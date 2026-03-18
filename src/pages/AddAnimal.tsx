import { useState, useEffect } from 'react';
import type { Animal, Breed, Sex } from '../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export const AddAnimal = () => {
  const navigate = useNavigate();
  const [bulls, setBulls] = useState<Animal[]>([]);
  const [cows, setCows] = useState<Animal[]>([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Animal>>({
    tagNumber: '',
    eidNumber: '',
    isQuarantined: false,
    name: '',
    breed: 'Boran',
    sex: 'Female',
    dateOfBirth: new Date().toISOString().split('T')[0],
    status: 'Active',
    sireId: '',
    damId: '',
    weight: undefined,
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const { data, error } = await supabase.from('animals').select('id, tag_number, name, sex');
      if (error) throw error;
      
      setBulls(data.filter(a => a.sex === 'Male').map(a => ({...a, tagNumber: a.tag_number}) as any));
      setCows(data.filter(a => a.sex === 'Female').map(a => ({...a, tagNumber: a.tag_number}) as any));
    } catch (error) {
      console.error('Failed to load parents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Create the full Animal object for Supabase (snake_case)
    const newAnimal = {
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
      weight: formData.weight || null
    };

    try {
      const { error } = await supabase.from('animals').insert([newAnimal]);
      if (error) throw error;
      
      alert(`Successfully saved ${newAnimal.tag_number}!`);
      navigate('/herd');
    } catch (error: any) {
      console.error('Error saving animal:', error);
      alert(`Error saving to database: ${error.message}`);
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                <option value="Angus">Angus</option>
                <option value="Brahman">Brahman</option>
                <option value="Hereford">Hereford</option>
                <option value="Holstein">Holstein</option>
                <option value="Tuli">Tuli</option>
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
                <option value="Female">Female (Cow/Heifer)</option>
                <option value="Male">Male (Bull/Steer)</option>
              </select>
            </div>

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

          <h3 style={{ marginTop: '32px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>Lineage (Optional)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Sire (Father)</label>
              <select 
                className="form-select"
                value={formData.sireId || ''}
                onChange={e => setFormData({...formData, sireId: e.target.value})}
              >
                <option value="">Unknown / Purchased</option>
                {bulls.map(b => (
                  <option key={b.id} value={b.id}>{b.tagNumber} {b.name ? `(${b.name})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dam (Mother)</label>
              <select 
                className="form-select"
                value={formData.damId || ''}
                onChange={e => setFormData({...formData, damId: e.target.value})}
              >
                <option value="">Unknown / Purchased</option>
                {cows.map(c => (
                  <option key={c.id} value={c.id}>{c.tagNumber} {c.name ? `(${c.name})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/herd')} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving to Database...' : 'Save Animal Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
