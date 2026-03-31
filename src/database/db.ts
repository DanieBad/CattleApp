import Dexie, { type EntityTable } from 'dexie';
import type { Animal, Camp, WeightLog, HealthLog, MovementLog, BiosecurityLog, JournalLog, FarmSettings } from '../types';

export interface SyncOutbox {
  id?: number;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string; // The UUID of the record being synced
  payload: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

const db = new Dexie('HealthyHerdLocal') as Dexie & {
  animals: EntityTable<Animal, 'id'>;
  camps: EntityTable<Camp, 'id'>;
  weight_logs: EntityTable<WeightLog, 'id'>;
  health_logs: EntityTable<HealthLog, 'id'>;
  movement_log: EntityTable<MovementLog, 'id'>;
  biosecurity_logs: EntityTable<BiosecurityLog, 'id'>;
  journal_logs: EntityTable<JournalLog, 'id'>;
  farm_settings: EntityTable<FarmSettings, 'userId'>;
  sync_outbox: EntityTable<SyncOutbox, 'id'>;
};

// Database Schema Declaration
db.version(1).stores({
  animals: 'id, species, tagNumber, eidNumber, breed, status, currentCampId',
  camps: 'id, userId, name',
  weight_logs: 'id, animalId, dateRecorded',
  health_logs: 'id, animalId, treatmentType, dateAdministered',
  movement_log: 'id, animalId, movementDate',
  biosecurity_logs: 'id, movementId, healthDeclarationDate',
  journal_logs: 'id, animalId, dateRecorded',
  farm_settings: 'userId',
  sync_outbox: '++id, tableName, operation, status, createdAt'
});

export { db };
