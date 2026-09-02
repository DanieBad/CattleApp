/**
 * Health and reproduction utility functions for HealthyHerd.
 */

/**
 * Determines whether a product category or treatment type represents a vaccination.
 * In livestock management, vaccinations are administered as fixed doses per animal,
 * rather than weight-dependent dosages.
 *
 * @param category - Category string (e.g. 'Vaccination', 'Deworming')
 * @returns true if vaccination category
 */
export function isVaccinationCategory(category?: string | null): boolean {
  if (!category) return false;
  return category.trim().toLowerCase() === 'vaccination';
}

/**
 * Calculates the recommended dosage in ml for a veterinary product.
 * - For vaccinations: fixed standard dose per animal (e.g. 2.0 ml for Brucellosis RB51 / S19).
 * - For treatments and dewormers: weight-dependent dosage (animalWeightKg * dosageRatePerKg).
 *
 * @param category - Category string (e.g. 'Vaccination', 'Deworming', 'Illness / Injury')
 * @param dosageRate - Either fixed ml per animal (for vaccines) or ml per kg (for other meds)
 * @param animalWeightKg - Estimated or actual animal weight in kg
 * @returns Recommended dose in ml
 */
export function calculateRecommendedDosage(
  category: string,
  dosageRate: number,
  animalWeightKg: number
): number {
  if (dosageRate <= 0) return 0;
  if (isVaccinationCategory(category)) {
    return dosageRate;
  }
  const weight = Math.max(0, animalWeightKg);
  return weight * dosageRate;
}

/**
 * Calculates the estimated calving or lambing due date based on gestation stage.
 * - Cattle average gestation: ~283 days
 * - Sheep average gestation: ~150 days
 *
 * @param checkDate - ISO date string of the check (YYYY-MM-DD)
 * @param monthsPregnant - Number of months pregnant (e.g. 1.0 to 9.0)
 * @param species - 'Cattle' or 'Sheep'
 * @returns Estimated due date as ISO string (YYYY-MM-DD)
 */
export function calculateGestationDueDate(
  checkDate: string,
  monthsPregnant: number,
  species: 'Cattle' | 'Sheep' = 'Cattle'
): string {
  const totalDays = species === 'Sheep' ? 150 : 283;
  const remainingDays = Math.max(0, Math.round(totalDays - (monthsPregnant * 30.5)));
  const d = new Date(checkDate);
  d.setDate(d.getDate() + remainingDays);
  return d.toISOString().split('T')[0];
}

/**
 * Formats a measurement date into a human-readable string and elapsed age.
 *
 * @param dateStr - Date string (ISO or parseable)
 * @returns Formatted date, days elapsed, and human-friendly label
 */
export function formatWeightDateStamp(dateStr: string): { formattedDate: string; daysAgo: number; ageLabel: string } {
  const dateObj = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const ageLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
  return {
    formattedDate: dateObj.toLocaleDateString(),
    daysAgo,
    ageLabel
  };
}
