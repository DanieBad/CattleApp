import { useState, useEffect } from 'react';
import type { Animal, Breed, Sex, Camp, Species, FarmSettings } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';

export const AddAnimal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [bulls, setBulls] = useState<Animal[]>([]);
  const [cows, setCows] = useState<Animal[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [saving, setSaving] = useState(false);
  const [farmSettings, setFarmSettings] = useState<Partial<FarmSettings> | null>(null);

  // Pre-fill lineage if navigated from a parent's profile page
  const initialDamId = searchParams.get('damId') || '';
  const initialSireId = searchParams.get('sireId') || '';

  const [formData, setFormData] = useState<Partial<Animal>>({
    species: 'Cattle',
    tagNumber: '',
    eidNumber: '',
    isQuarantined: false,
    name: '',
    breed: 'Boran',
    sex: 'Female',
    dateOfBirth: new Date().toISOString().split('T')[0],
    status: 'Active',
    sireId: initialSireId,
    damId: initialDamId,
    weight: undefined,
    currentCampId: '',
    hornStatus: undefined,
  });

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
      const { data, error } = await supabase.from('animals').select('id, tag_number, name, sex, species');
      if (error) throw error;
      
      setBulls(data.filter(a => a.sex === 'Male').map(a => ({...a, tagNumber: a.tag_number}) as any));
      setCows(data.filter(a => a.sex === 'Female').map(a => ({...a, tagNumber: a.tag_number}) as any));

      const { data: campsData } = await supabase.from('camps').select('*').order('name');
      if (campsData) {
        setCamps(campsData.map(c => ({ id: c.id, name: c.name }) as Camp));
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Create the full Animal object for Supabase (snake_case)
    const newAnimal = {
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
      const { data: insertedAnimal, error } = await supabase.from('animals').insert([newAnimal]).select().single();
      if (error) throw error;

      // Log initial movement if camp is assigned
      if (formData.currentCampId && insertedAnimal) {
        const destCamp = camps.find(c => c.id === formData.currentCampId)?.name || 'Unassigned';
        await supabase.from('movement_log').insert([{
          animal_id: insertedAnimal.id,
          movement_date: new Date().toISOString().split('T')[0],
          origin: 'Initial Assignment / Purchase',
          destination: destCamp,
          notes: 'Automatic log on creation'
        }]);
      }
      
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
                {formData.species === 'Cattle' ? (
                  <>
                    {/* Default breed option at the top if set */}
                    {farmSettings?.defaultCattleBreed && (
                      <option value={farmSettings.defaultCattleBreed}>{farmSettings.defaultCattleBreed} (Default)</option>
                    )}
                    <option value="Bonsmara">Bonsmara</option>
                    <option value="Brahman">Brahman</option>
                    <option value="Nguni">Nguni</option>
                    <option value="Simmentaler">Simmentaler</option>
                    <option value="Afrikaner">Afrikaner</option>
                    <option value="Drakensberger">Drakensberger</option>
                    <option value="Angus">Angus</option>
                    <option value="Boran">Boran</option>
                    <option value="Tuli">Tuli</option>
                    <option value="Sussex">Sussex</option>
                    <option value="Jersey">Jersey</option>
                    <option value="Limousin">Limousin</option>
                    <option value="Holstein Friesian">Holstein Friesian</option>
                    <option value="Wagyu">Wagyu</option>
                    <option value="Zebu / Indicus">Zebu / Indicus</option>
                    <option value="Hereford">Hereford</option>
                    <option value="Charolais">Charolais</option>
                    <option value="Brown Swiss">Brown Swiss</option>
                    <option value="Shorthorn">Shorthorn</option>
                    <option value="Gelbvieh">Gelbvieh</option>
                  </>
                ) : (
                  <>
                    {/* Default breed option at the top if set */}
                    {farmSettings?.defaultSheepBreed && (
                      <option value={farmSettings.defaultSheepBreed}>{farmSettings.defaultSheepBreed} (Default)</option>
                    )}
                    <option value="Dorper">Dorper</option>
                    <option value="Merino">Merino</option>
                    <option value="Dohne Merino">Dohne Merino</option>
                    <option value="Vleismerino">Vleismerino</option>
                    <option value="Meatmaster">Meatmaster</option>
                    <option value="Van Rooy">Van Rooy</option>
                    <option value="Ile de France">Ile de France</option>
                    <option value="Letelle">Letelle</option>
                    <option value="Damara">Damara</option>
                    <option value="Suffolk">Suffolk</option>
                    <option value="Afrino">Afrino</option>
                    <option value="Texel">Texel</option>
                    <option value="Hampshire Down">Hampshire Down</option>
                    <option value="Rambouillet">Rambouillet</option>
                    <option value="Romney">Romney</option>
                    <option value="Corriedale">Corriedale</option>
                    <option value="Awassi">Awassi</option>
                    <option value="Karakul">Karakul</option>
                    <option value="East Friesian">East Friesian</option>
                  </>
                )}
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
                <option value="Female">Female ({formData.species === 'Cattle' ? 'Cow/Heifer' : 'Ewe'})</option>
                <option value="Male">Male ({formData.species === 'Cattle' ? 'Bull/Steer' : 'Ram/Wether'})</option>
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
              <label className="form-label">Horn Status</label>
              <select 
                className="form-select"
                disabled={formData.species === 'Sheep'}
                value={formData.hornStatus || ''}
                onChange={e => setFormData({...formData, hornStatus: e.target.value as any})}
              >
                <option value="">-- Select --</option>
                <option value="Polled">Polled (No Horns)</option>
                <option value="Horned">Horned</option>
                <option value="Scurred">Scurred</option>
              </select>
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
                {bulls.filter(b => b.species === formData.species).map(b => (
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
                {cows.filter(c => c.species === formData.species).map(c => (
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
