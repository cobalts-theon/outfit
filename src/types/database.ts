/**
 * Các kiểu TypeScript được sinh từ schema Supabase, dùng để kiểm tra truy vấn.
 * Khi schema thay đổi cần sinh lại file; không chỉnh thủ công các kiểu bên dưới.
 */
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_plans: {
        Row: {
          activity: string
          baseline_risks: string[]
          baseline_status: string
          checked_items: string[]
          created_at: string
          ends_at: string
          feedback: string | null
          id: string
          latitude: number
          location_label: string
          longitude: number
          policy_version: string
          preparation: string
          reasons: string[]
          reminder_enabled: boolean
          starts_at: string
          status: string
          time_zone: string
          user_id: string
        }
        Insert: {
          activity?: string
          baseline_risks?: string[]
          baseline_status?: string
          checked_items?: string[]
          created_at?: string
          ends_at: string
          feedback?: string | null
          id?: string
          latitude: number
          location_label: string
          longitude: number
          policy_version: string
          preparation: string
          reasons: string[]
          reminder_enabled?: boolean
          starts_at: string
          status?: string
          time_zone: string
          user_id: string
        }
        Update: {
          activity?: string
          baseline_risks?: string[]
          baseline_status?: string
          checked_items?: string[]
          created_at?: string
          ends_at?: string
          feedback?: string | null
          id?: string
          latitude?: number
          location_label?: string
          longitude?: number
          policy_version?: string
          preparation?: string
          reasons?: string[]
          reminder_enabled?: boolean
          starts_at?: string
          status?: string
          time_zone?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          environmental_risk_enabled: boolean
          notifications_enabled: boolean
          primary_action_enabled: boolean
          rain_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          environmental_risk_enabled?: boolean
          notifications_enabled?: boolean
          primary_action_enabled?: boolean
          rain_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          environmental_risk_enabled?: boolean
          notifications_enabled?: boolean
          primary_action_enabled?: boolean
          rain_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          minute_of_day: number | null
          period: string | null
          response: string
          target_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          minute_of_day?: number | null
          period?: string | null
          response: string
          target_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          minute_of_day?: number | null
          period?: string | null
          response?: string
          target_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendation_logs: {
        Row: {
          aqi: number | null
          created_at: string | null
          feedback: number | null
          feedback_at: string | null
          humidity: number | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          rule_id: string | null
          temperature: number | null
          user_id: string | null
          uv_index: number | null
          weather_condition: string | null
        }
        Insert: {
          aqi?: number | null
          created_at?: string | null
          feedback?: number | null
          feedback_at?: string | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          rule_id?: string | null
          temperature?: number | null
          user_id?: string | null
          uv_index?: number | null
          weather_condition?: string | null
        }
        Update: {
          aqi?: number | null
          created_at?: string | null
          feedback?: number | null
          feedback_at?: string | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          rule_id?: string | null
          temperature?: number | null
          user_id?: string | null
          uv_index?: number | null
          weather_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "recommendation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_rules: {
        Row: {
          aqi_max: number | null
          aqi_min: number | null
          clothing_suggestion: string
          created_at: string | null
          health_advice: string | null
          humidity_max: number | null
          humidity_min: number | null
          icon_key: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          temp_max: number | null
          temp_min: number | null
          updated_at: string | null
          uv_max: number | null
          uv_min: number | null
          weather_condition: string | null
        }
        Insert: {
          aqi_max?: number | null
          aqi_min?: number | null
          clothing_suggestion: string
          created_at?: string | null
          health_advice?: string | null
          humidity_max?: number | null
          humidity_min?: number | null
          icon_key?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          temp_max?: number | null
          temp_min?: number | null
          updated_at?: string | null
          uv_max?: number | null
          uv_min?: number | null
          weather_condition?: string | null
        }
        Update: {
          aqi_max?: number | null
          aqi_min?: number | null
          clothing_suggestion?: string
          created_at?: string | null
          health_advice?: string | null
          humidity_max?: number | null
          humidity_min?: number | null
          icon_key?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          temp_max?: number | null
          temp_min?: number | null
          updated_at?: string | null
          uv_max?: number | null
          uv_min?: number | null
          weather_condition?: string | null
        }
        Relationships: []
      }
      saved_locations: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          latitude: number
          longitude: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          latitude: number
          longitude: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          latitude?: number
          longitude?: number
          user_id?: string
        }
        Relationships: []
      }
      walking_policies: {
        Row: {
          active: boolean
          created_at: string
          max_aqi: number
          max_feels_like: number
          max_gust: number
          max_rain_probability: number
          max_uv: number
          max_wind: number
          min_feels_like: number
          rationale: string
          version: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          max_aqi: number
          max_feels_like: number
          max_gust: number
          max_rain_probability: number
          max_uv: number
          max_wind: number
          min_feels_like: number
          rationale: string
          version: string
        }
        Update: {
          active?: boolean
          created_at?: string
          max_aqi?: number
          max_feels_like?: number
          max_gust?: number
          max_rain_probability?: number
          max_uv?: number
          max_wind?: number
          min_feels_like?: number
          rationale?: string
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
