import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { supabase } from '../supabase';
import type { FarmSettings, CattleBreed, SheepBreed } from '../types';
import { Save, Building2, MapPin, Hash, Globe, CheckCircle2, Activity, Download, Upload, FolderSync } from 'lucide-react';

export const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [settings, setSettings] = useState<Partial<FarmSettings>>({
    farmName: '',
    district: '',
    defaultCattleBreed: 'Bonsmara',
    defaultSheepBreed: 'Dorper',
    gs1CompanyPrefix: '',
    legalEntityGln: '',
    glnCertificateUrl: '',
    brandCertificateUrl: '',
    voiceLanguage: 'en-ZA'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('farm_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

      if (data) {
        setSettings({
          farmName: data.farm_name || '',
          district: data.district || '',
          defaultCattleBreed: data.default_cattle_breed as CattleBreed || 'Bonsmara',
          defaultSheepBreed: data.default_sheep_breed as SheepBreed || 'Dorper',
          gs1CompanyPrefix: data.gs1_company_prefix || '',
          legalEntityGln: data.legal_entity_gln || '',
          glnCertificateUrl: data.gln_certificate_url || '',
          brandCertificateUrl: data.brand_certificate_url || '',
          voiceLanguage: (localStorage.getItem('voice_language') as any) || 'en-ZA'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const payload = {
        user_id: user.id,
        farm_name: settings.farmName,
        district: settings.district,
        default_cattle_breed: settings.defaultCattleBreed,
        default_sheep_breed: settings.defaultSheepBreed,
        gs1_company_prefix: settings.gs1CompanyPrefix,
        legal_entity_gln: settings.legalEntityGln,
        gln_certificate_url: settings.glnCertificateUrl,
        brand_certificate_url: settings.brandCertificateUrl,
        updated_at: new Date().toISOString()
      };

      // Save voice language to localStorage to avoid Supabase missing column errors
      if (settings.voiceLanguage) {
        localStorage.setItem('voice_language', settings.voiceLanguage);
      }

      const { error } = await supabase
        .from('farm_settings')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  // ── Export handler (mirrors ImportData.tsx) ──────────────────────────────
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

      // Map DB snake_case columns back to friendly CSV headers
      const exportData = data.map(animal => ({
        'Tag Number':    animal.tag_number,
        'EID Number':    animal.eid_number   || '',
        'Species':       animal.species,
        'Breed':         animal.breed,
        'Sex':           animal.sex,
        'Date of Birth': animal.date_of_birth,
        'Status':        animal.status,
        'Weight (kg)':   animal.weight       || '',
        'Horn Status':   animal.horn_status   || '',
        'Is Quarantined': animal.is_quarantined ? 'Yes' : 'No',
        'Name':          animal.name          || '',
        'Notes':         animal.notes         || ''
      }));

      const csv  = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href',     url);
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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'glnCertificateUrl' | 'brandCertificateUrl') => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${fieldName}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
      
      setSettings(prev => ({ ...prev, [fieldName]: data.publicUrl }));
      setMessage({ type: 'success', text: 'Document uploaded successfully! Please save settings.' });
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Upload failed (ensure "documents" bucket exists in Supabase): ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Farm Setup & Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your farm details, GS1 prefixes, and default animal preferences.</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Farm Information */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--primary)" />
            Farm Information
          </h2>
          
          <div className="form-group">
            <label className="form-label" htmlFor="farmName">Farm Name</label>
            <input 
              id="farmName"
              className="form-input" 
              type="text" 
              placeholder="e.g. Green Valley Farm"
              value={settings.farmName || ''}
              onChange={e => setSettings({...settings, farmName: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="district">District / Region</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="district"
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                type="text" 
                placeholder="e.g. Free State"
                value={settings.district || ''}
                onChange={e => setSettings({...settings, district: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Brand Certificate</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="file" onChange={e => handleUpload(e, 'brandCertificateUrl')} className="form-input" style={{ flex: 1 }} />
              {settings.brandCertificateUrl && (
                <a href={settings.brandCertificateUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                  View Uploaded Document
                </a>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Upload a PDF or Image of your registered brand certificate.</p>
          </div>
        </div>

        {/* GS1 & Logistics */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="var(--primary)" />
            GS1 & Logistics (FMD)
          </h2>
          
          <div className="form-group">
            <label className="form-label" htmlFor="gs1Prefix">GS1 Company Prefix</label>
            <div style={{ position: 'relative' }}>
              <Hash size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="gs1Prefix"
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                type="text" 
                placeholder="e.g. 6001234"
                value={settings.gs1CompanyPrefix || ''}
                onChange={e => setSettings({...settings, gs1CompanyPrefix: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gln">Legal Entity GLN</label>
            <input 
              id="gln"
              className="form-input" 
              type="text" 
              placeholder="e.g. 6001234567890"
              value={settings.legalEntityGln || ''}
              onChange={e => setSettings({...settings, legalEntityGln: e.target.value})}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Used for issuing FMD transport documents.</p>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">GLN Certificate</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="file" onChange={e => handleUpload(e, 'glnCertificateUrl')} className="form-input" style={{ flex: 1 }} />
              {settings.glnCertificateUrl && (
                <a href={settings.glnCertificateUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                  View Uploaded Document
                </a>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Upload a PDF or Image of your GLN certificate.</p>
          </div>
        </div>

        {/* Default Breeds */}
        <div className="card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Activity size={20} color="var(--primary)" />
             Animal Defaults
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>Sets the preferred breed to appear first when adding new animals.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="defaultCattle">Default Cattle Breed</label>
              <select 
                id="defaultCattle"
                className="form-input"
                value={settings.defaultCattleBreed || ''}
                onChange={e => setSettings({...settings, defaultCattleBreed: e.target.value as CattleBreed})}
              >
                <option value="Bonsmara">Bonsmara</option>
                <option value="Brahman">Brahman</option>
                <option value="Nguni">Nguni</option>
                <option value="Simmentaler">Simmentaler</option>
                <option value="Afrikaner">Afrikaner</option>
                <option value="Drakensberger">Drakensberger</option>
                <option value="Angus">Angus</option>
                <option value="Boran">Boran</option>
                <option value="Tuli">Tuli</option>
                <option value="Sussex">Sussex</option>
                <option value="Jersey">Jersey</option>
                <option value="Limousin">Limousin</option>
                <option value="Holstein Friesian">Holstein Friesian</option>
                <option value="Wagyu">Wagyu</option>
                <option value="Zebu / Indicus">Zebu / Indicus</option>
                <option value="Hereford">Hereford</option>
                <option value="Charolais">Charolais</option>
                <option value="Brown Swiss">Brown Swiss</option>
                <option value="Shorthorn">Shorthorn</option>
                <option value="Gelbvieh">Gelbvieh</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="defaultSheep">Default Sheep Breed</label>
              <select 
                id="defaultSheep"
                className="form-input"
                value={settings.defaultSheepBreed || ''}
                onChange={e => setSettings({...settings, defaultSheepBreed: e.target.value as SheepBreed})}
              >
                <option value="Dorper">Dorper</option>
                <option value="Merino">Merino</option>
                <option value="Dohne Merino">Dohne Merino</option>
                <option value="Vleismerino">Vleismerino</option>
                <option value="Meatmaster">Meatmaster</option>
                <option value="Van Rooy">Van Rooy</option>
                <option value="Ile de France">Ile de France</option>
                <option value="Letelle">Letelle</option>
                <option value="Damara">Damara</option>
                <option value="Suffolk">Suffolk</option>
                <option value="Afrino">Afrino</option>
                <option value="Texel">Texel</option>
                <option value="Hampshire Down">Hampshire Down</option>
                <option value="Rambouillet">Rambouillet</option>
                <option value="Romney">Romney</option>
                <option value="Corriedale">Corriedale</option>
                <option value="Awassi">Awassi</option>
                <option value="Karakul">Karakul</option>
                <option value="East Friesian">East Friesian</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="voiceLanguage">Voice Assistant Language</label>
              <select 
                id="voiceLanguage"
                className="form-input"
                value={settings.voiceLanguage || 'en-ZA'}
                onChange={e => setSettings({...settings, voiceLanguage: e.target.value as any})}
              >
                <option value="en-ZA">English (South Africa)</option>
                <option value="af-ZA">Afrikaans (Suid-Afrika)</option>
              </select>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Determines how the app listens for your voice commands.</p>
            </div>
          </div>
        </div>

        {/* ── Import & Export Data ─────────────────────────────────────────────── */}
        <div className="card" style={{ padding: '24px', gridColumn: '1 / -1', border: '2px solid var(--primary-light)' }}>
          <div style={{ backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#065F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Upload size={18} /> Got existing records?
            </h3>
            <p style={{ margin: 0, color: '#047857', fontSize: '0.95rem' }}>
              You don't have to start from scratch! Use our <strong onClick={() => navigate('/herd/import')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>CSV Import tool</strong> below to easily move your existing animals into HealthyHerd in one go.
            </p>
          </div>

          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderSync size={20} color="var(--primary)" />
            Import &amp; Export Data
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Backup your full database or upload new records via CSV.
          </p>

          {/* Two-column action layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>

            {/* Export column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '20px',
              borderRadius: '10px',
              background: 'var(--background)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Download size={22} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Export Database</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Download all your animal records as a single CSV spreadsheet for backup or external use.
              </p>
              {/* Export is handled inline — no navigation needed */}
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleExport}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', marginTop: 'auto' }}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            {/* Import column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '20px',
              borderRadius: '10px',
              background: 'var(--background)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload size={22} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Import Animals</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Upload a CSV file to bulk-add animals to your account. The wizard guides you through
                column mapping and validation before saving.
              </p>
              {/* Import is a multi-step wizard — navigate to its dedicated page */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/herd/import')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', marginTop: 'auto' }}
              >
                <Upload size={16} />
                Go to Import Wizard
              </button>
            </div>

          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
          {message && (
            <div className={`fade-in`} style={{ 
              color: message.type === 'success' ? 'var(--primary)' : 'var(--danger)',
              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
            }}>
              {message.type === 'success' && <CheckCircle2 size={18} />}
              {message.text}
            </div>
          )}
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saving}
            style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
};
