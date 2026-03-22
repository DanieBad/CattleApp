export type Sex = 'Male' | 'Female';
export type Status = 'Active' | 'Sold' | 'Deceased';
export type Species = 'Cattle' | 'Sheep';
export type CattleBreed = 'Bonsmara' | 'Brahman' | 'Nguni' | 'Simmentaler' | 'Afrikaner' | 'Drakensberger' | 'Angus' | 'Boran' | 'Tuli' | 'Sussex' | 'Jersey' | 'Limousin' | 'Holstein Friesian' | 'Wagyu' | 'Zebu / Indicus' | 'Hereford' | 'Charolais' | 'Brown Swiss' | 'Shorthorn' | 'Gelbvieh' | 'Crossbreed' | 'Other';
export type SheepBreed = 'Dorper' | 'Merino' | 'Dohne Merino' | 'Vleismerino' | 'Meatmaster' | 'Van Rooy' | 'Ile de France' | 'Letelle' | 'Damara' | 'Suffolk' | 'Afrino' | 'Texel' | 'Hampshire Down' | 'Rambouillet' | 'Romney' | 'Corriedale' | 'Awassi' | 'Karakul' | 'East Friesian' | 'Crossbreed' | 'Other';
export type Breed = CattleBreed | SheepBreed;
export type HornStatus = 'Polled' | 'Horned' | 'Scurred';

export interface Animal {
  id: string;             // UUID
  species: Species;
  tagNumber: string;      // Visible ear tag
  eidNumber?: string;     // Official 15-digit EID
  isQuarantined?: boolean;// True if currently isolated
  name?: string;          // Optional pet name
  breed: Breed;           
  sex: Sex;               
  dateOfBirth: string;    // ISO string for consistency
  status: Status;         
  sireId?: string | null; // ID of father
  damId?: string | null;  // ID of mother
  hornStatus?: HornStatus;
  notes?: string;
  weight?: number;        // Current weight in kg
  currentCampId?: string | null; // ID of physical pasture
}

export interface Camp {
  id: string;
  userId: string;
  name: string;
  sizeHectares?: number;
  notes?: string;
  createdAt: string;
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

export interface JournalLog {
  id: string;
  animalId: string;
  noteText: string;
  dateRecorded: string;
  createdAt?: string;
}

export interface FarmSettings {
  userId: string;
  farmName: string | null;
  district: string | null;
  defaultCattleBreed: CattleBreed | null;
  defaultSheepBreed: SheepBreed | null;
  gs1CompanyPrefix: string | null;
  legalEntityGln: string | null;
  createdAt?: string;
  updatedAt?: string;
}
