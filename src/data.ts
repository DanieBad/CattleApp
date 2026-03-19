import type { Animal } from './types';

// Mock Data for MVP testing
export let initialHerd: Animal[] = [
  {
    id: '1',
    species: 'Cattle',
    tagNumber: 'BULL-01',
    name: 'Ferdinand',
    breed: 'Brahman',
    sex: 'Male',
    dateOfBirth: '2020-04-15',
    status: 'Active',
    sireId: null,
    damId: null,
    weight: 950
  },
  {
    id: '2',
    species: 'Cattle',
    tagNumber: 'C-552',
    name: 'Bessie',
    breed: 'Angus',
    sex: 'Female',
    dateOfBirth: '2021-02-10',
    status: 'Active',
    sireId: null,
    damId: null,
    weight: 600
  },
  {
    id: '3',
    species: 'Cattle',
    tagNumber: 'C-553',
    breed: 'Crossbreed',
    sex: 'Female',
    dateOfBirth: '2021-05-20',
    status: 'Active',
    sireId: null,
    damId: null,
    weight: 580
  },
  {
    id: '4',
    species: 'Cattle',
    tagNumber: 'CALF-12',
    breed: 'Crossbreed',
    sex: 'Male',
    dateOfBirth: '2023-11-05',
    status: 'Active',
    sireId: '1',  // Sire is Ferdinand
    damId: '2',   // Dam is Bessie
    weight: 120
  },
];

export const addAnimalToHerd = (animal: Animal) => {
  initialHerd = [...initialHerd, animal];
};
