import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Camp, Animal } from '../types';
import { Tent, Plus } from 'lucide-react';

export const CampsList = () => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Batch move state
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<'Cattle' | 'Sheep' | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch camps
      const { data: cData, error: cErr } = await supabase.from('camps').select('*').order('name');
      if (cErr) throw cErr;
      
      const mappedCamps: Camp[] = cData.map(c => ({
        id: c.id,
        userId: c.user_id,
        name: c.name,
        sizeHectares: c.size_hectares,
        notes: c.notes,
        createdAt: c.created_at
      }));
      setCamps(mappedCamps);

      // Fetch active animals to calculate stocking rates and allow moving
      const { data: aData, error: aErr } = await supabase
        .from('animals')
        .select('id, tag_number, breed, sex, current_camp_id, status, species')
        .eq('status', 'Active')
        .order('tag_number');
        
      if (aErr) throw aErr;
      
      setAnimals(aData.map(a => ({
        id: a.id,
        tagNumber: a.tag_number,
        breed: a.breed,
        sex: a.sex,
        currentCampId: a.current_camp_id,
        status: a.status,
        species: a.species
      })) as unknown as Animal[]);

    } catch (error) {
      console.error('Error fetching camps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from('camps').insert([{
        name: newName,
        size_hectares: newSize ? parseFloat(newSize) : null,
        notes: newNotes
      }]);
      
      if (error) throw error;
      
      setNewName('');
      setNewSize('');
      setNewNotes('');
      setShowForm(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      alert('Error creating camp: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string, headCount: number) => {
    if (headCount > 0) {
      alert(`Cannot delete ${name} because there are ${headCount} animals physically located there. Please move them to a different camp first.`);
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete the camp: ${name}?`)) return;
    
    try {
      const { error } = await supabase.from('camps').delete().eq('id', id);
      if (error) throw error;
      setCamps(camps.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Error deleting camp: ' + err.message);
    }
  };

  const openMoveModal = (campId: string, species: 'Cattle' | 'Sheep') => {
    setSelectedCampId(campId);
    setSelectedSpecies(species);
    setSelectedAnimals(new Set());
  };

  const handleBatchMove = async () => {
    if (!selectedCampId || selectedAnimals.size === 0) return;
    
    setMoving(true);
    try {
      const animalIds = Array.from(selectedAnimals);
      
      // Update animals table
      const { error } = await supabase
        .from('animals')
        .update({ current_camp_id: selectedCampId })
        .in('id', animalIds);
        
      if (error) throw error;
      
      // Prepare trace logs in Movement History for each animal
      const movementLogs = animalIds.map(aId => {
         const ani = animals.find(a => a.id === aId);
         const originCamp = camps.find(c => c.id === ani?.currentCampId)?.name || 'Unassigned / Different Pasture';
         const destCamp = camps.find(c => c.id === selectedCampId)?.name || 'Unknown';
         
         return {
           animal_id: aId,
           movement_date: new Date().toISOString().split('T')[0],
           origin: originCamp,
           destination: destCamp,
           notes: 'Batch moved via Camp & Pasture Manager'
         };
      });
      
      // Insert logs and ignore failure as it's non-critical
      const { error: logErr } = await supabase.from('movement_log').insert(movementLogs);
      if (logErr) console.error("Logging failed", logErr);
      
      setSelectedCampId(null);
      fetchData(); // Refresh counts and animal state
    } catch (error: any) {
      alert('Error moving animals: ' + error.message);
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Tent size={32} color="var(--primary)" />
          Pastures & Camps
        </h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} />
          Add New Camp
        </button>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Camp</h3>
          <form onSubmit={handleAddCamp}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Camp / Pasture Name</label>
                <input required type="text" className="form-input" placeholder="e.g. North Winter Camp" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Size (Hectares) <span style={{color: 'var(--text-muted)'}}>Optional</span></label>
                <input type="number" step="0.1" className="form-input" placeholder="e.g. 50" value={newSize} onChange={e => setNewSize(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Description / Notes <span style={{color: 'var(--text-muted)'}}>Optional</span></label>
              <textarea className="form-input" rows={2} placeholder="Water source status, grazing condition, etc." value={newNotes} onChange={e => setNewNotes(e.target.value)}></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Create Camp'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading camps...</div>
      ) : camps.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Tent size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No Camps Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto' }}>Create your first camp to start assigning your cattle to specific pastures for precise rotational management.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {camps.map(camp => {
            const headCount = animals.filter(a => a.currentCampId === camp.id).length;
            const density = camp.sizeHectares && headCount > 0 ? (headCount / camp.sizeHectares).toFixed(1) : null;
            
            return (
              <div key={camp.id} className="card fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 
                    onClick={() => navigate(`/herd?campId=${camp.id}`)}
                    style={{ 
                      margin: 0, 
                      fontSize: '1.25rem', 
                      color: 'var(--primary-dark)', 
                      cursor: 'pointer',
                      textDecoration: 'underline decoration-transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = 'var(--primary-dark)')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = 'transparent')}
                  >
                    {camp.name}
                  </h3>
                  <button 
                    onClick={() => handleDelete(camp.id, camp.name, headCount)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
                    title="Delete Camp"
                  >×</button>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{headCount}</div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Animals</div>
                    </div>
                    {camp.sizeHectares && (
                      <div style={{ padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{camp.sizeHectares} <span style={{fontSize:'0.8rem', fontWeight:500}}>ha</span></div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                          {density ? `${density} head/ha` : 'Size'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {camp.notes && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '6px', fontStyle: 'italic', margin: '0 0 16px' }}>
                      {camp.notes}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                      onClick={() => openMoveModal(camp.id, 'Cattle')}
                    >
                      + Move Cattle
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                      onClick={() => openMoveModal(camp.id, 'Sheep')}
                    >
                      + Move Sheep
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MOVE MODAL */}
      {selectedCampId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, color: 'var(--primary-dark)' }}>Move {selectedSpecies} to ⛺ {camps.find(c => c.id === selectedCampId)?.name}</h2>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 0' }}>Select active {selectedSpecies?.toLowerCase()} below to bulk transfer them to this pasture.</p>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {(() => {
                const moveCandidates = animals.filter(a => a.currentCampId !== selectedCampId && a.species === selectedSpecies);
                const isAllSelected = moveCandidates.length > 0 && moveCandidates.every(a => selectedAnimals.has(a.id));
                const isNoneSelected = selectedAnimals.size === 0;

                if (moveCandidates.length === 0) {
                  return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No active {selectedSpecies?.toLowerCase()} found to move to this camp.</p>;
                }

                return (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', cursor: 'pointer', fontWeight: 700, color: 'var(--primary)' }}>
                        <input 
                          type="checkbox" 
                          checked={isAllSelected}
                          ref={el => { if (el) el.indeterminate = !isAllSelected && !isNoneSelected && moveCandidates.some(a => selectedAnimals.has(a.id)); }}
                          onChange={(e) => {
                            const newSet = new Set(selectedAnimals);
                            moveCandidates.forEach(a => {
                              if (e.target.checked) newSet.add(a.id);
                              else newSet.delete(a.id);
                            });
                            setSelectedAnimals(newSet);
                          }}
                          style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                        />
                        Select All {selectedSpecies} ({moveCandidates.length})
                      </label>
                    </div>

                    {moveCandidates.map(animal => (
                      <label key={animal.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedAnimals.has(animal.id) ? '#F0F9FF' : 'transparent', transition: 'background-color 0.2s' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedAnimals.has(animal.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedAnimals);
                            if (e.target.checked) newSet.add(animal.id);
                            else newSet.delete(animal.id);
                            setSelectedAnimals(newSet);
                          }}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{animal.tagNumber}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {animal.breed} • {animal.sex} <span style={{ color: 'var(--border)', margin: '0 4px' }}>|</span> Currently in: <strong>{camps.find(c => c.id === animal.currentCampId)?.name || 'Unassigned'}</strong>
                        </div>
                      </div>
                    </label>
                  ))}
                  </div>
                );
              })()}
            </div>
            
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: '0 0 8px 8px' }}>
              <div style={{ color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: 600 }}>
                {selectedAnimals.size} animal(s) selected
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" onClick={() => setSelectedCampId(null)}>Cancel</button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleBatchMove}
                  disabled={moving || selectedAnimals.size === 0}
                >
                  {moving ? 'Moving...' : 'Confirm Move'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
