import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Animal, Camp } from '../types';
import { calculateAge } from '../utils';

export const HerdList = () => {
  const navigate = useNavigate();
  const [herd, setHerd] = useState<Animal[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'All' | 'Cattle' | 'Sheep'>('All');

  useEffect(() => {
    fetchHerd();
  }, []);

  const fetchHerd = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('date_of_birth', { ascending: false });

      if (error) throw error;

      // Supabase returns snake_case, map it to our camelCase Animal interface
      const mappedHerd: Animal[] = data.map(dbAnimal => ({
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
        currentCampId: dbAnimal.current_camp_id
      }));

      setHerd(mappedHerd);

      const { data: campsData } = await supabase.from('camps').select('id, name');
      if (campsData) {
        setCamps(campsData as Camp[]);
      }
    } catch (error) {
      console.error('Error fetching herd:', error);
      alert('Failed to load herd data from cloud.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHerd = herd.filter(animal => {
    const matchesSearch = 
      animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.eidNumber && animal.eidNumber.includes(searchTerm)) ||
      animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSpecies = speciesFilter === 'All' ? true : animal.species === speciesFilter;
    
    return matchesSearch && matchesSpecies;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <span className="badge badge-green">Active</span>;
      case 'Sold': return <span className="badge badge-blue">Sold</span>;
      case 'Deceased': return <span className="badge badge-red">Deceased</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Herd</h1>
        <button className="btn btn-primary" onClick={() => navigate('/herd/add')}>
          + Add Animal
        </button>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search by tag, name, or breed..." 
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px', flex: 1 }}
        />
        
        <div style={{ display: 'flex', backgroundColor: 'var(--surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setSpeciesFilter('All')}
            style={{ padding: '8px 16px', background: speciesFilter === 'All' ? 'var(--primary)' : 'transparent', color: speciesFilter === 'All' ? 'white' : 'var(--text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            All Animals
          </button>
          <button 
            onClick={() => setSpeciesFilter('Cattle')}
            style={{ padding: '8px 16px', background: speciesFilter === 'Cattle' ? 'var(--primary)' : 'transparent', color: speciesFilter === 'Cattle' ? 'white' : 'var(--text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            🐄 Cattle
          </button>
          <button 
            onClick={() => setSpeciesFilter('Sheep')}
            style={{ padding: '8px 16px', background: speciesFilter === 'Sheep' ? 'var(--primary)' : 'transparent', color: speciesFilter === 'Sheep' ? 'white' : 'var(--text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            🐑 Sheep
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tag Number</th>
                <th>EID (15-digit)</th>
                <th>Name</th>
                <th>Breed</th>
                <th>Sex</th>
                <th>Age</th>
                <th>Camp / Pasture</th>
                <th>Status</th>
                <th>Weight</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Loading herd data from cloud...
                  </td>
                </tr>
              ) : filteredHerd.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No animals found matching your search.
                  </td>
                </tr>
              ) : (
                filteredHerd.map(animal => (
                  <tr key={animal.id} style={animal.isQuarantined ? { backgroundColor: 'rgba(239, 68, 68, 0.05)' } : {}}>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }}>
                        {animal.species === 'Sheep' ? '🐑' : '🐄'}
                      </span>
                      <span 
                        onClick={() => navigate(`/herd/${animal.id}`)}
                        style={{ cursor: 'pointer', color: 'var(--primary-dark)', textDecoration: 'underline' }}
                        title="View Profile"
                      >
                        {animal.tagNumber}
                      </span>
                      {animal.isQuarantined && <span title="Quarantined" style={{ marginLeft: '8px', fontSize: '1.2rem', verticalAlign: 'middle' }}>😷</span>}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{animal.eidNumber || '-'}</td>
                    <td>{animal.name || '-'}</td>
                    <td>{animal.breed}</td>
                    <td>{animal.sex}</td>
                    <td>{calculateAge(animal.dateOfBirth).display}</td>
                    <td>
                      {animal.currentCampId ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                          ⛺ {camps.find(c => c.id === animal.currentCampId)?.name || 'Unknown'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td>{getStatusBadge(animal.status)}</td>
                    <td>{animal.weight ? `${animal.weight} kg` : '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline"
                        onClick={() => navigate(`/herd/${animal.id}`)}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
