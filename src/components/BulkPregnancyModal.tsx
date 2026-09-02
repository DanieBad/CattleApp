import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { SyncManager } from '../services/syncManager';
import type { Animal, HealthLog, JournalLog } from '../types';
import { getAnimalIcon, calculateAge } from '../utils';
import { calculateGestationDueDate } from '../utils/healthUtils';
import { Activity, X, Check, Calendar, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkPregnancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAnimals: Animal[];
  onSuccess: () => void;
}

type PregnancyStatus = 'Pregnant' | 'Open' | 'Doubtful' | 'Skip';
type DiagnosisMethod = 'Palpation' | 'Ultrasound' | 'Blood Test' | 'Visual Examination';

interface AnimalPregnancyEntry {
  animalId: string;
  status: PregnancyStatus;
  monthsPregnant: string;
  estimatedDueDate: string;
  notes: string;
}

export const BulkPregnancyModal: React.FC<BulkPregnancyModalProps> = ({
  isOpen,
  onClose,
  selectedAnimals,
  onSuccess
}) => {
  const [checkDate, setCheckDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<DiagnosisMethod>('Palpation');
  const [commonNotes, setCommonNotes] = useState<string>('');
  const [entries, setEntries] = useState<Record<string, AnimalPregnancyEntry>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Filter to female animals where pregnancy checks are applicable, or include all with male warning
    const initial: Record<string, AnimalPregnancyEntry> = {};
    selectedAnimals.forEach(a => {
      initial[a.id] = {
        animalId: a.id,
        status: a.sex === 'Female' ? 'Pregnant' : 'Skip',
        monthsPregnant: '',
        estimatedDueDate: '',
        notes: ''
      };
    });
    setEntries(initial);
  }, [isOpen, selectedAnimals]);

  if (!isOpen) return null;

  const handleStatusChange = (animalId: string, status: PregnancyStatus) => {
    setEntries(prev => {
      const current = prev[animalId] || {};
      let dueDate = current.estimatedDueDate;
      if (status !== 'Pregnant') {
        dueDate = '';
      }
      return {
        ...prev,
        [animalId]: {
          ...current,
          status,
          estimatedDueDate: dueDate
        }
      };
    });
  };

  const handleMonthsChange = (animalId: string, monthsStr: string) => {
    const animal = selectedAnimals.find(a => a.id === animalId);
    let autoDueDate = '';

    const months = parseFloat(monthsStr);
    if (!isNaN(months) && months > 0) {
      autoDueDate = calculateGestationDueDate(checkDate, months, animal?.species === 'Sheep' ? 'Sheep' : 'Cattle');
    }

    setEntries(prev => ({
      ...prev,
      [animalId]: {
        ...prev[animalId],
        monthsPregnant: monthsStr,
        estimatedDueDate: autoDueDate
      }
    }));
  };

  const handleRowNotesChange = (animalId: string, notes: string) => {
    setEntries(prev => ({
      ...prev,
      [animalId]: {
        ...prev[animalId],
        notes
      }
    }));
  };

  const markAll = (status: PregnancyStatus) => {
    setEntries(prev => {
      const next = { ...prev };
      selectedAnimals.forEach(a => {
        if (a.sex === 'Female') {
          next[a.id] = {
            ...next[a.id],
            status
          };
        }
      });
      return next;
    });
  };

  const validEntries = Object.values(entries).filter(e => e.status !== 'Skip');
  const pregnantCount = validEntries.filter(e => e.status === 'Pregnant').length;
  const openCount = validEntries.filter(e => e.status === 'Open').length;
  const doubtfulCount = validEntries.filter(e => e.status === 'Doubtful').length;
  const hasMales = selectedAnimals.some(a => a.sex !== 'Female');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validEntries.length === 0) {
      toast.error('No animals selected for pregnancy results recording.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`Saving pregnancy results for ${validEntries.length} animals...`);

    try {
      for (const entry of validEntries) {
        const healthLogId = uuidv4();
        const journalLogId = uuidv4();

        // Build result label for dosage field
        let resultLabel: string = entry.status;
        if (entry.status === 'Pregnant' && entry.monthsPregnant) {
          resultLabel = `Pregnant (~${entry.monthsPregnant} mos)`;
        }

        const noteParts = [
          `Method: ${method}`,
          entry.estimatedDueDate ? `Est. Due: ${entry.estimatedDueDate}` : '',
          entry.notes.trim(),
          commonNotes.trim()
        ].filter(Boolean);

        const formattedNotes = noteParts.join(' | ');

        // 1. HealthLog Record
        const healthLog: HealthLog = {
          id: healthLogId,
          animalId: entry.animalId,
          treatmentType: 'Pregnancy Check',
          medication: method,
          dosage: resultLabel,
          dateAdministered: checkDate,
          notes: formattedNotes,
          createdAt: new Date().toISOString()
        };

        const supabaseHealthPayload = {
          id: healthLogId,
          animal_id: entry.animalId,
          treatment_type: 'Pregnancy Check',
          medication: method,
          dosage: resultLabel,
          date_administered: checkDate,
          notes: formattedNotes
        };

        // 2. JournalLog Record for timeline
        const journalNoteText = `Pregnancy Check: ${resultLabel}${entry.estimatedDueDate ? ` (Est. Due: ${entry.estimatedDueDate})` : ''}. Method: ${method}.${entry.notes ? ` Notes: ${entry.notes}` : ''}`;
        const journalLog: JournalLog = {
          id: journalLogId,
          animalId: entry.animalId,
          noteText: journalNoteText,
          dateRecorded: checkDate,
          createdAt: new Date().toISOString()
        };

        const supabaseJournalPayload = {
          id: journalLogId,
          animal_id: entry.animalId,
          note_text: journalNoteText,
          date_recorded: checkDate
        };

        // Local Dexie write
        await db.health_logs.put(healthLog);
        await db.journal_logs.put(journalLog);

        // Queue in Sync Outbox
        await SyncManager.queueInsert('health_logs', healthLogId, supabaseHealthPayload);
        await SyncManager.queueInsert('journal_logs', journalLogId, supabaseJournalPayload);
      }

      // Schedule sync push
      SyncManager.pushPendingChanges();

      toast.success(`Recorded pregnancy results for ${validEntries.length} animals!`, { id: toastId });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save pregnancy records:', err);
      toast.error(`Error saving records: ${err.message || 'Unknown error'}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div 
        className="card fade-in"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FDF2F8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DB2777'
            }}>
              <Activity size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Batch Pregnancy Results
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Recording pregnancy checks for {selectedAnimals.length} animal{selectedAnimals.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Controls */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Check Date:
            </label>
            <input 
              type="date"
              className="form-input"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              style={{ width: '160px', padding: '6px 10px', fontSize: '0.875rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Method:
            </label>
            <select
              className="form-input"
              value={method}
              onChange={(e) => setMethod(e.target.value as DiagnosisMethod)}
              style={{ width: '180px', padding: '6px 10px', fontSize: '0.875rem' }}
            >
              <option value="Palpation">Palpation</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="Blood Test">Blood Test</option>
              <option value="Visual Examination">Visual</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Notes:
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Annual vet ultrasound check..."
              value={commonNotes}
              onChange={(e) => setCommonNotes(e.target.value)}
              style={{ flex: 1, padding: '6px 12px', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={() => markAll('Pregnant')}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Mark All Pregnant
            </button>
            <button
              type="button"
              onClick={() => markAll('Open')}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Mark All Open
            </button>
          </div>
        </div>

        {hasMales && (
          <div style={{
            padding: '10px 24px',
            backgroundColor: '#FFFBEB',
            borderBottom: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.825rem',
            color: '#92400E'
          }}>
            <AlertTriangle size={16} />
            <span>Note: Some selected livestock are male. Males default to <strong>Skip</strong>.</span>
          </div>
        )}

        {/* Table Area */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
            <table className="herd-table" style={{ marginTop: '12px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 5 }}>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Animal</th>
                  <th>Age / Last Birth</th>
                  <th style={{ width: '280px' }}>Diagnosis Result *</th>
                  <th style={{ width: '130px' }}>Stage (Mos)</th>
                  <th style={{ width: '150px' }}>Est. Due Date</th>
                  <th>Row Notes</th>
                </tr>
              </thead>
              <tbody>
                {selectedAnimals.map((animal, idx) => {
                  const entry = entries[animal.id] || { status: 'Skip', monthsPregnant: '', estimatedDueDate: '', notes: '' };
                  const isFemale = animal.sex === 'Female';

                  return (
                    <tr key={animal.id} className="table-row-hover" style={{ opacity: entry.status === 'Skip' ? 0.6 : 1 }}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {getAnimalIcon(animal.species, animal.breed, animal.sex)}
                          </span>
                          <div>
                            <div style={{ color: 'var(--text-main)' }}>{animal.tagNumber}</div>
                            <div style={{ fontSize: '0.75rem', color: isFemale ? '#EC4899' : '#3B82F6', fontWeight: 500 }}>
                              {animal.breed} · {animal.sex}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>{calculateAge(animal.dateOfBirth).display}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {(animal as any).lastBirthDate ? `Last: ${(animal as any).lastBirthDate}` : 'No prior calves recorded'}
                        </div>
                      </td>
                      <td>
                        {/* Result Selector Pills */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(animal.id, 'Pregnant')}
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: '1px solid',
                              cursor: 'pointer',
                              backgroundColor: entry.status === 'Pregnant' ? '#10B981' : '#F8FAFC',
                              color: entry.status === 'Pregnant' ? 'white' : 'var(--text-main)',
                              borderColor: entry.status === 'Pregnant' ? '#10B981' : 'var(--border)'
                            }}
                          >
                            Pregnant
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(animal.id, 'Open')}
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: '1px solid',
                              cursor: 'pointer',
                              backgroundColor: entry.status === 'Open' ? '#F97316' : '#F8FAFC',
                              color: entry.status === 'Open' ? 'white' : 'var(--text-main)',
                              borderColor: entry.status === 'Open' ? '#F97316' : 'var(--border)'
                            }}
                          >
                            Open (Empty)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(animal.id, 'Doubtful')}
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: '1px solid',
                              cursor: 'pointer',
                              backgroundColor: entry.status === 'Doubtful' ? '#EAB308' : '#F8FAFC',
                              color: entry.status === 'Doubtful' ? 'white' : 'var(--text-main)',
                              borderColor: entry.status === 'Doubtful' ? '#EAB308' : 'var(--border)'
                            }}
                          >
                            Recheck
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(animal.id, 'Skip')}
                            style={{
                              padding: '6px 8px',
                              fontSize: '0.75rem',
                              borderRadius: '6px',
                              border: '1px solid transparent',
                              cursor: 'pointer',
                              backgroundColor: entry.status === 'Skip' ? '#E2E8F0' : 'transparent',
                              color: 'var(--text-muted)'
                            }}
                          >
                            Skip
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="9.5"
                          placeholder="e.g. 3"
                          disabled={entry.status !== 'Pregnant'}
                          className="form-input"
                          value={entry.monthsPregnant || ''}
                          onChange={(e) => handleMonthsChange(animal.id, e.target.value)}
                          style={{
                            fontSize: '0.85rem',
                            padding: '6px 10px',
                            backgroundColor: entry.status !== 'Pregnant' ? '#F1F5F9' : 'white'
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          disabled={entry.status !== 'Pregnant'}
                          className="form-input"
                          value={entry.estimatedDueDate || ''}
                          onChange={(e) => setEntries(prev => ({
                            ...prev,
                            [animal.id]: { ...prev[animal.id], estimatedDueDate: e.target.value }
                          }))}
                          style={{
                            fontSize: '0.85rem',
                            padding: '6px 8px',
                            backgroundColor: entry.status !== 'Pregnant' ? '#F1F5F9' : 'white'
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Row note"
                          className="form-input"
                          value={entry.notes || ''}
                          onChange={(e) => handleRowNotesChange(animal.id, e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer with Summary & Save */}
          <div style={{
            padding: '16px 24px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>To record: </span>
                <strong>{validEntries.length} / {selectedAnimals.length}</strong>
              </div>
              <div style={{ color: '#065F46' }}>
                Pregnant: <strong>{pregnantCount}</strong>
              </div>
              <div style={{ color: '#C2410C' }}>
                Open: <strong>{openCount}</strong>
              </div>
              {doubtfulCount > 0 && (
                <div style={{ color: '#A16207' }}>
                  Recheck: <strong>{doubtfulCount}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={onClose}
                disabled={isSubmitting}
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting || validEntries.length === 0}
                style={{ padding: '8px 22px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#DB2777', borderColor: '#DB2777' }}
              >
                <Check size={18} />
                Save Pregnancy Results ({validEntries.length})
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
