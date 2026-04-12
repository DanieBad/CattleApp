import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { TraceabilityForm, type TraceabilityData } from '../components/TraceabilityForm';
import { calculateAge, getAnimalIcon } from '../utils';
import {
  PackageMinus, Check, ArrowLeft, Loader2,
  ArrowUpDown, ChevronUp, ChevronDown, User, Clock, Search,
  FileText, MapPin, Calendar, Tag,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const today = new Date().toISOString().split('T')[0];

interface HerdRow {
  id: string; tagNumber: string; name: string | null;
  species: string; breed: string; sex: string;
  dateOfBirth: string | null; isQuarantined: boolean;
}

type SortField = 'tagNumber' | 'age';

const emptyBuyerInfo = (): TraceabilityData => ({
  partyName: '', farmName: '', partyGln: '', glnCertFile: null,
  gpsCoordinates: '', permitNumber: '', permitFile: null, transactionDate: today,
});

// ── 4-step progress bar ────────────────────────────────────
const STEPS = ['Buyer Info', 'Select Animals', 'Confirm', 'Done'];
const StepBar = ({ step }: { step: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
    {STEPS.map((label, i) => {
      const s = i + 1;
      return (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < STEPS.length ? 1 : 'none' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            background: step >= s ? '#2563eb' : '#E2E8F0',
            color: step >= s ? 'white' : 'var(--text-muted)',
          }}>
            {step > s ? <Check size={16} /> : s}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginLeft: '8px', whiteSpace: 'nowrap', color: step >= s ? '#2563eb' : 'var(--text-muted)' }}>
            {label}
          </div>
          {s < STEPS.length && <div style={{ flex: 1, height: '2px', background: step > s ? '#2563eb' : '#E2E8F0', margin: '0 12px' }} />}
        </div>
      );
    })}
  </div>
);

// ── Review info row helper ────────────────────────────────
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) =>
  value ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>{icon}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '130px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-word' }}>{value}</span>
    </div>
  ) : null;

export const SellingWizard = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating]   = useState(false);
  const [saleRecordId, setSaleRecordId] = useState<string | null>(null);

  // Step 1 – buyer info
  const [buyerInfo, setBuyerInfo] = useState<TraceabilityData>(emptyBuyerInfo());

  // Step 2 – herd
  const PAGE_SIZE = 25;
  const [herd, setHerd] = useState<HerdRow[]>([]);
  const [loading, setLoading]       = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'All' | 'Cattle' | 'Sheep'>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig]  = useState<{ field: SortField; direction: 'asc' | 'desc' }>({ field: 'tagNumber', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Step 4 – done display
  const [soldAnimals, setSoldAnimals] = useState<{ id: string; tagNumber: string; species: string; breed: string; sex: string; price: string }[]>([]);

  // ── Load active herd when entering Step 2 ────────────────
  useEffect(() => {
    if (step === 2) {
      setLoading(true);
      supabase.from('animals')
        .select('id, tag_number, name, species, breed, sex, date_of_birth, is_quarantined')
        .eq('status', 'Active').order('tag_number', { ascending: true })
        .then(({ data }) => {
          setHerd((data || []).map((a: any) => ({
            id: a.id, tagNumber: a.tag_number, name: a.name,
            species: a.species || 'Cattle', breed: a.breed, sex: a.sex,
            dateOfBirth: a.date_of_birth, isQuarantined: a.is_quarantined,
          })));
          setLoading(false);
        });
    }
  }, [step]);

  // ── GPS ───────────────────────────────────────────────────
  const handleUseLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setBuyerInfo(p => ({ ...p, gpsCoordinates: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` })); setIsLocating(false); },
      () => { alert('Could not get location.'); setIsLocating(false); }
    );
  };

  // ── File upload ───────────────────────────────────────────
  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from('trade-documents').upload(path, file, { upsert: true });
    if (error) return null;
    return supabase.storage.from('trade-documents').getPublicUrl(path).data.publicUrl;
  };

  // ── Step 1: Save buyer info → DB ─────────────────────────
  const handleSaveBuyerInfo = async () => {
    setIsSubmitting(true);
    try {
      const tempId = uuidv4();
      const glnCertUrl = buyerInfo.glnCertFile ? await uploadFile(buyerInfo.glnCertFile, `${tempId}/gln-cert`) : null;
      const permitUrl  = buyerInfo.permitFile  ? await uploadFile(buyerInfo.permitFile,  `${tempId}/permit`)   : null;

      const { data, error } = await supabase.from('sale_records').insert({
        id: tempId, transaction_type: 'Sell',
        party_name: buyerInfo.partyName || null,
        farm_name: buyerInfo.farmName || null,
        party_gln: buyerInfo.partyGln || null,
        gln_certificate_url: glnCertUrl,
        gps_coordinates: buyerInfo.gpsCoordinates || null,
        permit_number: buyerInfo.permitNumber || null,
        permit_url: permitUrl,
        transaction_date: buyerInfo.transactionDate || null,
      }).select('id').single();

      if (error) throw error;
      setSaleRecordId(data.id);
      setStep(2);
    } catch (err: any) {
      alert(`Failed to save buyer info: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: sort / filter ─────────────────────────────────
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return <ArrowUpDown size={14} style={{ marginLeft: '6px', opacity: 0.3 }} />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={14} style={{ marginLeft: '6px', color: '#2563eb' }} />
      : <ChevronDown size={14} style={{ marginLeft: '6px', color: '#2563eb' }} />;
  };
  const handleSort = (f: SortField) =>
    setSortConfig(p => p.field === f ? { field: f, direction: p.direction === 'asc' ? 'desc' : 'asc' } : { field: f, direction: 'asc' });

  const displayRows = [...herd]
    .filter(a => {
      const q = searchTerm.toLowerCase();
      return (!q || a.tagNumber.toLowerCase().includes(q) || (a.name?.toLowerCase().includes(q) ?? false) || a.breed.toLowerCase().includes(q))
        && (speciesFilter === 'All' || a.species === speciesFilter);
    })
    .sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.field === 'tagNumber') return a.tagNumber.localeCompare(b.tagNumber, undefined, { numeric: true }) * dir;
      if (sortConfig.field === 'age') {
        const ta = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : 0;
        const tb = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : 0;
        return (tb - ta) * dir;
      }
      return 0;
    });

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(displayRows.length / PAGE_SIZE));
  const pagedRows = displayRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 whenever search or species filter changes
  useEffect(() => setCurrentPage(1), [searchTerm, speciesFilter]);

  // 'Select All' / 'Deselect All' applies only to the current page's visible rows
  const isAllPageSelected = pagedRows.length > 0 && pagedRows.every(a => selectedIds.has(a.id));
  const toggleAll = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (isAllPageSelected) pagedRows.forEach(a => next.delete(a.id));
      else pagedRows.forEach(a => next.add(a.id));
      return next;
    });
  }, [pagedRows, isAllPageSelected]);
  const toggleOne = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const totalValue = Array.from(selectedIds).reduce((s, id) => s + (parseFloat(prices[id] || '0') || 0), 0);

  // ── Step 2 → Step 3 (Review): no DB writes yet ───────────
  const handleProceedToReview = () => {
    if (selectedIds.size === 0) { alert('Select at least one animal.'); return; }
    setStep(3);
  };

  // ── Step 3 → Step 4: Final DB commit ─────────────────────
  const handleFinalCommit = async () => {
    if (!saleRecordId) return;
    setIsSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      const results: typeof soldAnimals = [];

      for (const id of ids) {
        const animal = herd.find(a => a.id === id)!;
        const price = prices[id] ? parseFloat(prices[id]) : null;

        // Mark animal as Sold
        await supabase.from('animals').update({ status: 'Sold', sold_price: price }).eq('id', id);

        // Sale movement log
        await supabase.from('movement_log').insert({
          id: uuidv4(), animal_id: id,
          movement_date: buyerInfo.transactionDate || today,
          origin: 'Farm',
          destination: buyerInfo.partyGln ? `GLN: ${buyerInfo.partyGln}` : (buyerInfo.farmName || 'External Buyer'),
          destination_gps: buyerInfo.gpsCoordinates || null,
          destination_gln: buyerInfo.partyGln || null,
          permit_number: buyerInfo.permitNumber || null,
          notes: `Sold to ${buyerInfo.partyName || 'unknown buyer'} — auto log`,
        });

        // Link to sale record with per-animal price
        await supabase.from('animal_sale_links').insert({ sale_record_id: saleRecordId, animal_id: id, sale_price: price });

        results.push({ id, tagNumber: animal.tagNumber, species: animal.species, breed: animal.breed, sex: animal.sex, price: prices[id] || '—' });
      }

      setSoldAnimals(results);
      setStep(4);
    } catch (err: any) {
      alert(`Failed to confirm sale: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Review helpers ────────────────────────────────────────
  // Build the review list from selectedIds + herd (which we still have in state)
  const reviewItems = Array.from(selectedIds)
    .map(id => ({ animal: herd.find(a => a.id === id)!, price: prices[id] || '' }))
    .filter(r => r.animal);

  return (
    <div className="fade-in" style={{ maxWidth: '900px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={() => navigate('/buy-sell')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Buy / Sell
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <PackageMinus size={20} />
        </div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Selling Animals</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Select animals and capture buyer traceability.</p>
        </div>
      </div>
      <StepBar step={step} />

      {/* ── STEP 1: Buyer Info ── */}
      {step === 1 && (
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Buyer / Destination Details</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Capture buyer traceability information. All fields are optional.
          </p>
          <TraceabilityForm mode="sell" data={buyerInfo} onChange={setBuyerInfo} isLocating={isLocating} onUseLocation={handleUseLocation} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <button className="btn btn-outline" onClick={() => navigate('/buy-sell')}>Cancel</button>
            <button className="btn" style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleSaveBuyerInfo} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Next: Select Animals →'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Select Animals ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── Always-visible selection summary — above everything ── */}
          <div style={{
            backgroundColor: selectedIds.size > 0 ? '#1E293B' : '#F8FAFC',
            border: `1px solid ${selectedIds.size > 0 ? '#334155' : 'var(--border)'}`,
            borderRadius: '12px', padding: '14px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
            transition: 'background-color 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {selectedIds.size > 0 ? (
                <>
                  <span style={{ backgroundColor: '#2563eb', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                    {selectedIds.size}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>animal{selectedIds.size !== 1 ? 's' : ''} selected</span>
                  <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '1rem' }}>
                    R {totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select animals below — tick a row to add it to the sale</span>
              )}
            </div>
            {selectedIds.size > 0 && (
              <button
                className="btn"
                style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                onClick={handleProceedToReview}
              >
                <Check size={16} /> Review {selectedIds.size} Animal{selectedIds.size !== 1 ? 's' : ''} →
              </button>
            )}
          </div>
          {/* Search + filter */}
          <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" className="form-input" placeholder="Search by tag, name, or breed…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '40px' }} />
            </div>
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
              {(['All', 'Cattle', 'Sheep'] as const).map(s => (
                <button key={s} onClick={() => setSpeciesFilter(s)} style={{
                  padding: '8px 16px', background: speciesFilter === s ? 'white' : 'transparent',
                  color: speciesFilter === s ? '#2563eb' : 'var(--text-muted)', border: 'none',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                  boxShadow: speciesFilter === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}>
                  {s === 'Cattle' ? '🐂 Cattle' : s === 'Sheep' ? '🐑 Sheep' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Herd table */}
          <div className="card">
            <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-off)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#2563eb', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={isAllPageSelected} onChange={toggleAll}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }} />
                {isAllPageSelected ? 'Deselect Page' : 'Select Page'}
              </label>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Page {currentPage} of {totalPages} &nbsp;·&nbsp; {displayRows.length} animals
              </span>
            </div>

            <div className="table-container">
              <table className="herd-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th onClick={() => handleSort('tagNumber')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}><User size={16} style={{ marginRight: '8px', opacity: 0.5 }} />Ear Tag{getSortIcon('tagNumber')}</div>
                    </th>
                    <th onClick={() => handleSort('age')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}><Clock size={16} style={{ marginRight: '8px', opacity: 0.5 }} />Age{getSortIcon('age')}</div>
                    </th>
                    <th>Selling Price (R)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}><Loader2 size={22} />Loading herd…</div>
                    </td></tr>
                  ) : pagedRows.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No animals match.</td></tr>
                  ) : pagedRows.map(animal => {
                    const sel = selectedIds.has(animal.id);
                    return (
                      <tr key={animal.id} className={`table-row-hover ${sel ? 'selected-row' : ''}`}
                        style={animal.isQuarantined ? { backgroundColor: '#FFF7ED' } : {}} onClick={() => toggleOne(animal.id)}>
                        <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={sel} onChange={() => toggleOne(animal.id)}
                            style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }} />
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.25rem' }}>{getAnimalIcon(animal.species, animal.breed, animal.sex)}</span>
                            <span style={{ color: '#2563eb' }}>{animal.tagNumber}</span>
                          </div>
                          {animal.name && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '37px' }}>{animal.name}</div>}
                        </td>
                        <td>
                          {animal.dateOfBirth
                            ? <span style={{ backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.875rem' }}>{calculateAge(animal.dateOfBirth).display}</span>
                            : '—'}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          {sel ? (
                            <input type="number" className="form-input" placeholder="0.00" step="0.01"
                              style={{ maxWidth: '140px', padding: '6px 10px', fontSize: '0.9rem' }}
                              value={prices[animal.id] || ''}
                              onChange={e => setPrices(prev => ({ ...prev, [animal.id]: e.target.value }))} />
                          ) : <span style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>— select to enter</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination controls ── */}
            {totalPages > 1 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                >
                  ← Previous
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) => p === '...' ? (
                      <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
                    ) : (
                      <button key={p} onClick={() => setCurrentPage(p as number)}
                        style={{
                          width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                          background: currentPage === p ? '#2563eb' : '#F1F5F9',
                          color: currentPage === p ? 'white' : 'var(--text-main)',
                        }}
                      >{p}</button>
                    ))}
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Review & Confirm (no DB writes until confirmed) ── */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="#2563eb" /> Review Sale — Please confirm before saving
            </h2>

            {/* Buyer info summary */}
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, marginBottom: '12px', color: '#1e40af', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Buyer / Destination
              </div>
              <InfoRow icon={<Tag size={14} />}      label="Name / Company"      value={buyerInfo.partyName} />
              <InfoRow icon={<Tag size={14} />}      label="Farm Name"           value={buyerInfo.farmName} />
              <InfoRow icon={<FileText size={14} />} label="GLN"                 value={buyerInfo.partyGln} />
              <InfoRow icon={<MapPin size={14} />}   label="GPS Coordinates"     value={buyerInfo.gpsCoordinates} />
              <InfoRow icon={<FileText size={14} />} label="Permit No"           value={buyerInfo.permitNumber} />
              <InfoRow icon={<Calendar size={14} />} label="Date Leaving Farm"   value={buyerInfo.transactionDate} />
              {(!buyerInfo.partyName && !buyerInfo.farmName && !buyerInfo.partyGln) && (
                <div style={{ color: '#93c5fd', fontSize: '0.85rem' }}>No buyer details captured.</div>
              )}
            </div>

            {/* Animals to sell */}
            <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Animals to be Sold ({reviewItems.length})
            </div>
            <table className="herd-table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Breed / Sex</th>
                  <th>Selling Price</th>
                </tr>
              </thead>
              <tbody>
                {reviewItems.map(({ animal, price }) => (
                  <tr key={animal.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{getAnimalIcon(animal.species, animal.breed, animal.sex)}</span>
                        <span style={{ color: '#2563eb' }}>{animal.tagNumber}</span>
                      </div>
                      {animal.name && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '37px' }}>{animal.name}</div>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{animal.breed} · {animal.sex}</td>
                    <td style={{ fontWeight: 600 }}>
                      {price ? `R ${parseFloat(price).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalValue > 0 && (
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb', fontSize: '1rem', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                Total: R {totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
            )}

            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#991B1B', marginTop: '16px' }}>
              ⚠️ Confirming will permanently mark {reviewItems.length} animal{reviewItems.length !== 1 ? 's' : ''} as <strong>Sold</strong> and cannot be undone from here.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={15} /> Back — Edit Selection
              </button>
              <button
                className="btn"
                style={{ background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={handleFinalCommit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                  : <><Check size={16} /> Confirm &amp; Complete Sale</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Done ── */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '28px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <Check size={24} />
              </div>
              <div>
                <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.3rem' }}>Sale Recorded!</h2>
                <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem' }}>
                  {soldAnimals.length} animal{soldAnimals.length !== 1 ? 's' : ''} marked as Sold and linked to buyer record.
                </p>
              </div>
            </div>

            {/* Summary table with correct icons (breed + sex stored in soldAnimals) */}
            <table className="herd-table" style={{ margin: 0 }}>
              <thead><tr><th>Animal</th><th>Breed / Sex</th><th>Selling Price</th></tr></thead>
              <tbody>
                {soldAnimals.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{getAnimalIcon(a.species, a.breed, a.sex)}</span>
                        <span style={{ color: '#2563eb' }}>{a.tagNumber}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{a.breed} · {a.sex}</td>
                    <td style={{ fontWeight: 600 }}>
                      {a.price && a.price !== '—' ? `R ${parseFloat(a.price).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {soldAnimals.some(a => a.price && a.price !== '—') && (
              <div style={{ marginTop: '12px', textAlign: 'right', fontWeight: 700, color: '#1e40af', fontSize: '1rem' }}>
                Total: R {soldAnimals.reduce((s, a) => s + (parseFloat(a.price) || 0), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn" style={{ background: '#2563eb', color: 'white' }} onClick={() => navigate('/herd')}>View My Herd →</button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Dashboard</button>
            <button className="btn btn-outline" onClick={() => {
              setSoldAnimals([]); setSelectedIds(new Set()); setPrices({});
              setSaleRecordId(null); setBuyerInfo(emptyBuyerInfo()); setStep(1);
            }}>Record Another Sale</button>
          </div>
        </div>
      )}
    </div>
  );
};
