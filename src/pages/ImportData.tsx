import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { supabase } from '../supabase';
import { Upload, ChevronRight, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import type { Animal, Breed, Status } from '../types';

type Step = 'upload' | 'mapping' | 'preview' | 'success';

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
];

export const ImportData = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [mappings, setMappings] = useState<ColumnMap>({});
  const [parsedAnimals, setParsedAnimals] = useState<Partial<Animal>[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

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
      
      return {
        _tempId: index, // Local ID for error tracking
        tagNumber: getVal('tagNumber'),
        species: (getVal('species') || 'Cattle') as any,
        breed: getVal('breed') as Breed || 'Other',
        sex: getVal('sex').match(/female|f/i) ? 'Female' : 'Male',
        dateOfBirth: getVal('dateOfBirth'),
        status: (getVal('status') || 'Active') as Status,
        name: getVal('name'),
        eidNumber: getVal('eidNumber'),
        weight: getVal('weight') ? parseFloat(getVal('weight')) : undefined,
        hornStatus: getVal('hornStatus') as any,
        purchasePrice: getVal('purchasePrice') ? parseFloat(getVal('purchasePrice')) : undefined,
        soldPrice: getVal('soldPrice') ? parseFloat(getVal('soldPrice')) : undefined,
        notes: getVal('notes')
      };
    });

    setParsedAnimals(transformed);
    validateData(transformed);
    setCurrentStep('preview');
  };

  // 3. VALIDATION
  const validateData = (data: Partial<Animal>[]) => {
    const newErrors: string[] = [];
    
    data.forEach((animal, i) => {
      const rowNum = i + 1;
      if (!animal.tagNumber) newErrors.push(`Row ${rowNum}: Missing Tag Number`);
      
      // Basic date validation
      if (animal.dateOfBirth) {
        const d = new Date(animal.dateOfBirth);
        if (isNaN(d.getTime())) {
          newErrors.push(`Row ${rowNum} (${animal.tagNumber}): Invalid Date form. Use YYYY-MM-DD.`);
        }
      } else {
        newErrors.push(`Row ${rowNum}: Missing Date of Birth`);
      }
    });
    
    setErrors(newErrors);
  };

  // 4. DATABASE INGESTION
  const handleImport = async () => {
    if (errors.length > 0) {
      alert('Please fix the validation errors before importing.');
      return;
    }

    setIsUploading(true);
    try {
      // Map frontend camelCase to database snake_case columns
      const payload = (parsedAnimals as any[]).map((animal) => ({
        tag_number: animal.tagNumber || 'UNKNOWN',
        eid_number: animal.eidNumber || null,
        name: animal.name || null,
        species: animal.species || 'Cattle',
        breed: animal.breed || 'Other',
        sex: animal.sex || 'Female',
        date_of_birth: animal.dateOfBirth,
        status: animal.status || 'Active',
        weight: animal.weight || null,
        horn_status: animal.hornStatus || null,
        purchase_price: animal.purchasePrice || null,
        sold_price: animal.soldPrice || null
      }));
      
      const { error } = await supabase.from('animals').insert(payload);
      if (error) throw error;
      
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '20px 0' }}>
            
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
                <button 
                  className="btn btn-primary" 
                  onClick={handleImport}
                  disabled={errors.length > 0 || isUploading}
                >
                  {isUploading ? 'Importing securely...' : 'Import to Database'}
                </button>
              </div>
            </div>

            {errors.length > 0 && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', padding: '16px', marginBottom: '24px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 600, marginBottom: '8px' }}>
                  <AlertTriangle size={20} />
                  Please fix {errors.length} formatting errors before importing:
                </div>
                <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--danger)' }}>
                  {errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  {errors.length > 5 && <li>...and {errors.length - 5} more issues.</li>}
                </ul>
                <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>*Tip: Fix these in your original Excel file, re-save as CSV, and hit "Edit Mapping" to re-upload.</p>
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
                  {parsedAnimals.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}>{row.tagNumber || <span style={{color:'red'}}>MISSING</span>}</td>
                      <td style={{ padding: '12px' }}>{row.species}</td>
                      <td style={{ padding: '12px' }}>{row.breed}</td>
                      <td style={{ padding: '12px' }}>{row.sex}</td>
                      <td style={{ padding: '12px' }}>{row.dateOfBirth || <span style={{color:'red'}}>MISSING</span>}</td>
                      <td style={{ padding: '12px' }}>{row.status}</td>
                      <td style={{ padding: '12px' }}>{row.weight ? `${row.weight} kg` : '-'}</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                        {row.purchasePrice && <div>In: R{row.purchasePrice}</div>}
                        {row.soldPrice && <div style={{color:'var(--primary)'}}>Out: R{row.soldPrice}</div>}
                      </td>
                    </tr>
                  ))}
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
              {parsedAnimals.length} animals have been securely saved to the cloud database.
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
