import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Animal } from '../types';
import { calculateAge } from '../utils';

export const HerdList = () => {
  const navigate = useNavigate();
  const [herd, setHerd] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        weight: dbAnimal.weight
      }));

      setHerd(mappedHerd);
    } catch (error) {
      console.error('Error fetching herd:', error);
      alert('Failed to load herd data from cloud.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHerd = herd.filter(animal => 
    animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (animal.eidNumber && animal.eidNumber.includes(searchTerm)) ||
    animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search by tag, name, or breed..." 
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
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
                      {animal.tagNumber}
                      {animal.isQuarantined && <span title="Quarantined" style={{ marginLeft: '8px', fontSize: '1.2rem', verticalAlign: 'middle' }}>😷</span>}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{animal.eidNumber || '-'}</td>
                    <td>{animal.name || '-'}</td>
                    <td>{animal.breed}</td>
                    <td>{animal.sex}</td>
                    <td>{calculateAge(animal.dateOfBirth).display}</td>
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
