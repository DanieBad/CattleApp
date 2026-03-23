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
    brand: '',
    originGln: '',
    previousOwnerTag: '',
    previousOwnerBrand: '',
    arrivalDate: new Date().toISOString().split('T')[0],
    purchasePrice: undefined
  });
  
  const [numberOfOffspring, setNumberOfOffspring] = useState(1);
  const [prevVaccines, setPrevVaccines] = useState<string[]>([]);

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
    
    try {
      for (let i = 0; i < numberOfOffspring; i++) {
        const tagSuffix = numberOfOffspring > 1 ? `-${i + 1}` : '';
        const tagNumber = formData.tagNumber + tagSuffix;
        
        // Create the full Animal object for Supabase (snake_case)
        const newAnimal = {
          species: formData.species || 'Cattle',
          tag_number: tagNumber || 'UNKNOWN',
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
          horn_status: formData.hornStatus || null,
          brand: formData.brand || null,
          origin_gln: formData.originGln || null,
          previous_owner_tag: formData.previousOwnerTag || null,
          previous_owner_brand: formData.previousOwnerBrand || null,
          arrival_date: formData.arrivalDate || null,
          purchase_price: formData.purchasePrice || null
        };

        const { data: insertedAnimal, error } = await supabase.from('animals').insert([newAnimal]).select().single();
        if (error) throw error;

        // Log initial movement if camp is assigned
        if (formData.currentCampId && insertedAnimal) {
          const destCamp = camps.find(c => c.id === formData.currentCampId)?.name || 'Unassigned';
          await supabase.from('movement_log').insert([{
            animal_id: insertedAnimal.id,
            movement_date: new Date().toISOString().split('T')[0],
            origin: formData.originGln ? `Farm GLN: ${formData.originGln}` : 'Initial Assignment / Purchase',
            destination: destCamp,
            notes: 'Automatic log on creation'
          }]);
        }
        
        // Log previous vaccines
        if (prevVaccines.length > 0 && insertedAnimal) {
          const vaccineInserts = prevVaccines.map(v => ({
            animal_id: insertedAnimal.id,
            treatment_type: 'Vaccination',
            medication: v,
            date_administered: formData.arrivalDate || new Date().toISOString().split('T')[0],
            notes: 'Vaccinated by previous owner prior to arrival'
          }));
          await supabase.from('health_logs').insert(vaccineInserts);
        }
      }
      
      alert(`Successfully saved ${numberOfOffspring > 1 ? numberOfOffspring + ' animals' : formData.tagNumber}!`);
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>If &gt; 1, tags will be suffixed with -1, -2, etc.</span>
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

          <h3 style={{ marginTop: '32px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>Traceability & Purchasing</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
              <label className="form-label">Current Farm Brand</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. XYZ"
                value={formData.brand || ''}
                onChange={e => setFormData({...formData, brand: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Previous Owner Tag</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Previous tag..."
                value={formData.previousOwnerTag || ''}
                onChange={e => setFormData({...formData, previousOwnerTag: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Previous Owner Brand</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Previous brand..."
                value={formData.previousOwnerBrand || ''}
                onChange={e => setFormData({...formData, previousOwnerBrand: e.target.value})}
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
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Vaccinations from Previous Owner</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['FMD (Foot & Mouth Disease)', 'Covexin 10 / Multivax', 'Anthrax', 'Botulism', 'Rift Valley Fever'].map(vac => (
                  <label key={vac} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={prevVaccines.includes(vac)}
                      onChange={e => {
                        if (e.target.checked) setPrevVaccines([...prevVaccines, vac]);
                        else setPrevVaccines(prevVaccines.filter(v => v !== vac));
                      }}
                    />
                    <span style={{ fontSize: '0.85rem' }}>{vac}</span>
                  </label>
                ))}
              </div>
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
