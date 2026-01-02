export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actuators: {
        Row: {
          actuator_id: string
          actuator_name: string
          actuator_type: string | null
          created_at: string
          failure_symptoms: string | null
          problem_id: string
          testing_procedure: string | null
          updated_at: string
        }
        Insert: {
          actuator_id?: string
          actuator_name: string
          actuator_type?: string | null
          created_at?: string
          failure_symptoms?: string | null
          problem_id: string
          testing_procedure?: string | null
          updated_at?: string
        }
        Update: {
          actuator_id?: string
          actuator_name?: string
          actuator_type?: string | null
          created_at?: string
          failure_symptoms?: string | null
          problem_id?: string
          testing_procedure?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actuators_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      cost_estimation: {
        Row: {
          cost_id: string
          created_at: string
          currency: string | null
          labor_cost: number | null
          last_updated: string | null
          part_cost_max: number | null
          part_cost_min: number | null
          problem_id: string
          total_cost_estimate: number | null
        }
        Insert: {
          cost_id?: string
          created_at?: string
          currency?: string | null
          labor_cost?: number | null
          last_updated?: string | null
          part_cost_max?: number | null
          part_cost_min?: number | null
          problem_id: string
          total_cost_estimate?: number | null
        }
        Update: {
          cost_id?: string
          created_at?: string
          currency?: string | null
          labor_cost?: number | null
          last_updated?: string | null
          part_cost_max?: number | null
          part_cost_min?: number | null
          problem_id?: string
          total_cost_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_estimation_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      dtc_codes: {
        Row: {
          created_at: string
          dtc_code: string
          dtc_description: string | null
          dtc_id: string
          dtc_type: Database["public"]["Enums"]["dtc_type"]
          obd_standard: string | null
          problem_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dtc_code: string
          dtc_description?: string | null
          dtc_id?: string
          dtc_type?: Database["public"]["Enums"]["dtc_type"]
          obd_standard?: string | null
          problem_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dtc_code?: string
          dtc_description?: string | null
          dtc_id?: string
          dtc_type?: Database["public"]["Enums"]["dtc_type"]
          obd_standard?: string | null
          problem_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dtc_codes_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      parts_factors: {
        Row: {
          component_name: string
          component_type: string | null
          created_at: string
          failure_cause: string | null
          part_id: string
          problem_id: string
          replacement_interval: string | null
          updated_at: string
          wear_indicator: string | null
        }
        Insert: {
          component_name: string
          component_type?: string | null
          created_at?: string
          failure_cause?: string | null
          part_id?: string
          problem_id: string
          replacement_interval?: string | null
          updated_at?: string
          wear_indicator?: string | null
        }
        Update: {
          component_name?: string
          component_type?: string | null
          created_at?: string
          failure_cause?: string | null
          part_id?: string
          problem_id?: string
          replacement_interval?: string | null
          updated_at?: string
          wear_indicator?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_factors_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      problem_relations: {
        Row: {
          created_at: string
          is_ai_generated: boolean | null
          primary_problem_id: string
          related_problem_id: string
          relation_id: string
          relation_type: Database["public"]["Enums"]["relation_type"]
        }
        Insert: {
          created_at?: string
          is_ai_generated?: boolean | null
          primary_problem_id: string
          related_problem_id: string
          relation_id?: string
          relation_type?: Database["public"]["Enums"]["relation_type"]
        }
        Update: {
          created_at?: string
          is_ai_generated?: boolean | null
          primary_problem_id?: string
          related_problem_id?: string
          relation_id?: string
          relation_type?: Database["public"]["Enums"]["relation_type"]
        }
        Relationships: [
          {
            foreignKeyName: "problem_relations_primary_problem_id_fkey"
            columns: ["primary_problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
          {
            foreignKeyName: "problem_relations_related_problem_id_fkey"
            columns: ["related_problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      problems: {
        Row: {
          created_at: string
          description: string | null
          problem_code: string
          problem_id: string
          problem_name: string
          severity_level: Database["public"]["Enums"]["severity_level"]
          system_category: Database["public"]["Enums"]["system_category"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          problem_code: string
          problem_id?: string
          problem_name: string
          severity_level?: Database["public"]["Enums"]["severity_level"]
          system_category: Database["public"]["Enums"]["system_category"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          problem_code?: string
          problem_id?: string
          problem_name?: string
          severity_level?: Database["public"]["Enums"]["severity_level"]
          system_category?: Database["public"]["Enums"]["system_category"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      safety_precautions: {
        Row: {
          created_at: string
          emergency_procedure: string | null
          hazard_type: string | null
          ppe_required: string | null
          precaution_type: string | null
          problem_id: string
          safety_description: string
          safety_id: string
          updated_at: string
          warning_level: Database["public"]["Enums"]["warning_level"] | null
        }
        Insert: {
          created_at?: string
          emergency_procedure?: string | null
          hazard_type?: string | null
          ppe_required?: string | null
          precaution_type?: string | null
          problem_id: string
          safety_description: string
          safety_id?: string
          updated_at?: string
          warning_level?: Database["public"]["Enums"]["warning_level"] | null
        }
        Update: {
          created_at?: string
          emergency_procedure?: string | null
          hazard_type?: string | null
          ppe_required?: string | null
          precaution_type?: string | null
          problem_id?: string
          safety_description?: string
          safety_id?: string
          updated_at?: string
          warning_level?: Database["public"]["Enums"]["warning_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_precautions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      search_queries: {
        Row: {
          created_at: string
          has_results: boolean | null
          id: string
          last_searched_at: string | null
          original_query: string
          search_count: number | null
          translated_keywords: string[] | null
        }
        Insert: {
          created_at?: string
          has_results?: boolean | null
          id?: string
          last_searched_at?: string | null
          original_query: string
          search_count?: number | null
          translated_keywords?: string[] | null
        }
        Update: {
          created_at?: string
          has_results?: boolean | null
          id?: string
          last_searched_at?: string | null
          original_query?: string
          search_count?: number | null
          translated_keywords?: string[] | null
        }
        Relationships: []
      }
      sensors: {
        Row: {
          created_at: string
          failure_mode: string | null
          problem_id: string
          sensor_id: string
          sensor_location: string | null
          sensor_name: string
          testing_method: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          failure_mode?: string | null
          problem_id: string
          sensor_id?: string
          sensor_location?: string | null
          sensor_name: string
          testing_method?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          failure_mode?: string | null
          problem_id?: string
          sensor_id?: string
          sensor_location?: string | null
          sensor_name?: string
          testing_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensors_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      solutions: {
        Row: {
          created_at: string
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time: number | null
          is_ai_generated: boolean | null
          problem_id: string
          solution_id: string
          solution_step: string
          special_notes: string | null
          step_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time?: number | null
          is_ai_generated?: boolean | null
          problem_id: string
          solution_id?: string
          solution_step: string
          special_notes?: string | null
          step_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time?: number | null
          is_ai_generated?: boolean | null
          problem_id?: string
          solution_id?: string
          solution_step?: string
          special_notes?: string | null
          step_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solutions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      symptoms: {
        Row: {
          created_at: string
          frequency: Database["public"]["Enums"]["frequency_type"] | null
          occurrence_condition: string | null
          problem_id: string
          symptom_description: string
          symptom_id: string
          symptom_type: Database["public"]["Enums"]["symptom_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["frequency_type"] | null
          occurrence_condition?: string | null
          problem_id: string
          symptom_description: string
          symptom_id?: string
          symptom_type?: Database["public"]["Enums"]["symptom_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["frequency_type"] | null
          occurrence_condition?: string | null
          problem_id?: string
          symptom_description?: string
          symptom_id?: string
          symptom_type?: Database["public"]["Enums"]["symptom_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      technical_theory: {
        Row: {
          created_at: string
          failure_mechanism: string | null
          is_ai_generated: boolean | null
          preventive_measures: string | null
          problem_id: string
          reference_links: string | null
          system_operation: string | null
          technical_explanation: string | null
          theory_id: string
          theory_title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          failure_mechanism?: string | null
          is_ai_generated?: boolean | null
          preventive_measures?: string | null
          problem_id: string
          reference_links?: string | null
          system_operation?: string | null
          technical_explanation?: string | null
          theory_id?: string
          theory_title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          failure_mechanism?: string | null
          is_ai_generated?: boolean | null
          preventive_measures?: string | null
          problem_id?: string
          reference_links?: string | null
          system_operation?: string | null
          technical_explanation?: string | null
          theory_id?: string
          theory_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_theory_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
      tools: {
        Row: {
          alternative_tool: string | null
          created_at: string
          is_mandatory: boolean | null
          solution_id: string
          tool_category: Database["public"]["Enums"]["tool_category"] | null
          tool_id: string
          tool_name: string
          tool_specification: string | null
          updated_at: string
        }
        Insert: {
          alternative_tool?: string | null
          created_at?: string
          is_mandatory?: boolean | null
          solution_id: string
          tool_category?: Database["public"]["Enums"]["tool_category"] | null
          tool_id?: string
          tool_name: string
          tool_specification?: string | null
          updated_at?: string
        }
        Update: {
          alternative_tool?: string | null
          created_at?: string
          is_mandatory?: boolean | null
          solution_id?: string
          tool_category?: Database["public"]["Enums"]["tool_category"] | null
          tool_id?: string
          tool_name?: string
          tool_specification?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["solution_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          created_at: string
          engine_type: string | null
          manufacturer: string
          market_region: string | null
          model_id: string
          model_name: string
          transmission_type: string | null
          updated_at: string
          year_range: string | null
        }
        Insert: {
          created_at?: string
          engine_type?: string | null
          manufacturer: string
          market_region?: string | null
          model_id?: string
          model_name: string
          transmission_type?: string | null
          updated_at?: string
          year_range?: string | null
        }
        Update: {
          created_at?: string
          engine_type?: string | null
          manufacturer?: string
          market_region?: string | null
          model_id?: string
          model_name?: string
          transmission_type?: string | null
          updated_at?: string
          year_range?: string | null
        }
        Relationships: []
      }
      vehicle_problems: {
        Row: {
          created_at: string
          id: string
          model_id: string
          notes: string | null
          problem_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          notes?: string | null
          problem_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          notes?: string | null
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_problems_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["model_id"]
          },
          {
            foreignKeyName: "vehicle_problems_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["problem_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_technician: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "senior_technician" | "technician"
      difficulty_level: "Easy" | "Medium" | "Hard" | "Expert"
      dtc_type: "Powertrain" | "Chassis" | "Body" | "Network"
      frequency_type: "Always" | "Intermittent" | "Occasional"
      relation_type: "Causes" | "Related To" | "Symptom Of" | "Consequence Of"
      severity_level: "Low" | "Medium" | "High" | "Critical"
      symptom_type:
        | "Visual"
        | "Audio"
        | "Performance"
        | "Warning Light"
        | "Vibration"
        | "Smell"
        | "Touch"
        | "Other"
      system_category:
        | "Engine"
        | "Transmission"
        | "Brake"
        | "Suspension"
        | "Electrical"
        | "Cooling"
        | "Fuel"
        | "Exhaust"
        | "HVAC"
        | "Body"
        | "Steering"
        | "Drivetrain"
      tool_category:
        | "Diagnostic"
        | "Hand Tool"
        | "Power Tool"
        | "Specialty Tool"
      warning_level: "Caution" | "Warning" | "Danger"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "senior_technician", "technician"],
      difficulty_level: ["Easy", "Medium", "Hard", "Expert"],
      dtc_type: ["Powertrain", "Chassis", "Body", "Network"],
      frequency_type: ["Always", "Intermittent", "Occasional"],
      relation_type: ["Causes", "Related To", "Symptom Of", "Consequence Of"],
      severity_level: ["Low", "Medium", "High", "Critical"],
      symptom_type: [
        "Visual",
        "Audio",
        "Performance",
        "Warning Light",
        "Vibration",
        "Smell",
        "Touch",
        "Other",
      ],
      system_category: [
        "Engine",
        "Transmission",
        "Brake",
        "Suspension",
        "Electrical",
        "Cooling",
        "Fuel",
        "Exhaust",
        "HVAC",
        "Body",
        "Steering",
        "Drivetrain",
      ],
      tool_category: [
        "Diagnostic",
        "Hand Tool",
        "Power Tool",
        "Specialty Tool",
      ],
      warning_level: ["Caution", "Warning", "Danger"],
    },
  },
} as const
