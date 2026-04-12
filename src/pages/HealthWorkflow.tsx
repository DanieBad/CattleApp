import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { calculateAge, getAnimalIcon } from '../utils';
import {
  Activity, Search, ChevronRight, Loader2, AlertCircle,
  ArrowUpDown, ChevronUp, ChevronDown, User, Clock, Calendar, Shield,
} from 'lucide-react';

interface HerdRow {
  id: string;
  tagNumber: string;
  name: string | null;
  species: string;
  breed: string;
  sex: string;
  dateOfBirth: string | null;
  lastTreatmentDate: string | null;
  lastTreatmentType: string | null;
  isQuarantined: boolean;
}

type SortField = 'tagNumber' | 'age' | 'lastTreatmentDate' | 'lastTreatmentType';

export const HealthWorkflow = () => {
  const navigate = useNavigate();

  const [herd, setHerd] = useState<HerdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'All' | 'Cattle' | 'Sheep'>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: 'asc' | 'desc' }>({
    field: 'lastTreatmentDate',
    direction: 'desc',
  });

  // ── Fetch animals + last treatment per animal ────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: animals, error: aErr } = await supabase
          .from('animals')
          .select('id, tag_number, name, species, breed, sex, date_of_birth, is_quarantined')
          .eq('status', 'Active')
          .order('tag_number', { ascending: true });

        if (aErr) throw aErr;

        // Fetch all health logs ordered by date desc — then build a per-animal map
        const { data: logs } = await supabase
          .from('health_logs')
          .select('animal_id, treatment_type, date_administered')
          .order('date_administered', { ascending: false });

        const logMap: Record<string, { date: string; type: string }> = {};
        for (const log of logs || []) {
          if (!logMap[log.animal_id]) {
            logMap[log.animal_id] = { date: log.date_administered, type: log.treatment_type };
          }
        }

        setHerd((animals || []).map(a => ({
          id: a.id,
          tagNumber: a.tag_number,
          name: a.name,
          species: a.species || 'Cattle',
          breed: a.breed,
          sex: a.sex,
          dateOfBirth: a.date_of_birth,
          lastTreatmentDate: logMap[a.id]?.date || null,
          lastTreatmentType: logMap[a.id]?.type || null,
          isQuarantined: a.is_quarantined,
        })));
      } catch (err) {
        console.error('HealthWorkflow load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Sorting ──────────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    setSortConfig(prev =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return <ArrowUpDown size={14} style={{ marginLeft: '6px', opacity: 0.3 }} />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={14} style={{ marginLeft: '6px', color: 'var(--primary)' }} />
      : <ChevronDown size={14} style={{ marginLeft: '6px', color: 'var(--primary)' }} />;
  };

  const SortableHeader = ({ field, label, icon: Icon }: { field: SortField; label: string; icon?: any }) => (
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

  // ── Filter + sort ────────────────────────────────────────────────────────
  const displayRows = [...herd]
    .filter(a => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q
        || a.tagNumber.toLowerCase().includes(q)
        || (a.name?.toLowerCase().includes(q) ?? false)
        || a.breed.toLowerCase().includes(q);
      const matchesSpecies = speciesFilter === 'All' || a.species === speciesFilter;
      return matchesSearch && matchesSpecies;
    })
    .sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.field === 'tagNumber') {
        return a.tagNumber.localeCompare(b.tagNumber, undefined, { numeric: true }) * dir;
      }
      if (sortConfig.field === 'age') {
        const ta = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : 0;
        const tb = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : 0;
        return (tb - ta) * dir; // older DOB = older animal
      }
      if (sortConfig.field === 'lastTreatmentDate') {
        const da = a.lastTreatmentDate || '';
        const db2 = b.lastTreatmentDate || '';
        return da < db2 ? -dir : da > db2 ? dir : 0;
      }
      if (sortConfig.field === 'lastTreatmentType') {
        return (a.lastTreatmentType || '').localeCompare(b.lastTreatmentType || '') * dir;
      }
      return 0;
    });

  // ── Selection helpers ────────────────────────────────────────────────────
  const isAllSelected = displayRows.length > 0 && displayRows.every(a => selectedIds.has(a.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (isAllSelected) {
        displayRows.forEach(a => next.delete(a.id));
      } else {
        displayRows.forEach(a => next.add(a.id));
      }
      return next;
    });
  }, [displayRows, isAllSelected]);

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Continue routing ─────────────────────────────────────────────────────
  const handleContinue = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (ids.length === 1) {
      navigate(`/herd/${ids[0]}`, { state: { tab: 'health' } });
    } else {
      const selectedAnimals = herd.filter(a => selectedIds.has(a.id));
      navigate('/batch-health', { state: { preSelectedIds: ids, preSelectedAnimals: selectedAnimals } });
    }
  };


  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              flexShrink: 0,
            }}>
              <Activity size={18} />
            </div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Health</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', marginLeft: '48px' }}>
            Select one or more animals to log a treatment or vaccination.
          </p>
        </div>
      </div>

      {/* Search + species filter bar — identical pill group to My Herd */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by tag, name, or breed..."
            className="form-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            autoFocus
          />
        </div>

        {/* Species filter — same pill group styling as My Herd */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          {(['All', 'Cattle', 'Sheep'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSpeciesFilter(s)}
              style={{
                padding: '8px 16px',
                background: speciesFilter === s ? 'white' : 'transparent',
                color: speciesFilter === s ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontWeight: 600,
                boxShadow: speciesFilter === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {s === 'All' ? 'All' : s === 'Cattle' ? '🐂 Cattle' : '🐑 Sheep'}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        {/* Select-all row — same style as herd list header controls */}
        <div style={{
          padding: '12px 20px', backgroundColor: 'var(--bg-off)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            {isAllSelected ? 'Deselect All' : 'Select All Filtered'}
          </label>
          <span style={{ fontWeight: 600, color: selectedIds.size > 0 ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
            {selectedIds.size} Selected
          </span>
        </div>

        <div className="table-container">
          <table className="herd-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}></th>
                <SortableHeader field="tagNumber" label="Ear Tag" icon={User} />
                <SortableHeader field="age" label="Age" icon={Clock} />
                <SortableHeader field="lastTreatmentDate" label="Last Treatment" icon={Calendar} />
                <SortableHeader field="lastTreatmentType" label="Treatment Type" icon={Shield} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Loader2 size={22} className="animate-spin" />
                      Loading herd data...
                    </div>
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No animals found matching your criteria.
                  </td>
                </tr>
              ) : displayRows.map(animal => {
                const selected = selectedIds.has(animal.id);
                return (
                  <tr
                    key={animal.id}
                    style={animal.isQuarantined ? { backgroundColor: '#FFF7ED' } : {}}
                    className={`table-row-hover ${selected ? 'selected-row' : ''}`}
                    onClick={() => toggleOne(animal.id)}
                  >
                    {/* Checkbox */}
                    <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleOne(animal.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    </td>

                    {/* Ear Tag — same layout as My Herd: icon + green link */}
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {getAnimalIcon(animal.species, animal.breed, animal.sex)}
                        </span>
                        <span
                          onClick={e => { e.stopPropagation(); navigate(`/herd/${animal.id}`, { state: { tab: 'health' } }); }}
                          style={{ cursor: 'pointer', color: 'var(--primary)' }}
                          className="hover-underline"
                        >
                          {animal.tagNumber}
                        </span>
                        {animal.isQuarantined && (
                          <span title="Quarantined" style={{ color: '#F97316', display: 'flex' }}>
                            <Shield size={15} />
                          </span>
                        )}
                      </div>
                      {animal.name && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '37px' }}>
                          {animal.name}
                        </div>
                      )}
                    </td>

                    {/* Age — same pill badge */}
                    <td>
                      {animal.dateOfBirth ? (
                        <span style={{ backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.875rem' }}>
                          {calculateAge(animal.dateOfBirth).display}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Last Treatment Date — same raw ISO format + muted colour as My Herd */}
                    <td style={{ color: 'var(--text-muted)' }}>
                      {animal.lastTreatmentDate || '—'}
                    </td>

                    {/* Treatment Type — green badge same pill as status badges */}
                    <td>
                      {animal.lastTreatmentType ? (
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                          fontSize: '0.8rem', fontWeight: 600,
                          backgroundColor: '#D1FAE5', color: '#065F46',
                        }}>
                          {animal.lastTreatmentType}
                        </span>
                      ) : (
                        <span style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>No record</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer action bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'white', gap: '12px', flexWrap: 'wrap',
        }}>
          {selectedIds.size === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              Select at least one animal to continue
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {selectedIds.size === 1
                ? "1 animal selected — will open the animal's Health tab"
                : `${selectedIds.size} animals selected — will open Batch Health`}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={selectedIds.size === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
          >
            Continue <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
