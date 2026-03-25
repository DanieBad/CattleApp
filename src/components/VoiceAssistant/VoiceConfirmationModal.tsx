import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../supabase';

interface VoiceConfirmationModalProps {
  isOpen: boolean;
  transcript: string;
  actionType: string;
  parsedData: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export const VoiceConfirmationModal: React.FC<VoiceConfirmationModalProps> = ({ 
  isOpen, transcript, actionType, parsedData, onConfirm, onCancel 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  if (!isOpen || !parsedData) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      if (actionType === 'add_animal') {
        let damId: string | null = null;
        
        // Step 1: If a mother tag was provided, Look up her UUID
        if (parsedData.motherTag) {
          const { data: motherData } = await supabase
            .from('animals')
            .select('id')
            .ilike('tag_number', parsedData.motherTag)
            .single();
          if (motherData) damId = motherData.id;
        }

        // Step 2: Insert the calf
        const { data: insertedAnimal, error } = await supabase.from('animals').insert([{
          species: parsedData.species || 'Cattle',
          tag_number: parsedData.tagNumber || 'PENDING',
          sex: parsedData.sex || 'Unknown',
          status: 'Active',
          date_of_birth: parsedData.dateOfBirth || new Date().toISOString().split('T')[0],
          breed: parsedData.breed || 'Crossbreed',
          dam_id: damId, // Correctly link to mother
        }]).select().single();
        if (error) throw error;

        // Step 3: Record the voice transcript in a Journal entry (since 'animals' table has no 'notes' column)
        if (insertedAnimal) {
          await supabase.from('journal_logs').insert([{
            animal_id: insertedAnimal.id,
            note_text: `Added via Voice Prompt: "${transcript}"${parsedData.motherTag ? `. Mother: ${parsedData.motherTag}` : ''}`,
            date_recorded: new Date().toISOString().split('T')[0]
          }]);
        }
      } else if (actionType === 'add_health_log') {
        if (parsedData.isBatch) {
          // BATCH LOGIC: Fetch active animals, filtered by species if specified
          let query = supabase
            .from('animals')
            .select('id')
            .eq('status', 'Active');
          
          if (parsedData.targetSpecies) {
            query = query.eq('species', parsedData.targetSpecies);
          }

          const { data: activeAnimals, error: fetchError } = await query;
          
          if (fetchError || !activeAnimals || activeAnimals.length === 0) {
            throw new Error("No active animals found to apply batch treatment to.");
          }

          const payloads = activeAnimals.map(animal => ({
            animal_id: animal.id,
            treatment_type: parsedData.treatmentType || 'Vaccination',
            medication: parsedData.medication,
            dosage: parsedData.dosage,
            date_administered: parsedData.dateAdministered || new Date().toISOString().split('T')[0],
            notes: `Batch Logged via Voice: "${transcript}"`
          }));

          const { error: batchError } = await supabase
            .from('health_logs')
            .insert(payloads);
          
          if (batchError) throw batchError;
        } else {
          // SINGLE ANIMAL LOGIC
          const searchTag = parsedData.tagNumber;
          const { data: animalData, error: animalError } = await supabase
            .from('animals')
            .select('id')
            .ilike('tag_number', searchTag)
            .single();
          
          if (animalError || !animalData) {
            throw new Error(`Could not find an animal in the herd with Tag Number ${searchTag} to apply medication to.`);
          }

          const { error: logError } = await supabase.from('health_logs').insert([{
            animal_id: animalData.id,
            treatment_type: parsedData.treatmentType,
            medication: parsedData.medication,
            dosage: parsedData.dosage,
            date_administered: parsedData.dateAdministered || new Date().toISOString().split('T')[0],
            notes: `Logged via Voice Prompt: "${transcript}"`
          }]);
          if (logError) throw logError;
        }
      }

      onConfirm();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card fade-in" style={{ width: '90%', maxWidth: '500px', padding: '24px', backgroundColor: 'white', position: 'relative' }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="#64748B" />
        </button>
        
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Confirm Voice Input</h2>
        
        <div style={{ backgroundColor: '#F1F5F9', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontStyle: 'italic', color: '#475569' }}>
          "{transcript}"
        </div>

        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Parsed Details:</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {actionType === 'add_animal' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Action</label>
                <div>Add Animal</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Tag Number</label>
                <div style={{ fontWeight: 600 }}>{parsedData.tagNumber || 'Not specified'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Cattle Type</label>
                <div>{parsedData.sex === 'Male' ? 'Bull/Ram' : 'Cow/Ewe'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Mother (Dam)</label>
                <div style={{ color: parsedData.motherTag ? 'var(--primary)' : '#64748B' }}>
                  {parsedData.motherTag || 'None/Unknown'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Date of Birth</label>
                <div>{parsedData.dateOfBirth || 'Today'}</div>
              </div>
            </>
          )}

          {actionType === 'add_health_log' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Action</label>
                <div>Log Health Treatment</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Target Group</label>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {parsedData.tagNumber || 'Not specified'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Treatment</label>
                <div style={{ fontWeight: 600 }}>{parsedData.treatmentType || 'General Treatment'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Medication</label>
                <div>{parsedData.medication || 'None'} {parsedData.dosage ? `(${parsedData.dosage})` : ''}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Date Administered</label>
                <div>{parsedData.dateAdministered || 'Today'}</div>
              </div>
            </>
          )}
        </div>

        {errorMessage && (
          <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', fontSize: '0.9rem' }}>
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onCancel} disabled={isSaving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isSaving ? 'Saving...' : <><Check size={18} /> Confirm & Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};
