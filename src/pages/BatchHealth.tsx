import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Animal } from '../types';
import { Activity, Search, AlertCircle, Save, CheckSquare, Square, ArrowLeft } from 'lucide-react';
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

  // Form State
  const [treatmentType, setTreatmentType] = useState('Vaccination');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only need to fetch the full herd if we're NOT in pre-selected mode
    if (!isPreSelected) {
      fetchActiveHerd();
    }
  }, []);

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

    setIsSubmitting(true);

    const payloads = Array.from(selectedIds).map(animalId => ({
      animal_id: animalId,
      treatment_type: treatmentType,
      medication: medication || null,
      dosage: dosage || null,
      date_administered: dateAdministered,
      notes: notes || null,
    }));

    const { error } = await supabase.from('health_logs').insert(payloads);
    setIsSubmitting(false);

    if (error) {
      console.error('Error inserting batch logs:', error);
      alert('Failed to save batch logs.');
    } else {
      alert(`Successfully saved ${payloads.length} health logs!`);
      navigate(isPreSelected ? '/health' : '/herd');
    }
  };

  const isAllSelected = filteredHerd.length > 0 && filteredHerd.every(a => selectedIds.has(a.id));

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
                <option value="Checkup">General Checkup</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="medication">Medication / Vaccine Name *</label>
              <input
                id="medication"
                className="form-input"
                type="text"
                required
                placeholder="e.g. Supavax"
                value={medication}
                onChange={e => setMedication(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dosage">Dosage</label>
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
