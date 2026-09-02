import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isVaccinationCategory,
  calculateRecommendedDosage,
  calculateGestationDueDate,
  formatWeightDateStamp
} from './healthUtils';

describe('healthUtils - Vaccination Classification', () => {
  it('should return true when category is Vaccination', () => {
    assert.equal(isVaccinationCategory('Vaccination'), true);
    assert.equal(isVaccinationCategory('vaccination'), true);
    assert.equal(isVaccinationCategory('  Vaccination  '), true);
  });

  it('should return false when category is Deworming or Illness', () => {
    assert.equal(isVaccinationCategory('Deworming'), false);
    assert.equal(isVaccinationCategory('Illness / Injury'), false);
  });

  it('should return false when category is null or undefined (edge case)', () => {
    assert.equal(isVaccinationCategory(null), false);
    assert.equal(isVaccinationCategory(undefined), false);
    assert.equal(isVaccinationCategory(''), false);
  });
});

describe('healthUtils - calculateRecommendedDosage (RB51 Bug Fix Verification)', () => {
  it('should return fixed 2.0 ml dose for RB51 vaccine regardless of animal weight (happy path)', () => {
    // Verified bug: female calf weighing 226.55kg was incorrectly assigned 453.1ml
    const dosageForCalf = calculateRecommendedDosage('Vaccination', 2.0, 226.55);
    assert.equal(dosageForCalf, 2.0);

    const dosageForMatureCow = calculateRecommendedDosage('Vaccination', 2.0, 550);
    assert.equal(dosageForMatureCow, 2.0);

    const dosageForYoungCalf = calculateRecommendedDosage('Vaccination', 2.0, 60);
    assert.equal(dosageForYoungCalf, 2.0);
  });

  it('should calculate weight-proportional dosage for antibiotics and dewormers (happy path)', () => {
    // Terramycin LA: 0.1 ml/kg
    const doseFor450kg = calculateRecommendedDosage('Illness / Injury', 0.1, 450);
    assert.equal(doseFor450kg, 45.0);

    // Dectomax: 0.02 ml/kg
    const dewormerDose = calculateRecommendedDosage('Deworming', 0.02, 300);
    assert.equal(dewormerDose, 6.0);
  });

  it('should return 0 when animal weight is 0 or negative (edge case)', () => {
    const zeroWeightDose = calculateRecommendedDosage('Deworming', 0.05, 0);
    assert.equal(zeroWeightDose, 0);

    const negativeWeightDose = calculateRecommendedDosage('Deworming', 0.05, -50);
    assert.equal(negativeWeightDose, 0);
  });

  it('should return 0 when dosage rate is 0 or negative (error path / boundary)', () => {
    assert.equal(calculateRecommendedDosage('Vaccination', 0, 400), 0);
    assert.equal(calculateRecommendedDosage('Vaccination', -2.0, 400), 0);
    assert.equal(calculateRecommendedDosage('Deworming', 0, 400), 0);
  });
});

describe('healthUtils - calculateGestationDueDate', () => {
  it('should compute expected calving date for cattle with ~283 days gestation (happy path)', () => {
    const checkDate = '2026-06-01';
    // 3 months (approx 91.5 days) pregnant -> ~192 days remaining
    const dueDate = calculateGestationDueDate(checkDate, 3, 'Cattle');
    assert.match(dueDate, /^2026-12-/);
  });

  it('should compute expected lambing date for sheep with ~150 days gestation (happy path)', () => {
    const checkDate = '2026-06-01';
    // 2 months (approx 61 days) pregnant -> ~89 days remaining
    const dueDate = calculateGestationDueDate(checkDate, 2, 'Sheep');
    assert.match(dueDate, /^2026-08-/);
  });

  it('should handle zero months pregnant (edge case)', () => {
    const checkDate = '2026-01-01';
    const dueDate = calculateGestationDueDate(checkDate, 0, 'Cattle');
    assert.ok(new Date(dueDate).getTime() > new Date(checkDate).getTime());
  });

  it('should clamp remaining days to zero if gestation exceeds expected length (edge case)', () => {
    const checkDate = '2026-01-01';
    const dueDate = calculateGestationDueDate(checkDate, 10, 'Cattle');
    assert.equal(dueDate, '2026-01-01');
  });
});

describe('healthUtils - formatWeightDateStamp', () => {
  it('should format today correctly with Today label', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = formatWeightDateStamp(today);
    assert.equal(result.ageLabel, 'Today');
    assert.equal(result.daysAgo, 0);
  });

  it('should format past dates with elapsed days', () => {
    const past = new Date();
    past.setDate(past.getDate() - 30);
    const result = formatWeightDateStamp(past.toISOString().split('T')[0]);
    assert.equal(result.daysAgo, 30);
    assert.equal(result.ageLabel, '30 days ago');
  });
});
