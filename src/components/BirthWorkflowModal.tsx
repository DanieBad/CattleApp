import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { db } from '../database/db';
import { SyncManager } from '../services/syncManager';
import { v4 as uuidv4 } from 'uuid';
import { useSubscription } from '../context/SubscriptionContext';
import type { Breed, Camp } from '../types';
import { X, Baby, Search, ChevronRight, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

interface BirthWorkflowModalProps {
  onClose: () => void;
  /** Pass a pre-selected mother (from Animal Profile "Add Calf" button) */
  initialMother?: {
    id: string;
    tag_number: string;
    name?: string;
    breed: string;
    species: string;
    sex: string;
    current_camp_id?: string | null;
    is_quarantined?: boolean;
    quarantine_end_date?: string | null;
  } | null;
}

const CATTLE_BREEDS = ['Bonsmara', 'Brahman', 'Nguni', 'Simmentaler', 'Afrikaner', 'Drakensberger', 'Boran', 'Tuli', 'Sussex', 'Angus', 'Wagyu', 'Hereford', 'Crossbreed', 'Other'];
const SHEEP_BREEDS = ['Dorper', 'Merino', 'Dohne Merino', 'Meatmaster', 'Damara', 'Letelle', 'Afrino', 'Ile de France', 'Crossbreed', 'Other'];

export const BirthWorkflowModal = ({ onClose, initialMother }: BirthWorkflowModalProps) => {
  const navigate = useNavigate();
  const { isBlocked, isAtLimit, planName } = useSubscription();

  // ── Step 1: Mother selection ─────────────────────────────────────────────
  const [motherSearch, setMotherSearch] = useState(initialMother?.tag_number || '');
  const [motherResults, setMotherResults] = useState<any[]>([]);
  const [isSearchingMother, setIsSearchingMother] = useState(false);
  const [selectedMother, setSelectedMother] = useState<any | null>(initialMother || null);
  const [showMotherDropdown, setShowMotherDropdown] = useState(false);
  const [calveWarning, setCalveWarning] = useState<{ date: string; months: number } | null>(null);
  const [calveWarningConfirmed, setCalveWarningConfirmed] = useState(false);
  const motherSearchRef = useRef<HTMLDivElement>(null);

  // ── Step 2: Sire selection ───────────────────────────────────────────────
  const [sireSearch, setSireSearch] = useState('');
  const [sireResults, setSireResults] = useState<any[]>([]);
  const [isSearchingSire, setIsSearchingSire] = useState(false);
  const [selectedSire, setSelectedSire] = useState<any | null>(null);
  const [showSireDropdown, setShowSireDropdown] = useState(false);
  const sireSearchRef = useRef<HTMLDivElement>(null);

  // ── Form data ────────────────────────────────────────────────────────────
  const [camps, setCamps] = useState<Camp[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    tagNumber: '',
    eidNumber: '',
    sex: 'Female' as 'Male' | 'Female',
    dateOfBirth: new Date().toISOString().split('T')[0],
    breed: (initialMother?.breed || '') as Breed | '',
    weight: '' as string,
    currentCampId: initialMother?.current_camp_id || '',
  });

  // ── Load camps (Supabase), farm settings, default sire, and check calving if initialMother ──
  useEffect(() => {
    const init = async () => {
      // Fetch camps from Supabase to ensure they match the animal's camp IDs
      const { data: campData } = await supabase.from('camps').select('id, name, size_hectares, notes, created_at, user_id').order('name');
      if (campData) {
        setCamps(campData.map(c => ({ id: c.id, userId: c.user_id, name: c.name, sizeHectares: c.size_hectares, notes: c.notes, createdAt: c.created_at })));
      }

      // If a mother was pre-selected (from Animal Profile), run the full selectMother logic
      if (initialMother) {
        await runMotherChecks(initialMother);
      }
    };
    init();

    const handleOutside = (e: MouseEvent) => {
      if (motherSearchRef.current && !motherSearchRef.current.contains(e.target as Node)) setShowMotherDropdown(false);
      if (sireSearchRef.current && !sireSearchRef.current.contains(e.target as Node)) setShowSireDropdown(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ── Load default sire once mother species is known ───────────────────────
  const loadDefaultSire = async (species: string) => {
    const { data } = await supabase.from('animals')
      .select('id, tag_number, name, breed, species')
      .eq('status', 'Active').eq('sex', 'Male').eq('species', species)
      .order('tag_number', { ascending: true })
      .limit(1);
    if (data && data.length > 0) {
      setSelectedSire(data[0]);
      setSireSearch(data[0].tag_number);
    }
  };

  // ── Shared mother-check logic (calving warning + default sire + camp) ────
  const runMotherChecks = async (mother: any) => {
    // Check last calving date
    const { data: offspring } = await supabase.from('animals')
      .select('date_of_birth').eq('dam_id', mother.id).eq('status', 'Active')
      .order('date_of_birth', { ascending: false }).limit(1);

    if (offspring && offspring.length > 0) {
      const lastDob = new Date(offspring[0].date_of_birth);
      const monthsAgo = (Date.now() - lastDob.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      if (monthsAgo < 10) {
        setCalveWarning({ date: offspring[0].date_of_birth, months: Math.floor(monthsAgo) });
      }
    }

    // Load default sire
    await loadDefaultSire(mother.species);
  };

  // ── Mother live search (debounced) ───────────────────────────────────────
  useEffect(() => {
    if (!motherSearch.trim() || selectedMother) { setMotherResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearchingMother(true);
      const { data } = await supabase.from('animals')
        .select('id, tag_number, name, breed, species, sex, current_camp_id, is_quarantined, quarantine_end_date')
        .eq('status', 'Active').eq('sex', 'Female')
        .or(`tag_number.ilike.${motherSearch}%,name.ilike.${motherSearch}%`)
        .limit(8);
      setMotherResults(data || []);
      setIsSearchingMother(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [motherSearch, selectedMother]);

  // ── Sire live search (debounced) ─────────────────────────────────────────
  useEffect(() => {
    if (!sireSearch.trim() || selectedSire || !selectedMother) { setSireResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearchingSire(true);
      const { data } = await supabase.from('animals')
        .select('id, tag_number, name, breed, species')
        .eq('status', 'Active').eq('sex', 'Male').eq('species', selectedMother.species)
        .or(`tag_number.ilike.${sireSearch}%,name.ilike.${sireSearch}%`)
        .limit(8);
      setSireResults(data || []);
      setIsSearchingSire(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [sireSearch, selectedSire, selectedMother]);

  const selectMother = async (mother: any) => {
    setSelectedMother(mother);
    setMotherSearch(mother.tag_number);
    setShowMotherDropdown(false);
    setCalveWarning(null);
    setCalveWarningConfirmed(false);
    setSelectedSire(null);
    setSireSearch('');

    setFormData(prev => ({
      ...prev,
      breed: (mother.breed || '') as Breed,
      currentCampId: mother.current_camp_id || '',
    }));

    await runMotherChecks(mother);
  };

  // ── Auto-generate tag number ─────────────────────────────────────────────
  const generateTagNumber = async (): Promise<string> => {
    if (!selectedMother) return '';
    const base = `${selectedMother.tag_number}-`;
    const { data } = await supabase.from('animals')
      .select('tag_number').ilike('tag_number', `${base}%`);
    const existing = (data || []).map((a: any) => a.tag_number);
    for (let i = 1; i <= 99; i++) {
      const candidate = `${base}${String(i).padStart(2, '0')}`;
      if (!existing.includes(candidate)) return candidate;
    }
    return `${base}01`;
  };

  // ── Quarantine logic: inherit from mother ────────────────────────────────
  const getQuarantineFields = () => {
    const mother = selectedMother;
    if (!mother?.is_quarantined || !mother?.quarantine_end_date) {
      return { isQuarantined: false, quarantineStartDate: undefined, quarantineEndDate: undefined };
    }
    const today = new Date().toISOString().split('T')[0];
    return {
      isQuarantined: true,
      quarantineStartDate: today,
      quarantineEndDate: mother.quarantine_end_date,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMother) { toast.error('Please select a mother first.'); return; }
    if (calveWarning && !calveWarningConfirmed) { toast.error('Please confirm the calving warning before continuing.'); return; }

    if (isBlocked) { toast.error('Your free trial has ended. Please select a plan to continue.'); navigate('/billing'); return; }
    if (isAtLimit) { toast.error(`You've reached your ${planName} plan limit. Upgrade to add more.`); navigate('/billing'); return; }

    setSaving(true);
    try {
      const animalId = uuidv4();
      const tagNumber = formData.tagNumber.trim() || await generateTagNumber();
      const today = new Date().toISOString().split('T')[0];
      const { isQuarantined, quarantineStartDate, quarantineEndDate } = getQuarantineFields();

      const newAnimal = {
        id: animalId,
        species: selectedMother.species,
        tagNumber,
        eidNumber: formData.eidNumber || undefined,
        isQuarantined,
        breed: (formData.breed || selectedMother.breed || 'Other') as Breed,
        sex: formData.sex,
        dateOfBirth: formData.dateOfBirth,
        status: 'Active' as const,
        damId: selectedMother.id,
        sireId: selectedSire?.id || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        currentCampId: formData.currentCampId || undefined,
        quarantineStartDate,
        quarantineEndDate,
      };

      await db.animals.add(newAnimal);
      await SyncManager.queueInsert('animals', animalId, {
        id: newAnimal.id,
        species: newAnimal.species,
        tag_number: newAnimal.tagNumber,
        eid_number: newAnimal.eidNumber,
        is_quarantined: isQuarantined,
        breed: newAnimal.breed,
        sex: newAnimal.sex,
        date_of_birth: newAnimal.dateOfBirth,
        status: newAnimal.status,
        dam_id: newAnimal.damId,
        sire_id: newAnimal.sireId,
        weight: newAnimal.weight,
        current_camp_id: newAnimal.currentCampId,
        quarantine_start_date: quarantineStartDate,
        quarantine_end_date: quarantineEndDate,
      });

      // Initial movement log
      const movementId = uuidv4();
      const destCamp = camps.find(c => c.id === formData.currentCampId)?.name || 'Unassigned';
      const movementPayload = {
        id: movementId, animal_id: animalId,
        movement_date: today, origin: `Born on farm — dam: ${selectedMother.tag_number}`,
        destination: destCamp, notes: 'Automatic log on birth registration',
      };
      await db.movement_log.add({ id: movementId, animalId, movementDate: today, origin: movementPayload.origin, destination: destCamp, notes: movementPayload.notes, createdAt: new Date().toISOString() });
      await SyncManager.queueInsert('movement_log', movementId, movementPayload);

      toast.success(`${newAnimal.species === 'Cattle' ? 'Calf' : 'Lamb'} "${tagNumber}" registered successfully!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error saving birth record: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const breeds = selectedMother?.species === 'Sheep' ? SHEEP_BREEDS : CATTLE_BREEDS;
  const speciesLabel = selectedMother?.species === 'Sheep'
    ? { young: 'Lamb', sire: 'Ram', dam: 'Ewe' }
    : { young: 'Calf', sire: 'Bull', dam: 'Cow' };

  const { isQuarantined: willBeQuarantined, quarantineEndDate: inheritedQEnd } = getQuarantineFields();

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'white', position: 'relative' }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Baby size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>Register New Birth</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>New Calf / Lamb Workflow</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 28px 28px' }}>
          {/* SECTION 1: Mother */}
          <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Step 1 — Select {selectedMother ? speciesLabel.dam : 'Mother'}
            </h3>

            <div ref={motherSearchRef} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by tag or name (female animals)..."
                  style={{ paddingLeft: '38px', paddingRight: selectedMother ? '38px' : '12px' }}
                  value={motherSearch}
                  onChange={e => {
                    setMotherSearch(e.target.value);
                    setSelectedMother(null);
                    setShowMotherDropdown(true);
                    setCalveWarning(null);
                    setCalveWarningConfirmed(false);
                    setSireSearch('');
                    setSelectedSire(null);
                    setFormData(prev => ({ ...prev, currentCampId: '', breed: '' }));
                  }}
                  onFocus={() => { if (!selectedMother) setShowMotherDropdown(true); }}
                  autoFocus={!initialMother}
                />
                {selectedMother && (
                  <Check size={16} color="#10b981" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                )}
              </div>

              {showMotherDropdown && !selectedMother && motherSearch.trim() && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: '6px', overflow: 'hidden' }}>
                  {isSearchingMother ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Searching...</div>
                  ) : motherResults.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No female animals found</div>
                  ) : motherResults.map(a => (
                    <div key={a.id} onClick={() => selectMother(a)}
                      style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{a.tag_number}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.875rem' }}>{a.name ? `(${a.name}) · ` : ''}{a.breed} · {a.species}</span>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calving warning */}
            {calveWarning && (
              <div style={{ marginTop: '12px', padding: '14px', backgroundColor: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#92400E', fontSize: '0.9rem' }}>
                    Last calving was on {calveWarning.date} — only {calveWarning.months} month{calveWarning.months !== 1 ? 's' : ''} ago.
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={calveWarningConfirmed} onChange={e => setCalveWarningConfirmed(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#D97706' }} />
                    <span style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: 500 }}>I confirm this is correct and want to proceed</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Birth details */}
          {selectedMother && (!calveWarning || calveWarningConfirmed) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Step 2 — {speciesLabel.young} Details
              </h3>

              {/* Sex */}
              <div className="form-group">
                <label className="form-label">Sex *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(['Female', 'Male'] as const).map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '12px 16px', borderRadius: '10px', border: `2px solid ${formData.sex === s ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: formData.sex === s ? 'var(--primary-light)' : 'transparent', transition: 'all 0.15s', fontWeight: 600 }}>
                      <input type="radio" name="sex" value={s} checked={formData.sex === s} onChange={() => setFormData(p => ({...p, sex: s}))} style={{ display: 'none' }} />
                      <span style={{ fontSize: '1.1rem' }}>{s === 'Female' ? '♀️' : '♂️'}</span>
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="responsive-grid-2col">
                {/* Date of Birth */}
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input type="date" className="form-input" value={formData.dateOfBirth}
                    onChange={e => setFormData(p => ({...p, dateOfBirth: e.target.value}))} required />
                </div>

                {/* Breed */}
                <div className="form-group">
                  <label className="form-label">Breed</label>
                  <select className="form-select" value={formData.breed} onChange={e => setFormData(p => ({...p, breed: e.target.value as Breed}))}>
                    {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* EID */}
                <div className="form-group">
                  <label className="form-label">EID Tag (15-digit) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Optional</span></label>
                  <input type="text" className="form-input" placeholder="e.g. 982000000012345" pattern="[0-9]{15}" maxLength={15}
                    title="EID must be exactly 15 digits or left blank"
                    value={formData.eidNumber} onChange={e => setFormData(p => ({...p, eidNumber: e.target.value.trim()}))} />
                </div>

                {/* Birth weight */}
                <div className="form-group">
                  <label className="form-label">Birth Weight (kg) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Optional</span></label>
                  <input type="number" className="form-input" placeholder="e.g. 35" min="0" step="0.1"
                    value={formData.weight} onChange={e => setFormData(p => ({...p, weight: e.target.value}))} />
                </div>

                {/* Camp */}
                <div className="form-group">
                  <label className="form-label">Camp / Pasture</label>
                  <select className="form-select" value={formData.currentCampId} onChange={e => setFormData(p => ({...p, currentCampId: e.target.value}))}>
                    <option value="">Unassigned</option>
                    {camps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Tag Number */}
                <div className="form-group">
                  <label className="form-label">Ear Tag Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Optional — auto-generates if blank</span></label>
                  <input type="text" className="form-input" placeholder={`e.g. ${selectedMother.tag_number}-01 (auto)`}
                    value={formData.tagNumber} onChange={e => setFormData(p => ({...p, tagNumber: e.target.value}))} />
                </div>
              </div>

              {/* Sire search */}
              <div className="form-group" style={{ marginTop: '4px' }}>
                <label className="form-label">{speciesLabel.sire} / Father <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>for lineage tracking</span></label>
                <div ref={sireSearchRef} style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Search ${speciesLabel.sire.toLowerCase()} by tag or name...`}
                      style={{ paddingLeft: '38px', paddingRight: selectedSire ? '56px' : '12px' }}
                      value={sireSearch}
                      onChange={e => { setSireSearch(e.target.value); setSelectedSire(null); setShowSireDropdown(true); }}
                      onFocus={() => { if (!selectedSire) setShowSireDropdown(true); }}
                    />
                    {selectedSire && (
                      <>
                        <Check size={16} color="#10b981" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <button type="button" onClick={() => { setSelectedSire(null); setSireSearch(''); loadDefaultSire(selectedMother.species); }}
                          style={{ position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>

                  {showSireDropdown && !selectedSire && sireSearch.trim() && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: '6px', overflow: 'hidden' }}>
                      {isSearchingSire ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Searching...</div>
                      ) : sireResults.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No male {selectedMother.species.toLowerCase()} found</div>
                      ) : sireResults.map(a => (
                        <div key={a.id}
                          onClick={() => { setSelectedSire(a); setSireSearch(a.tag_number); setShowSireDropdown(false); }}
                          style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <div>
                            <span style={{ fontWeight: 700 }}>{a.tag_number}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.875rem' }}>{a.name ? `(${a.name}) · ` : ''}{a.breed}</span>
                          </div>
                          <ChevronRight size={16} color="#94a3b8" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quarantine notice — conditional */}
              {willBeQuarantined ? (
                <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA', fontSize: '0.875rem', color: '#991B1B', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>
                    The {speciesLabel.dam.toLowerCase()} is currently quarantined — this {speciesLabel.young.toLowerCase()} will inherit the <strong>same quarantine period</strong> (until {inheritedQEnd}).
                  </span>
                </div>
              ) : (
                <div style={{ padding: '12px 16px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #A7F3D0', fontSize: '0.875rem', color: '#065F46', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Check size={16} style={{ flexShrink: 0 }} />
                  <span>No quarantine required — the {speciesLabel.dam.toLowerCase()} is not currently quarantined.</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', gap: '8px', display: 'flex', alignItems: 'center' }}>
                  <Baby size={16} />
                  {saving ? 'Saving...' : `Register ${speciesLabel.young}`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
