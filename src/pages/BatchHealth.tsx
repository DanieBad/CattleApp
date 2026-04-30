import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { db } from '../database/db';
import { SyncManager } from '../services/syncManager';
import { v4 as uuidv4 } from 'uuid';
import type { Animal, VetProduct } from '../types';
import { Activity, Search, AlertCircle, Save, CheckSquare, Square, ArrowLeft, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PreSelectedAnimal {
  id: string;
  tagNumber: string;
  name?: string | null;
}

export const BatchHealth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Pre-selection from Health Workflow ───────────────────────────────────
  const preSelectedIds: string[] | undefined = (location.state as any)?.preSelectedIds;
  const preSelectedAnimals: PreSelectedAnimal[] | undefined = (location.state as any)?.preSelectedAnimals;
  const isPreSelected = Array.isArray(preSelectedIds) && preSelectedIds.length > 1;

  const [herd, setHerd] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(!isPreSelected);
  const [searchTerm, setSearchTerm] = useState('');

  // Selection State — initialise with pre-selected if provided
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    isPreSelected ? new Set(preSelectedIds) : new Set()
  );

  // Products State (same as AnimalDetail)
  const [products, setProducts] = useState<VetProduct[]>([]);

  // Form State
  const [treatmentType, setTreatmentType] = useState('Vaccination');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customProduct, setCustomProduct] = useState('');
  const [withdrawalDays, setWithdrawalDays] = useState<string>('');
  const [dosage, setDosage] = useState('');
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived: known product definition for the selected product
  const selectedProductDef = products.find(p => p.productName === selectedProduct);
  const knownWithdrawalDays = selectedProductDef?.meatWithdrawalDays;

  // Computed safe date label
  const computedSafeDate = (() => {
    const days = isOtherSelected
      ? (withdrawalDays ? parseInt(withdrawalDays) : null)
      : knownWithdrawalDays ?? null;
    if (!days || days === 0 || days === 999) return null;
    const d = new Date(dateAdministered);
    d.setDate(d.getDate() + days);
    return d;
  })();

  useEffect(() => {
    fetchProducts();
    if (!isPreSelected) fetchActiveHerd();
  }, []);

  // Re-fetch products when treatment type changes
  useEffect(() => {
    setSelectedProduct('');
    setIsOtherSelected(false);
    setWithdrawalDays('');
  }, [treatmentType]);

  const fetchProducts = async () => {
    try {
      const { data: gvp } = await supabase.from('global_vet_products').select('*');
      const { data: gsp } = await supabase.from('global_sheep_vet_products').select('*');
      const userRes = await supabase.auth.getUser();
      let uvp: any[] = [];
      let usp: any[] = [];
      if (userRes.data.user) {
        const { data: ud } = await supabase.from('user_vet_products').select('*').eq('user_id', userRes.data.user.id);
        const { data: us } = await supabase.from('user_sheep_vet_products').select('*').eq('user_id', userRes.data.user.id);
        if (ud) uvp = ud;
        if (us) usp = us;
      }
      const mapProduct = (p: any, isCustom = false): VetProduct => ({
        id: p.id,
        category: p.category,
        productName: p.product_name,
        dosageMlPerKg: p.dosage_ml_per_kg,
        meatWithdrawalDays: p.meat_withdrawal_days,
        milkWithdrawalDays: p.milk_withdrawal_days,
        isCustom,
      });
      const allProducts = [
        ...(gvp || []).map(p => mapProduct(p)),
        ...(gsp || []).map(p => mapProduct(p)),
        ...uvp.map(p => mapProduct(p, true)),
        ...usp.map(p => mapProduct(p, true)),
      ];
      setProducts(allProducts);
    } catch (err) {
      console.error('Failed to load vet products:', err);
    }
  };

  const fetchActiveHerd = async () => {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('status', 'Active')
      .order('tag_number', { ascending: true });

    if (error) {
      console.error('Error fetching herd:', error);
    } else if (data) {
      const mappedHerd: Animal[] = data.map((dbAnimal: any) => ({
        id: dbAnimal.id,
        species: dbAnimal.species || 'Cattle',
        tagNumber: dbAnimal.tag_number,
        eidNumber: dbAnimal.eid_number,
        isQuarantined: dbAnimal.is_quarantined,
        name: dbAnimal.name,
        breed: dbAnimal.breed,
        sex: dbAnimal.sex,
        dateOfBirth: dbAnimal.date_of_birth,
        status: dbAnimal.status,
      }));
      setHerd(mappedHerd);
    }
    setIsLoading(false);
  };

  const filteredHerd = herd.filter(animal =>
    animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (animal.eidNumber && animal.eidNumber.includes(searchTerm))
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredHerd.length && filteredHerd.length > 0) {
      const newSelected = new Set(selectedIds);
      filteredHerd.forEach(a => newSelected.delete(a.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      filteredHerd.forEach(a => newSelected.add(a.id));
      setSelectedIds(newSelected);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) {
      alert('Please select at least one animal to treat.');
      return;
    }

    const finalMedication = isOtherSelected ? customProduct : selectedProduct;
    if (!finalMedication) {
      alert('Please select or enter a medication / product name.');
      return;
    }

    // Compute safe date if withdrawal days are known
    const resolvedWithdrawalDays = isOtherSelected
      ? (withdrawalDays ? parseInt(withdrawalDays) : null)
      : (knownWithdrawalDays ?? null);

    let safeDateStr: string | undefined = undefined;
    if (resolvedWithdrawalDays && resolvedWithdrawalDays > 0 && resolvedWithdrawalDays !== 999) {
      const d = new Date(dateAdministered);
      d.setDate(d.getDate() + resolvedWithdrawalDays);
      safeDateStr = d.toISOString().split('T')[0];
    }

    setIsSubmitting(true);

    try {
      const animalIds = Array.from(selectedIds);

      for (const animalId of animalIds) {
        const logId = uuidv4();

        // Local Dexie save first
        const localRecord: any = {
          id: logId,
          animalId,
          treatmentType,
          medication: finalMedication,
          dosage: dosage || undefined,
          dateAdministered,
          notes: notes || undefined,
          safeDate: safeDateStr,
          createdAt: new Date().toISOString(),
        };
        await db.health_logs.add(localRecord);

        // Queue for cloud sync
        const supabasePayload: any = {
          id: logId,
          animal_id: animalId,
          treatment_type: treatmentType,
          medication: finalMedication,
          dosage: dosage || null,
          date_administered: dateAdministered,
          notes: notes || null,
        };
        if (safeDateStr) supabasePayload.safe_date = safeDateStr;

        await SyncManager.queueInsert('health_logs', logId, supabasePayload);
      }

      setIsSubmitting(false);
      alert(`Successfully queued ${animalIds.length} health log${animalIds.length !== 1 ? 's' : ''} for Cloud sync!`);
      navigate(isPreSelected ? '/health' : '/herd');
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('Error saving batch health logs:', err);
      alert('Failed to save batch logs: ' + err.message);
    }
  };

  const isAllSelected = filteredHerd.length > 0 && filteredHerd.every(a => selectedIds.has(a.id));

  // Withdrawal display helper
  const withdrawalLabel = (() => {
    if (isOtherSelected) {
      return withdrawalDays
        ? `${withdrawalDays} days (manual entry)`
        : 'Not specified — enter below';
    }
    if (!selectedProduct) return null;
    if (!knownWithdrawalDays || knownWithdrawalDays === 0) return 'No withdrawal period';
    if (knownWithdrawalDays === 999) return 'Unknown — refer to product label';
    return `${knownWithdrawalDays} days (auto-filled)`;
  })();

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          {/* Back link — only shown when arriving from Health Workflow */}
          {isPreSelected && (
            <button
              onClick={() => navigate('/health')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0 0 12px',
              }}
            >
              <ArrowLeft size={15} /> Change selection
            </button>
          )}
          <h1 className="page-title" style={{ marginBottom: '8px' }}>Batch Health Action</h1>
          <p style={{ color: 'var(--text-muted)' }}>Apply treatments or vaccinations to multiple animals simultaneously.</p>
        </div>
      </div>

      <div className="responsive-grid-batch" style={{ gap: '24px', alignItems: 'start' }}>

        {/* Left Column: Pre-selected summary OR full picker */}
        {isPreSelected ? (
          /* ── Compact summary of pre-selected animals ── */
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Selected Animals
              </h3>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                {selectedIds.size} animals
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(preSelectedAnimals || []).map(a => (
                <div
                  key={a.id}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    backgroundColor: '#D1FAE5', color: '#065F46',
                    borderRadius: '20px', padding: '5px 12px',
                    fontWeight: 700, fontSize: '0.85rem',
                  }}
                >
                  🐄 {a.tagNumber}{a.name ? ` (${a.name})` : ''}
                </div>
              ))}
            </div>

            {/* Withdrawal notice */}
            {computedSafeDate && (
              <div style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '0.85rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={14} />
                Withdrawal: all {selectedIds.size} animals safe from <strong>{computedSafeDate.toLocaleDateString()}</strong>
              </div>
            )}

            <button
              onClick={() => navigate('/health')}
              style={{
                marginTop: '16px', background: 'none', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.85rem', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <ArrowLeft size={14} /> Change selection
            </button>
          </div>
        ) : (
          /* ── Full picker (direct /batch-health access) ── */
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
              <div className="search-bar">
                <Search size={20} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search active herd by Tag or EID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-off)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={toggleSelectAll}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)' }}
              >
                {isAllSelected ? <CheckSquare size={20} /> : <Square size={20} color="var(--text-muted)" />}
                {isAllSelected ? 'Deselect All' : 'Select All Filtered'}
              </button>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedIds.size} Selected</span>
            </div>

            {/* Withdrawal summary bar */}
            {selectedIds.size > 0 && computedSafeDate && (
              <div style={{ padding: '10px 20px', backgroundColor: '#FFFBEB', borderBottom: '1px solid #FDE68A', fontSize: '0.85rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={14} />
                Withdrawal logged: safe from <strong>{computedSafeDate.toLocaleDateString()}</strong> for all selected animals
              </div>
            )}

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading active herd...</div>
              ) : filteredHerd.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No animals match your search.</div>
              ) : (
                <table className="data-table" style={{ width: '100%', margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white' }}>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>Tag / EID</th>
                      <th>Breed &amp; Sex</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHerd.map(animal => (
                      <tr
                        key={animal.id}
                        onClick={() => toggleSelect(animal.id)}
                        style={{ cursor: 'pointer', backgroundColor: selectedIds.has(animal.id) ? 'rgba(16, 185, 129, 0.05)' : animal.isQuarantined ? 'rgba(239, 68, 68, 0.05)' : '' }}
                      >
                        <td>
                          {selectedIds.has(animal.id) ? <CheckSquare size={20} color="var(--primary)" /> : <Square size={20} color="var(--text-muted)" />}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{animal.tagNumber} {animal.isQuarantined && <span title="Quarantined" style={{ marginLeft: '4px', fontSize: '1rem' }}>😷</span>}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{animal.eidNumber || 'No EID'}</div>
                        </td>
                        <td>
                          <div>{animal.breed}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{animal.sex}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Treatment Form */}
        <div className="card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" />
            Treatment Details
          </h2>

          <form onSubmit={handleBatchSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="treatmentType">Treatment Type *</label>
              <select
                id="treatmentType"
                className="form-input"
                required
                value={treatmentType}
                onChange={e => setTreatmentType(e.target.value)}
              >
                <option value="Vaccination">Vaccination</option>
                <option value="Deworming">Deworming</option>
                <option value="Dip / External">Dip / External Parasite</option>
                <option value="Illness / Injury">Illness / Injury</option>
                <option value="Checkup">General Checkup</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Smart Product Dropdown */}
            <div className="form-group">
              <label className="form-label" htmlFor="product">Medication / Vaccine *</label>
              <select
                id="product"
                className="form-input"
                required
                value={isOtherSelected ? 'Other' : selectedProduct}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setIsOtherSelected(true);
                    setSelectedProduct('');
                    setWithdrawalDays('');
                  } else {
                    setIsOtherSelected(false);
                    setSelectedProduct(val);
                    setWithdrawalDays('');
                  }
                }}
              >
                <option value="">-- Select Product --</option>
                {products
                  .filter(p => p.category === treatmentType)
                  .map(p => (
                    <option key={p.id} value={p.productName}>
                      {p.productName}{p.isCustom ? ' (Custom)' : ''}
                    </option>
                  ))}
                <option value="Other">Other (Manual Entry)</option>
              </select>
            </div>

            {/* Custom product name when Other selected */}
            {isOtherSelected && (
              <div className="form-group">
                <label className="form-label" htmlFor="customProduct">Custom Product Name *</label>
                <input
                  id="customProduct"
                  className="form-input"
                  type="text"
                  required
                  placeholder="e.g. Dectomax Pour-On"
                  value={customProduct}
                  onChange={e => setCustomProduct(e.target.value)}
                />
              </div>
            )}

            {/* Withdrawal Period */}
            <div className="form-group">
              <label className="form-label" htmlFor="withdrawal">
                Withdrawal Period
                {isOtherSelected && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (days)</span>}
              </label>
              {isOtherSelected ? (
                <input
                  id="withdrawal"
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="Enter days (0 = none)"
                  value={withdrawalDays}
                  onChange={e => setWithdrawalDays(e.target.value)}
                />
              ) : (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: selectedProductDef ? (knownWithdrawalDays ? '#FFFBEB' : '#F0FDF4') : 'var(--bg-off)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  color: selectedProductDef ? (knownWithdrawalDays ? '#92400E' : '#065F46') : 'var(--text-muted)',
                  fontWeight: selectedProductDef ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  {withdrawalLabel || 'Select a product above'}
                </div>
              )}

              {/* Computed safe date preview */}
              {computedSafeDate && (
                <p style={{ fontSize: '0.78rem', color: '#92400E', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠️ Meat safe from: <strong>{computedSafeDate.toLocaleDateString()}</strong>
                </p>
              )}
            </div>

            {/* Dosage — plain optional text, no smart calculation for batch */}
            <div className="form-group">
              <label className="form-label" htmlFor="dosage">
                Dosage
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>(optional — not auto-calculated for batch)</span>
              </label>
              <input
                id="dosage"
                className="form-input"
                type="text"
                placeholder="e.g. 5ml"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dateAdministered">Date Administered *</label>
              <input
                id="dateAdministered"
                className="form-input"
                type="date"
                required
                value={dateAdministered}
                onChange={e => setDateAdministered(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes / Batch Number</label>
              <textarea
                id="notes"
                className="form-input"
                rows={3}
                placeholder="e.g. Batch #12345"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {selectedIds.size === 0 && (
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-off)', borderRadius: '8px', display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                <AlertCircle size={18} />
                Please select at least one animal from the list to apply this treatment.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              disabled={isSubmitting || selectedIds.size === 0}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving Batch...' : `Record for ${selectedIds.size} Animal${selectedIds.size !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
