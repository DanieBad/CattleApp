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
  brand?: string;         // Brand info
  originGln?: string;     // Previous farm GLN
  previousOwnerTag?: string;
  previousOwnerBrand?: string;
  arrivalDate?: string;
  purchasePrice?: number;
  soldPrice?: number;
  quarantineStartDate?: string; // ISO string
  quarantineEndDate?: string; // ISO string
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
  permitIssueDate?: string;
  permitExpiryDate?: string;
  permitPdfUrl?: string;
  originGps?: string;
  destinationGps?: string;
  originGln?: string;
  destinationGln?: string;
  gpsSource?: 'Auto' | 'Manual';
  vehicleRegistration?: string;
  notes?: string;
  createdAt?: string;
}

export interface BiosecurityLog {
  id: string;
  movementId: string;
  healthDeclarationDate?: string;
  vehicleDisinfectionDate?: string;
  disinfectionCertificateUrl?: string;
  notes?: string;
  createdAt?: string;
  syncedAt?: string;
}

export interface JournalLog {
  id: string;
  animalId: string;
  noteText: string;
  dateRecorded: string;
  audioUrl?: string; // Stored path in Supabase Storage
  audioSizeBytes?: number; // In bytes
  audioDurationSeconds?: number; // In seconds
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
  glnCertificateUrl?: string | null;
  brandCertificateUrl?: string | null;
  voiceLanguage?: 'en-ZA' | 'af-ZA';
  audioUsedBytes?: number; // Quota tracking
  createdAt?: string;
  updatedAt?: string;
}
