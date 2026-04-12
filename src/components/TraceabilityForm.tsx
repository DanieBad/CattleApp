import { MapPin, Loader2 } from 'lucide-react';

export interface TraceabilityData {
  partyName: string;
  farmName: string;
  partyGln: string;
  glnCertFile: File | null;
  gpsCoordinates: string;
  permitNumber: string;
  permitFile: File | null;
  transactionDate: string;
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
  const gpsLabel = isBuy ? 'Origin GPS Coordinates' : 'Destination GPS Coordinates';
  const glnLabel = isBuy ? 'Origin Farm GLN (Legal Entity)' : 'Destination Farm GLN (Legal Entity)';
  const dateLabel = isBuy ? 'Date of Arrival at Farm' : 'Date Leaving the Farm';
  const certLabel = isBuy ? 'GLN Certificate (optional)' : 'Destination GLN Certificate (optional)';
  const permitUploadLabel = isBuy ? 'Upload Permit (optional)' : 'Upload Permit (optional)';

  const set = (key: keyof TraceabilityData, value: any) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="responsive-grid-2col">
      <div className="form-group">
        <label className="form-label">Name / Company Name</label>
        <input
          type="text"
          className="form-input"
          placeholder={isBuy ? 'e.g. Smith Farms (Pty) Ltd' : 'e.g. Jones Abattoir'}
          value={data.partyName}
          onChange={e => set('partyName', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Farm Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Rooiwater Plaas"
          value={data.farmName}
          onChange={e => set('farmName', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{glnLabel}</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. 6001234567890"
          value={data.partyGln}
          onChange={e => set('partyGln', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{certLabel}</label>
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

      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <label className="form-label">{gpsLabel}</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="-29.1234, 26.5678"
            value={data.gpsCoordinates}
            onChange={e => set('gpsCoordinates', e.target.value)}
            style={{ flex: 1 }}
          />
          {onUseLocation && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onUseLocation}
              disabled={isLocating}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Auto-fill coordinates from your device"
            >
              {isLocating
                ? <Loader2 size={15} className="animate-spin" />
                : <MapPin size={15} />}
              {isLocating ? 'Locating…' : 'Use My Location'}
            </button>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Permit No (e.g. FMD / Red Cross)</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. FMD-2026-00123"
          value={data.permitNumber}
          onChange={e => set('permitNumber', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{permitUploadLabel}</label>
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
        <label className="form-label">{dateLabel}</label>
        <input
          type="date"
          className="form-input"
          value={data.transactionDate}
          onChange={e => set('transactionDate', e.target.value)}
        />
      </div>
    </div>
  );
};
