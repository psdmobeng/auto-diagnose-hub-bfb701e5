-- =====================================================
-- DATABASE EXPORT - Vehicle Diagnostic System
-- Generated: 2026-01-04
-- =====================================================

-- =====================================================
-- 1. ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'senior_technician', 'technician');
CREATE TYPE public.difficulty_level AS ENUM ('Easy', 'Medium', 'Hard', 'Expert');
CREATE TYPE public.dtc_type AS ENUM ('Powertrain', 'Chassis', 'Body', 'Network');
CREATE TYPE public.frequency_type AS ENUM ('Always', 'Intermittent', 'Occasional');
CREATE TYPE public.relation_type AS ENUM ('Causes', 'Related To', 'Symptom Of', 'Consequence Of');
CREATE TYPE public.severity_level AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE public.symptom_type AS ENUM ('Visual', 'Audio', 'Performance', 'Warning Light', 'Vibration', 'Smell', 'Touch', 'Other');
CREATE TYPE public.system_category AS ENUM ('Engine', 'Transmission', 'Brake', 'Suspension', 'Electrical', 'Cooling', 'Fuel', 'Exhaust', 'HVAC', 'Body', 'Steering', 'Drivetrain');
CREATE TYPE public.tool_category AS ENUM ('Diagnostic', 'Hand Tool', 'Power Tool', 'Specialty Tool');
CREATE TYPE public.warning_level AS ENUM ('Caution', 'Warning', 'Danger');

-- =====================================================
-- 2. TABLES
-- =====================================================

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'technician',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Vehicle Models
CREATE TABLE public.vehicle_models (
  model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer TEXT NOT NULL,
  model_name TEXT NOT NULL,
  year_range TEXT,
  engine_type TEXT,
  transmission_type TEXT,
  market_region TEXT DEFAULT 'Indonesia',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Problems
CREATE TABLE public.problems (
  problem_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_code TEXT NOT NULL,
  problem_name TEXT NOT NULL,
  description TEXT,
  system_category system_category NOT NULL,
  severity_level severity_level NOT NULL DEFAULT 'Medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicle Problems (Junction)
CREATE TABLE public.vehicle_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES public.vehicle_models(model_id),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Symptoms
CREATE TABLE public.symptoms (
  symptom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  symptom_description TEXT NOT NULL,
  symptom_type symptom_type NOT NULL DEFAULT 'Other',
  frequency frequency_type DEFAULT 'Intermittent',
  occurrence_condition TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DTC Codes
CREATE TABLE public.dtc_codes (
  dtc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  dtc_code TEXT NOT NULL,
  dtc_description TEXT,
  dtc_type dtc_type NOT NULL DEFAULT 'Powertrain',
  obd_standard TEXT DEFAULT 'OBD-II',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sensors
CREATE TABLE public.sensors (
  sensor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  sensor_name TEXT NOT NULL,
  sensor_location TEXT,
  failure_mode TEXT,
  testing_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Actuators
CREATE TABLE public.actuators (
  actuator_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  actuator_name TEXT NOT NULL,
  actuator_type TEXT,
  failure_symptoms TEXT,
  testing_procedure TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parts Factors
CREATE TABLE public.parts_factors (
  part_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  component_name TEXT NOT NULL,
  component_type TEXT,
  failure_cause TEXT,
  wear_indicator TEXT,
  replacement_interval TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solutions
CREATE TABLE public.solutions (
  solution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  solution_step TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 1,
  difficulty_level difficulty_level DEFAULT 'Medium',
  estimated_time INTEGER,
  special_notes TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tools
CREATE TABLE public.tools (
  tool_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES public.solutions(solution_id),
  tool_name TEXT NOT NULL,
  tool_category tool_category DEFAULT 'Hand Tool',
  tool_specification TEXT,
  alternative_tool TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Technical Theory
CREATE TABLE public.technical_theory (
  theory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  theory_title TEXT NOT NULL,
  technical_explanation TEXT,
  system_operation TEXT,
  failure_mechanism TEXT,
  preventive_measures TEXT,
  reference_links TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Problem Relations
CREATE TABLE public.problem_relations (
  relation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  related_problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  relation_type relation_type NOT NULL DEFAULT 'Related To',
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safety Precautions
CREATE TABLE public.safety_precautions (
  safety_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  safety_description TEXT NOT NULL,
  warning_level warning_level DEFAULT 'Caution',
  precaution_type TEXT,
  hazard_type TEXT,
  ppe_required TEXT,
  emergency_procedure TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cost Estimation
CREATE TABLE public.cost_estimation (
  cost_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(problem_id),
  part_cost_min NUMERIC DEFAULT 0,
  part_cost_max NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  total_cost_estimate NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'IDR',
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Search Queries
CREATE TABLE public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_query TEXT NOT NULL,
  translated_keywords TEXT[] DEFAULT '{}',
  search_count INTEGER DEFAULT 1,
  has_results BOOLEAN DEFAULT false,
  last_searched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_technician()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('senior_technician', 'admin')
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'senior_technician');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. ENABLE RLS
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dtc_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_theory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_precautions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_estimation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- Profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all user roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id) OR is_admin());
CREATE POLICY "Admin can update user roles" ON public.user_roles FOR UPDATE USING (is_admin());

-- Technician tables policies (same pattern for all diagnostic tables)
-- Problems
CREATE POLICY "Technicians can view problems" ON public.problems FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert problems" ON public.problems FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update problems" ON public.problems FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete problems" ON public.problems FOR DELETE USING (is_technician());

-- Vehicle Models
CREATE POLICY "Technicians can view vehicle_models" ON public.vehicle_models FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert vehicle_models" ON public.vehicle_models FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update vehicle_models" ON public.vehicle_models FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete vehicle_models" ON public.vehicle_models FOR DELETE USING (is_technician());

-- Symptoms
CREATE POLICY "Technicians can view symptoms" ON public.symptoms FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert symptoms" ON public.symptoms FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update symptoms" ON public.symptoms FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete symptoms" ON public.symptoms FOR DELETE USING (is_technician());

-- DTC Codes
CREATE POLICY "Technicians can view dtc_codes" ON public.dtc_codes FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert dtc_codes" ON public.dtc_codes FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update dtc_codes" ON public.dtc_codes FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete dtc_codes" ON public.dtc_codes FOR DELETE USING (is_technician());

-- Sensors
CREATE POLICY "Technicians can view sensors" ON public.sensors FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert sensors" ON public.sensors FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update sensors" ON public.sensors FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete sensors" ON public.sensors FOR DELETE USING (is_technician());

-- Actuators
CREATE POLICY "Technicians can view actuators" ON public.actuators FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert actuators" ON public.actuators FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update actuators" ON public.actuators FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete actuators" ON public.actuators FOR DELETE USING (is_technician());

-- Parts Factors
CREATE POLICY "Technicians can view parts_factors" ON public.parts_factors FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert parts_factors" ON public.parts_factors FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update parts_factors" ON public.parts_factors FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete parts_factors" ON public.parts_factors FOR DELETE USING (is_technician());

-- Solutions
CREATE POLICY "Technicians can view solutions" ON public.solutions FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert solutions" ON public.solutions FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update solutions" ON public.solutions FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete solutions" ON public.solutions FOR DELETE USING (is_technician());

-- Tools
CREATE POLICY "Technicians can view tools" ON public.tools FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert tools" ON public.tools FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update tools" ON public.tools FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete tools" ON public.tools FOR DELETE USING (is_technician());

-- Technical Theory
CREATE POLICY "Technicians can view technical_theory" ON public.technical_theory FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert technical_theory" ON public.technical_theory FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update technical_theory" ON public.technical_theory FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete technical_theory" ON public.technical_theory FOR DELETE USING (is_technician());

-- Problem Relations
CREATE POLICY "Technicians can view problem_relations" ON public.problem_relations FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert problem_relations" ON public.problem_relations FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update problem_relations" ON public.problem_relations FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete problem_relations" ON public.problem_relations FOR DELETE USING (is_technician());

-- Safety Precautions
CREATE POLICY "Technicians can view safety_precautions" ON public.safety_precautions FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert safety_precautions" ON public.safety_precautions FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update safety_precautions" ON public.safety_precautions FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete safety_precautions" ON public.safety_precautions FOR DELETE USING (is_technician());

-- Cost Estimation
CREATE POLICY "Technicians can view cost_estimation" ON public.cost_estimation FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert cost_estimation" ON public.cost_estimation FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update cost_estimation" ON public.cost_estimation FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete cost_estimation" ON public.cost_estimation FOR DELETE USING (is_technician());

-- Vehicle Problems
CREATE POLICY "Technicians can view vehicle_problems" ON public.vehicle_problems FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert vehicle_problems" ON public.vehicle_problems FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update vehicle_problems" ON public.vehicle_problems FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete vehicle_problems" ON public.vehicle_problems FOR DELETE USING (is_technician());

-- Search Queries
CREATE POLICY "Anyone can view search queries" ON public.search_queries FOR SELECT USING (true);
CREATE POLICY "Technicians can insert search queries" ON public.search_queries FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update search queries" ON public.search_queries FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete search queries" ON public.search_queries FOR DELETE USING (is_technician());

-- =====================================================
-- 7. DATA INSERTS - PROBLEMS (Parent Table - Insert First)
-- =====================================================

INSERT INTO public.problems (problem_id, problem_code, problem_name, description, system_category, severity_level, created_at, updated_at) VALUES
('7eb9d443-0e90-4ec4-a79e-57e0e1915974', 'ENG-001', 'Engine Misfire', 'Pembakaran tidak sempurna pada satu atau lebih silinder menyebabkan getaran, kehilangan tenaga, dan peningkatan emisi. Dapat disebabkan oleh busi rusak, koil pengapian lemah, atau masalah injeksi bahan bakar.', 'Engine', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('7946bacb-44b4-4d72-9e4f-755e8e29d8ec', 'ENG-002', 'Engine Knocking/Detonasi', 'Suara ketukan dari ruang bakar akibat pembakaran abnormal. Dapat menyebabkan kerusakan piston dan connecting rod jika dibiarkan.', 'Engine', 'Critical', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('e363b9f7-029a-4996-bc99-44f189defb40', 'ENG-003', 'Engine Overheating', 'Suhu mesin melebihi batas normal (>100°C). Dapat menyebabkan kerusakan head gasket, warped cylinder head, atau seized engine.', 'Engine', 'Critical', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('706e0034-d88c-44bb-a347-9f0ecaf39579', 'ENG-004', 'Oil Consumption Berlebihan', 'Mesin mengkonsumsi oli lebih dari 1L per 1000km. Biasanya disebabkan oleh ring piston aus, valve seal bocor, atau PCV valve rusak.', 'Engine', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('ac8a4d30-cbfb-43c7-82b5-067259142be3', 'ENG-005', 'Engine Stall/Mati Mendadak', 'Mesin mati secara tiba-tiba saat idle atau berkendara. Dapat disebabkan oleh masalah bahan bakar, sensor, atau kelistrikan.', 'Engine', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('667e97b0-efd5-4e9a-a22c-cb603c0180e3', 'ENG-006', 'Rough Idle/Idle Tidak Stabil', 'Putaran mesin tidak stabil saat idle, bergetar atau hampir mati. Umumnya disebabkan oleh throttle body kotor, IACV rusak, atau vacuum leak.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('9dd85b7a-5a59-47f7-8a2c-4f6ba8be856b', 'ENG-007', 'Hard Starting/Susah Starter', 'Mesin sulit dihidupkan, membutuhkan beberapa kali percobaan. Dapat disebabkan oleh fuel pump lemah, busi aus, atau starter motor bermasalah.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('948e27d7-caec-43e2-99c1-54f5c69a4ada', 'ENG-008', 'Loss of Power/Tenaga Berkurang', 'Akselerasi lambat dan tenaga mesin berkurang. Biasanya disebabkan oleh filter bahan bakar tersumbat, catalytic converter tersumbat, atau turbo rusak.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('277b88bd-ba22-4ab9-8e3f-05f4fa272d88', 'ENG-009', 'Engine Vibration Berlebihan', 'Getaran mesin yang tidak normal terasa di kabin. Dapat disebabkan oleh engine mounting rusak, misfire, atau balancing issue.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('5ada0979-63c3-4514-820a-b5c646e81f7d', 'ENG-010', 'Timing Chain/Belt Noise', 'Suara rantai atau belt timing yang berisik. Jika diabaikan dapat menyebabkan timing meleset dan kerusakan valve.', 'Engine', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('747ba084-234b-4909-b0b1-d5d10c1cbd79', 'ENG-011', 'Valve Tick/Suara Klep', 'Suara tik-tik dari area cylinder head. Biasanya disebabkan oleh clearance klep tidak tepat atau hydraulic lifter bermasalah.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('a1f896bd-cad1-4a63-a655-90c5073caca7', 'ENG-012', 'Oil Leak/Kebocoran Oli', 'Kebocoran oli mesin dari gasket atau seal. Dapat menyebabkan level oli rendah dan kerusakan mesin jika dibiarkan.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('0694da84-0c1e-4e22-b569-9e73e8e74031', 'ENG-014', 'Throttle Response Lambat', 'Respon akselerasi lambat atau tidak responsif. Umumnya disebabkan oleh throttle body elektronik bermasalah atau sensor APP error.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('78ba3c55-8181-4ce1-aab8-a9ed945d0719', 'TRN-001', 'Transmission Slip', 'Transmisi selip saat perpindahan gigi atau akselerasi. Menandakan clutch pack aus atau tekanan hydraulic rendah.', 'Transmission', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('a285f602-f901-439f-a005-602514615f20', 'COL-001', 'Cooling Fan Tidak Bekerja', 'Kipas radiator tidak menyala saat suhu tinggi. Menyebabkan overheating terutama saat idle atau macet.', 'Cooling', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('e2f599f5-3b72-4de8-bf87-76ce854a8325', 'FUL-001', 'Fuel Pump Lemah', 'Pompa bahan bakar tidak menghasilkan tekanan yang cukup. Menyebabkan susah starter dan kehilangan tenaga.', 'Fuel', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('78ef01cf-c17b-45cc-8885-1abdde8ef7c0', 'FUL-002', 'Fuel Pressure Regulator Rusak', 'Regulator tekanan bahan bakar tidak berfungsi. Menyebabkan campuran terlalu kaya atau terlalu miskin.', 'Fuel', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('73ef8472-7dd9-4766-82cb-b44286a8ef88', 'EXH-001', 'EGR Valve Stuck', 'Katup EGR macet terbuka atau tertutup. Menyebabkan idle kasar atau knocking.', 'Exhaust', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('8d7e5628-e704-43bc-8894-9e75287f5099', 'EXH-002', 'Catalytic Converter Tersumbat', 'Catalytic converter tersumbat mengurangi aliran exhaust. Menyebabkan kehilangan tenaga dan overheating.', 'Exhaust', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('0c04e230-c3bc-427f-8200-4d7accf5e959', 'ENG-013', 'Coolant Leak/Kebocoran Coolant', 'Kebocoran cairan pendingin dari radiator, hose, atau water pump. Dapat menyebabkan overheating.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('9be155b9-b3cb-4dfc-873e-e36f033d742e', 'COL-002', 'Thermostat Stuck Closed', 'Thermostat tidak membuka saat suhu tinggi. Menyebabkan overheating cepat.', 'Cooling', 'Critical', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('27fe0647-5b87-4e38-99fc-ae4b20929395', 'COL-003', 'Water Pump Failure', 'Pompa air tidak berfungsi. Tidak ada sirkulasi coolant.', 'Cooling', 'Critical', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('87a96e17-2eab-4f77-a2b6-9feba1b6df06', 'COL-004', 'Radiator Tersumbat', 'Radiator tersumbat kotoran atau karat. Mengurangi kapasitas pendinginan.', 'Cooling', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('0f3370bf-82d3-44de-bc99-bd71a755efe4', 'ENG-015', 'High Idle RPM', 'RPM idle terlalu tinggi (>1000 RPM). Biasanya disebabkan oleh vacuum leak atau IACV stuck open.', 'Engine', 'Low', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('a4454356-23be-428f-93ea-7aad5e6bef26', 'ENG-016', 'Head Gasket Bocor', 'Gasket kepala silinder bocor. Dapat menyebabkan mixing oli-coolant dan overheating.', 'Engine', 'Critical', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('4b92f122-37e5-4841-ad69-95794a1ff965', 'ENG-017', 'Compression Rendah', 'Kompresi silinder di bawah spesifikasi. Menandakan ring piston atau valve aus.', 'Engine', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('d144e2d4-39d8-4a3d-8055-e171b040fba1', 'ENG-018', 'Vacuum Leak', 'Kebocoran vacuum di intake system. Menyebabkan lean mixture dan rough idle.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('00f4fe14-7f38-4dbe-a1b1-f7d741d2babd', 'FUL-003', 'Injector Clogged', 'Fuel injector tersumbat kotoran. Menyebabkan misfire dan tenaga berkurang.', 'Fuel', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('b87b26e6-0212-411a-8ca5-11fc0e20cbff', 'FUL-004', 'Fuel Leak', 'Kebocoran bahan bakar dari fuel line, injector, atau fuel rail. BERBAHAYA!', 'Fuel', 'Critical', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00');

-- NOTE: Tabel vehicle_problems saat ini kosong
-- NOTE: Data untuk tabel lainnya (symptoms, dtc_codes, sensors, actuators, parts_factors, solutions, tools, technical_theory, problem_relations, safety_precautions, cost_estimation) sangat besar
-- Silakan hubungi saya jika Anda memerlukan INSERT statements untuk tabel-tabel tersebut

-- =====================================================
-- FILE INI BERISI SCHEMA LENGKAP + SAMPLE DATA PROBLEMS
-- Untuk data lengkap semua tabel, silakan request terpisah
-- =====================================================
