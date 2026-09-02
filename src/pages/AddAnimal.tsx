import { useState, useEffect } from 'react';
import type { Animal, Breed, Sex, Camp, Species, FarmSettings } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { db } from '../database/db';
import { SyncManager } from '../services/syncManager';
import { v4 as uuidv4 } from 'uuid';
import { useSubscription } from '../context/SubscriptionContext';

export const AddAnimal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isBlocked, isAtLimit, planName, animalLimit, activeAnimalCount } = useSubscription();
  
  const [camps, setCamps] = useState<Camp[]>([]);
  const [saving, setSaving] = useState(false);
  const [farmSettings, setFarmSettings] = useState<Partial<FarmSettings> | null>(null);

  // Pre-fill lineage if navigated from a parent's profile page
  const initialDamId = searchParams.get('damId') || '';
  const initialSireId = searchParams.get('sireId') || '';

  const [formData, setFormData] = useState<Partial<Animal> & { permitNumber?: string; permitIssueDate?: string; permitExpiryDate?: string; originGps?: string; healthDeclarationDate?: string; vehicleDisinfectionDate?: string; }>({
    species: 'Cattle',
    tagNumber: '',
    eidNumber: '',
    isQuarantined: true, // Auto quarantine true by default for FMD
    name: '',
    breed: '',  // Will be set by fetchFarmSettings once loaded
    sex: 'Female',
    dateOfBirth: new Date().toISOString().split('T')[0],
    status: 'Active',
    sireId: initialSireId,
    damId: initialDamId,
    weight: undefined,
    currentCampId: '',
    hornStatus: undefined,
    brand: '',
    originGln: '',
    previousOwnerTag: '',
    previousOwnerBrand: '',
    arrivalDate: new Date().toISOString().split('T')[0],
    purchasePrice: undefined,
    permitNumber: '',
    permitIssueDate: '',
    permitExpiryDate: '',
    originGps: '',
    healthDeclarationDate: '',
    vehicleDisinfectionDate: ''
  });
  
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [numberOfOffspring, setNumberOfOffspring] = useState(1);

  useEffect(() => {
    fetchParents();
    fetchFarmSettings();
  }, []);

  const fetchFarmSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('farm_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFarmSettings({
          defaultCattleBreed: data.default_cattle_breed,
          defaultSheepBreed: data.default_sheep_breed
        });
        
        // Initial breed default based on settings
        setFormData(prev => ({
          ...prev,
          breed: prev.species === 'Cattle' 
            ? (data.default_cattle_breed || 'Boran') 
            : (data.default_sheep_breed || 'Merino')
        }));
      }
    } catch (error) {
      console.error('Error fetching farm settings:', error);
    }
  };

  const fetchParents = async () => {
    try {
      // Local first reads could be used here, but keeping direct fetch if needed.
      // Evolving to use local dexie reads to be fully offline
      const localCamps = await db.camps.orderBy('name').toArray();

      setCamps(localCamps as Camp[]);
    } catch (error) {
      console.error('Failed to load form data from local db:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Subscription guard ──────────────────────────────────────────────────
    if (isBlocked) {
      alert('Your free trial has ended. Please select a plan on the Billing page to continue adding animals.');
      navigate('/billing');
      return;
    }
    if (isAtLimit) {
      alert(`You've reached your ${planName} plan limit of ${animalLimit} active animals. Upgrade your plan to add more.`);
      navigate('/billing');
      return;
    }
    // Check that multi-offspring add won't push over the limit
    if (activeAnimalCount + numberOfOffspring > animalLimit) {
      alert(`Adding ${numberOfOffspring} animals would exceed your ${planName} plan limit (${animalLimit} animals). You have ${animalLimit - activeAnimalCount} slot(s) remaining.`);
      return;
    }
    // ────────────────────────────────────────────────────────────────────────

    // Note: Permit number and health declaration are optional — not globally required.

    setSaving(true);
    
    try {
      for (let i = 0; i < numberOfOffspring; i++) {
        const tagSuffix = numberOfOffspring > 1 ? `-${i + 1}` : '';
        const tagNumber = formData.tagNumber + tagSuffix;
        const animalId = uuidv4();
        
        const qStart = formData.arrivalDate || new Date().toISOString().split('T')[0];
        const qEnd = new Date(qStart);
        qEnd.setDate(qEnd.getDate() + 28);
        
        // Create the full Animal object
        const newAnimal = {
          id: animalId,
          species: formData.species || 'Cattle',
          tagNumber: tagNumber || 'UNKNOWN',
          eidNumber: formData.eidNumber || undefined,
          isQuarantined: formData.isQuarantined || false,
          name: formData.name || undefined,
          breed: formData.breed || 'Other',
          sex: formData.sex || 'Female',
          dateOfBirth: formData.dateOfBirth || new Date().toISOString().split('T')[0],
          status: 'Active' as const,
          sireId: formData.sireId || undefined,
          damId: formData.damId || undefined,
          weight: formData.weight || undefined,
          currentCampId: formData.currentCampId || undefined,
          hornStatus: formData.hornStatus || undefined,
          brand: formData.brand || undefined,
          originGln: formData.originGln || undefined,
          previousOwnerTag: formData.previousOwnerTag || undefined,
          previousOwnerBrand: formData.previousOwnerBrand || undefined,
          arrivalDate: formData.arrivalDate || undefined,
          purchasePrice: formData.purchasePrice || undefined,
          quarantineStartDate: formData.isQuarantined ? qStart : undefined,
          quarantineEndDate: formData.isQuarantined ? qEnd.toISOString().split('T')[0] : undefined
        };

        // Local SQLite save
        await db.animals.add(newAnimal);
        
        // Transform keys to snake_case for Supabase Outbox
        const supabaseAnimal = {
          id: newAnimal.id,
          species: newAnimal.species,
          tag_number: newAnimal.tagNumber,
          eid_number: newAnimal.eidNumber,
          is_quarantined: newAnimal.isQuarantined,
          name: newAnimal.name,
          breed: newAnimal.breed,
          sex: newAnimal.sex,
          date_of_birth: newAnimal.dateOfBirth,
          status: newAnimal.status,
          sire_id: newAnimal.sireId,
          dam_id: newAnimal.damId,
          weight: newAnimal.weight,
          current_camp_id: newAnimal.currentCampId,
          horn_status: newAnimal.hornStatus,
          brand: newAnimal.brand,
          origin_gln: newAnimal.originGln,
          previous_owner_tag: newAnimal.previousOwnerTag,
          previous_owner_brand: newAnimal.previousOwnerBrand,
          arrival_date: newAnimal.arrivalDate,
          purchase_price: newAnimal.purchasePrice,
          quarantine_start_date: newAnimal.quarantineStartDate,
          quarantine_end_date: newAnimal.quarantineEndDate
        };
        await SyncManager.queueInsert('animals', newAnimal.id, supabaseAnimal);

        // Initial Weight Log
        if (newAnimal.weight) {
          const weightLogId = uuidv4();
          const weightLogDate = newAnimal.arrivalDate || new Date().toISOString().split('T')[0];
          const newWeightLog = {
            id: weightLogId,
            animalId: newAnimal.id,
            weightKg: newAnimal.weight,
            dateRecorded: weightLogDate,
            notes: 'Initial registration weight'
          };
          await db.weight_logs.add(newWeightLog);
          await SyncManager.queueInsert('weight_logs', weightLogId, {
            id: weightLogId,
            animal_id: newAnimal.id,
            weight_kg: newAnimal.weight,
            date_recorded: weightLogDate,
            notes: 'Initial registration weight'
          });
        }

        // Permit File Upload (Background Queue wrapper attempt)
        let permitPdfUrl = null;
        if (permitFile && navigator.onLine) {
           const path = `permits/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${animalId}-${permitFile.name}`;
           permitPdfUrl = await SyncManager.uploadPermitFile(permitFile, path);
        }

        // Initial Movement Log
        const movementId = uuidv4();
        const destCamp = camps.find(c => c.id === formData.currentCampId)?.name || 'Unassigned Farm Area';
        const newMovement = {
          id: movementId,
          animalId: newAnimal.id,
          movementDate: newAnimal.arrivalDate || new Date().toISOString().split('T')[0],
          origin: formData.originGln ? `GLN: ${formData.originGln}` : 'Initial Purchase',
          destination: destCamp,
          originGps: formData.originGps,
          originGln: formData.originGln,
          permitNumber: formData.permitNumber,
          permitIssueDate: formData.permitIssueDate || undefined,
          permitExpiryDate: formData.permitExpiryDate || undefined,
          permitPdfUrl: permitPdfUrl || undefined,
          gpsSource: 'Manual' as const,
          notes: 'Automatic log on arrival / purchase'
        };
        await db.movement_log.add(newMovement);
        
        const supabaseMovement = {
          id: newMovement.id,
          animal_id: newMovement.animalId,
          movement_date: newMovement.movementDate,
          origin: newMovement.origin,
          destination: newMovement.destination,
          origin_gps: newMovement.originGps,
          origin_gln: newMovement.originGln,
          permit_number: newMovement.permitNumber,
          permit_issue_date: newMovement.permitIssueDate,
          permit_expiry_date: newMovement.permitExpiryDate,
          permit_pdf_url: newMovement.permitPdfUrl,
          gps_source: newMovement.gpsSource,
          notes: newMovement.notes
        };
        await SyncManager.queueInsert('movement_log', movementId, supabaseMovement);

        // Biosecurity Log
        if (formData.healthDeclarationDate || formData.vehicleDisinfectionDate) {
          const bioId = uuidv4();
          const newBio = {
            id: bioId,
            movementId: movementId,
            healthDeclarationDate: formData.healthDeclarationDate || undefined,
            vehicleDisinfectionDate: formData.vehicleDisinfectionDate || undefined,
            notes: 'Biosecurity verified on arrival'
          };
          await db.biosecurity_logs.add(newBio);
          
          const supabaseBio = {
            id: newBio.id,
            movement_id: newBio.movementId,
            health_declaration_date: newBio.healthDeclarationDate ? new Date(newBio.healthDeclarationDate).toISOString() : null,
            vehicle_disinfection_date: newBio.vehicleDisinfectionDate ? new Date(newBio.vehicleDisinfectionDate).toISOString() : null,
            notes: newBio.notes
          };
          await SyncManager.queueInsert('biosecurity_logs', bioId, supabaseBio);
        }
      }
      
      alert(`Successfully saved ${numberOfOffspring > 1 ? numberOfOffspring + ' animals locally and queued for Cloud sync.' : formData.tagNumber + ' locally and queued for Cloud sync.'}`);
      navigate('/herd');
    } catch (error: any) {
      console.error('Error saving animal:', error);
      alert(`Error saving to local database: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Animal</h1>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          
          <h3 style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>Basic Information</h3>
          
          <div className="responsive-grid-2col">
            <div className="form-group">
              <label className="form-label">Species *</label>
              <select 
                className="form-select"
                value={formData.species}
                onChange={e => {
                  const newSpecies = e.target.value as Species;
                  const defaultBreed = newSpecies === 'Cattle' 
                    ? (farmSettings?.defaultCattleBreed || 'Bonsmara') 
                    : (farmSettings?.defaultSheepBreed || 'Dorper');
                  setFormData({
                    ...formData, 
                    species: newSpecies, 
                    breed: defaultBreed as Breed, 
                    sireId: '', 
                    damId: '',
                    hornStatus: newSpecies === 'Sheep' ? undefined : formData.hornStatus
                  });
                }}
              >
                <option value="Cattle">Cattle</option>
                <option value="Sheep">Sheep</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Ear Tag Number *</label>
              <input 
                required
                type="text" 
                className="form-input" 
                placeholder="e.g. A-102"
                value={formData.tagNumber}
                onChange={e => setFormData({...formData, tagNumber: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">EID Tag (15-digit)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 982000000012345"
                pattern="[0-9]{15}"
                maxLength={15}
                title="EID must be exactly 15 digits or left blank"
                value={formData.eidNumber || ''}
                onChange={e => setFormData({...formData, eidNumber: e.target.value.trim()})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Name (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Bessie"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Breed</label>
              <select 
                className="form-select"
                value={formData.breed}
                onChange={e => setFormData({...formData, breed: e.target.value as Breed})}
              >
                {(() => {
                  const defaultBreed = formData.species === 'Cattle' 
                    ? (farmSettings?.defaultCattleBreed || 'Bonsmara')
                    : (farmSettings?.defaultSheepBreed || 'Dorper');
                    
                  const topCattleBreeds = ['Bonsmara', 'Brahman', 'Nguni', 'Simmentaler', 'Afrikaner', 'Drakensberger', 'Boran', 'Tuli', 'Sussex', 'Angus', 'Wagyu', 'Hereford'];
                  const topSheepBreeds = ['Dorper', 'Merino', 'Dohne Merino', 'Meatmaster', 'Damara', 'Letelle', 'Afrino', 'Ile de France'];
                  
                  let breeds = formData.species === 'Cattle' ? topCattleBreeds : topSheepBreeds;
                  
                  if (!breeds.includes(defaultBreed)) {
                    breeds.push(defaultBreed);
                  }
                  
                  breeds = [
                    defaultBreed,
                    ...breeds.filter(b => b !== defaultBreed)
                  ];

                  return breeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ));
                })()}
                <option value="Crossbreed">Crossbreed</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sex</label>
              <select 
                className="form-select"
                value={formData.sex}
                onChange={e => setFormData({...formData, sex: e.target.value as Sex})}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            {formData.species === 'Sheep' && formData.damId && (
              <div className="form-group">
                <label className="form-label">Number of Offspring</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    min={1} 
                    max={4}
                    className="form-input"
                    value={numberOfOffspring}
                    onChange={e => setNumberOfOffspring(parseInt(e.target.value))}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>If &gt; 1, tags will be suffixed.</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input 
                type="date" 
                className="form-input"
                value={formData.dateOfBirth}
                onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Weight (kg)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 250"
                value={formData.weight || ''}
                onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Camp / Pasture</label>
              <select 
                className="form-select"
                value={formData.currentCampId || ''}
                onChange={e => setFormData({...formData, currentCampId: e.target.value})}
              >
                <option value="">Unassigned</option>
                {camps.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 500 }}>
                <input 
                  type="checkbox" 
                  checked={formData.isQuarantined || false}
                  onChange={e => setFormData({...formData, isQuarantined: e.target.checked})}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--danger)' }}
                />
                <span style={{ color: 'var(--danger)' }}>
                   ⚠️ Place this animal under 28-day Quarantine
                </span>
              </label>
            </div>
          </div>

          <h3 style={{ marginTop: '32px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>Traceability & Compliance</h3>
          
          <div className="responsive-grid-2col">
            <div className="form-group">
              <label className="form-label">Origin Farm GLN</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 6001234567890"
                value={formData.originGln || ''}
                onChange={e => setFormData({...formData, originGln: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Origin GPS Coordinates</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="-29.112, 26.211"
                value={formData.originGps || ''}
                onChange={e => setFormData({...formData, originGps: e.target.value})}
              />
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Manual entry required for origin location.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Permit Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Red Cross Vet Permit ID..."
                value={formData.permitNumber || ''}
                onChange={e => setFormData({...formData, permitNumber: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Permit PDF Upload</label>
              <input 
                type="file" 
                className="form-input" 
                accept="application/pdf"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setPermitFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Permit Issue Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.permitIssueDate || ''}
                onChange={e => setFormData({...formData, permitIssueDate: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Permit Expiry Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.permitExpiryDate || ''}
                onChange={e => setFormData({...formData, permitExpiryDate: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Owner's Health Declaration Date</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.healthDeclarationDate || ''}
                onChange={e => setFormData({...formData, healthDeclarationDate: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Disinfection Date</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.vehicleDisinfectionDate || ''}
                onChange={e => setFormData({...formData, vehicleDisinfectionDate: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Arrival Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.arrivalDate || ''}
                onChange={e => setFormData({...formData, arrivalDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Price (R)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0.00"
                value={formData.purchasePrice || ''}
                onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/herd')} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save & Sync Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
