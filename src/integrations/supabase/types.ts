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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      goals: {
        Row: {
          area_id: string | null
          created_at: string
          current_value: number
          ends_on: string | null
          id: string
          metric: Database["public"]["Enums"]["goal_metric"]
          period: Database["public"]["Enums"]["goal_period"]
          starts_on: string
          target_value: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          current_value?: number
          ends_on?: string | null
          id?: string
          metric?: Database["public"]["Enums"]["goal_metric"]
          period?: Database["public"]["Enums"]["goal_period"]
          starts_on?: string
          target_value: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          current_value?: number
          ends_on?: string | null
          id?: string
          metric?: Database["public"]["Enums"]["goal_metric"]
          period?: Database["public"]["Enums"]["goal_period"]
          starts_on?: string
          target_value?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "study_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_events: {
        Row: {
          created_at: string
          ends_at: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          notes: string | null
          review_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          notes?: string | null
          review_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          notes?: string | null
          review_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_events_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_events_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          exam_date: string | null
          full_name: string | null
          id: string
          preferences: Json
          updated_at: string
          weekly_hours_goal: number
          weekly_questions_goal: number
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          full_name?: string | null
          id: string
          preferences?: Json
          updated_at?: string
          weekly_hours_goal?: number
          weekly_questions_goal?: number
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json
          updated_at?: string
          weekly_hours_goal?: number
          weekly_questions_goal?: number
        }
        Relationships: []
      }
      question_sessions: {
        Row: {
          accuracy: number | null
          area_id: string | null
          correct_count: number
          created_at: string
          duration_minutes: number | null
          exam_board: string | null
          id: string
          notes: string | null
          performed_at: string
          source: string | null
          title: string | null
          topic_id: string | null
          total_questions: number
          updated_at: string
          user_id: string
          void_count: number
          wrong_count: number | null
        }
        Insert: {
          accuracy?: number | null
          area_id?: string | null
          correct_count?: number
          created_at?: string
          duration_minutes?: number | null
          exam_board?: string | null
          id?: string
          notes?: string | null
          performed_at?: string
          source?: string | null
          title?: string | null
          topic_id?: string | null
          total_questions: number
          updated_at?: string
          user_id: string
          void_count?: number
          wrong_count?: number | null
        }
        Update: {
          accuracy?: number | null
          area_id?: string | null
          correct_count?: number
          created_at?: string
          duration_minutes?: number | null
          exam_board?: string | null
          id?: string
          notes?: string | null
          performed_at?: string
          source?: string | null
          title?: string | null
          topic_id?: string | null
          total_questions?: number
          updated_at?: string
          user_id?: string
          void_count?: number
          wrong_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_sessions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "study_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      review_rules: {
        Row: {
          created_at: string
          id: string
          intervals: number[]
          is_default: boolean
          mode: Database["public"]["Enums"]["review_rule_mode"]
          name: string
          performance_bands: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intervals?: number[]
          is_default?: boolean
          mode?: Database["public"]["Enums"]["review_rule_mode"]
          name?: string
          performance_bands?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intervals?: number[]
          is_default?: boolean
          mode?: Database["public"]["Enums"]["review_rule_mode"]
          name?: string
          performance_bands?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          change_origin: string | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          mastery_level: number | null
          method: string | null
          notes: string | null
          previous_scheduled_for: string | null
          questions_correct: number | null
          questions_total: number | null
          result: Database["public"]["Enums"]["review_result"] | null
          review_number: number
          rule_id: string | null
          scheduled_for: string
          status: Database["public"]["Enums"]["review_status"]
          title: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          change_origin?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mastery_level?: number | null
          method?: string | null
          notes?: string | null
          previous_scheduled_for?: string | null
          questions_correct?: number | null
          questions_total?: number | null
          result?: Database["public"]["Enums"]["review_result"] | null
          review_number?: number
          rule_id?: string | null
          scheduled_for: string
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          change_origin?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mastery_level?: number | null
          method?: string | null
          notes?: string | null
          previous_scheduled_for?: string | null
          questions_correct?: number | null
          questions_total?: number | null
          result?: Database["public"]["Enums"]["review_result"] | null
          review_number?: number
          rule_id?: string | null
          scheduled_for?: string
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "review_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_areas: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          position: number
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          area_id: string | null
          created_at: string
          id: string
          net_minutes: number
          notes: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          study_type: Database["public"]["Enums"]["study_type"]
          title: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          id?: string
          net_minutes?: number
          notes?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          study_type?: Database["public"]["Enums"]["study_type"]
          title?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          id?: string
          net_minutes?: number
          notes?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          study_type?: Database["public"]["Enums"]["study_type"]
          title?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "study_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          area_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "study_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          archived_at: string | null
          area_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          estimated_minutes: number | null
          id: string
          importance: Database["public"]["Enums"]["topic_importance"]
          mastery_level: number | null
          notes: string | null
          planned_date: string | null
          priority: Database["public"]["Enums"]["topic_priority"]
          source: string | null
          status: Database["public"]["Enums"]["topic_status"]
          subject_id: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          importance?: Database["public"]["Enums"]["topic_importance"]
          mastery_level?: number | null
          notes?: string | null
          planned_date?: string | null
          priority?: Database["public"]["Enums"]["topic_priority"]
          source?: string | null
          status?: Database["public"]["Enums"]["topic_status"]
          subject_id?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          area_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          importance?: Database["public"]["Enums"]["topic_importance"]
          mastery_level?: number | null
          notes?: string | null
          planned_date?: string | null
          priority?: Database["public"]["Enums"]["topic_priority"]
          source?: string | null
          status?: Database["public"]["Enums"]["topic_status"]
          subject_id?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "study_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_current_user: {
        Args: { p_full_name?: string }
        Returns: undefined
      }
    }
    Enums: {
      event_status: "planejado" | "concluido" | "cancelado"
      event_type: "estudo" | "revisao" | "simulado" | "descanso" | "outro"
      goal_metric: "horas" | "questoes" | "topicos" | "revisoes" | "acertos"
      goal_period: "diario" | "semanal" | "mensal"
      review_result: "ruim" | "regular" | "bom" | "otimo"
      review_rule_mode: "fixo" | "desempenho" | "hibrida"
      review_status: "pendente" | "concluida" | "atrasada" | "cancelada"
      session_status: "planejada" | "em_andamento" | "concluida" | "cancelada"
      study_type:
        | "teoria"
        | "questoes"
        | "revisao"
        | "resumo"
        | "aula"
        | "flashcards"
        | "videoaula"
        | "leitura"
        | "outro"
      topic_importance: "alta" | "media" | "baixa"
      topic_priority: "P1" | "P2" | "P3" | "P4"
      topic_status:
        | "nao_iniciado"
        | "em_andamento"
        | "concluido"
        | "revisar"
        | "estudado"
        | "dominado"
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
      event_status: ["planejado", "concluido", "cancelado"],
      event_type: ["estudo", "revisao", "simulado", "descanso", "outro"],
      goal_metric: ["horas", "questoes", "topicos", "revisoes", "acertos"],
      goal_period: ["diario", "semanal", "mensal"],
      review_result: ["ruim", "regular", "bom", "otimo"],
      review_rule_mode: ["fixo", "desempenho", "hibrida"],
      review_status: ["pendente", "concluida", "atrasada", "cancelada"],
      session_status: ["planejada", "em_andamento", "concluida", "cancelada"],
      study_type: [
        "teoria",
        "questoes",
        "revisao",
        "resumo",
        "aula",
        "flashcards",
        "videoaula",
        "leitura",
        "outro",
      ],
      topic_importance: ["alta", "media", "baixa"],
      topic_priority: ["P1", "P2", "P3", "P4"],
      topic_status: [
        "nao_iniciado",
        "em_andamento",
        "concluido",
        "revisar",
        "estudado",
        "dominado",
      ],
    },
  },
} as const
