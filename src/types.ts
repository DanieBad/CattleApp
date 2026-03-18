export type Sex = 'Male' | 'Female';
export type Status = 'Active' | 'Sold' | 'Deceased';
export type Breed = 'Angus' | 'Brahman' | 'Hereford' | 'Holstein' | 'Jersey' | 'Tuli' | 'Boran' | 'Other';

export interface Animal {
  id: string;             // UUID
  tagNumber: string;      // Visible ear tag
  name?: string;          // Optional pet name
  breed: Breed;           
  sex: Sex;               
  dateOfBirth: string;    // ISO string for consistency
  status: Status;         
  sireId?: string | null; // ID of father
  damId?: string | null;  // ID of mother
  notes?: string;
  weight?: number;        // Current weight in kg
}

export interface WeightLog {
  id: string;
  animalId: string;
  weightKg: number;
  dateRecorded: string;
  notes?: string;
  createdAt?: string;
}

export interface HealthLog {
  id: string;
  animalId: string;
  treatmentType: string;
  medication?: string;
  dosage?: string;
  dateAdministered: string;
  notes?: string;
  createdAt?: string;
}

export interface MovementLog {
  id: string;
  animalId: string;
  movementDate: string;
  origin: string;
  destination: string;
  permitNumber?: string;
  vehicleRegistration?: string;
  notes?: string;
  createdAt?: string;
}
