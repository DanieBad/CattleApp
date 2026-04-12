import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { TraceabilityForm, type TraceabilityData } from '../components/TraceabilityForm';
import { getAnimalIcon } from '../utils';
import { PackagePlus, Check, AlertTriangle, ArrowLeft, Loader2, Plus, FileText, MapPin, Calendar, Tag } from 'lucide-react';
import type { Breed, Sex, Species } from '../types';
import { useSubscription } from '../context/SubscriptionContext';
import { v4 as uuidv4 } from 'uuid';

// ── Saved animal type (includes breed/sex for correct icon rendering) ──────
interface SavedAnimal {
  id: string;
  tagNumber: string;
  species: string;
  breed: string;
  sex: string;
  purchasePrice: string;
}

interface QuickAnimal {
  tagNumber: string;
  species: Species;
  breed: string;
  sex: Sex;
  dateOfBirth: string;
  weight: string;
  purchasePrice: string;
}

const today = new Date().toISOString().split('T')[0];
const CATTLE_BREEDS = ['Bonsmara','Brahman','Nguni','Simmentaler','Boran','Afrikaner','Angus','Tuli','Sussex','Drakensberger','Wagyu','Hereford','Crossbreed','Other'];
const SHEEP_BREEDS  = ['Dorper','Merino','Dohne Merino','Meatmaster','Damara','Letelle','Afrino','Ile de France','Crossbreed','Other'];

const blankAnimal = (species: Species): QuickAnimal => ({
  tagNumber: '', species,
  breed: species === 'Cattle' ? 'Bonsmara' : 'Dorper',
  sex: 'Female', dateOfBirth: today, weight: '', purchasePrice: '',
});

const emptySellerInfo = (): TraceabilityData => ({
  partyName: '', farmName: '', partyGln: '', glnCertFile: null,
  gpsCoordinates: '', permitNumber: '', permitFile: null, transactionDate: today,
});

// ── 4-step progress bar ────────────────────────────────────
const STEPS = ['Seller Info', 'Add Animals', 'Review', 'Done'];
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
            background: step >= s ? 'var(--primary)' : '#E2E8F0',
            color: step >= s ? 'white' : 'var(--text-muted)',
          }}>
            {step > s ? <Check size={16} /> : s}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginLeft: '8px', whiteSpace: 'nowrap', color: step >= s ? 'var(--primary)' : 'var(--text-muted)' }}>
            {label}
          </div>
          {s < STEPS.length && <div style={{ flex: 1, height: '2px', background: step > s ? 'var(--primary)' : '#E2E8F0', margin: '0 12px' }} />}
        </div>
      );
    })}
  </div>
);

// ── Info row helper for review cards ──────────────────────
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) =>
  value ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>{icon}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '130px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-word' }}>{value}</span>
    </div>
  ) : null;

export const BuyingWizard = () => {
  const navigate = useNavigate();
  const { isBlocked, isAtLimit, planName, animalLimit } = useSubscription();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating]   = useState(false);
  const [saleRecordId, setSaleRecordId] = useState<string | null>(null);

  const [sellerInfo, setSellerInfo]   = useState<TraceabilityData>(emptySellerInfo());
  const [savedAnimals, setSavedAnimals] = useState<SavedAnimal[]>([]);
  const [animalForm, setAnimalForm]   = useState<QuickAnimal>(blankAnimal('Cattle'));
  const [isSavingAnimal, setIsSavingAnimal] = useState(false);

  // ── GPS ──────────────────────────────────────────────────
  const handleUseLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setSellerInfo(p => ({ ...p, gpsCoordinates: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` })); setIsLocating(false); },
      () => { alert('Could not get location. Enter manually.'); setIsLocating(false); }
    );
  };

  // ── File upload ───────────────────────────────────────────
  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from('trade-documents').upload(path, file, { upsert: true });
    if (error) { console.error('Upload error:', error); return null; }
    return supabase.storage.from('trade-documents').getPublicUrl(path).data.publicUrl;
  };

  // ── Step 1: Save seller info → DB ─────────────────────────
  const handleSaveSellerInfo = async () => {
    setIsSubmitting(true);
    try {
      const tempId = uuidv4();
      const glnCertUrl = sellerInfo.glnCertFile ? await uploadFile(sellerInfo.glnCertFile, `${tempId}/gln-cert`) : null;
      const permitUrl  = sellerInfo.permitFile  ? await uploadFile(sellerInfo.permitFile,  `${tempId}/permit`)  : null;

      const { data, error } = await supabase.from('sale_records').insert({
        id: tempId, transaction_type: 'Buy',
        party_name: sellerInfo.partyName || null,
        farm_name: sellerInfo.farmName || null,
        party_gln: sellerInfo.partyGln || null,
        gln_certificate_url: glnCertUrl,
        gps_coordinates: sellerInfo.gpsCoordinates || null,
        permit_number: sellerInfo.permitNumber || null,
        permit_url: permitUrl,
        transaction_date: sellerInfo.transactionDate || null,
      }).select('id').single();

      if (error) throw error;
      setSaleRecordId(data.id);
      setStep(2);
    } catch (err: any) {
      alert(`Failed to save seller info: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Save one animal immediately ───────────────────
  const handleSaveAnimal = async () => {
    if (!animalForm.tagNumber.trim()) { alert('Ear tag is required.'); return; }
    if (!saleRecordId) return;
    if (isBlocked) { alert('Your trial has ended.'); navigate('/billing'); return; }
    if (isAtLimit) { alert(`You've reached your ${planName} limit of ${animalLimit} animals.`); navigate('/billing'); return; }

    setIsSavingAnimal(true);
    try {
      const animalId = uuidv4();
      const qStart = sellerInfo.transactionDate || today;
      const qEnd = new Date(qStart); qEnd.setDate(qEnd.getDate() + 28);

      const { error: aErr } = await supabase.from('animals').insert({
        id: animalId, tag_number: animalForm.tagNumber.trim(),
        species: animalForm.species, breed: animalForm.breed, sex: animalForm.sex,
        date_of_birth: animalForm.dateOfBirth, status: 'Active',
        is_quarantined: true,
        quarantine_start_date: qStart,
        quarantine_end_date: qEnd.toISOString().split('T')[0],
        arrival_date: sellerInfo.transactionDate || today,
        origin_gln: sellerInfo.partyGln || null,
        purchase_price: animalForm.purchasePrice ? parseFloat(animalForm.purchasePrice) : null,
        weight: animalForm.weight ? parseFloat(animalForm.weight) : null,
      });
      if (aErr) throw aErr;

      // Initial movement log
      await supabase.from('movement_log').insert({
        id: uuidv4(), animal_id: animalId,
        movement_date: sellerInfo.transactionDate || today,
        origin: sellerInfo.partyGln ? `GLN: ${sellerInfo.partyGln}` : (sellerInfo.farmName || 'External Purchase'),
        destination: 'Farm intake',
        origin_gps: sellerInfo.gpsCoordinates || null,
        origin_gln: sellerInfo.partyGln || null,
        permit_number: sellerInfo.permitNumber || null,
        notes: `Purchased from ${sellerInfo.partyName || 'unknown seller'} — auto log`,
      });

      // Link to sale record
      await supabase.from('animal_sale_links').insert({ sale_record_id: saleRecordId, animal_id: animalId, sale_price: null });

      // Store breed/sex for correct icon rendering in review/done screens
      setSavedAnimals(prev => [...prev, {
        id: animalId, tagNumber: animalForm.tagNumber.trim(),
        species: animalForm.species, breed: animalForm.breed, sex: animalForm.sex,
        purchasePrice: animalForm.purchasePrice,
      }]);
      setAnimalForm(prev => ({ ...blankAnimal(prev.species), breed: prev.breed, sex: prev.sex }));
    } catch (err: any) {
      alert(`Failed to save animal: ${err.message}`);
    } finally {
      setIsSavingAnimal(false);
    }
  };

  // ── Step 2 → Step 3 (Review) ──────────────────────────────
  const handleFinish = () => {
    if (savedAnimals.length === 0) { alert('Please add at least one animal before reviewing.'); return; }
    setStep(3);
  };

  const totalPurchased = savedAnimals.reduce((s, a) => s + (parseFloat(a.purchasePrice) || 0), 0);

  return (
    <div className="fade-in" style={{ maxWidth: '760px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={() => navigate('/buy-sell')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Buy / Sell
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <PackagePlus size={20} />
        </div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Buying Animals</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Register a new purchase with full traceability.</p>
        </div>
      </div>
      <StepBar step={step} />

      {/* ── STEP 1: Seller Info ── */}
      {step === 1 && (
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Seller / Origin Details</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Capture seller information for traceability. All fields are optional.
          </p>
          <TraceabilityForm mode="buy" data={sellerInfo} onChange={setSellerInfo} isLocating={isLocating} onUseLocation={handleUseLocation} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <button className="btn btn-outline" onClick={() => navigate('/buy-sell')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveSellerInfo} disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Next: Add Animals →'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Add Animals ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Seller summary + progress chips */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-main)' }}>Seller:</strong> {sellerInfo.partyName || '—'}{sellerInfo.farmName && ` · ${sellerInfo.farmName}`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {savedAnimals.map(a => (
                <span key={a.id} style={{ backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {getAnimalIcon(a.species, a.breed, a.sex)} {a.tagNumber}
                </span>
              ))}
              {savedAnimals.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No animals added yet</span>}
            </div>
          </div>

          {/* Quick-add form */}
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="var(--primary)" /> Add Animal
            </h2>
            <div className="responsive-grid-2col">
              <div className="form-group">
                <label className="form-label">Species</label>
                <select className="form-select" value={animalForm.species}
                  onChange={e => setAnimalForm(p => ({ ...p, species: e.target.value as Species, breed: e.target.value === 'Cattle' ? 'Bonsmara' : 'Dorper' }))}>
                  <option>Cattle</option><option>Sheep</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ear Tag Number *</label>
                <input type="text" className="form-input" placeholder="e.g. A-201" value={animalForm.tagNumber}
                  onChange={e => setAnimalForm(p => ({ ...p, tagNumber: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Breed</label>
                <select className="form-select" value={animalForm.breed}
                  onChange={e => setAnimalForm(p => ({ ...p, breed: e.target.value as Breed }))}>
                  {(animalForm.species === 'Cattle' ? CATTLE_BREEDS : SHEEP_BREEDS).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sex</label>
                <select className="form-select" value={animalForm.sex}
                  onChange={e => setAnimalForm(p => ({ ...p, sex: e.target.value as Sex }))}>
                  <option>Female</option><option>Male</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" value={animalForm.dateOfBirth}
                  onChange={e => setAnimalForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Weight (kg)</label>
                <input type="number" className="form-input" placeholder="e.g. 280" value={animalForm.weight}
                  onChange={e => setAnimalForm(p => ({ ...p, weight: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Price (R)</label>
                <input type="number" className="form-input" placeholder="0.00" step="0.01" value={animalForm.purchasePrice}
                  onChange={e => setAnimalForm(p => ({ ...p, purchasePrice: e.target.value }))} />
              </div>
            </div>

            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '20px' }}>
              <AlertTriangle size={15} />
              Animal will be placed under <strong>28-day FMD quarantine</strong> from the arrival date. Seller GLN, GPS &amp; permit are auto-linked.
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleSaveAnimal} disabled={isSavingAnimal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSavingAnimal ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Plus size={16} /> Save &amp; Add Another</>}
              </button>
              <button className="btn btn-outline" onClick={handleFinish} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} /> Review Purchase →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review & Confirm ── */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="var(--primary)" /> Review Purchase Summary
            </h2>

            {/* Seller info card */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seller / Origin</div>
              <InfoRow icon={<Tag size={14} />}      label="Name / Company"    value={sellerInfo.partyName} />
              <InfoRow icon={<Tag size={14} />}      label="Farm Name"         value={sellerInfo.farmName} />
              <InfoRow icon={<FileText size={14} />} label="GLN"               value={sellerInfo.partyGln} />
              <InfoRow icon={<MapPin size={14} />}   label="GPS Coordinates"   value={sellerInfo.gpsCoordinates} />
              <InfoRow icon={<FileText size={14} />} label="Permit No"         value={sellerInfo.permitNumber} />
              <InfoRow icon={<Calendar size={14} />} label="Arrival Date"      value={sellerInfo.transactionDate} />
              {(!sellerInfo.partyName && !sellerInfo.farmName && !sellerInfo.partyGln) && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No seller details captured.</div>
              )}
            </div>

            {/* Animals table */}
            <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Animals Purchased ({savedAnimals.length})
            </div>
            <table className="herd-table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Breed / Sex</th>
                  <th>Purchase Price</th>
                </tr>
              </thead>
              <tbody>
                {savedAnimals.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{getAnimalIcon(a.species, a.breed, a.sex)}</span>
                        <span style={{ color: 'var(--primary)' }}>{a.tagNumber}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{a.breed} · {a.sex}</td>
                    <td style={{ fontWeight: 600 }}>
                      {a.purchasePrice ? `R ${parseFloat(a.purchasePrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPurchased > 0 && (
              <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                Total: R {totalPurchased.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={15} /> Back — Add More Animals
              </button>
              <button className="btn btn-primary" onClick={() => setStep(4)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} /> Confirm Purchase — Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Done / Quarantine Reminder ── */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '28px', backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <Check size={24} />
              </div>
              <div>
                <h2 style={{ margin: 0, color: '#065F46', fontSize: '1.3rem' }}>Purchase Recorded!</h2>
                <p style={{ margin: 0, color: '#047857', fontSize: '0.9rem' }}>
                  {savedAnimals.length} animal{savedAnimals.length !== 1 ? 's' : ''} added and linked to seller record.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {savedAnimals.map(a => (
                <span key={a.id} style={{ backgroundColor: 'white', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '20px', padding: '5px 14px', fontSize: '0.85rem', fontWeight: 700 }}>
                  {getAnimalIcon(a.species, a.breed, a.sex)} {a.tagNumber}
                </span>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f97316', backgroundColor: '#FFF7ED' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertTriangle size={22} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: '4px' }}>Quarantine Reminder</div>
                <div style={{ color: '#92400e', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  All {savedAnimals.length} newly purchased animal{savedAnimals.length !== 1 ? 's have' : ' has'} been placed under a <strong>28-day FMD quarantine</strong> from the arrival date.
                  Review and adjust individual quarantine settings from each animal's profile in My Herd.
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/herd')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Go to My Herd →</button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Dashboard</button>
            <button className="btn btn-outline" onClick={() => { setSavedAnimals([]); setSaleRecordId(null); setSellerInfo(emptySellerInfo()); setStep(1); }}>
              Record Another Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
