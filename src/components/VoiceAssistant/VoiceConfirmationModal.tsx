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
        const { error } = await supabase.from('animals').insert([{
          species: parsedData.species || 'Cattle',
          tag_number: parsedData.tagNumber || 'UNKNOWN',
          sex: parsedData.sex || 'Unknown',
          status: 'Active',
          date_of_birth: parsedData.dateOfBirth || new Date().toISOString().split('T')[0],
          breed: parsedData.breed || 'Crossbreed',
          notes: `Added via Voice Prompt: "${transcript}"`
        }]);
        if (error) throw error;
      } else if (actionType === 'add_health_log') {
        // Step 1: Look up the animal UUID by tag Number
        const searchTag = parsedData.tagNumber;
        const { data: animalData, error: animalError } = await supabase
          .from('animals')
          .select('id')
          .ilike('tag_number', searchTag)
          .single();
        
        if (animalError || !animalData) {
          throw new Error(`Could not find an animal in the herd with Tag Number ${searchTag} to apply medication to.`);
        }

        // Step 2: Insert the health log
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Species & Type</label>
                <div>{parsedData.species} {parsedData.sex === 'Male' ? '(Bull/Ram)' : '(Cow/Ewe)'}</div>
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Tag Number (Patient)</label>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{parsedData.tagNumber || 'Not specified'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Medication</label>
                <div>{parsedData.medication} {parsedData.dosage ? `(${parsedData.dosage})` : ''}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Date Administered</label>
                <div>{parsedData.dateAdministered}</div>
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
