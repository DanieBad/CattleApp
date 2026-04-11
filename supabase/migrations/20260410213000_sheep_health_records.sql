-- 1. `global_sheep_vet_products` (Read-Only Global Table)
CREATE TABLE global_sheep_vet_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  dosage_ml_per_kg DECIMAL NOT NULL,
  meat_withdrawal_days INT NOT NULL,
  milk_withdrawal_days INT NOT NULL
);

ALTER TABLE global_sheep_vet_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON global_sheep_vet_products FOR SELECT TO authenticated USING (true);

INSERT INTO global_sheep_vet_products (category, product_name, dosage_ml_per_kg, meat_withdrawal_days, milk_withdrawal_days) VALUES
('Illness / Injury', 'Terramycin LA', 0.1, 28, 5),
('Illness / Injury', 'Engemycin 10%', 0.1, 14, 3),
('Illness / Injury', 'Draxxin', 0.025, 49, 999),
('Illness / Injury', 'Nuflor', 0.066, 38, 999),
('Deworming', 'Dectomax', 0.02, 35, 999),
('Deworming', 'Valbazen', 0.1, 10, 3),
('Deworming', 'Pro-Dose Orange', 0.2, 14, 999),
('Deworming', 'Tramisol', 0.2, 7, 999),
('Deworming', 'Lintex-L', 0.2, 14, 999),
('Vaccination', 'OBP Bluetongue', 1.0, 21, 0),
('Vaccination', 'Multivax-P Plus', 2.0, 21, 0),
('Vaccination', 'OBP Pulpy Kidney', 1.0, 21, 0),
('Vaccination', 'OBP Pasteurella', 1.0, 21, 0),
('Vaccination', 'Rift Valley Fever (Live)', 1.0, 21, 0),
('Vaccination', 'Enzootic Abortion', 2.0, 21, 0),
('Vaccination', 'Corynebacterium', 1.0, 21, 0);

-- 2. `user_sheep_vet_products` (Read/Write Multi-Tenant Table)
CREATE TABLE user_sheep_vet_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  dosage_ml_per_kg DECIMAL NOT NULL,
  meat_withdrawal_days INT NOT NULL,
  milk_withdrawal_days INT NOT NULL
);

ALTER TABLE user_sheep_vet_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sheep vet products" ON user_sheep_vet_products FOR ALL USING (auth.uid() = user_id);

-- 3. `global_sheep_breed_standards` (Read-Only Reference Table)
CREATE TABLE global_sheep_breed_standards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  breed_name TEXT NOT NULL,
  birth_weight_kg INT NOT NULL,
  weaning_weight_kg INT NOT NULL,
  mature_ewe_kg INT NOT NULL,
  mature_ram_kg INT NOT NULL
);

ALTER TABLE global_sheep_breed_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON global_sheep_breed_standards FOR SELECT TO authenticated USING (true);

INSERT INTO global_sheep_breed_standards (breed_name, birth_weight_kg, weaning_weight_kg, mature_ewe_kg, mature_ram_kg) VALUES
('Dorper', 4, 30, 75, 105),
('Merino', 4, 25, 60, 90),
('Dohne Merino', 4, 28, 65, 95),
('Meatmaster', 4, 28, 65, 90),
('Afrino', 4, 27, 65, 95),
('Suffolk', 5, 32, 85, 120),
('Van Rooy', 4, 25, 60, 85),
('Ile de France', 4, 30, 80, 110),
('Letelle', 4, 26, 60, 85);
