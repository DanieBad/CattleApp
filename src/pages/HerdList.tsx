import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowUpDown, ChevronUp, ChevronDown, Plus, Search, 
  MapPin, Calendar, Clock, User, Fingerprint 
} from 'lucide-react';
import { supabase } from '../supabase';
import type { Animal, Camp } from '../types';
import { calculateAge } from '../utils';

type SortField = 'tagNumber' | 'dateOfBirth' | 'age' | 'sex' | 'breed' | 'camp' | 'eidNumber' | 'lastBirthDate';

export const HerdList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const campIdParam = searchParams.get('campId');
  
  const [herd, setHerd] = useState<Animal[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'All' | 'Cattle' | 'Sheep'>('All');
  const [campFilter, setCampFilter] = useState<string | null>(campIdParam);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: 'asc' | 'desc' } | null>({
    field: 'dateOfBirth',
    direction: 'desc'
  });

  useEffect(() => {
    fetchHerd();
  }, []);

  const fetchHerd = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*');

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
        currentCampId: dbAnimal.current_camp_id,
        // Optional fields from Supabase
        brand: dbAnimal.brand,
        originGln: dbAnimal.origin_gln,
        previousOwnerTag: dbAnimal.previous_owner_tag,
        previousOwnerBrand: dbAnimal.previous_owner_brand,
        arrivalDate: dbAnimal.arrival_date,
        purchasePrice: dbAnimal.purchase_price,
        soldPrice: dbAnimal.sold_price
      }));

      // Calculate lastBirthDate for females
      mappedHerd.forEach(animal => {
        if (animal.sex === 'Female') {
          const offspring = mappedHerd.filter(a => a.damId === animal.id && a.dateOfBirth);
          if (offspring.length > 0) {
            const latest = offspring.reduce((a, b) => new Date(a.dateOfBirth).getTime() > new Date(b.dateOfBirth).getTime() ? a : b);
            (animal as any).lastBirthDate = latest.dateOfBirth;
          }
        }
      });

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

  const handleSort = (field: SortField) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  const getSortIcon = (field: SortField) => {
    if (!sortConfig || sortConfig.field !== field) return <ArrowUpDown size={14} style={{ marginLeft: '6px', opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} style={{ marginLeft: '6px', color: 'var(--primary)' }} /> 
      : <ChevronDown size={14} style={{ marginLeft: '6px', color: 'var(--primary)' }} />;
  };

  const sortedAndFilteredHerd = [...herd]
    .filter(animal => {
      const matchesSearch = 
        animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (animal.eidNumber && animal.eidNumber.includes(searchTerm)) ||
        animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesSpecies = speciesFilter === 'All' ? true : animal.species === speciesFilter;
      const matchesCamp = !campFilter ? true : animal.currentCampId === campFilter;
      
      return matchesSearch && matchesSpecies && matchesCamp;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      let valA: any = a[sortConfig.field as keyof Animal] ?? '';
      let valB: any = b[sortConfig.field as keyof Animal] ?? '';

      // Special handling for Age (calculated)
      if (sortConfig.field === 'age') {
        valA = new Date(a.dateOfBirth).getTime();
        valB = new Date(b.dateOfBirth).getTime();
        // Sorting by age descending means DOB ascending
        return sortConfig.direction === 'asc' ? valB - valA : valA - valB;
      }

      // Special handling for Camp (lookup)
      if (sortConfig.field === 'camp') {
        const campA = camps.find(c => c.id === a.currentCampId)?.name || '';
        const campB = camps.find(c => c.id === b.currentCampId)?.name || '';
        valA = campA;
        valB = campB;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSelection = (id: string) => {
    setSelectedAnimals(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedAnimals.length === sortedAndFilteredHerd.length) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(sortedAndFilteredHerd.map(a => a.id));
    }
  };

  const SortableHeader = ({ field, label, icon: Icon }: { field: SortField, label: string, icon?: any }) => (
    <th 
      onClick={() => handleSort(field)} 
      style={{ cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background-color 0.2s' }}
      className="sortable-header"
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {Icon && <Icon size={16} style={{ marginRight: '8px', opacity: 0.5 }} />}
        {label}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Herd</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and track your active livestock.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/herd/add')} style={{ gap: '8px' }}>
          <Plus size={20} /> Add Animal
        </button>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by tag, name, or breed..." 
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        
        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setSpeciesFilter('All')}
            style={{ padding: '8px 16px', background: speciesFilter === 'All' ? 'white' : 'transparent', color: speciesFilter === 'All' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, boxShadow: speciesFilter === 'All' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            All
          </button>
          <button 
            onClick={() => setSpeciesFilter('Cattle')}
            style={{ padding: '8px 16px', background: speciesFilter === 'Cattle' ? 'white' : 'transparent', color: speciesFilter === 'Cattle' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, boxShadow: speciesFilter === 'Cattle' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            🐄 Cattle
          </button>
          <button 
            onClick={() => setSpeciesFilter('Sheep')}
            style={{ padding: '8px 16px', background: speciesFilter === 'Sheep' ? 'white' : 'transparent', color: speciesFilter === 'Sheep' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, boxShadow: speciesFilter === 'Sheep' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            🐑 Sheep
          </button>
        </div>

        {campFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary-light)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--primary)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
              Filtering by Camp: {camps.find(c => c.id === campFilter)?.name || 'Loading...'}
            </span>
            <button 
              onClick={() => {
                setCampFilter(null);
                setSearchParams({});
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}
              title="Clear Filter"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="herd-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={sortedAndFilteredHerd.length > 0 && selectedAnimals.length === sortedAndFilteredHerd.length}
                    onChange={toggleSelectAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </th>
                <SortableHeader field="tagNumber" label="Ear Tag" icon={User} />
                <SortableHeader field="dateOfBirth" label="Date of Birth" icon={Calendar} />
                <SortableHeader field="age" label="Age" icon={Clock} />
                <SortableHeader field="lastBirthDate" label="Last Birth" icon={Calendar} />
                <SortableHeader field="sex" label="Sex" />
                <SortableHeader field="breed" label="Breed" />
                <SortableHeader field="camp" label="Camp" icon={MapPin} />
                <SortableHeader field="eidNumber" label="EID" icon={Fingerprint} />
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="loading-spinner"></div>
                      Loading herd data from cloud...
                    </div>
                  </td>
                </tr>
              ) : sortedAndFilteredHerd.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No animals found matching your criteria.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredHerd.map(animal => (
                  <tr 
                    key={animal.id} 
                    style={animal.isQuarantined ? { backgroundColor: '#FFF7ED' } : {}}
                    className={`table-row-hover ${selectedAnimals.includes(animal.id) ? 'selected-row' : ''}`}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedAnimals.includes(animal.id)}
                        onChange={() => toggleSelection(animal.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {animal.species === 'Sheep' ? '🐑' : '🐄'}
                        </span>
                        <span 
                          onClick={() => navigate(`/herd/${animal.id}`)}
                          style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'none' }}
                          className="hover-underline"
                        >
                          {animal.tagNumber}
                        </span>
                        {animal.isQuarantined && <span title="Quarantined" style={{ color: '#F97316' }}><Fingerprint size={16} /></span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{animal.dateOfBirth}</td>
                    <td>
                      <span style={{ backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.875rem' }}>
                        {calculateAge(animal.dateOfBirth).display}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {animal.sex === 'Female' ? ((animal as any).lastBirthDate || '—') : '—'}
                    </td>
                    <td>
                      <span style={{ color: animal.sex === 'Female' ? '#EC4899' : '#3B82F6', fontWeight: 500 }}>
                        {animal.sex}
                      </span>
                    </td>
                    <td>{animal.breed}</td>
                    <td>
                      {animal.currentCampId ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-dark)', fontWeight: 500 }}>
                          <MapPin size={14} />
                          {camps.find(c => c.id === animal.currentCampId)?.name || 'Unknown'}
                        </span>
                      ) : (
                        <span style={{ color: '#CBD5E1' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {animal.eidNumber || '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/herd/${animal.id}`)}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedAnimals.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1E293B',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          zIndex: 100
        }} className="fade-in">
          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {selectedAnimals.length} Animal{selectedAnimals.length !== 1 ? 's' : ''} Selected
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn"
              style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: '1px solid #475569' }}
              onClick={() => setSelectedAnimals([])}
            >
              Clear
            </button>
            <button 
              className="btn btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#059669' }}
              onClick={() => navigate('/herd/batch-move', { state: { selectedIds: selectedAnimals } })}
            >
              Batch Move / Sell &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
