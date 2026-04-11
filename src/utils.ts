/**
 * Calculates the exact age from a birth date string
 * Returns an object with Years and Months for logic,
 * and a formatted string for display.
 */
export const calculateAge = (dateOfBirth: string) => {
  if (!dateOfBirth) return { years: 0, months: 0, display: 'Unknown' };

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();

  // Adjust if the current day of the month is before the birth day
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let display = '';
  if (years > 0) {
    display += `${years} yr${years > 1 ? 's' : ''}`;
  }
  if (remainingMonths > 0) {
    if (display) display += ' ';
    display += `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
  }
  
  if (months === 0) {
    display = 'Less than 1 mo';
  }

  return {
    totalMonths: months,
    years,
    remainingMonths,
    display
  };
};

/**
 * Returns a fitting emoji icon based on species and breed.
 * Removes the generic dairy cow unless the breed is actually dairy.
 */
export const getAnimalIcon = (species?: string | null, breed?: string | null, sex?: string | null) => {
  if (species === 'Sheep') {
    if (sex === 'Male') return '🐏';
    return '🐑';
  }
  if (!breed) return '🐂';
  
  const dairyBreeds = ['Holstein Friesian', 'Jersey', 'Brown Swiss'];
  const zebuBreeds = ['Brahman', 'Boran', 'Zebu / Indicus', 'Afrikaner'];
  const blackBreeds = ['Drakensberger', 'Angus'];
  
  if (dairyBreeds.includes(breed)) return '🐄';
  if (zebuBreeds.includes(breed) || blackBreeds.includes(breed)) return '🐃'; // Zebu/Brahman or Black breeds
  return '🐂'; // Standard beef cattle (Tuli, Bonsmara, etc.)
};
