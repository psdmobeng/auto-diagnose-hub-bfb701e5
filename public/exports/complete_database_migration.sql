-- =====================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Auto-Diagnostic System Database
-- Target: https://tvqpckxujzoachfweado.supabase.co
-- Generated: 2026-01-04
-- =====================================================

-- =====================================================
-- SECTION 1: ENUM TYPES
-- =====================================================

-- Create enum types
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
-- SECTION 2: TABLES
-- =====================================================

-- Profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role public.app_role NOT NULL DEFAULT 'technician'::app_role,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Vehicle models table
CREATE TABLE public.vehicle_models (
    model_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    manufacturer TEXT NOT NULL,
    model_name TEXT NOT NULL,
    year_range TEXT,
    engine_type TEXT,
    transmission_type TEXT,
    market_region TEXT DEFAULT 'Indonesia',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Problems table
CREATE TABLE public.problems (
    problem_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_code TEXT NOT NULL,
    problem_name TEXT NOT NULL,
    description TEXT,
    system_category public.system_category NOT NULL,
    severity_level public.severity_level NOT NULL DEFAULT 'Medium'::severity_level,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vehicle problems junction table
CREATE TABLE public.vehicle_problems (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID NOT NULL REFERENCES public.vehicle_models(model_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Symptoms table
CREATE TABLE public.symptoms (
    symptom_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    symptom_description TEXT NOT NULL,
    symptom_type public.symptom_type NOT NULL DEFAULT 'Other'::symptom_type,
    frequency public.frequency_type DEFAULT 'Intermittent'::frequency_type,
    occurrence_condition TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DTC codes table
CREATE TABLE public.dtc_codes (
    dtc_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    dtc_code TEXT NOT NULL,
    dtc_description TEXT,
    dtc_type public.dtc_type NOT NULL DEFAULT 'Powertrain'::dtc_type,
    obd_standard TEXT DEFAULT 'OBD-II',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sensors table
CREATE TABLE public.sensors (
    sensor_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    sensor_name TEXT NOT NULL,
    sensor_location TEXT,
    failure_mode TEXT,
    testing_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Actuators table
CREATE TABLE public.actuators (
    actuator_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    actuator_name TEXT NOT NULL,
    actuator_type TEXT,
    failure_symptoms TEXT,
    testing_procedure TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Parts factors table
CREATE TABLE public.parts_factors (
    part_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    component_name TEXT NOT NULL,
    component_type TEXT,
    failure_cause TEXT,
    wear_indicator TEXT,
    replacement_interval TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Solutions table
CREATE TABLE public.solutions (
    solution_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    solution_step TEXT NOT NULL,
    step_order INTEGER NOT NULL DEFAULT 1,
    difficulty_level public.difficulty_level DEFAULT 'Medium'::difficulty_level,
    estimated_time INTEGER,
    special_notes TEXT,
    is_ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tools table
CREATE TABLE public.tools (
    tool_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    solution_id UUID NOT NULL REFERENCES public.solutions(solution_id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    tool_specification TEXT,
    tool_category public.tool_category DEFAULT 'Hand Tool'::tool_category,
    is_mandatory BOOLEAN DEFAULT true,
    alternative_tool TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Technical theory table
CREATE TABLE public.technical_theory (
    theory_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    theory_title TEXT NOT NULL,
    technical_explanation TEXT,
    system_operation TEXT,
    failure_mechanism TEXT,
    preventive_measures TEXT,
    reference_links TEXT,
    is_ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Problem relations table
CREATE TABLE public.problem_relations (
    relation_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    primary_problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    related_problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    relation_type public.relation_type NOT NULL DEFAULT 'Related To'::relation_type,
    is_ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Safety precautions table
CREATE TABLE public.safety_precautions (
    safety_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    safety_description TEXT NOT NULL,
    warning_level public.warning_level DEFAULT 'Caution'::warning_level,
    precaution_type TEXT,
    hazard_type TEXT,
    ppe_required TEXT,
    emergency_procedure TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost estimation table
CREATE TABLE public.cost_estimation (
    cost_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(problem_id) ON DELETE CASCADE,
    part_cost_min NUMERIC DEFAULT 0,
    part_cost_max NUMERIC DEFAULT 0,
    labor_cost NUMERIC DEFAULT 0,
    total_cost_estimate NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'IDR',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Search queries table
CREATE TABLE public.search_queries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    original_query TEXT NOT NULL,
    translated_keywords TEXT[] DEFAULT '{}',
    has_results BOOLEAN DEFAULT false,
    search_count INTEGER DEFAULT 1,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- SECTION 3: FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Function to check if current user is technician
CREATE OR REPLACE FUNCTION public.is_technician()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('senior_technician', 'admin')
  )
$$;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'senior_technician');
    
    RETURN new;
END;
$$;

-- =====================================================
-- SECTION 4: TRIGGERS
-- =====================================================

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECTION 5: ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
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

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all user roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id) OR is_admin());
CREATE POLICY "Admin can update user roles" ON public.user_roles FOR UPDATE USING (is_admin());

-- Technician access policies for all diagnostic tables
CREATE POLICY "Technicians can view vehicle_models" ON public.vehicle_models FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert vehicle_models" ON public.vehicle_models FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update vehicle_models" ON public.vehicle_models FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete vehicle_models" ON public.vehicle_models FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view problems" ON public.problems FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert problems" ON public.problems FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update problems" ON public.problems FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete problems" ON public.problems FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view vehicle_problems" ON public.vehicle_problems FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert vehicle_problems" ON public.vehicle_problems FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update vehicle_problems" ON public.vehicle_problems FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete vehicle_problems" ON public.vehicle_problems FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view symptoms" ON public.symptoms FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert symptoms" ON public.symptoms FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update symptoms" ON public.symptoms FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete symptoms" ON public.symptoms FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view dtc_codes" ON public.dtc_codes FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert dtc_codes" ON public.dtc_codes FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update dtc_codes" ON public.dtc_codes FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete dtc_codes" ON public.dtc_codes FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view sensors" ON public.sensors FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert sensors" ON public.sensors FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update sensors" ON public.sensors FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete sensors" ON public.sensors FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view actuators" ON public.actuators FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert actuators" ON public.actuators FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update actuators" ON public.actuators FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete actuators" ON public.actuators FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view parts_factors" ON public.parts_factors FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert parts_factors" ON public.parts_factors FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update parts_factors" ON public.parts_factors FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete parts_factors" ON public.parts_factors FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view solutions" ON public.solutions FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert solutions" ON public.solutions FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update solutions" ON public.solutions FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete solutions" ON public.solutions FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view tools" ON public.tools FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert tools" ON public.tools FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update tools" ON public.tools FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete tools" ON public.tools FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view technical_theory" ON public.technical_theory FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert technical_theory" ON public.technical_theory FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update technical_theory" ON public.technical_theory FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete technical_theory" ON public.technical_theory FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view problem_relations" ON public.problem_relations FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert problem_relations" ON public.problem_relations FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update problem_relations" ON public.problem_relations FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete problem_relations" ON public.problem_relations FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view safety_precautions" ON public.safety_precautions FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert safety_precautions" ON public.safety_precautions FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update safety_precautions" ON public.safety_precautions FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete safety_precautions" ON public.safety_precautions FOR DELETE USING (is_technician());

CREATE POLICY "Technicians can view cost_estimation" ON public.cost_estimation FOR SELECT USING (is_technician());
CREATE POLICY "Technicians can insert cost_estimation" ON public.cost_estimation FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update cost_estimation" ON public.cost_estimation FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete cost_estimation" ON public.cost_estimation FOR DELETE USING (is_technician());

CREATE POLICY "Anyone can view search queries" ON public.search_queries FOR SELECT USING (true);
CREATE POLICY "Technicians can insert search queries" ON public.search_queries FOR INSERT WITH CHECK (is_technician());
CREATE POLICY "Technicians can update search queries" ON public.search_queries FOR UPDATE USING (is_technician());
CREATE POLICY "Technicians can delete search queries" ON public.search_queries FOR DELETE USING (is_technician());

-- =====================================================
-- SECTION 6: DATA - PROBLEMS
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
('ab408592-7eff-416e-8a82-efb7d26015c5', 'ENG-013', 'Coolant Leak/Kebocoran Coolant', 'Kebocoran cairan pendingin dari radiator, hose, atau water pump. Dapat menyebabkan overheating.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('73ef8472-7dd9-4766-82cb-b44286a8ef88', 'ENG-014', 'EGR System Problem', 'Masalah pada sistem Exhaust Gas Recirculation. Menyebabkan rough idle, knocking, atau peningkatan emisi.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('0f3370bf-82d3-44de-bc99-bd71a755efe4', 'ENG-015', 'Vacuum Leak', 'Kebocoran pada sistem vacuum. Menyebabkan idle tidak stabil, lean mixture, dan check engine light.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('0694da84-0c1e-4e22-b569-9e73e8e74031', 'ENG-016', 'Throttle Body Problem', 'Masalah pada throttle body elektronik. Menyebabkan respons gas tidak normal, limp mode, atau engine stall.', 'Engine', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('8d7e5628-e704-43bc-8894-9e75287f5099', 'ENG-017', 'Catalytic Converter Problem', 'Catalytic converter tersumbat atau rusak. Menyebabkan tenaga berkurang, bau sulfur, dan emisi tinggi.', 'Exhaust', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('a4454356-23be-428f-93ea-7aad5e6bef26', 'ENG-018', 'Turbo/Supercharger Problem', 'Masalah pada sistem forced induction. Menyebabkan tenaga berkurang drastis, smoke berlebihan, atau suara abnormal.', 'Engine', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('0c04e230-c3bc-427f-8200-4d7accf5e959', 'ENG-019', 'Head Gasket Failure', 'Kebocoran pada head gasket. Menyebabkan coolant bercampur oli, white smoke, dan overheating.', 'Engine', 'Critical', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('4b92f122-37e5-4841-ad69-95794a1ff965', 'ENG-020', 'Compression Loss', 'Kompresi mesin rendah pada satu atau lebih silinder. Menyebabkan hard start, misfire, dan tenaga berkurang.', 'Engine', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('78ba3c55-8181-4ce1-aab8-a9ed945d0719', 'TRN-001', 'Transmission Slip', 'Transmisi slip saat perpindahan gigi atau saat akselerasi. RPM naik tapi kendaraan tidak merespons.', 'Transmission', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('d144e2d4-39d8-4a3d-8055-e171b040fba1', 'TRN-002', 'Harsh Shifting', 'Perpindahan gigi terasa kasar atau hentakan. Dapat disebabkan oleh ATF kotor, solenoid rusak, atau valve body bermasalah.', 'Transmission', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('00f4fe14-7f38-4dbe-a1b1-f7d741d2babd', 'TRN-003', 'Delayed Engagement', 'Jeda terlalu lama saat memindahkan tuas dari P ke D atau R. Indikasi masalah tekanan hydraulic atau clutch.', 'Transmission', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('e2f599f5-3b72-4de8-bf87-76ce854a8325', 'FUEL-001', 'Fuel Pump Failure', 'Pompa bahan bakar lemah atau mati. Menyebabkan hard start, stall, atau no start condition.', 'Fuel', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('78ef01cf-c17b-45cc-8885-1abdde8ef7c0', 'FUEL-002', 'Fuel Pressure Problem', 'Tekanan bahan bakar tidak sesuai spesifikasi. Menyebabkan running lean/rich, hard start, atau stall.', 'Fuel', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('b87b26e6-0212-411a-8ca5-11fc0e20cbff', 'FUEL-003', 'Fuel Leak', 'Kebocoran bahan bakar dari tangki, fuel line, atau injector. BAHAYA KEBAKARAN!', 'Fuel', 'Critical', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('a285f602-f901-439f-a005-602514615f20', 'COOL-001', 'Cooling Fan Problem', 'Kipas radiator tidak berfungsi atau bekerja terus-menerus. Menyebabkan overheating atau baterai terkuras.', 'Cooling', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('9be155b9-b3cb-4dfc-873e-e36f033d742e', 'COOL-002', 'Thermostat Problem', 'Thermostat stuck open atau closed. Menyebabkan overheating atau mesin tidak mencapai suhu operasi.', 'Cooling', 'Medium', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('27fe0647-5b87-4e38-99fc-ae4b20929395', 'COOL-003', 'Water Pump Failure', 'Pompa air tidak berfungsi optimal. Menyebabkan overheating, noise, atau coolant leak.', 'Cooling', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00'),
('87a96e17-2eab-4f77-a2b6-9feba1b6df06', 'COOL-004', 'Radiator Problem', 'Radiator tersumbat, bocor, atau rusak. Menyebabkan overheating dan coolant loss.', 'Cooling', 'High', '2026-01-02 07:08:19.062735+00', '2026-01-02 07:08:19.062735+00');

-- =====================================================
-- SECTION 7: DATA - VEHICLE MODELS
-- =====================================================

INSERT INTO public.vehicle_models (model_id, manufacturer, model_name, year_range, engine_type, transmission_type, market_region, created_at, updated_at) VALUES
('50844c17-0c72-4c87-96ec-d95f39ac3deb', 'Toyota', 'Avanza', '2015-2024', 'Bensin 1.3L/1.5L DOHC VVT-i', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('bd306c6f-3f8e-4695-98b2-f8f1071a8af3', 'Toyota', 'Innova', '2016-2024', 'Bensin 2.0L/Diesel 2.4L', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('6937246a-e993-4aaa-b39f-f56ee43b7e97', 'Toyota', 'Fortuner', '2016-2024', 'Diesel 2.4L/2.8L VNT', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('9947cffb-82d2-491f-b4b7-482409bcd6c8', 'Toyota', 'Yaris', '2014-2023', 'Bensin 1.5L DOHC VVT-i', 'Manual/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('dc2848a8-8289-44f1-b992-bc1d5db11cb4', 'Toyota', 'Camry', '2019-2024', 'Bensin 2.5L Dynamic Force', 'Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('a61e9e60-1da3-4acb-8293-1916468a20d4', 'Toyota', 'Hilux', '2015-2024', 'Diesel 2.4L/2.8L', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('b1a0442b-6612-43a5-8f68-f712353a1892', 'Toyota', 'Rush', '2018-2024', 'Bensin 1.5L 2NR-VE', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('d3964184-63f4-4573-9602-bb358e0deb76', 'Toyota', 'Agya', '2017-2024', 'Bensin 1.0L/1.2L', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('6eb8092e-55ca-42a6-881e-ea7833d4fc5b', 'Toyota', 'Calya', '2016-2024', 'Bensin 1.2L 3NR-VE', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('63398744-a750-4565-84a8-a0020ed71294', 'Toyota', 'Veloz', '2022-2024', 'Bensin 1.5L 2NR-VE', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('0a1c041b-6ac6-4c4a-b721-c0a49458c7ad', 'Honda', 'Brio', '2016-2024', 'Bensin 1.2L i-VTEC', 'Manual/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('d31b4dd2-4c5f-435e-8584-d95fd5a4de2c', 'Honda', 'Mobilio', '2014-2024', 'Bensin 1.5L i-VTEC', 'Manual/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('2c18753e-c0c5-4357-b160-1cd7a86f1fc2', 'Honda', 'HR-V', '2015-2024', 'Bensin 1.5L/1.8L i-VTEC', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('e05c061f-cb18-45af-95ea-af8f122bbad0', 'Honda', 'CR-V', '2017-2024', 'Bensin 1.5L Turbo VTEC', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('3d78c9af-1f4c-4e55-9c22-9c0506e3b1d5', 'Honda', 'Jazz', '2014-2021', 'Bensin 1.5L i-VTEC', 'Manual/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('1eac0a2a-ffcd-4159-b4f9-9a16dc3d778d', 'Honda', 'City', '2017-2024', 'Bensin 1.5L i-VTEC', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('3f78a91b-e7a9-42dc-8b6f-c0076e4c30e5', 'Honda', 'Civic', '2017-2024', 'Bensin 1.5L Turbo VTEC', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('a033edaf-5f74-405d-ba12-d22e73123174', 'Honda', 'Accord', '2019-2024', 'Bensin 1.5L Turbo', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('ecf5c3c6-0de1-4a4a-9e3e-2893c14a4dc7', 'Honda', 'WR-V', '2023-2024', 'Bensin 1.5L i-VTEC', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('dcea0a58-fe74-4cd9-be30-83be49f2aa2a', 'Honda', 'BR-V', '2022-2024', 'Bensin 1.5L i-VTEC', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('f9a4f0d8-69f7-4e00-98d6-be22a34e9f80', 'Daihatsu', 'Xenia', '2015-2024', 'Bensin 1.3L/1.5L VVT-i', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('7d7fe0a9-8b47-4b58-9c95-d7fc7c3fac16', 'Daihatsu', 'Terios', '2018-2024', 'Bensin 1.5L 2NR-VE', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('28c93c45-3bce-4ef0-8d4a-c9a1d8bfc4a5', 'Daihatsu', 'Ayla', '2017-2024', 'Bensin 1.0L/1.2L', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('e3c6c8af-0df0-4ea7-8f58-0da7be39d6ab', 'Daihatsu', 'Sigra', '2016-2024', 'Bensin 1.0L/1.2L', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('a6f9c0a5-6f25-4b73-a3e5-8f1e4f43a0e6', 'Daihatsu', 'Rocky', '2021-2024', 'Bensin 1.0L Turbo/1.2L NA', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('c21f0e7c-e5b7-4a31-b4c5-1e9c5c55e8b4', 'Suzuki', 'Ertiga', '2018-2024', 'Bensin 1.5L K15B', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('f1d4e8c7-9b0a-4e5c-8d3f-6a2b9c7e0d1f', 'Suzuki', 'XL7', '2020-2024', 'Bensin 1.5L K15B', 'Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('b8a4c2d3-5e7f-4a1b-9c8d-3f2e1a0b9c7d', 'Suzuki', 'Ignis', '2017-2024', 'Bensin 1.2L K12M', 'Manual/AGS', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('d7e5f4c3-2a1b-4e9c-8f7d-5b3a2c1e0f9d', 'Suzuki', 'Baleno', '2017-2024', 'Bensin 1.4L K14B', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('a9b8c7d6-5e4f-3a2b-1c9d-8e7f6a5b4c3d', 'Suzuki', 'S-Presso', '2020-2024', 'Bensin 1.0L K10B', 'Manual/AGS', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('c3d2e1f0-9a8b-7c6d-5e4f-3a2b1c0d9e8f', 'Suzuki', 'Jimny', '2019-2024', 'Bensin 1.5L K15B', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('e1f0d9c8-b7a6-5e4d-3c2b-1a0f9e8d7c6b', 'Mitsubishi', 'Xpander', '2017-2024', 'Bensin 1.5L 4A91', 'Manual/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('f9e8d7c6-b5a4-3e2d-1c0b-9a8f7e6d5c4b', 'Mitsubishi', 'Pajero Sport', '2016-2024', 'Diesel 2.4L MIVEC', 'Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('a7b6c5d4-e3f2-1a0b-9c8d-7e6f5a4b3c2d', 'Mitsubishi', 'Triton', '2015-2024', 'Diesel 2.4L MIVEC', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('c5d4e3f2-a1b0-9c8d-7e6f-5a4b3c2d1e0f', 'Mitsubishi', 'Outlander PHEV', '2019-2024', 'Hybrid 2.4L + Motor', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('d3e2f1a0-b9c8-7d6e-5f4a-3b2c1d0e9f8a', 'Mitsubishi', 'Eclipse Cross', '2019-2024', 'Bensin 1.5L Turbo', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('e1f0a9b8-c7d6-5e4f-3a2b-1c0d9e8f7a6b', 'Nissan', 'Livina', '2019-2024', 'Bensin 1.5L HR15DE', 'Manual/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('f9a8b7c6-d5e4-3f2a-1b0c-9d8e7f6a5b4c', 'Nissan', 'Magnite', '2021-2024', 'Bensin 1.0L Turbo', 'Manual/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('a7b6c5d4-e3f2-a1b0-9c8d-7e6f5a4b3c2d', 'Nissan', 'Kicks', '2020-2024', 'e-Power 1.2L', 'e-Power', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('c5d4e3f2-1a0b-9c8d-7e6f-5a4b3c2d1e0f', 'Nissan', 'X-Trail', '2017-2024', 'Bensin 2.0L/2.5L', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('d3e2f1a0-9b8c-7d6e-5f4a-3b2c1d0e9f8a', 'Nissan', 'Terra', '2018-2024', 'Diesel 2.5L YD25DDTi', 'Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('e1f0a9b8-7c6d-5e4f-3a2b-1c0d9e8f7a6b', 'Nissan', 'Navara', '2015-2024', 'Diesel 2.5L', 'Manual/Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('f9a8b7c6-5d4e-3f2a-1b0c-9d8e7f6a5b4c', 'Hyundai', 'Creta', '2021-2024', 'Bensin 1.5L Smartstream', 'IVT/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('a7b6c5d4-3e2f-a1b0-9c8d-7e6f5a4b3c2d', 'Hyundai', 'Stargazer', '2022-2024', 'Bensin 1.5L Smartstream', 'IVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('c5d4e3f2-a1b0-9c8d-7e6f-5a4b3c2d1e0f', 'Hyundai', 'Santa Fe', '2019-2024', 'Diesel 2.2L CRDi', 'Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('d3e2f1a0-b9c8-7d6e-5f4a-3b2c1d0e9f8a', 'Hyundai', 'Palisade', '2020-2024', 'Diesel 2.2L CRDi', 'Automatic', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('e1f0a9b8-c7d6-5e4f-3a2b-1c0d9e8f7a6b', 'Hyundai', 'Ioniq 5', '2022-2024', 'Electric 72.6kWh', 'Electric', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('f9a8b7c6-d5e4-3f2a-1b0c-9d8e7f6a5b4c', 'Wuling', 'Confero', '2017-2024', 'Bensin 1.5L', 'Manual/CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('a7b6c5d4-e3f2-1a0b-9c8d-7e6f5a4b3c2d', 'Wuling', 'Almaz', '2019-2024', 'Bensin 1.5L Turbo', 'CVT', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00'),
('c5d4e3f2-1a0b-c9d8-7e6f-5a4b3c2d1e0f', 'Wuling', 'Air ev', '2022-2024', 'Electric 17.3kWh', 'Electric', 'Indonesia', '2026-01-02 07:06:26.032444+00', '2026-01-02 07:06:26.032444+00');

-- Continue in next file due to size...
