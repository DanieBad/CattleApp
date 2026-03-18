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
