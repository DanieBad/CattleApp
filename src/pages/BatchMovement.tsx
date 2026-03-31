import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Truck, MapPin, ShieldAlert, Trash2, ShieldCheck } from 'lucide-react';
import { db } from '../database/db';
import { SyncManager } from '../services/syncManager';
import { v4 as uuidv4 } from 'uuid';
import type { Animal, Camp } from '../types';

export const BatchMovement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialIds: string[] = location.state?.selectedIds || [];

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [movementType, setMovementType] = useState<'Internal' | 'Sale'>('Internal');
  const [movementDate, setMovementDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Destination Details
  const [destinationCampId, setDestinationCampId] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [destinationGln, setDestinationGln] = useState('');
  
  // FMD Compliance Details
  const [originGps, setOriginGps] = useState('');
  const [gpsSource, setGpsSource] = useState<'Auto' | 'Manual' | null>(null);
  const [permitNumber, setPermitNumber] = useState('');
  const [permitIssueDate, setPermitIssueDate] = useState('');
  const [permitExpiryDate, setPermitExpiryDate] = useState('');
  const [permitFile, setPermitFile] = useState<File | null>(null);
  
  // Biosecurity & Transport
  const [vehicleReg, setVehicleReg] = useState('');
  const [healthDeclarationDate, setHealthDeclarationDate] = useState('');
  const [vehicleDisinfectionDate, setVehicleDisinfectionDate] = useState('');
  
  // Financial
  const [totalSalePrice, setTotalSalePrice] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!initialIds || initialIds.length === 0) {
      navigate('/herd');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [localAnimals, localCamps] = await Promise.all([
        db.animals.where('id').anyOf(initialIds).toArray(),
        db.camps.orderBy('name').toArray()
      ]);
      setAnimals(localAnimals as Animal[]);
      setCamps(localCamps as Camp[]);
    } catch (e) {
      console.error(e);
      alert('Failed to load local data.');
    } finally {
      setLoading(false);
    }
  };

  const removeAnimal = (id: string) => {
    const updated = animals.filter(a => a.id !== id);
    setAnimals(updated);
    if (updated.length === 0) navigate('/herd');
  };

  const quarantinedAnimals = animals.filter(a => a.isQuarantined);
  const hasQuarantined = quarantinedAnimals.length > 0;

  const captureGps = async () => {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
           enableHighAccuracy: true,
           timeout: 7000 
        });
      });
      setOriginGps(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      setGpsSource('Auto');
    } catch (err) {
      console.warn("GPS auto-capture failed", err);
      const manual = window.prompt("Could not capture GPS. Please enter coordinates manually (e.g. -29.112, 26.211):");
      if (manual) {
        setOriginGps(manual);
        setGpsSource('Manual');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (animals.length === 0) return;

    if (movementType === 'Sale' && hasQuarantined) {
      alert("Cannot process a sale. Please remove quarantined animals from the batch first.");
      return;
    }

    if (movementType === 'Sale' && (animals.some(a => a.species === 'Cattle' || a.species === 'Sheep'))) {
      if (!permitNumber || !healthDeclarationDate) {
         alert("FMD Compliance Alert: Red Cross Permit Number and Health Declaration Dates are required for cloven-hoofed sales.");
         return;
      }
    }

    setSaving(true);
    try {
      // 1. Upload global permit if provided and online
      let permitPdfUrl = null;
      if (permitFile && navigator.onLine) {
         const batchId = uuidv4().substring(0, 8);
         const path = `permits/${new Date().getFullYear()}/${new Date().getMonth() + 1}/batch-${batchId}-${permitFile.name}`;
         permitPdfUrl = await SyncManager.uploadPermitFile(permitFile, path);
      }

      const pricePerHead = totalSalePrice ? Number((totalSalePrice / animals.length).toFixed(2)) : undefined;
      const destinationLabel = movementType === 'Internal' ? 
        (camps.find(c => c.id === destinationCampId)?.name || 'Unknown Camp') : 
        destinationName;

      // 2. Process each animal identically based on the batch config
      for (const animal of animals) {
        
        // Update Animal Record (Status, Camp, SoldPrice)
        const updatePayload: any = {};
        if (movementType === 'Internal') {
          updatePayload.current_camp_id = destinationCampId || null;
          await db.animals.update(animal.id, { currentCampId: destinationCampId || undefined });
        } else {
          updatePayload.status = 'Sold';
          updatePayload.current_camp_id = null;
          if (pricePerHead) updatePayload.sold_price = pricePerHead;
          await db.animals.update(animal.id, { 
             status: 'Sold', 
             currentCampId: undefined, 
             ...(pricePerHead && { soldPrice: pricePerHead }) 
          });
        }
        await SyncManager.queueUpdate('animals', animal.id, updatePayload);

        // Create Movement Log
        const movementId = uuidv4();
        const originLabel = animal.currentCampId ? `Camp: ${camps.find(c => c.id === animal.currentCampId)?.name || 'Unknown'}` : 'Unassigned';
        
        const localMovement = {
          id: movementId,
          animalId: animal.id,
          movementDate: movementDate,
          origin: originLabel,
          destination: destinationLabel,
          originGps: originGps || undefined,
          originGln: undefined, // Leaving origin GLN off for outbound, usually destination GLN is filled
          permitNumber: permitNumber || undefined,
          permitIssueDate: permitIssueDate || undefined,
          permitExpiryDate: permitExpiryDate || undefined,
          permitPdfUrl: permitPdfUrl || undefined,
          gpsSource: gpsSource || undefined,
          notes: notes || (movementType === 'Sale' ? 'Batch Sale' : 'Batch Movement')
        };
        await db.movement_log.add(localMovement);
        
        await SyncManager.queueInsert('movement_log', movementId, {
          id: localMovement.id,
          animal_id: localMovement.animalId,
          movement_date: localMovement.movementDate,
          origin: localMovement.origin,
          destination: localMovement.destination,
          origin_gps: localMovement.originGps,
          destination_gln: destinationGln || null,
          permit_number: localMovement.permitNumber,
          permit_issue_date: localMovement.permitIssueDate,
          permit_expiry_date: localMovement.permitExpiryDate,
          permit_pdf_url: localMovement.permitPdfUrl,
          gps_source: localMovement.gpsSource,
          notes: localMovement.notes,
          vehicle_registration: vehicleReg || null
        });

        // Biosecurity Log (if applicable)
        if (healthDeclarationDate || vehicleDisinfectionDate) {
          const bioId = uuidv4();
          await db.biosecurity_logs.add({
            id: bioId,
            movementId: movementId,
            healthDeclarationDate: healthDeclarationDate || undefined,
            vehicleDisinfectionDate: vehicleDisinfectionDate || undefined,
            notes: 'Batch Biosecurity Record'
          });
          await SyncManager.queueInsert('biosecurity_logs', bioId, {
            id: bioId,
            movement_id: movementId,
            health_declaration_date: healthDeclarationDate ? new Date(healthDeclarationDate).toISOString() : null,
            vehicle_disinfection_date: vehicleDisinfectionDate ? new Date(vehicleDisinfectionDate).toISOString() : null,
            notes: 'Batch Biosecurity Record'
          });
        }
      }

      alert(`Successfully processed ${movementType} for ${animals.length} animals! Pending local sync.`);
      navigate('/herd');
    } catch (e: any) {
      console.error(e);
      alert('Failed to process batch: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading batch data...</div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <button className="btn btn-outline" onClick={() => navigate('/herd')} style={{ marginBottom: '16px' }}>&larr; Back to Herd</button>
          <h1 className="page-title">Batch Movement & Sale</h1>
          <p style={{ color: 'var(--text-muted)' }}>Log a single FMD-compliant movement event for {animals.length} animals.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px', alignItems: 'start' }}>
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
          
          {/* Movement Type Toggle */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <button 
              type="button"
              onClick={() => setMovementType('Internal')}
              style={{ flex: 1, padding: '16px', borderRadius: '8px', border: movementType === 'Internal' ? '2px solid var(--primary)' : '2px solid transparent', backgroundColor: movementType === 'Internal' ? 'var(--primary-light)' : 'var(--surface)', fontWeight: 600, color: movementType === 'Internal' ? 'var(--primary-dark)' : 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
            >
              <MapPin size={20} />
              Internal Farm Move
            </button>
            <button 
              type="button"
              onClick={() => setMovementType('Sale')}
              style={{ flex: 1, padding: '16px', borderRadius: '8px', border: movementType === 'Sale' ? '2px solid #ef4444' : '2px solid transparent', backgroundColor: movementType === 'Sale' ? '#fee2e2' : 'var(--surface)', fontWeight: 600, color: movementType === 'Sale' ? '#991b1b' : 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
            >
              <Truck size={20} />
              External Sale / Move Off-Farm
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className="form-group">
              <label className="form-label">Movement Date *</label>
              <input type="date" className="form-input" required value={movementDate} onChange={e => setMovementDate(e.target.value)} />
            </div>

            {movementType === 'Internal' ? (
               <div className="form-group">
                 <label className="form-label">Destination Camp *</label>
                 <select required className="form-select" value={destinationCampId} onChange={e => setDestinationCampId(e.target.value)}>
                   <option value="">-- Select Camp --</option>
                   {camps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>
            ) : (
               <div className="form-group">
                 <label className="form-label">Destination Name (Buyer/Abattoir) *</label>
                 <input type="text" required className="form-input" placeholder="e.g. Karan Beef" value={destinationName} onChange={e => setDestinationName(e.target.value)} />
               </div>
            )}
          </div>

          {/* FMD COMPLIANCE SECTION - ONLY FOR EXTERNAL SALE */}
          {movementType === 'Sale' && (
            <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#0F172A' }}>
                <ShieldCheck size={24} color="#059669" />
                <h3 style={{ margin: 0 }}>FMD Traceability Requirements</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                   <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                     Origin GPS Coordinates
                     {gpsSource && <span style={{ color: "var(--primary)", fontSize: '0.8rem' }}>{gpsSource} Capture Active</span>}
                   </label>
                   <div style={{ display: 'flex', gap: '12px' }}>
                     <input type="text" className="form-input" placeholder="-29.112, 26.211" value={originGps} onChange={e => { setOriginGps(e.target.value); setGpsSource('Manual'); }} style={{ flex: 1 }} />
                     <button type="button" onClick={captureGps} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <MapPin size={16} /> Auto-Capture
                     </button>
                   </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination GLN</label>
                  <input type="text" className="form-input" placeholder="e.g. 6001234567890" value={destinationGln} onChange={e => setDestinationGln(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State Vet Permit Number *</label>
                  <input type="text" className="form-input" placeholder="e.g. RC-55992" value={permitNumber} onChange={e => setPermitNumber(e.target.value)} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Permit Issue Date</label>
                  <input type="date" className="form-input" value={permitIssueDate} onChange={e => setPermitIssueDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Permit Expiry Date</label>
                  <input type="date" className="form-input" value={permitExpiryDate} onChange={e => setPermitExpiryDate(e.target.value)} />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Upload Virtual Permit / Red Cross Document (PDF/JPG)</label>
                  <input type="file" className="form-input" onChange={e => setPermitFile(e.target.files ? e.target.files[0] : null)} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', margin: '24px 0' }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#0F172A' }}>
                <Truck size={20} color="#0284C7" />
                <h4 style={{ margin: 0 }}>Biosecurity & Transport</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Vehicle Registration Plate</label>
                  <input type="text" className="form-input" placeholder="e.g. ND 12345" value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Disinfection Date</label>
                  <input type="date" className="form-input" value={vehicleDisinfectionDate} onChange={e => setVehicleDisinfectionDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Health Declaration Signed Date *</label>
                  <input type="date" className="form-input" value={healthDeclarationDate} onChange={e => setHealthDeclarationDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Batch Sale Price (R)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Optional" value={totalSalePrice === undefined ? '' : totalSalePrice} onChange={e => setTotalSalePrice(e.target.value ? parseFloat(e.target.value) : undefined)} />
                </div>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Additional Movement Notes</label>
            <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Condition of animals, buyer contact info, etc."></textarea>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', backgroundColor: movementType === 'Sale' ? '#EF4444' : 'var(--primary)' }}
            disabled={saving || (movementType === 'Sale' && hasQuarantined)}
            title={hasQuarantined ? "Please remove quarantined animals before selling" : ""}
          >
            {saving ? 'Processing Batch...' : `Confirm ${movementType === 'Sale' ? 'Sale & Departure' : 'Internal Movement'}`}
          </button>
        </form>

        {/* Selected Animals List sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {movementType === 'Sale' && hasQuarantined && (
            <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '8px', border: '1px solid #FECACA', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <ShieldAlert size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
               <div>
                  <h4 style={{ color: '#991B1B', margin: '0 0 4px 0' }}>Quarantine Lock</h4>
                  <p style={{ color: '#B91C1C', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                    {quarantinedAnimals.length} animal(s) are currently under the 28-day FMD isolation period. You MUST remove them from this batch to proceed with an external sale.
                  </p>
               </div>
            </div>
          )}

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Selected Animals</h3>
              <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>{animals.length}</span>
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
              {animals.map(animal => (
                <div key={animal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: animal.isQuarantined && movementType === 'Sale' ? '#FEF2F2' : 'var(--surface)', borderRadius: '8px', marginBottom: '8px', border: animal.isQuarantined && movementType === 'Sale' ? '1px solid #FECACA' : '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {animal.tagNumber}
                      {animal.isQuarantined && movementType === 'Sale' && <span style={{ backgroundColor: '#EF4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quarantined</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{animal.breed} {animal.sex}</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeAnimal(animal.id)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                    title="Remove from batch"
                  >
                    <Trash2 size={16} className="hover:text-red-500 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
