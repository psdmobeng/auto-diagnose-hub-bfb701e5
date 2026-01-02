-- Create enum types
CREATE TYPE public.severity_level AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE public.system_category AS ENUM ('Engine', 'Transmission', 'Brake', 'Suspension', 'Electrical', 'Cooling', 'Fuel', 'Exhaust', 'HVAC', 'Body', 'Steering', 'Drivetrain');
CREATE TYPE public.symptom_type AS ENUM ('Visual', 'Audio', 'Performance', 'Warning Light', 'Vibration', 'Smell', 'Touch', 'Other');
CREATE TYPE public.frequency_type AS ENUM ('Always', 'Intermittent', 'Occasional');
CREATE TYPE public.dtc_type AS ENUM ('Powertrain', 'Chassis', 'Body', 'Network');
CREATE TYPE public.difficulty_level AS ENUM ('Easy', 'Medium', 'Hard', 'Expert');
CREATE TYPE public.tool_category AS ENUM ('Diagnostic', 'Hand Tool', 'Power Tool', 'Specialty Tool');
CREATE TYPE public.relation_type AS ENUM ('Causes', 'Related To', 'Symptom Of', 'Consequence Of');
CREATE TYPE public.warning_level AS ENUM ('Caution', 'Warning', 'Danger');
CREATE TYPE public.app_role AS ENUM ('admin', 'senior_technician', 'technician');

-- 1. User Roles Table (for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'technician',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 2. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Vehicle Models Table
CREATE TABLE public.vehicle_models (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer TEXT NOT NULL,
    model_name TEXT NOT NULL,
    year_range TEXT,
    engine_type TEXT,
    transmission_type TEXT,
    market_region TEXT DEFAULT 'Indonesia',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Problems Table
CREATE TABLE public.problems (
    problem_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_code TEXT NOT NULL UNIQUE,
    problem_name TEXT NOT NULL,
    system_category system_category NOT NULL,
    severity_level severity_level NOT NULL DEFAULT 'Medium',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Vehicle-Problem Junction Table (many-to-many)
CREATE TABLE public.vehicle_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES public.vehicle_models(model_id) ON DELETE CASCADE NOT NULL,
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(model_id, problem_id)
);

-- 6. Symptoms Table
CREATE TABLE public.symptoms (
    symptom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    symptom_description TEXT NOT NULL,
    symptom_type symptom_type NOT NULL DEFAULT 'Other',
    occurrence_condition TEXT,
    frequency frequency_type DEFAULT 'Intermittent',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. DTC Codes Table
CREATE TABLE public.dtc_codes (
    dtc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    dtc_code TEXT NOT NULL,
    dtc_type dtc_type NOT NULL DEFAULT 'Powertrain',
    dtc_description TEXT,
    obd_standard TEXT DEFAULT 'OBD-II',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Sensors Table
CREATE TABLE public.sensors (
    sensor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    sensor_name TEXT NOT NULL,
    sensor_location TEXT,
    failure_mode TEXT,
    testing_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Actuators Table
CREATE TABLE public.actuators (
    actuator_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    actuator_name TEXT NOT NULL,
    actuator_type TEXT,
    failure_symptoms TEXT,
    testing_procedure TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Parts & Factors Table
CREATE TABLE public.parts_factors (
    part_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    component_name TEXT NOT NULL,
    component_type TEXT,
    failure_cause TEXT,
    wear_indicator TEXT,
    replacement_interval TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Solutions Table
CREATE TABLE public.solutions (
    solution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    solution_step TEXT NOT NULL,
    step_order INTEGER NOT NULL DEFAULT 1,
    estimated_time INTEGER,
    difficulty_level difficulty_level DEFAULT 'Medium',
    special_notes TEXT,
    is_ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Technical Theory Table
CREATE TABLE public.technical_theory (
    theory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
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

-- 13. Tools Table
CREATE TABLE public.tools (
    tool_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_id UUID REFERENCES public.solutions(solution_id) ON DELETE CASCADE NOT NULL,
    tool_name TEXT NOT NULL,
    tool_category tool_category DEFAULT 'Hand Tool',
    tool_specification TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    alternative_tool TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. Problem Relations Table
CREATE TABLE public.problem_relations (
    relation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    related_problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    relation_type relation_type NOT NULL DEFAULT 'Related To',
    is_ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT different_problems CHECK (primary_problem_id != related_problem_id)
);

-- 15. Safety Precautions Table
CREATE TABLE public.safety_precautions (
    safety_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    precaution_type TEXT,
    warning_level warning_level DEFAULT 'Caution',
    safety_description TEXT NOT NULL,
    ppe_required TEXT,
    hazard_type TEXT,
    emergency_procedure TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 16. Cost Estimation Table
CREATE TABLE public.cost_estimation (
    cost_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(problem_id) ON DELETE CASCADE NOT NULL,
    part_cost_min DECIMAL(15,2) DEFAULT 0,
    part_cost_max DECIMAL(15,2) DEFAULT 0,
    labor_cost DECIMAL(15,2) DEFAULT 0,
    total_cost_estimate DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'IDR',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dtc_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_theory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_precautions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_estimation ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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

-- Function to check if user is authenticated technician
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

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for all data tables (Senior Technicians have full access)
CREATE POLICY "Technicians can view vehicle_models" ON public.vehicle_models
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert vehicle_models" ON public.vehicle_models
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update vehicle_models" ON public.vehicle_models
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete vehicle_models" ON public.vehicle_models
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view problems" ON public.problems
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert problems" ON public.problems
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update problems" ON public.problems
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete problems" ON public.problems
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view vehicle_problems" ON public.vehicle_problems
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert vehicle_problems" ON public.vehicle_problems
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update vehicle_problems" ON public.vehicle_problems
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete vehicle_problems" ON public.vehicle_problems
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view symptoms" ON public.symptoms
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert symptoms" ON public.symptoms
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update symptoms" ON public.symptoms
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete symptoms" ON public.symptoms
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view dtc_codes" ON public.dtc_codes
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert dtc_codes" ON public.dtc_codes
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update dtc_codes" ON public.dtc_codes
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete dtc_codes" ON public.dtc_codes
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view sensors" ON public.sensors
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert sensors" ON public.sensors
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update sensors" ON public.sensors
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete sensors" ON public.sensors
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view actuators" ON public.actuators
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert actuators" ON public.actuators
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update actuators" ON public.actuators
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete actuators" ON public.actuators
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view parts_factors" ON public.parts_factors
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert parts_factors" ON public.parts_factors
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update parts_factors" ON public.parts_factors
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete parts_factors" ON public.parts_factors
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view solutions" ON public.solutions
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert solutions" ON public.solutions
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update solutions" ON public.solutions
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete solutions" ON public.solutions
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view technical_theory" ON public.technical_theory
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert technical_theory" ON public.technical_theory
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update technical_theory" ON public.technical_theory
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete technical_theory" ON public.technical_theory
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view tools" ON public.tools
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert tools" ON public.tools
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update tools" ON public.tools
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete tools" ON public.tools
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view problem_relations" ON public.problem_relations
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert problem_relations" ON public.problem_relations
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update problem_relations" ON public.problem_relations
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete problem_relations" ON public.problem_relations
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view safety_precautions" ON public.safety_precautions
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert safety_precautions" ON public.safety_precautions
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update safety_precautions" ON public.safety_precautions
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete safety_precautions" ON public.safety_precautions
    FOR DELETE TO authenticated USING (public.is_technician());

CREATE POLICY "Technicians can view cost_estimation" ON public.cost_estimation
    FOR SELECT TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can insert cost_estimation" ON public.cost_estimation
    FOR INSERT TO authenticated WITH CHECK (public.is_technician());
CREATE POLICY "Technicians can update cost_estimation" ON public.cost_estimation
    FOR UPDATE TO authenticated USING (public.is_technician());
CREATE POLICY "Technicians can delete cost_estimation" ON public.cost_estimation
    FOR DELETE TO authenticated USING (public.is_technician());

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicle_models_updated_at BEFORE UPDATE ON public.vehicle_models
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON public.problems
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_symptoms_updated_at BEFORE UPDATE ON public.symptoms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dtc_codes_updated_at BEFORE UPDATE ON public.dtc_codes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON public.sensors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_actuators_updated_at BEFORE UPDATE ON public.actuators
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parts_factors_updated_at BEFORE UPDATE ON public.parts_factors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_solutions_updated_at BEFORE UPDATE ON public.solutions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_technical_theory_updated_at BEFORE UPDATE ON public.technical_theory
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_safety_precautions_updated_at BEFORE UPDATE ON public.safety_precautions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'senior_technician');
    
    RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_problems_system_category ON public.problems(system_category);
CREATE INDEX idx_problems_severity ON public.problems(severity_level);
CREATE INDEX idx_symptoms_problem_id ON public.symptoms(problem_id);
CREATE INDEX idx_dtc_codes_problem_id ON public.dtc_codes(problem_id);
CREATE INDEX idx_dtc_codes_code ON public.dtc_codes(dtc_code);
CREATE INDEX idx_sensors_problem_id ON public.sensors(problem_id);
CREATE INDEX idx_actuators_problem_id ON public.actuators(problem_id);
CREATE INDEX idx_solutions_problem_id ON public.solutions(problem_id);
CREATE INDEX idx_vehicle_problems_model ON public.vehicle_problems(model_id);
CREATE INDEX idx_vehicle_problems_problem ON public.vehicle_problems(problem_id);