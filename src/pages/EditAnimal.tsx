import { useState, useEffect } from 'react';
import type { Animal, Camp, Species } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

export const EditAnimal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [bulls, setBulls] = useState<Animal[]>([]);
  const [cows, setCows] = useState<Animal[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Animal>>({
    species: 'Cattle',
    tagNumber: '',
    eidNumber: '',
    isQuarantined: false,
    name: '',
    breed: 'Boran', // Default to a common breed, will be overwritten
    sex: 'Female',
    dateOfBirth: new Date().toISOString().split('T')[0],
    status: 'Active',
    sireId: '',
    damId: '',
    weight: undefined,
    currentCampId: '',
    hornStatus: undefined,
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch parents for dropdowns
      const { data: parents, error: pErr } = await supabase.from('animals').select('id, tag_number, name, sex, species');
      if (pErr) throw pErr;
      
      setBulls(parents.filter(a => a.sex === 'Male' && a.id !== id).map(a => ({...a, tagNumber: a.tag_number}) as any));
      setCows(parents.filter(a => a.sex === 'Female' && a.id !== id).map(a => ({...a, tagNumber: a.tag_number}) as any));

      const { data: campsData } = await supabase.from('camps').select('*').order('name');
      if (campsData) {
        setCamps(campsData.map(c => ({ id: c.id, name: c.name }) as Camp));
      }

      // Fetch animal to edit
      const { data: animalData, error: aErr } = await supabase.from('animals').select('*').eq('id', id).single();
      if (aErr) throw aErr;

      setFormData({
        species: animalData.species || 'Cattle',
        tagNumber: animalData.tag_number,
        eidNumber: animalData.eid_number || '',
        isQuarantined: animalData.is_quarantined || false,
        name: animalData.name || '',
        breed: animalData.breed,
        sex: animalData.sex as any,
        dateOfBirth: animalData.date_of_birth,
        status: animalData.status as any,
        sireId: animalData.sire_id || '',
        damId: animalData.dam_id || '',
        weight: animalData.weight || undefined,
        currentCampId: animalData.current_camp_id || '',
        hornStatus: animalData.horn_status || undefined,
      });

    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load animal data for editing.');
      navigate('/herd');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const updates = {
      species: formData.species || 'Cattle',
      tag_number: formData.tagNumber || 'UNKNOWN',
      eid_number: formData.eidNumber || null,
      is_quarantined: formData.isQuarantined || false,
      name: formData.name || null,
      breed: formData.breed || 'Other',
      sex: formData.sex || 'Female',
      date_of_birth: formData.dateOfBirth || new Date().toISOString().split('T')[0],
      status: formData.status || 'Active',
      sire_id: formData.sireId || null,
      dam_id: formData.damId || null,
      weight: formData.weight || null,
      current_camp_id: formData.currentCampId || null,
      horn_status: formData.hornStatus || null
    };

    try {
      const { error } = await supabase.from('animals').update(updates).eq('id', id);
      if (error) throw error;
      
      alert(`Successfully updated ${updates.tag_number}!`);
      navigate(`/herd/${id}`);
    } catch (error: any) {
      console.error('Error updating animal:', error);
      alert(`Error saving to database: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header">
        <h2 className="card-title">Edit Animal: {formData.tagNumber}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Same form layout as AddAnimal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="species">Species *</label>
            <select 
              id="species"
              className="form-input" 
              required
              value={formData.species || 'Cattle'}
              onChange={e => {
                const newSpecies = e.target.value as Species;
                setFormData({...formData, species: newSpecies, breed: newSpecies === 'Cattle' ? 'Boran' : 'Merino', sireId: '', damId: ''});
              }}
            >
              <option value="Cattle">Cattle</option>
              <option value="Sheep">Sheep</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tagNumber">Tag Number *</label>
            <input 
              id="tagNumber"
              className="form-input" 
              type="text" 
              required 
              value={formData.tagNumber}
              onChange={(e) => setFormData({...formData, tagNumber: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="eidNumber">EID Tag (15-digit)</label>
            <input 
              id="eidNumber"
              className="form-input" 
              type="text" 
              placeholder="e.g. 982000000012345"
              pattern="[0-9]{15}"
              maxLength={15}
              title="EID must be exactly 15 digits or left blank"
              value={formData.eidNumber || ''}
              onChange={(e) => setFormData({...formData, eidNumber: e.target.value.trim()})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Name / Nickname</label>
            <input 
              id="name"
              className="form-input" 
              type="text" 
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="breed">Breed *</label>
            <select 
              id="breed"
              className="form-input" 
              required
              value={formData.breed}
              onChange={(e) => setFormData({...formData, breed: e.target.value as any})}
            >
              {formData.species === 'Cattle' ? (
                <>
                  <option value="Angus">Angus</option>
                  <option value="Brahman">Brahman</option>
                  <option value="Hereford">Hereford</option>
                  <option value="Holstein">Holstein</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Tuli">Tuli</option>
                  <option value="Boran">Boran</option>
                </>
              ) : (
                <>
                  <option value="Merino">Merino</option>
                  <option value="Dorper">Dorper</option>
                  <option value="Meatmaster">Meatmaster</option>
                  <option value="Suffolk">Suffolk</option>
                  <option value="Afrino">Afrino</option>
                </>
              )}
              <option value="Crossbreed">Crossbreed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sex">Sex *</label>
            <select 
              id="sex"
              className="form-input" 
              required
              value={formData.sex}
              onChange={(e) => setFormData({...formData, sex: e.target.value as any})}
            >
              <option value="Female">Female ({formData.species === 'Cattle' ? 'Cow/Heifer' : 'Ewe'})</option>
              <option value="Male">Male ({formData.species === 'Cattle' ? 'Bull/Steer' : 'Ram/Wether'})</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dateOfBirth">Date of Birth *</label>
            <input 
              id="dateOfBirth"
              className="form-input" 
              type="date" 
              required 
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Status *</label>
            <select 
              id="status"
              className="form-input" 
              required
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
              <option value="Deceased">Deceased</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="hornStatus">Horn Status</label>
            <select 
              id="hornStatus"
              className="form-input" 
              value={formData.hornStatus || ''}
              onChange={(e) => setFormData({...formData, hornStatus: e.target.value as any})}
            >
              <option value="">-- Select --</option>
              <option value="Polled">Polled (No Horns)</option>
              <option value="Horned">Horned</option>
              <option value="Scurred">Scurred</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="weight">Weight (kg)</label>
            <input 
              id="weight"
              className="form-input" 
              type="number" 
              min="0"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || undefined})}
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
              <span style={{ color: 'var(--danger)' }}>⚠️ Place this animal under Quarantine</span>
            </label>
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '24px' }}>Lineage (Optional)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="sireId">Sire (Father)</label>
            <select 
              id="sireId"
              className="form-input" 
              value={formData.sireId || ''}
              onChange={(e) => setFormData({...formData, sireId: e.target.value || undefined})}
            >
              <option value="">Unknown / Native</option>
              {bulls.filter(b => b.species === formData.species).map(bull => (
                <option key={bull.id} value={bull.id}>{bull.tagNumber} {bull.name ? `(${bull.name})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="damId">Dam (Mother)</label>
            <select 
              id="damId"
              className="form-input" 
              value={formData.damId || ''}
              onChange={(e) => setFormData({...formData, damId: e.target.value || undefined})}
            >
              <option value="">Unknown / Native</option>
              {cows.filter(c => c.species === formData.species).map(cow => (
                <option key={cow.id} value={cow.id}>{cow.tagNumber} {cow.name ? `(${cow.name})` : ''}</option>
              ))}
            </select>
          </div>

        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(`/herd/${id}`)} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating Database...' : 'Update Record'}
          </button>
        </div>
      </form>
    </div>
  );
};
