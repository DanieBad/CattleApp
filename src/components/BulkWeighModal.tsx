import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { SyncManager } from '../services/syncManager';
import type { Animal, Camp, WeightLog } from '../types';
import { getAnimalIcon } from '../utils';
import { Scale, X, Check, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkWeighModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAnimals: Animal[];
  camps: Camp[];
  onSuccess: () => void;
}

interface AnimalWeightEntry {
  animalId: string;
  weight: string;
  notes: string;
}

export const BulkWeighModal: React.FC<BulkWeighModalProps> = ({
  isOpen,
  onClose,
  selectedAnimals,
  camps,
  onSuccess
}) => {
  const [weighDate, setWeighDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [commonNotes, setCommonNotes] = useState<string>('');
  const [entries, setEntries] = useState<Record<string, AnimalWeightEntry>>({});
  const [previousWeights, setPreviousWeights] = useState<Record<string, { weight: number; date: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!isOpen) return;

    // Initialize entries for selected animals
    const initialEntries: Record<string, AnimalWeightEntry> = {};
    selectedAnimals.forEach(a => {
      initialEntries[a.id] = {
        animalId: a.id,
        weight: '',
        notes: ''
      };
    });
    setEntries(initialEntries);

    // Fetch previous weight logs from local Dexie for fast offline display
    const loadPreviousLogs = async () => {
      try {
        const logs = await db.weight_logs
          .where('animalId')
          .anyOf(selectedAnimals.map(a => a.id))
          .toArray();

        const prevMap: Record<string, { weight: number; date: string }> = {};
        selectedAnimals.forEach(animal => {
          const animalLogs = logs
            .filter(l => l.animalId === animal.id)
            .sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());

          if (animalLogs.length > 0) {
            prevMap[animal.id] = {
              weight: animalLogs[0].weightKg,
              date: animalLogs[0].dateRecorded
            };
          } else if (animal.weight) {
            prevMap[animal.id] = {
              weight: animal.weight,
              date: animal.arrivalDate || animal.dateOfBirth || 'Initial'
            };
          }
        });
        setPreviousWeights(prevMap);
      } catch (err) {
        console.error('Error fetching previous weight logs:', err);
      }
    };

    loadPreviousLogs();

    // Auto-focus first input after modal opens
    setTimeout(() => {
      if (selectedAnimals.length > 0 && inputRefs.current[selectedAnimals[0].id]) {
        inputRefs.current[selectedAnimals[0].id]?.focus();
      }
    }, 150);
  }, [isOpen, selectedAnimals]);

  if (!isOpen) return null;

  const handleWeightChange = (animalId: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [animalId]: {
        ...prev[animalId],
        weight: value
      }
    }));
  };

  const handleRowNotesChange = (animalId: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [animalId]: {
        ...prev[animalId],
        notes: value
      }
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < selectedAnimals.length) {
        const nextAnimalId = selectedAnimals[nextIndex].id;
        inputRefs.current[nextAnimalId]?.focus();
      }
    }
  };

  // Real-time batch statistics
  const enteredWeights = Object.values(entries)
    .map(e => parseFloat(e.weight))
    .filter(w => !isNaN(w) && w > 0);

  const totalBatchWeight = enteredWeights.reduce((acc, w) => acc + w, 0);
  const avgBatchWeight = enteredWeights.length > 0 ? (totalBatchWeight / enteredWeights.length) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validEntries = Object.values(entries).filter(entry => {
      const num = parseFloat(entry.weight);
      return !isNaN(num) && num > 0;
    });

    if (validEntries.length === 0) {
      toast.error('Please enter at least one animal weight.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`Saving weights for ${validEntries.length} animal${validEntries.length > 1 ? 's' : ''}...`);

    try {
      for (const entry of validEntries) {
        const numWeight = parseFloat(entry.weight);
        const logId = uuidv4();
        const fullNotes = [entry.notes.trim(), commonNotes.trim()].filter(Boolean).join(' — ');

        const weightLogRecord: WeightLog = {
          id: logId,
          animalId: entry.animalId,
          weightKg: numWeight,
          dateRecorded: weighDate,
          notes: fullNotes || undefined,
          createdAt: new Date().toISOString()
        };

        const supabasePayload = {
          id: logId,
          animal_id: entry.animalId,
          weight_kg: numWeight,
          date_recorded: weighDate,
          notes: fullNotes || null
        };

        // 1. Local Dexie writes
        await db.weight_logs.put(weightLogRecord);
        await db.animals.update(entry.animalId, { weight: numWeight });

        // 2. Queue into Sync Outbox
        await SyncManager.queueInsert('weight_logs', logId, supabasePayload);
        await SyncManager.queueUpdate('animals', entry.animalId, { weight: numWeight });
      }

      // 3. Trigger pending push
      SyncManager.pushPendingChanges();

      toast.success(`Successfully recorded weights for ${validEntries.length} animals!`, { id: toastId });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save bulk weights:', err);
      toast.error(`Failed to save weights: ${err.message || 'Unknown error'}`, { id: toastId });
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
          maxWidth: '900px',
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
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Scale size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Bulk Weigh In
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Entering weights for {selectedAnimals.length} selected animal{selectedAnimals.length !== 1 ? 's' : ''}
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
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Weigh Date:
            </label>
            <input 
              type="date"
              className="form-input"
              value={weighDate}
              onChange={(e) => setWeighDate(e.target.value)}
              style={{ width: '160px', padding: '6px 10px', fontSize: '0.875rem' }}
              required
            />
          </div>

          <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              Batch Notes:
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Monthly crush weigh-in, weaning weights..."
              value={commonNotes}
              onChange={(e) => setCommonNotes(e.target.value)}
              style={{ flex: 1, padding: '6px 12px', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {/* Table Area */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
            <table className="herd-table" style={{ marginTop: '12px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 5 }}>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Animal</th>
                  <th>Pasture</th>
                  <th>Last Recorded</th>
                  <th style={{ width: '160px' }}>New Weight (kg) *</th>
                  <th>Row Notes</th>
                </tr>
              </thead>
              <tbody>
                {selectedAnimals.map((animal, idx) => {
                  const prev = previousWeights[animal.id];
                  const campName = camps.find(c => c.id === animal.currentCampId)?.name || 'Unassigned';

                  return (
                    <tr key={animal.id} className="table-row-hover">
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
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                              {animal.breed} · {animal.sex}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {campName}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {prev ? (
                          <div>
                            <span style={{ fontWeight: 600 }}>{prev.weight} kg</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {prev.date !== 'Initial' ? new Date(prev.date).toLocaleDateString() : 'Initial'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>
                      <td>
                        <input 
                          ref={el => { inputRefs.current[animal.id] = el; }}
                          type="number"
                          step="0.1"
                          min="1"
                          placeholder="e.g. 480"
                          className="form-input"
                          value={entries[animal.id]?.weight || ''}
                          onChange={(e) => handleWeightChange(animal.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          style={{
                            fontWeight: 600,
                            padding: '8px 12px',
                            borderColor: entries[animal.id]?.weight ? 'var(--primary)' : undefined,
                            backgroundColor: entries[animal.id]?.weight ? '#F0FDF4' : undefined
                          }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          placeholder="Optional note"
                          className="form-input"
                          value={entries[animal.id]?.notes || ''}
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

          {/* Footer with Real-Time Stats & Action Buttons */}
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
            {/* Real-time stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Weighed: </span>
                <strong style={{ color: enteredWeights.length > 0 ? 'var(--primary-dark)' : 'var(--text-main)' }}>
                  {enteredWeights.length} / {selectedAnimals.length}
                </strong>
              </div>
              {enteredWeights.length > 0 && (
                <>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total: </span>
                    <strong>{totalBatchWeight.toFixed(1)} kg</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Average: </span>
                    <strong style={{ color: 'var(--primary-dark)' }}>{avgBatchWeight.toFixed(1)} kg</strong>
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
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
                disabled={isSubmitting || enteredWeights.length === 0}
                style={{ padding: '8px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Check size={18} />
                Save All Weights ({enteredWeights.length})
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
