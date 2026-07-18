import { useState } from 'react';
import { MapPin, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export interface TraceabilityData {
  partyName: string;
  farmName: string;
  partyGln: string;
  glnCertFile: File | null;
  gpsCoordinates: string; // Used as Origin/Destination Address in Sell mode
  permitNumber: string;
  permitFile: File | null;
  transactionDate: string;
  
  // New transport fields
  partyIdNumber?: string;
  partyAddress?: string;
  partyContact?: string;
  
  driverFullName?: string;
  driverIdNumber?: string;
  driverAddress?: string;
  driverContact?: string;
  
  vehicleRegistration?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  
  movementFrom?: string; // Sell mode origin address
}

interface Props {
  mode: 'buy' | 'sell';
  data: TraceabilityData;
  onChange: (data: TraceabilityData) => void;
  isLocating?: boolean;
  onUseLocation?: () => void;
}

export const TraceabilityForm = ({ mode, data, onChange, isLocating, onUseLocation }: Props) => {
  const isBuy = mode === 'buy';
  
  const [openSections, setOpenSections] = useState({
    buyer: true,
    driver: false,
    vehicle: false,
    documents: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const set = (key: keyof TraceabilityData, value: any) =>
    onChange({ ...data, [key]: value });

  const renderSectionHeader = (title: string, section: keyof typeof openSections) => (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 16px', 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: '8px', 
        cursor: 'pointer',
        border: '1px solid var(--border)',
        marginBottom: '16px',
        gridColumn: '1 / -1'
      }}
      onClick={() => toggleSection(section)}
    >
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
      {openSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
      
      {/* BUYER / SELLER DETAILS */}
      {renderSectionHeader(isBuy ? 'Seller Details' : 'Buyer Details', 'buyer')}
      
      {openSections.buyer && (
        <>
          <div className="form-group">
            <label className="form-label">Full Name / Company Name</label>
            <input
              type="text"
              className="form-input"
              placeholder={isBuy ? 'e.g. Smith Farms (Pty) Ltd' : 'e.g. John Doe'}
              value={data.partyName || ''}
              onChange={e => set('partyName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Farm Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rooiwater Plaas"
              value={data.farmName || ''}
              onChange={e => set('farmName', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">ID Number / Passport</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 8001015009087"
              value={data.partyIdNumber || ''}
              onChange={e => set('partyIdNumber', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 082 123 4567"
              value={data.partyContact || ''}
              onChange={e => set('partyContact', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Physical Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 123 Farm Road, District"
              value={data.partyAddress || ''}
              onChange={e => set('partyAddress', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isBuy ? 'Origin Farm GLN' : 'Destination Farm GLN'}</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 6001234567890"
              value={data.partyGln || ''}
              onChange={e => set('partyGln', e.target.value)}
            />
          </div>
        </>
      )}

      {/* DRIVER DETAILS */}
      {renderSectionHeader('Driver Details', 'driver')}
      
      {openSections.driver && (
        <>
          <div className="form-group">
            <label className="form-label">Driver Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Peter Smith"
              value={data.driverFullName || ''}
              onChange={e => set('driverFullName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Driver ID Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 8001015009087"
              value={data.driverIdNumber || ''}
              onChange={e => set('driverIdNumber', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Driver Contact</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 082 123 4567"
              value={data.driverContact || ''}
              onChange={e => set('driverContact', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Driver Physical Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 123 Transport St"
              value={data.driverAddress || ''}
              onChange={e => set('driverAddress', e.target.value)}
            />
          </div>
        </>
      )}

      {/* VEHICLE DETAILS */}
      {renderSectionHeader('Vehicle Details', 'vehicle')}
      
      {openSections.vehicle && (
        <>
          <div className="form-group">
            <label className="form-label">Vehicle Registration</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. ABC 123 FS"
              value={data.vehicleRegistration || ''}
              onChange={e => set('vehicleRegistration', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vehicle Make</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Toyota"
              value={data.vehicleMake || ''}
              onChange={e => set('vehicleMake', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vehicle Model</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Hilux"
              value={data.vehicleModel || ''}
              onChange={e => set('vehicleModel', e.target.value)}
            />
          </div>
        </>
      )}

      {/* PERMITS & MOVEMENT */}
      {renderSectionHeader('Documents & Movement', 'documents')}
      
      {openSections.documents && (
        <>
          {/* Movement Details */}
          {!isBuy && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Movement From (Farm Address)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Farm origin address"
                value={data.movementFrom || ''}
                onChange={e => set('movementFrom', e.target.value)}
              />
            </div>
          )}

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{isBuy ? 'Origin GPS Coordinates' : 'Destination Address'}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder={isBuy ? "-29.1234, 26.5678" : "e.g. 123 Destination Road"}
                value={data.gpsCoordinates || ''}
                onChange={e => set('gpsCoordinates', e.target.value)}
                style={{ flex: 1 }}
              />
              {isBuy && onUseLocation && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onUseLocation}
                  disabled={isLocating}
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Auto-fill coordinates from your device"
                >
                  {isLocating ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
                  {isLocating ? 'Locating…' : 'Use My Location'}
                </button>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="form-group">
            <label className="form-label">{isBuy ? 'Date of Arrival at Farm' : 'Date Leaving the Farm'}</label>
            <input
              type="date"
              className="form-input"
              value={data.transactionDate || ''}
              onChange={e => set('transactionDate', e.target.value)}
            />
          </div>

          {/* Permits */}
          <div className="form-group">
            <label className="form-label">Permit No (e.g. FMD)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. FMD-2026-00123"
              value={data.permitNumber || ''}
              onChange={e => set('permitNumber', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Permit (optional)</label>
            <input
              type="file"
              className="form-input"
              accept="application/pdf,image/*"
              onChange={e => set('permitFile', e.target.files?.[0] ?? null)}
            />
            {data.permitFile && (
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                ✓ {data.permitFile.name}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">GLN Certificate (optional)</label>
            <input
              type="file"
              className="form-input"
              accept="application/pdf,image/*"
              onChange={e => set('glnCertFile', e.target.files?.[0] ?? null)}
            />
            {data.glnCertFile && (
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                ✓ {data.glnCertFile.name}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
