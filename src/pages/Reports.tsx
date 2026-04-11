import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Animal, WeightLog, HealthLog, MovementLog, Camp } from '../types';
import { calculateAge } from '../utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Scale, MapPin, Heart, ShieldAlert, ChevronRight, DollarSign, Download } from 'lucide-react';

type ReportId = 'weight' | 'pasture' | 'reproductive' | 'health' | 'financial';

interface ReportCard {
  id: ReportId;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const REPORT_CARDS: ReportCard[] = [
  {
    id: 'weight',
    icon: <Scale size={24} />,
    title: 'Weight Performance (ADG)',
    description: 'Average Daily Gain per animal and breed. Identify your best and worst converters.',
    color: '#10B981',
  },
  {
    id: 'pasture',
    icon: <MapPin size={24} />,
    title: 'Pasture Utilization',
    description: 'Average days animals spend per camp. Prevent overgrazing and manage rotation.',
    color: '#3B82F6',
  },
  {
    id: 'reproductive',
    icon: <Heart size={24} />,
    title: 'Reproductive Efficiency',
    description: 'Calving/lambing intervals per dam. Find your most fertile and productive animals.',
    color: '#8B5CF6',
  },
  {
    id: 'health',
    icon: <ShieldAlert size={24} />,
    title: 'Health & Withdrawal Compliance',
    description: 'Treatment history and animals still within medicine withdrawal periods.',
    color: '#F59E0B',
  },
  {
    id: 'financial',
    icon: <DollarSign size={24} />,
    title: 'Sales & Financials',
    description: 'Track sold animals, purchase vs selling price, and profit margins over any timeline.',
    color: '#059669',
  },
];

const COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899','#64748b'];

// ──────────────── WEIGHT PERFORMANCE REPORT ────────────────
const WeightReport = ({ animals, weightLogs }: { animals: Animal[]; weightLogs: WeightLog[] }) => {
  const activeAnimals = animals.filter(a => a.status === 'Active');

  const adgData = activeAnimals
    .filter(a => a.dateOfBirth && a.weight && a.weight > 0)
    .map(a => {
      const birthDate = new Date(a.dateOfBirth);
      const today = new Date();
      const ageDays = Math.max(1, Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)));
      const adg = parseFloat(((a.weight || 0) / ageDays).toFixed(3));
      return { label: a.tagNumber + (a.name ? ` (${a.name})` : ''), adg, weight: a.weight, breed: a.breed };
    })
    .sort((a, b) => b.adg - a.adg)
    .slice(0, 15);

  const breedAvgAdg = Object.entries(
    adgData.reduce((acc, a) => {
      if (!acc[a.breed]) acc[a.breed] = { total: 0, count: 0 };
      acc[a.breed].total += a.adg;
      acc[a.breed].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([breed, { total, count }]) => ({
    name: breed,
    avgAdg: parseFloat((total / count).toFixed(3)),
    count,
  })).sort((a, b) => b.avgAdg - a.avgAdg);

  // recent weight logs
  const recentLogs = [...weightLogs]
    .sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime())
    .slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Active</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10B981' }}>{activeAnimals.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg ADG (Top 15)</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10B981' }}>
            {adgData.length > 0 ? (adgData.reduce((s, a) => s + a.adg, 0) / adgData.length).toFixed(3) : '—'} kg/day
          </p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Best Performer</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{adgData[0]?.label || '—'}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{adgData[0] ? `${adgData[0].adg} kg/day` : ''}</p>
        </div>
      </div>

      <div className="responsive-grid-2col" style={{ gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Top 15 ADG by Animal</h3>
          <div style={{ height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adgData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit=" kg/d" tick={{ fontSize: 11 }} />
                <YAxis dataKey="label" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} kg/day`, 'ADG']} />
                <Bar dataKey="adg" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Avg ADG by Breed</h3>
          <div style={{ height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breedAvgAdg} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit=" kg/d" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} kg/day`, 'Avg ADG']} />
                <Bar dataKey="avgAdg" radius={[0, 4, 4, 0]}>
                  {breedAvgAdg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {recentLogs.length > 0 && (
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3>Recent Weight Records</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Date</th>
                  <th>Weight (kg)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map(log => {
                  const animal = animals.find(a => a.id === log.animalId);
                  return (
                    <tr key={log.id}>
                      <td>{animal ? `${animal.tagNumber}${animal.name ? ` (${animal.name})` : ''}` : 'Unknown'}</td>
                      <td>{new Date(log.dateRecorded).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>{log.weightKg} kg</td>
                      <td style={{ color: 'var(--text-muted)' }}>{log.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ──────────────── PASTURE UTILIZATION REPORT ────────────────
const PastureReport = ({ movementLogs, camps }: { movementLogs: MovementLog[]; camps: Camp[] }) => {
  // Calculate average days each camp was a destination
  const campStats = camps.map(camp => {
    const arrivals = movementLogs.filter(m => m.destination === camp.name).sort(
      (a, b) => new Date(a.movementDate).getTime() - new Date(b.movementDate).getTime()
    );
    const durations: number[] = [];
    arrivals.forEach((arrival, _i) => {
      const nextEvent = movementLogs.filter(
        m => m.origin === camp.name && new Date(m.movementDate) > new Date(arrival.movementDate)
      ).sort((a, b) => new Date(a.movementDate).getTime() - new Date(b.movementDate).getTime())[0];
      const end = nextEvent ? new Date(nextEvent.movementDate) : new Date();
      const days = Math.floor((end.getTime() - new Date(arrival.movementDate).getTime()) / (1000 * 60 * 60 * 24));
      if (days >= 0) durations.push(days);
    });
    const avgDays = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;
    return { name: camp.name, avgDays, visits: arrivals.length, size: camp.sizeHectares };
  }).filter(c => c.visits > 0).sort((a, b) => b.avgDays - a.avgDays);

  const recentMoves = [...movementLogs]
    .sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime())
    .slice(0, 15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Movements</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3B82F6' }}>{movementLogs.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Camps</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3B82F6' }}>{campStats.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Most Used Camp</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6' }}>{campStats[0]?.name || '—'}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{campStats[0] ? `${campStats[0].visits} visits` : ''}</p>
        </div>
      </div>

      {campStats.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Average Days per Camp Visit</h3>
          <div style={{ height: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campStats} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit=" days" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} days`, 'Avg Stay']} />
                <Bar dataKey="avgDays" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3>Recent Movements</h3>
        </div>
        {recentMoves.length === 0 ? (
          <p style={{ padding: '24px', color: 'var(--text-muted)' }}>No movements logged yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentMoves.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.movementDate).toLocaleDateString()}</td>
                    <td>{log.origin}</td>
                    <td style={{ fontWeight: 600, color: '#3B82F6' }}>{log.destination}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{log.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ──────────────── REPRODUCTIVE EFFICIENCY REPORT ────────────────
const ReproductiveReport = ({ animals }: { animals: Animal[] }) => {
  const females = animals.filter(a => a.sex === 'Female' && a.status === 'Active' && a.dateOfBirth);

  const damData = females.map(dam => {
    const offspring = animals.filter(a => a.damId === dam.id && a.dateOfBirth).sort(
      (a, b) => new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime()
    );
    const intervals: number[] = [];
    for (let i = 1; i < offspring.length; i++) {
      const prev = new Date(offspring[i - 1].dateOfBirth);
      const curr = new Date(offspring[i].dateOfBirth);
      intervals.push(Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)));
    }
    const avgInterval = intervals.length > 0 ? Math.round(intervals.reduce((s, d) => s + d, 0) / intervals.length) : null;
    const age = calculateAge(dam.dateOfBirth);
    return {
      tag: dam.tagNumber + (dam.name ? ` (${dam.name})` : ''),
      breed: dam.breed,
      age: age.display,
      totalOffspring: offspring.length,
      avgInterval,
      latestOffspring: offspring[offspring.length - 1]?.dateOfBirth,
    };
  }).filter(d => d.totalOffspring > 0).sort((a, b) => (a.avgInterval ?? 9999) - (b.avgInterval ?? 9999));

  const chartData = damData.filter(d => d.avgInterval !== null).map(d => ({
    name: d.tag,
    interval: d.avgInterval!,
  })).slice(0, 12);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Females</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#8B5CF6' }}>{females.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Dams with Records</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#8B5CF6' }}>{damData.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Best Interval</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6' }}>
            {damData[0]?.avgInterval ? `${damData[0].avgInterval} days` : '—'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{damData[0]?.tag || ''}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '8px' }}>Calving Interval by Dam</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Lower = more productive. Target: &lt;365 days.</p>
          <div style={{ height: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit=" days" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} days`, 'Avg Interval']} />
                <Bar dataKey="interval" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, _i) => (
                    <Cell key={_i} fill={COLORS[_i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3>Dam Performance Table</h3>
        </div>
        {damData.length === 0 ? (
          <p style={{ padding: '24px', color: 'var(--text-muted)' }}>No reproductive data yet. Link sire/dam IDs when adding animals.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Breed</th>
                  <th>Age</th>
                  <th>Total Offspring</th>
                  <th>Avg Interval</th>
                  <th>Last Offspring</th>
                </tr>
              </thead>
              <tbody>
                {damData.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.tag}</td>
                    <td>{d.breed}</td>
                    <td>{d.age}</td>
                    <td>{d.totalOffspring}</td>
                    <td>
                      {d.avgInterval ? (
                        <span style={{
                          fontWeight: 600,
                          color: d.avgInterval <= 365 ? '#10B981' : d.avgInterval <= 400 ? '#F59E0B' : '#EF4444'
                        }}>
                          {d.avgInterval} days
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {d.latestOffspring ? new Date(d.latestOffspring).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ──────────────── HEALTH & COMPLIANCE REPORT ────────────────
const HealthComplianceReport = ({ animals, healthLogs }: { animals: Animal[]; healthLogs: HealthLog[] }) => {
  const today = new Date();
  const WITHDRAWAL_DAYS = 21; // Default withdrawal period

  const logsWithAnimals = healthLogs.map(log => {
    const animal = animals.find(a => a.id === log.animalId);
    const treatmentDate = new Date(log.dateAdministered);
    const daysSince = Math.floor((today.getTime() - treatmentDate.getTime()) / (1000 * 60 * 60 * 24));
    const inWithdrawal = daysSince < WITHDRAWAL_DAYS;
    const withdrawalEnds = new Date(treatmentDate.getTime() + WITHDRAWAL_DAYS * 24 * 60 * 60 * 1000);
    return { ...log, animal, daysSince, inWithdrawal, withdrawalEnds };
  }).sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime());

  const inWithdrawal = logsWithAnimals.filter(l => l.inWithdrawal);
  const cleared = logsWithAnimals.filter(l => !l.inWithdrawal);

  const treatmentTypeCounts = healthLogs.reduce((acc, l) => {
    acc[l.treatmentType] = (acc[l.treatmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const treatmentChartData = Object.entries(treatmentTypeCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Treatments</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F59E0B' }}>{healthLogs.length}</p>
        </div>
        <div className="card" style={{ padding: '20px', border: inWithdrawal.length > 0 ? '2px solid #EF4444' : undefined }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>⚠️ In Withdrawal</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#EF4444' }}>{inWithdrawal.length}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>do not sell these animals</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Cleared for Sale</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10B981' }}>{cleared.length}</p>
        </div>
      </div>

      {inWithdrawal.length > 0 && (
        <div className="card" style={{ border: '2px solid #FEE2E2' }}>
          <div style={{ padding: '16px 24px', backgroundColor: '#FEF2F2', borderBottom: '1px solid #FEE2E2', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ShieldAlert size={20} color="#EF4444" />
            <h3 style={{ color: '#991B1B', margin: 0 }}>⛔ Withdrawal Period Alert — Do Not Sell</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Treatment</th>
                  <th>Medication</th>
                  <th>Date Given</th>
                  <th>Cleared On</th>
                  <th>Days Remaining</th>
                </tr>
              </thead>
              <tbody>
                {inWithdrawal.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.animal ? `${log.animal.tagNumber}${log.animal.name ? ` (${log.animal.name})` : ''}` : 'Unknown'}</td>
                    <td>{log.treatmentType}</td>
                    <td>{log.medication || '—'}</td>
                    <td>{new Date(log.dateAdministered).toLocaleDateString()}</td>
                    <td style={{ color: '#EF4444', fontWeight: 600 }}>{log.withdrawalEnds.toLocaleDateString()}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                        {WITHDRAWAL_DAYS - log.daysSince} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {treatmentChartData.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Treatment Type Breakdown</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={treatmentChartData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3>Full Treatment History</h3>
        </div>
        {logsWithAnimals.length === 0 ? (
          <p style={{ padding: '24px', color: 'var(--text-muted)' }}>No health treatments recorded yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Date</th>
                  <th>Treatment</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logsWithAnimals.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.animal ? `${log.animal.tagNumber}${log.animal.name ? ` (${log.animal.name})` : ''}` : 'Unknown'}</td>
                    <td>{new Date(log.dateAdministered).toLocaleDateString()}</td>
                    <td>{log.treatmentType}</td>
                    <td>{log.medication || '—'}</td>
                    <td>{log.dosage || '—'}</td>
                    <td>
                      {log.inWithdrawal ? (
                        <span className="badge badge-red">In Withdrawal</span>
                      ) : (
                        <span className="badge badge-green">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


// ──────────────── SALES & FINANCIAL REPORT ────────────────
const FinancialReport = ({ animals }: { animals: Animal[] }) => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const salesData = animals.filter(a => a.status === 'Sold').map(a => {
    const sd = (a as any).updatedAt ? new Date((a as any).updatedAt) : new Date();
    return { ...a, soldDate: sd };
  }).filter(a => {
    const sdTime = a.soldDate.getTime();
    return sdTime >= new Date(startDate).getTime() && sdTime <= new Date(endDate + 'T23:59:59').getTime();
  }).sort((a, b) => b.soldDate.getTime() - a.soldDate.getTime());

  const totalSales = salesData.reduce((sum, a) => sum + (a.soldPrice || 0), 0);
  const totalPurchase = salesData.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const profit = totalSales - totalPurchase;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="card" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', backgroundColor: '#F8FAFC' }}>
        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Animals Sold</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669' }}>{salesData.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Revenue</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669' }}>R {totalSales.toFixed(2)}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Purchase Cost</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F59E0B' }}>R {totalPurchase.toFixed(2)}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderTop: `4px solid ${profit >= 0 ? '#10B981' : '#EF4444'}` }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gross Profit/Loss</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: profit >= 0 ? '#10B981' : '#EF4444' }}>
            {profit < 0 ? '-' : ''}R {Math.abs(profit).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3>Sales Ledger</h3>
        </div>
        {salesData.length === 0 ? (
          <p style={{ padding: '24px', color: 'var(--text-muted)' }}>No animals were sold in this timeframe.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date Sold</th>
                  <th>Ear Tag</th>
                  <th>Species/Breed</th>
                  <th>Purchase Price</th>
                  <th>Sold Price</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map(animal => {
                  const m = (animal.soldPrice || 0) - (animal.purchasePrice || 0);
                  return (
                    <tr key={animal.id}>
                      <td>{animal.soldDate.toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>{animal.tagNumber}</td>
                      <td>{animal.species} / {animal.breed}</td>
                      <td>R {(animal.purchasePrice || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: '#059669' }}>R {(animal.soldPrice || 0).toFixed(2)}</td>
                      <td style={{ color: m >= 0 ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                        {m >= 0 ? '+' : '-'}R {Math.abs(m).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


// ──────────────── MAIN REPORTS PAGE ────────────────
export const Reports = () => {
  const [activeReport, setActiveReport] = useState<ReportId | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [movementLogs, setMovementLogs] = useState<MovementLog[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, wRes, hRes, mRes, cRes] = await Promise.all([
          supabase.from('animals').select('*'),
          supabase.from('weight_logs').select('*'),
          supabase.from('health_logs').select('*'),
          supabase.from('movement_log').select('*'),
          supabase.from('camps').select('*'),
        ]);

        setAnimals((aRes.data || []).map((a: any) => ({
          id: a.id, species: a.species || 'Cattle', tagNumber: a.tag_number, name: a.name,
          breed: a.breed, sex: a.sex, dateOfBirth: a.date_of_birth, status: a.status,
          sireId: a.sire_id, damId: a.dam_id, weight: a.weight, currentCampId: a.current_camp_id,
          hornStatus: a.horn_status, brand: a.brand, originGln: a.origin_gln, previousOwnerTag: a.previous_owner_tag, previousOwnerBrand: a.previous_owner_brand, arrivalDate: a.arrival_date, purchasePrice: a.purchase_price, soldPrice: a.sold_price, updatedAt: a.updated_at
        })));

        setWeightLogs((wRes.data || []).map((w: any) => ({
          id: w.id, animalId: w.animal_id, weightKg: w.weight_kg,
          dateRecorded: w.date_recorded, notes: w.notes,
        })));

        setHealthLogs((hRes.data || []).map((h: any) => ({
          id: h.id, animalId: h.animal_id, treatmentType: h.treatment_type,
          medication: h.medication, dosage: h.dosage,
          dateAdministered: h.date_administered, notes: h.notes,
        })));

        setMovementLogs((mRes.data || []).map((m: any) => ({
          id: m.id, animalId: m.animal_id, movementDate: m.movement_date,
          origin: m.origin, destination: m.destination, notes: m.notes,
        })));

        setCamps((cRes.data || []).map((c: any) => ({
          id: c.id, userId: c.user_id, name: c.name,
          sizeHectares: c.size_hectares, notes: c.notes, createdAt: c.created_at,
        })));
      } catch (err) {
        console.error('Error loading report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const activeCard = REPORT_CARDS.find(r => r.id === activeReport);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading report data...</div>;

  return (
    <div>
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {activeReport && (
          <>
            <button onClick={() => setActiveReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, fontWeight: 500 }}>
              Reports
            </button>
            <ChevronRight size={14} />
            <span>{activeCard?.title}</span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">{activeCard?.title ?? 'Reports Hub'}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
            {activeCard ? '' : 'Select a report to view detailed analytics for your farm.'}
          </p>
        </div>
        
        {activeReport && (
          <button 
            className="btn btn-primary" 
            onClick={() => window.print()} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <Download size={18} /> Download PDF
          </button>
        )}
      </div>

      {!activeReport ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {REPORT_CARDS.map(report => (
            <div
              key={report.id}
              className="card"
              style={{ padding: '28px', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onClick={() => setActiveReport(report.id)}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: `${report.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: report.color, marginBottom: '16px' }}>
                {report.icon}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>{report.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>{report.description}</p>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '4px', color: report.color, fontSize: '0.875rem', fontWeight: 600 }}>
                View Report <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {activeReport === 'weight' && <WeightReport animals={animals} weightLogs={weightLogs} />}
          {activeReport === 'pasture' && <PastureReport movementLogs={movementLogs} camps={camps} />}
          {activeReport === 'reproductive' && <ReproductiveReport animals={animals} />}
          {activeReport === 'health' && <HealthComplianceReport animals={animals} healthLogs={healthLogs} />}
          {activeReport === 'financial' && <FinancialReport animals={animals} />}
        </div>
      )}
    </div>
  );
};
