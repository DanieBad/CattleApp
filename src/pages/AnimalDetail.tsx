import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Animal, HealthLog, WeightLog, MovementLog, Camp } from '../types';
import { calculateAge } from '../utils';

type Tab = 'overview' | 'health' | 'weight' | 'movement';

export const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [sire, setSire] = useState<Animal | undefined>(undefined);
  const [dam, setDam] = useState<Animal | undefined>(undefined);
  const [offspring, setOffspring] = useState<Animal[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [movementLogs, setMovementLogs] = useState<MovementLog[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  
  const [newMovementDate, setNewMovementDate] = useState(new Date().toISOString().split('T')[0]);
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newPermitNumber, setNewPermitNumber] = useState('');
  const [newVehicleReg, setNewVehicleReg] = useState('');
  const [newMovementNotes, setNewMovementNotes] = useState('');
  
  const [newWeight, setNewWeight] = useState('');
  const [newWeightNotes, setNewWeightNotes] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);

  const [newTreatmentType, setNewTreatmentType] = useState('Vaccination');
  const [newMedication, setNewMedication] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newHealthNotes, setNewHealthNotes] = useState('');
  const [newHealthDate, setNewHealthDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAnimalDetails();
  }, [id]);

  const mapToCamelCase = (dbAnimal: any): Animal => ({
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
    sireId: dbAnimal.sire_id,
    damId: dbAnimal.dam_id,
    weight: dbAnimal.weight,
    currentCampId: dbAnimal.current_camp_id,
    hornStatus: dbAnimal.horn_status
  });

  const fetchAnimalDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch main animal
      const { data: aData, error: aErr } = await supabase.from('animals').select('*').eq('id', id).single();
      if (aErr) throw aErr;
      const mainAnimal = mapToCamelCase(aData);
      setAnimal(mainAnimal);

      // 2. Fetch Sire
      if (mainAnimal.sireId) {
        const { data: sData } = await supabase.from('animals').select('*').eq('id', mainAnimal.sireId).single();
        if (sData) setSire(mapToCamelCase(sData));
      } else {
        setSire(undefined);
      }

      // 3. Fetch Dam
      if (mainAnimal.damId) {
        const { data: dData } = await supabase.from('animals').select('*').eq('id', mainAnimal.damId).single();
        if (dData) setDam(mapToCamelCase(dData));
      } else {
        setDam(undefined);
      }

      // 4. Fetch Offspring
      const { data: oData } = await supabase
        .from('animals')
        .select('*')
        .or(`sire_id.eq.${id},dam_id.eq.${id}`)
        .order('date_of_birth', { ascending: false });
        
      if (oData) {
        setOffspring(oData.map(mapToCamelCase));
      }

      // 5. Fetch Weight Logs
      const { data: wData } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('animal_id', id)
        .order('date_recorded', { ascending: false });
        
      if (wData) {
        setWeightLogs(wData.map(w => ({
          id: w.id,
          animalId: w.animal_id,
          weightKg: w.weight_kg,
          dateRecorded: w.date_recorded,
          notes: w.notes,
          createdAt: w.created_at
        })));
      }

      // 6. Fetch Health Logs
      const { data: hData } = await supabase
        .from('health_logs')
        .select('*')
        .eq('animal_id', id)
        .order('date_administered', { ascending: false });
        
      if (hData) {
        setHealthLogs(hData.map(h => ({
          id: h.id,
          animalId: h.animal_id,
          treatmentType: h.treatment_type,
          medication: h.medication,
          dosage: h.dosage,
          dateAdministered: h.date_administered,
          notes: h.notes,
          createdAt: h.created_at
        })));
      }

      // 7. Fetch Movement Logs
      const { data: mData } = await supabase
        .from('movement_log')
        .select('*')
        .eq('animal_id', id)
        .order('movement_date', { ascending: false });
        
      if (mData) {
        setMovementLogs(mData.map(m => ({
          id: m.id,
          animalId: m.animal_id,
          movementDate: m.movement_date,
          origin: m.origin,
          destination: m.destination,
          permitNumber: m.permit_number,
          vehicleRegistration: m.vehicle_registration,
          notes: m.notes,
          createdAt: m.created_at
        })));
      }

      // 8. Fetch Camps to resolve camp names
      const { data: cData } = await supabase.from('camps').select('*');
      if (cData) {
        setCamps(cData.map(c => ({ id: c.id, name: c.name }) as Camp));
      }

    } catch (error) {
      console.error('Error fetching animal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'Sold' | 'Deceased') => {
    if (!window.confirm(`Are you sure you want to mark this animal as ${newStatus}?`)) return;
    
    try {
      const { error } = await supabase.from('animals').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      setAnimal(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (offspring.length > 0) {
      alert(`Cannot delete ${animal?.tagNumber} because it is listed as a parent to ${offspring.length} calf/calves. Please edit the calves to remove this parent first, or simply mark this animal as Sold or Deceased.`);
      return;
    }
    
    if (!window.confirm(`WARNING: Are you absolutely sure you want to PERMANENTLY delete ${animal?.tagNumber}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.from('animals').delete().eq('id', id);
      if (error) throw error;
      
      alert('Animal deleted successfully.');
      navigate('/herd');
    } catch (error: any) {
      console.error('Failed to delete:', error);
      alert('Error deleting animal: ' + error.message);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    
    try {
      const { data, error } = await supabase.from('weight_logs').insert([{
        animal_id: id,
        weight_kg: parseFloat(newWeight),
        date_recorded: newWeightDate,
        notes: newWeightNotes
      }]).select();
      
      if (error) throw error;
      
      // Update local state
      if (data) {
        const newLog: WeightLog = {
          id: data[0].id,
          animalId: data[0].animal_id,
          weightKg: data[0].weight_kg,
          dateRecorded: data[0].date_recorded,
          notes: data[0].notes,
          createdAt: data[0].created_at
        };
        setWeightLogs([newLog, ...weightLogs]);
        
        // Update animal's main weight if this is the newest record
        if (!animal?.weight || new Date(newWeightDate) >= new Date()) {
          const { error: updateErr } = await supabase.from('animals').update({ weight: parseFloat(newWeight) }).eq('id', id);
          if (!updateErr) {
            setAnimal(prev => prev ? { ...prev, weight: parseFloat(newWeight) } : null);
          }
        }
      }
      
      // Reset form
      setNewWeight('');
      setNewWeightNotes('');
      setShowWeightForm(false);
    } catch (error: any) {
      alert('Error adding weight: ' + error.message);
    }
  };

  const handleAddHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatmentType) return;
    
    try {
      const { data, error } = await supabase.from('health_logs').insert([{
        animal_id: id,
        treatment_type: newTreatmentType,
        medication: newMedication,
        dosage: newDosage,
        date_administered: newHealthDate,
        notes: newHealthNotes
      }]).select();
      
      if (error) throw error;
      
      if (data) {
        const newLog: HealthLog = {
          id: data[0].id,
          animalId: data[0].animal_id,
          treatmentType: data[0].treatment_type,
          medication: data[0].medication,
          dosage: data[0].dosage,
          dateAdministered: data[0].date_administered,
          notes: data[0].notes,
          createdAt: data[0].created_at
        };
        setHealthLogs([newLog, ...healthLogs]);
      }
      
      // Reset form
      setNewTreatmentType('Vaccination');
      setNewMedication('');
      setNewDosage('');
      setNewHealthNotes('');
      setShowHealthForm(false);
    } catch (error: any) {
      alert('Error adding health record: ' + error.message);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin || !newDestination) return;
    
    try {
      const { data, error } = await supabase.from('movement_log').insert([{
        animal_id: id,
        movement_date: newMovementDate,
        origin: newOrigin,
        destination: newDestination,
        permit_number: newPermitNumber,
        vehicle_registration: newVehicleReg,
        notes: newMovementNotes
      }]).select();
      
      if (error) throw error;
      
      if (data) {
        const newLog: MovementLog = {
          id: data[0].id,
          animalId: data[0].animal_id,
          movementDate: data[0].movement_date,
          origin: data[0].origin,
          destination: data[0].destination,
          permitNumber: data[0].permit_number,
          vehicleRegistration: data[0].vehicle_registration,
          notes: data[0].notes,
          createdAt: data[0].created_at
        };
        setMovementLogs([newLog, ...movementLogs]);
      }
      
      setNewOrigin('');
      setNewDestination('');
      setNewPermitNumber('');
      setNewVehicleReg('');
      setNewMovementNotes('');
      setShowMovementForm(false);
    } catch (error: any) {
      alert('Error adding movement record: ' + error.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile from database...</div>;
  }

  if (!animal) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Animal not found</h2>
        <button className="btn btn-outline" onClick={() => navigate('/herd')} style={{ marginTop: '16px' }}>Back to Herd</button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <span className="badge badge-green">Active</span>;
      case 'Sold': return <span className="badge badge-blue">Sold</span>;
      case 'Deceased': return <span className="badge badge-red">Deceased</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  const AnimalCard = ({ ani, title }: { ani?: Animal, title: string }) => {
    if (!ani) {
      return (
        <div className="card" style={{ padding: '16px', border: '1px dashed var(--border)', background: 'transparent' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{title}</div>
          <div style={{ color: 'var(--text-muted)' }}>Unknown / Not Recorded</div>
        </div>
      );
    }
    
    return (
      <div 
        className="card" 
        style={{ padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
        onClick={() => navigate(`/herd/${ani.id}`)}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{title}</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{ani.tagNumber}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {ani.breed} • {ani.sex} • {ani.name || 'No Name'}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <button className="btn btn-outline" onClick={() => navigate('/herd')} style={{ marginBottom: '16px' }}>
              &larr; Back to Herd
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 className="page-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{animal.species === 'Sheep' ? '🐑' : '🐄'}</span>
                {animal.tagNumber} {animal.name && <span style={{ color: 'var(--text-muted)' }}>"{animal.name}"</span>}
              </h1>
              {getStatusBadge(animal.status)}
              {animal.isQuarantined && <span className="badge badge-red" style={{ border: '1px solid #991B1B' }}>⚠️ QUARANTINED</span>}
            </div>
          </div>
          
          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/herd/${animal.id}/edit`)}>
              Edit Record
            </button>
            
            {animal.status === 'Active' && (
              <>
                <button 
                  className="btn btn-outline" 
                  onClick={() => handleStatusChange('Sold')}
                  disabled={animal.isQuarantined}
                  title={animal.isQuarantined ? "Cannot sell quarantined animal" : ""}
                  style={animal.isQuarantined ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Mark Sold
                </button>
                <button className="btn btn-outline" onClick={() => handleStatusChange('Deceased')}>
                  Mark Deceased
                </button>
              </>
            )}

            <button 
              className="btn btn-outline" 
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border)', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'overview' ? 600 : 400,
            color: activeTab === 'overview' ? 'var(--primary-dark)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '-2px'
          }}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('health')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'health' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'health' ? 600 : 400,
            color: activeTab === 'health' ? 'var(--primary-dark)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '-2px'
          }}
        >
          Health & Treatments
        </button>
        <button 
          onClick={() => setActiveTab('weight')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'weight' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'weight' ? 600 : 400,
            color: activeTab === 'weight' ? 'var(--primary-dark)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '-2px'
          }}
        >
          Weight History
        </button>
        <button 
          onClick={() => setActiveTab('movement')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'movement' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'movement' ? 600 : 400,
            color: activeTab === 'movement' ? 'var(--primary-dark)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '-2px'
          }}
        >
          Movement History
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          
          {/* Left Column - Details & Offspring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Animal Profile</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>EID Tag</p>
                <p style={{ fontWeight: 500, fontFamily: 'monospace' }}>{animal.eidNumber || 'Not registered'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Species</p>
                <p style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {animal.species === 'Sheep' ? '🐑' : '🐄'} {animal.species}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Breed</p>
                <p style={{ fontWeight: 500 }}>{animal.breed}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Sex</p>
                <p style={{ fontWeight: 500 }}>{animal.sex} {animal.hornStatus ? `(${animal.hornStatus})` : ''}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Date of Birth</p>
                <p style={{ fontWeight: 500 }}>
                  {new Date(animal.dateOfBirth).toLocaleDateString()} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({calculateAge(animal.dateOfBirth).display} old)</span>
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Current Camp</p>
                <p style={{ fontWeight: 500 }}>
                  {animal.currentCampId ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      📍 {camps.find(c => c.id === animal.currentCampId)?.name || 'Unknown'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                  )}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Current Weight</p>
                <p style={{ fontWeight: 500 }}>{animal.weight ? `${animal.weight} kg` : 'Not recorded'}</p>
              </div>
              {animal.currentCampId && movementLogs.length > 0 && (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Days in Current Pasture</p>
                  <p style={{ fontWeight: 500, color: 'var(--primary-dark)' }}>
                    {(() => {
                      const currentCampName = camps.find(c => c.id === animal.currentCampId)?.name;
                      const lastMoveToCurrent = movementLogs.find(m => m.destination === currentCampName);
                      if (!lastMoveToCurrent) return 'Unknown (No recent log)';
                      
                      const moveDate = new Date(lastMoveToCurrent.movementDate);
                      const today = new Date();
                      const diffTime = Math.abs(today.getTime() - moveDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
                      
                      return `${diffDays} Day${diffDays === 1 ? '' : 's'} (since ${moveDate.toLocaleDateString()})`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Registered Offspring ({offspring.length})</h3>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate(`/add-animal?${animal.sex === 'Female' ? 'damId' : 'sireId'}=${animal.id}`)}
                style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Add Calf
              </button>
            </div>
            
            {offspring.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No offspring registered in the system yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {offspring.map(calf => (
                  <AnimalCard key={calf.id} ani={calf} title="Calf" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Lineage Tree */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#F9FAFB' }}>
          <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Lineage Tree</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Parents Layer */}
            <AnimalCard ani={sire} title="Sire (Father)" />
            <AnimalCard ani={dam} title="Dam (Mother)" />
            
            {/* Connector Visual */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <div style={{ height: '30px', width: '2px', backgroundColor: 'var(--border)' }}></div>
            </div>
            
            {/* Current Animal */}
            <div className="card" style={{ padding: '16px', border: '2px solid var(--primary)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10px', left: '0', right: '0', textAlign: 'center' }}>
                <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>THIS ANIMAL</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '8px' }}>{animal.tagNumber}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {animal.breed} • {animal.weight ? `${animal.weight} kg` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB CONTENT: HEALTH */}
      {activeTab === 'health' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Health Records</h2>
            <button className="btn btn-primary" onClick={() => setShowHealthForm(!showHealthForm)}>
              {showHealthForm ? 'Cancel' : 'Log Treatment'}
            </button>
          </div>
          
          {showHealthForm && (
            <form onSubmit={handleAddHealth} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '16px' }}>New Treatment Record</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={newHealthDate} onChange={e => setNewHealthDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Treatment Type</label>
                  <select className="form-input" value={newTreatmentType} onChange={e => setNewTreatmentType(e.target.value)}>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Deworming">Deworming</option>
                    <option value="Illness">Illness / Injury</option>
                    <option value="General Checkup">General Checkup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Medication (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. Ivermectin" value={newMedication} onChange={e => setNewMedication(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dosage (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. 10ml" value={newDosage} onChange={e => setNewDosage(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={newHealthNotes} onChange={e => setNewHealthNotes(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Record</button>
            </form>
          )}

          {healthLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No health records found for this animal.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Treatment Type</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {healthLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.dateAdministered).toLocaleDateString()}</td>
                    <td>{log.treatmentType}</td>
                    <td>{log.medication || '-'}</td>
                    <td>{log.dosage || '-'}</td>
                    <td>{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB CONTENT: WEIGHT */}
      {activeTab === 'weight' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Weight History</h2>
            <button className="btn btn-primary" onClick={() => setShowWeightForm(!showWeightForm)}>
              {showWeightForm ? 'Cancel' : 'Log Weight'}
            </button>
          </div>
          
          {showWeightForm && (
            <form onSubmit={handleAddWeight} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '16px' }}>New Weight Record</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={newWeightDate} onChange={e => setNewWeightDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input type="number" step="0.1" className="form-input" required value={newWeight} onChange={e => setNewWeight(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={newWeightNotes} onChange={e => setNewWeightNotes(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Weight</button>
            </form>
          )}

          {weightLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No weight records found for this animal.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date Recorded</th>
                  <th>Weight (kg)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {weightLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.dateRecorded).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>{log.weightKg} kg</td>
                    <td>{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB CONTENT: MOVEMENT */}
      {activeTab === 'movement' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Movement History</h2>
            <button className="btn btn-primary" onClick={() => setShowMovementForm(!showMovementForm)}>
              {showMovementForm ? 'Cancel' : 'Log Movement'}
            </button>
          </div>
          
          {showMovementForm && (
            <form onSubmit={handleAddMovement} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '16px' }}>New Movement Record</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date of Movement</label>
                  <input type="date" className="form-input" required value={newMovementDate} onChange={e => setNewMovementDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State Vet Permit Number</label>
                  <input type="text" className="form-input" placeholder="e.g. RC-12345" value={newPermitNumber} onChange={e => setNewPermitNumber(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input type="text" className="form-input" required placeholder="Farm Name / Camp" value={newOrigin} onChange={e => setNewOrigin(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input type="text" className="form-input" required placeholder="Buyer / Abattoir / Farm" value={newDestination} onChange={e => setNewDestination(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Registration</label>
                  <input type="text" className="form-input" placeholder="Truck Plate Number" value={newVehicleReg} onChange={e => setNewVehicleReg(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={newMovementNotes} onChange={e => setNewMovementNotes(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Movement</button>
            </form>
          )}

          {movementLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No movement records found for this animal.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Permit No.</th>
                  <th>Vehicle Reg</th>
                </tr>
              </thead>
              <tbody>
                {movementLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.movementDate).toLocaleDateString()}</td>
                    <td>{log.origin}</td>
                    <td>{log.destination}</td>
                    <td>{log.permitNumber || '-'}</td>
                    <td>{log.vehicleRegistration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
};
