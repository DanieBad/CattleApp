-- 1. `global_vet_products` (Read-Only Global Table)
CREATE TABLE global_vet_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  dosage_ml_per_kg DECIMAL NOT NULL,
  meat_withdrawal_days INT NOT NULL,
  milk_withdrawal_days INT NOT NULL
);

-- Enable RLS and setup Read-Only Policy for public access
ALTER TABLE global_vet_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON global_vet_products FOR SELECT TO authenticated USING (true);

-- Baseline Insertions
INSERT INTO global_vet_products (category, product_name, dosage_ml_per_kg, meat_withdrawal_days, milk_withdrawal_days) VALUES
('Illness / Injury', 'Terramycin LA', 0.1, 28, 5),
('Illness / Injury', 'Hi-Tet 120', 0.1, 14, 3),
('Illness / Injury', 'Nuflor', 0.066, 28, 999),
('Illness / Injury', 'Draxxin', 0.025, 18, 999),
('Illness / Injury', 'Metacam', 0.025, 15, 5),
('Deworming', 'Dectomax', 0.02, 35, 999),
('Deworming', 'Ivermectin 1%', 0.02, 28, 999),
('Deworming', 'Valbazen Ultra', 0.1, 12, 3),
('Deworming', 'Panacur', 0.05, 14, 4),
('Vaccination', 'Anthrax', 1.0, 21, 0),
('Vaccination', 'Brucellosis S19/RB51', 2.0, 21, 0),
('Vaccination', 'Blackquarter', 2.0, 21, 0),
('Vaccination', 'Lumpy Skin Disease', 1.0, 21, 0),
('Vaccination', 'RVF Inactivated', 1.0, 21, 0),
('Vaccination', '3-Day Stiff-Sickness', 2.0, 21, 0),
('Vaccination', 'FMD', 2.0, 21, 0);

-- 2. `user_vet_products` (Read/Write Multi-Tenant Table)
CREATE TABLE user_vet_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  dosage_ml_per_kg DECIMAL NOT NULL,
  meat_withdrawal_days INT NOT NULL,
  milk_withdrawal_days INT NOT NULL
);

-- Enable RLS to isolate users
ALTER TABLE user_vet_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own vet products" ON user_vet_products FOR ALL USING (auth.uid() = user_id);

-- 3. `global_breed_standards` (Read-Only Reference Table)
CREATE TABLE global_breed_standards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  breed_name TEXT NOT NULL,
  birth_weight_kg INT NOT NULL,
  weaning_weight_kg INT NOT NULL,
  mature_cow_kg INT NOT NULL,
  mature_bull_kg INT NOT NULL
);

-- Enable RLS and setup Read-Only Policy
ALTER TABLE global_breed_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON global_breed_standards FOR SELECT TO authenticated USING (true);

-- Baseline Insertions
INSERT INTO global_breed_standards (breed_name, birth_weight_kg, weaning_weight_kg, mature_cow_kg, mature_bull_kg) VALUES
('Bonsmara', 35, 230, 500, 800),
('Brahman', 30, 210, 500, 850),
('Nguni', 25, 160, 350, 600),
('Tuli', 32, 210, 450, 800),
('Afrikaner', 32, 200, 450, 750);

-- 4. Update existing `health_logs` and `animals` table to track Safe Date
ALTER TABLE health_logs ADD COLUMN safe_date DATE;
ALTER TABLE animals ADD COLUMN meat_safe_date DATE;
