import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase';
import { Upload, ChevronRight, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import type { Animal, Breed, Status } from '../types';
import { useSubscription } from '../context/SubscriptionContext';

type Step = 'upload' | 'mapping' | 'preview' | 'success';

const DEFAULTS = {
  tagNumber:   '999999',
  breed:       'Bonsmara',
  sex:         'Female',
  dateOfBirth: '2020-01-01',
} as const;

interface CsvData {
  headers: string[];
  rows: any[];
}

interface ColumnMap {
  [internalKey: string]: string; // Maps our DB column name to the CSV header name
}

const REQUIRED_FIELDS = [
  { key: 'tagNumber', label: 'Tag Number*', required: true },
  { key: 'breed', label: 'Breed*', required: true },
  { key: 'sex', label: 'Sex*', required: true },
  { key: 'dateOfBirth', label: 'Date of Birth*', required: true },
];

const OPTIONAL_FIELDS = [
  { key: 'name', label: 'Pet Name' },
  { key: 'eidNumber', label: 'EID (15-digit)' },
  { key: 'weight', label: 'Current Weight (kg)' },
  { key: 'hornStatus', label: 'Horn Status (Polled, Horned, etc)' },
  { key: 'species', label: 'Species (Cattle/Sheep)' },
  { key: 'status', label: 'Status (Active/Sold/Deceased)' },
  { key: 'purchasePrice', label: 'Purchase Price' },
  { key: 'soldPrice', label: 'Sold Price' },
  { key: 'notes', label: 'Notes' },
  { key: 'damTagNumber', label: 'Dam Tag Number' },
  { key: 'sireTagNumber', label: 'Sire Tag Number (Bull/Ram)' },
];

export const ImportData = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isBlocked, planName, animalLimit, activeAnimalCount } = useSubscription();
  
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [mappings, setMappings] = useState<ColumnMap>({});
  const [parsedAnimals, setParsedAnimals] = useState<Partial<Animal>[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Duplicate detection
  const [duplicateTags, setDuplicateTags]       = useState<Set<string>>(new Set());
  const [duplicateMode, setDuplicateMode]       = useState<'skip' | 'overwrite'>('skip');
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [insertedCount, setInsertedCount]       = useState(0);

  // 1. FILE UPLOAD
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          alert('Error parsing CSV. Please ensure it is formatted correctly.');
          console.error(results.errors);
          return;
        }
        if (results.meta.fields) {
          setCsvData({
            headers: results.meta.fields,
            rows: results.data
          });
          setCurrentStep('mapping');
        }
      }
    });
  };

  // 2. MAPPING THE COLUMNS
  const handleMappingChange = (internalKey: string, csvHeader: string) => {
    setMappings(prev => ({
      ...prev,
      [internalKey]: csvHeader
    }));
  };

  const processMapping = () => {
    if (!csvData) return;
    
    // Check if required fields are mapped
    for (const field of REQUIRED_FIELDS) {
      if (!mappings[field.key]) {
        alert(`Please map the required field: ${field.label}`);
        return;
      }
    }

    const transformed: Partial<Animal>[] = csvData.rows.map((row, index) => {
      // Helper to safely get and trim text
      const getVal = (key: string) => row[mappings[key]] ? String(row[mappings[key]]).trim() : '';

      // Preserve empty string so we can distinguish 'not provided' from a real value.
      // Defaults are applied only when the user clicks 'Accept Defaults'.
      const rawSex = getVal('sex');
      const sex = rawSex ? (rawSex.match(/female|f/i) ? 'Female' : 'Male') : '' as any;

      return {
        _tempId: index, // Local ID for error tracking
        tagNumber: getVal('tagNumber'),
        species: (getVal('species') || 'Cattle') as any,
        breed: (getVal('breed') || '') as Breed,  // keep empty if not in CSV
        sex,                                       // keep empty if not in CSV
        dateOfBirth: getVal('dateOfBirth'),
        status: (getVal('status') || 'Active') as Status,
        name: getVal('name'),
        eidNumber: getVal('eidNumber'),
        weight: getVal('weight') ? parseFloat(getVal('weight')) : undefined,
        hornStatus: getVal('hornStatus') as any,
        purchasePrice: getVal('purchasePrice') ? parseFloat(getVal('purchasePrice')) : undefined,
        soldPrice: getVal('soldPrice') ? parseFloat(getVal('soldPrice')) : undefined,
        notes: getVal('notes'),
        // Parentage — stored temporarily; resolved to UUIDs post-import
        damTagNumber: getVal('damTagNumber') || undefined,
        sireTagNumber: getVal('sireTagNumber') || undefined,
      } as any;
    });

    setParsedAnimals(transformed);
    validateData(transformed);
    setCurrentStep('preview');

    // Async: detect which tag numbers already exist in the DB
    const tags = transformed.map((a: any) => a.tagNumber).filter(Boolean);
    if (tags.length > 0) {
      setIsCheckingDuplicates(true);
      (async () => {
        try {
          const { data } = await supabase.from('animals').select('tag_number').in('tag_number', tags);
          setDuplicateTags(new Set((data || []).map((a: any) => String(a.tag_number))));
        } catch {
          // silently ignore; import will still work
        } finally {
          setIsCheckingDuplicates(false);
        }
      })();
    } else {
      setDuplicateTags(new Set());
    }
  };

  // 3. VALIDATION
  const validateData = (data: Partial<Animal>[]) => {
    const newErrors: string[] = [];

    data.forEach((animal, i) => {
      const rowNum = i + 1;
      if (!animal.tagNumber)      newErrors.push(`Row ${rowNum}: Missing Tag Number`);
      if (!animal.breed)          newErrors.push(`Row ${rowNum}: Missing Breed`);
      if (!(animal as any).sex)   newErrors.push(`Row ${rowNum}: Missing Sex`);

      if (animal.dateOfBirth) {
        const d = new Date(animal.dateOfBirth);
        if (isNaN(d.getTime())) {
          newErrors.push(`Row ${rowNum} (${animal.tagNumber}): Invalid date format. Use YYYY-MM-DD.`);
        }
      } else {
        newErrors.push(`Row ${rowNum}: Missing Date of Birth`);
      }
    });

    setErrors(newErrors);
  };

  // ── Apply defaults ONLY to fields that are empty/missing in each row ────────────────
  const handleApplyDefaults = () => {
    const fixed = parsedAnimals.map(animal => ({
      ...animal,
      // || only fills in if the field is empty/undefined; existing values are preserved
      tagNumber:   animal.tagNumber             || DEFAULTS.tagNumber,
      breed:       animal.breed                 || (DEFAULTS.breed as Breed),
      sex:         (animal as any).sex          || DEFAULTS.sex,
      dateOfBirth: animal.dateOfBirth           || DEFAULTS.dateOfBirth,
    })) as Partial<Animal>[];
    setParsedAnimals(fixed);
    validateData(fixed);
  };

  // 4. DATABASE INGESTION
  const handleImport = async () => {
    if (errors.length > 0) {
      alert('Please fix the validation errors before importing.');
      return;
    }

    // ── Subscription guard ──────────────────────────────────────────────────
    if (isBlocked) {
      alert('Your free trial has ended. Please select a plan to import animals.');
      navigate('/billing');
      return;
    }
    const slotsRemaining = animalLimit - activeAnimalCount;
    if (parsedAnimals.length > slotsRemaining) {
      setErrors(prev => [
        `⚠️ Import blocked: This import contains ${parsedAnimals.length} animals but your ${planName} plan only has ${slotsRemaining} slot(s) remaining (limit: ${animalLimit}). Please remove rows from your CSV or upgrade your plan.`,
        ...prev
      ]);
      return;
    }
    // ────────────────────────────────────────────────────────────────────────

    setIsUploading(true);
    setInsertedCount(0);
    try {
      const allRows = parsedAnimals as any[];

      // Split into new (not in DB) and existing (already in DB)
      const newRows      = allRows.filter(a => !duplicateTags.has(String(a.tagNumber)));
      const existingRows = allRows.filter(a =>  duplicateTags.has(String(a.tagNumber)));

      const toInsert = duplicateMode === 'skip' ? newRows : newRows; // always insert new

      // ── Overwrite: UPDATE existing records ─────────────────────────────────────
      if (duplicateMode === 'overwrite' && existingRows.length > 0) {
        for (const animal of existingRows) {
          await supabase.from('animals').update({
            species:        animal.species  || 'Cattle',
            breed:          animal.breed    || 'Other',
            sex:            animal.sex      || 'Female',
            date_of_birth:  animal.dateOfBirth || null,
            status:         animal.status   || 'Active',
            weight:         animal.weight   || null,
            horn_status:    animal.hornStatus || null,
            purchase_price: animal.purchasePrice || null,
            sold_price:     animal.soldPrice || null,
            name:           animal.name     || null,
          }).eq('tag_number', animal.tagNumber);
        }
      }

      // ── INSERT new animals ─────────────────────────────────────────────────
      if (toInsert.length > 0) {
        const payload = toInsert.map((animal) => ({
          tag_number:     animal.tagNumber || 'UNKNOWN',
          eid_number:     animal.eidNumber || null,
          name:           animal.name      || null,
          species:        animal.species   || 'Cattle',
          breed:          animal.breed     || 'Other',
          sex:            animal.sex       || 'Female',
          date_of_birth:  animal.dateOfBirth,
          status:         animal.status    || 'Active',
          weight:         animal.weight    || null,
          horn_status:    animal.hornStatus || null,
          purchase_price: animal.purchasePrice || null,
          sold_price:     animal.soldPrice  || null
        }));
        const { error } = await supabase.from('animals').insert(payload);
        if (error) throw error;
      }

      const actualInserted = toInsert.length + (duplicateMode === 'overwrite' ? existingRows.length : 0);
      setInsertedCount(actualInserted);

      // ── Post-insert: resolve dam/sire tag numbers to UUIDs ────────────────
      const withParents = allRows.filter(a => a.damTagNumber || a.sireTagNumber);
      if (withParents.length > 0) {
        const { data: allAnimals } = await supabase.from('animals').select('id, tag_number');
        const tagToId = new Map((allAnimals || []).map((a: any) => [String(a.tag_number), a.id]));
        for (const animal of withParents) {
          const updates: Record<string, string> = {};
          if (animal.damTagNumber  && tagToId.has(animal.damTagNumber))  updates.dam_id  = tagToId.get(animal.damTagNumber)!;
          if (animal.sireTagNumber && tagToId.has(animal.sireTagNumber)) updates.sire_id = tagToId.get(animal.sireTagNumber)!;
          if (Object.keys(updates).length > 0) {
            await supabase.from('animals').update(updates).eq('tag_number', animal.tagNumber);
          }
        }
      }

      // ── Create initial weight logs for animals imported with weight ─
      const animalsWithWeight = allRows.filter(a => a.weight && !isNaN(Number(a.weight)));
      if (animalsWithWeight.length > 0) {
        const { data: dbAnimals } = await supabase.from('animals').select('id, tag_number');
        const tagToId = new Map((dbAnimals || []).map((a: any) => [String(a.tag_number), a.id]));
        const weightPayloads = animalsWithWeight
          .filter(a => tagToId.has(String(a.tagNumber)))
          .map(a => ({
            id: uuidv4(),
            animal_id: tagToId.get(String(a.tagNumber))!,
            weight_kg: Number(a.weight),
            date_recorded: new Date().toISOString().split('T')[0],
            notes: 'Initial weight recorded via CSV import'
          }));
        if (weightPayloads.length > 0) {
          await supabase.from('weight_logs').insert(weightPayloads);
        }
      }
      // ────────────────────────────────────────────────────────────────

      setCurrentStep('success');
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('tag_number');
      
      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No animal data found to export.');
        return;
      }

      // Format for export (map back to friendly field names)
      const exportData = data.map(animal => ({
        'Tag Number': animal.tag_number,
        'EID Number': animal.eid_number || '',
        'Species': animal.species,
        'Breed': animal.breed,
        'Sex': animal.sex,
        'Date of Birth': animal.date_of_birth,
        'Status': animal.status,
        'Weight (kg)': animal.weight || '',
        'Horn Status': animal.horn_status || '',
        'Is Quarantined': animal.is_quarantined ? 'Yes' : 'No',
        'Name': animal.name || '',
        'Notes': animal.notes || ''
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `HealthyHerd_Export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Import & Export Data</h1>
        <p style={{ color: 'var(--text-muted)' }}>Backup your full database or upload new records via CSV.</p>
      </div>

      {/* PROGRESS TRACKER */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px', color: 'var(--text-muted)' }}>
        <div style={{ fontWeight: currentStep === 'upload' ? 700 : 400, color: currentStep === 'upload' ? 'var(--primary)' : 'inherit' }}>1. Upload</div>
        <ChevronRight size={16} />
        <div style={{ fontWeight: currentStep === 'mapping' ? 700 : 400, color: currentStep === 'mapping' ? 'var(--primary)' : 'inherit' }}>2. Map Columns</div>
        <ChevronRight size={16} />
        <div style={{ fontWeight: currentStep === 'preview' ? 700 : 400, color: currentStep === 'preview' ? 'var(--primary)' : 'inherit' }}>3. Preview & Save</div>
      </div>

      <div className="card fade-in" style={{ padding: '32px' }}>
        
        {/* STEP 1: UPLOAD / EXPORT OPTIONS */}
        {currentStep === 'upload' && (
          <div className="responsive-grid-2col" style={{ gap: '32px', padding: '20px 0' }}>
            
            {/* Import Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderRight: '1px solid var(--border)' }}>
              <Upload size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px' }}>Select a CSV File</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center', maxWidth: '300px' }}>
                Upload new records into your account. Ensure your file has a header row.
              </p>
              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
              />
              <button 
                className="btn btn-primary" 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', maxWidth: '200px' }}
              >
                Browse Files
              </button>
            </div>

            {/* Export Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
              <Download size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px' }}>Export Database</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center', maxWidth: '300px' }}>
                Download all your animal data as a single CSV spreadsheet for backup or external use.
              </p>
              <button 
                className="btn btn-outline" 
                onClick={handleExport}
                style={{ width: '100%', maxWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: MAPPING */}
        {currentStep === 'mapping' && csvData && (
          <div>
            <h3 style={{ marginBottom: '24px' }}>Map Your Columns</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              We found {csvData.headers.length} columns in your file. Please match them to the required system fields.
            </p>

            <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
              <div>
                <h4 style={{ color: 'var(--danger)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px' }}>Required Fields</h4>
                {REQUIRED_FIELDS.map(field => (
                  <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontWeight: 600 }}>{field.label}</label>
                    <select 
                      className="form-input" 
                      value={mappings[field.key] || ''} 
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                    >
                      <option value="">-- Ignore / Not in file --</option>
                      {csvData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px' }}>Optional Fields</h4>
                {OPTIONAL_FIELDS.map(field => (
                  <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', marginBottom: '12px' }}>
                    <label>{field.label}</label>
                    <select 
                      className="form-input" 
                      value={mappings[field.key] || ''} 
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                    >
                      <option value="">-- Ignore / Not in file --</option>
                      {csvData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
              <button className="btn btn-outline" onClick={() => setCurrentStep('upload')}>Back</button>
              <button className="btn btn-primary" onClick={processMapping}>Generate Data Preview</button>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW & VALIDATION */}
        {currentStep === 'preview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Data Preview ({parsedAnimals.length} Records)</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" onClick={() => setCurrentStep('mapping')} disabled={isUploading}>Edit Mapping</button>
                {/* Import button only shown once all required fields are present */}
                {!parsedAnimals.some(r => !r.tagNumber || !r.breed || !r.sex || !r.dateOfBirth) && (
                  <button
                    className="btn btn-primary"
                    onClick={handleImport}
                    disabled={errors.length > 0 || isUploading || isCheckingDuplicates}
                  >
                    {isUploading
                      ? 'Importing…'
                      : isCheckingDuplicates
                        ? 'Checking duplicates…'
                        : duplicateMode === 'skip'
                          ? `Import ${parsedAnimals.length - duplicateTags.size} New Animals`
                          : `Import ${parsedAnimals.length} Animals (Overwrite ${duplicateTags.size})`
                    }
                  </button>
                )}
              </div>
            </div>

            {/* ── Duplicate detection banner ── */}
            {isCheckingDuplicates && (
              <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.875rem', color: '#1e40af' }}>
                Checking for existing animals in database…
              </div>
            )}
            {!isCheckingDuplicates && duplicateTags.size > 0 && (
              <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>
                      {duplicateTags.size} tag number{duplicateTags.size !== 1 ? 's' : ''} already exist in the database
                    </div>
                    <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: '0 0 14px 0' }}>
                      Choose how to handle them — rows highlighted in amber are duplicates.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setDuplicateMode('skip')}
                        style={{
                          padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                          background: duplicateMode === 'skip' ? '#1e40af' : 'white',
                          color: duplicateMode === 'skip' ? 'white' : '#1e40af',
                          border: '2px solid #1e40af',
                        }}
                      >
                        {duplicateMode === 'skip' ? '✓ ' : ''}Skip Duplicates (default)
                      </button>
                      <button
                        onClick={() => setDuplicateMode('overwrite')}
                        style={{
                          padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                          background: duplicateMode === 'overwrite' ? '#1e40af' : 'white',
                          color: duplicateMode === 'overwrite' ? 'white' : '#1e40af',
                          border: '2px solid #1e40af',
                        }}
                      >
                        {duplicateMode === 'overwrite' ? '✓ ' : ''}Overwrite Existing
                      </button>
                    </div>
                    <p style={{ color: '#60a5fa', fontSize: '0.8rem', margin: '10px 0 0' }}>
                      {duplicateMode === 'skip'
                        ? `${duplicateTags.size} duplicate${duplicateTags.size !== 1 ? 's' : ''} will be skipped. Only ${parsedAnimals.length - duplicateTags.size} new animals will be imported.`
                        : `Existing records for ${duplicateTags.size} tag${duplicateTags.size !== 1 ? 's' : ''} will be updated with data from the CSV.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Missing-fields warning with defaults proposal ── */}
            {(() => {
              const missingRows = parsedAnimals
                .map((row, i) => {
                  const missing: string[] = [];
                  if (!row.tagNumber)   missing.push('Tag Number');
                  if (!row.breed)       missing.push('Breed');
                  if (!row.sex)         missing.push('Sex');
                  if (!row.dateOfBirth) missing.push('Date of Birth');
                  return missing.length > 0 ? { row: i + 1, fields: missing } : null;
                })
                .filter(Boolean) as { row: number; fields: string[] }[];

              if (missingRows.length === 0) return null;

              return (
                <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <AlertTriangle size={22} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: '8px', fontSize: '1rem' }}>
                        {missingRows.length} row{missingRows.length !== 1 ? 's have' : ' has'} missing required fields
                      </div>
                      <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', color: '#92400e', fontSize: '0.875rem', lineHeight: 1.7 }}>
                        {missingRows.slice(0, 8).map(r => (
                          <li key={r.row}>
                            <strong>Row {r.row}:</strong> {r.fields.join(' · ')}
                          </li>
                        ))}
                        {missingRows.length > 8 && <li>…and {missingRows.length - 8} more rows</li>}
                      </ul>

                      {/* Only show defaults for fields that are ACTUALLY missing across affected rows */}
                      {(() => {
                        const allMissingNames = new Set(missingRows.flatMap(r => r.fields));
                        const relevantDefaults = [
                          { name: 'Tag Number',    val: DEFAULTS.tagNumber   },
                          { name: 'Breed',         val: DEFAULTS.breed       },
                          { name: 'Sex',           val: DEFAULTS.sex         },
                          { name: 'Date of Birth', val: DEFAULTS.dateOfBirth },
                        ].filter(d => allMissingNames.has(d.name));
                        return (
                          <div style={{ backgroundColor: 'white', border: '1px solid #FED7AA', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                            <div style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Proposed Default Values</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 20px', fontSize: '0.875rem' }}>
                              {relevantDefaults.map(d => (
                                <>
                                  <span key={`lbl-${d.name}`} style={{ color: '#92400e' }}>{d.name}:</span>
                                  <span key={`val-${d.name}`} style={{ fontWeight: 700 }}>{d.val}</span>
                                </>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => setCurrentStep('mapping')}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#f97316', color: '#9a3412' }}
                        >
                          ← Go Back &amp; Fix in File
                        </button>
                        <button
                          className="btn"
                          style={{ background: '#f97316', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={handleApplyDefaults}
                        >
                          ✅ Accept Defaults &amp; Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Date-format errors (after defaults applied, if any remain) ── */}
            {errors.length > 0 && !parsedAnimals.some(r => !r.tagNumber || !r.breed || !r.sex || !r.dateOfBirth) && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', padding: '16px', marginBottom: '24px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 600, marginBottom: '8px' }}>
                  <AlertTriangle size={20} />
                  {errors.length} date format error{errors.length !== 1 ? 's' : ''} — please fix before importing:
                </div>
                <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--danger)' }}>
                  {errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  {errors.length > 5 && <li>...and {errors.length - 5} more issues.</li>}
                </ul>
                <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>Fix these in your CSV file, then click "Edit Mapping" to re-upload.</p>
              </div>
            )}

            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', zIndex: 10 }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Tag Number</th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Species</th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Breed</th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Sex</th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Date of Birth</th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Weight</th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Prices</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedAnimals.map((row, i) => {
                    const isDuplicate = duplicateTags.has(String(row.tagNumber));
                    return (
                      <tr key={i} style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: isDuplicate ? '#FFFBEB' : undefined,
                        opacity: isDuplicate && duplicateMode === 'skip' ? 0.55 : 1,
                      }}>
                        <td style={{ padding: '12px' }}>
                          {row.tagNumber || <span style={{color:'red'}}>MISSING</span>}
                          {isDuplicate && (
                            <span style={{ marginLeft: '8px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#FDE68A', color: '#92400E', borderRadius: '4px', padding: '2px 6px' }}>
                              {duplicateMode === 'skip' ? 'SKIP' : 'UPDATE'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>{row.species}</td>
                        <td style={{ padding: '12px' }}>{row.breed || <span style={{color:'red'}}>MISSING</span>}</td>
                        <td style={{ padding: '12px' }}>{row.sex || <span style={{color:'red'}}>MISSING</span>}</td>
                        <td style={{ padding: '12px' }}>{row.dateOfBirth || <span style={{color:'red'}}>MISSING</span>}</td>
                        <td style={{ padding: '12px' }}>{row.status}</td>
                        <td style={{ padding: '12px' }}>{row.weight ? `${row.weight} kg` : '-'}</td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                          {row.purchasePrice && <div>In: R{row.purchasePrice}</div>}
                          {row.soldPrice && <div style={{color:'var(--primary)'}}>Out: R{row.soldPrice}</div>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {currentStep === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <CheckCircle size={64} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <h2 style={{ marginBottom: '8px' }}>Import Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              {insertedCount} animal{insertedCount !== 1 ? 's' : ''} saved
              {duplicateTags.size > 0 && duplicateMode === 'skip' && ` · ${duplicateTags.size} duplicate${duplicateTags.size !== 1 ? 's' : ''} skipped`}
              {duplicateTags.size > 0 && duplicateMode === 'overwrite' && ` · ${duplicateTags.size} existing record${duplicateTags.size !== 1 ? 's' : ''} updated`}
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-outline" onClick={() => { setCurrentStep('upload'); setCsvData(null); setParsedAnimals([]); }}>Import Another File</button>
              <button className="btn btn-primary" onClick={() => navigate('/herd')}>View Herd List</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
