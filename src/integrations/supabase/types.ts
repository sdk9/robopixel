export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      course_entitlements: {
        Row: {
          course_id: string;
          created_at: string;
          environment: string;
          id: string;
          paddle_customer_id: string | null;
          paddle_transaction_id: string;
          purchased_at: string;
          refunded_at: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          environment?: string;
          id?: string;
          paddle_customer_id?: string | null;
          paddle_transaction_id: string;
          purchased_at?: string;
          refunded_at?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          environment?: string;
          id?: string;
          paddle_customer_id?: string | null;
          paddle_transaction_id?: string;
          purchased_at?: string;
          refunded_at?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      course_signups: {
        Row: {
          created_at: string;
          email: string;
          goal: string | null;
          id: string;
          name: string;
          track: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          goal?: string | null;
          id?: string;
          name: string;
          track: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          goal?: string | null;
          id?: string;
          name?: string;
          track?: string;
        };
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          completed_at: string;
          course_slug: string;
          lesson_slug: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string;
          course_slug: string;
          lesson_slug: string;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          course_slug?: string;
          lesson_slug?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          attempt_count: number;
          created_at: string;
          environment: string;
          event_id: string;
          event_type: string;
          handled: boolean;
          id: string;
          last_error: string | null;
          note: string | null;
          payload: Json | null;
          processing_started_at: string | null;
          status: string;
          transaction_id: string | null;
        };
        Insert: {
          attempt_count?: number;
          created_at?: string;
          environment: string;
          event_id: string;
          event_type: string;
          handled?: boolean;
          id?: string;
          last_error?: string | null;
          note?: string | null;
          payload?: Json | null;
          processing_started_at?: string | null;
          status?: string;
          transaction_id?: string | null;
        };
        Update: {
          attempt_count?: number;
          created_at?: string;
          environment?: string;
          event_id?: string;
          event_type?: string;
          handled?: boolean;
          id?: string;
          last_error?: string | null;
          note?: string | null;
          payload?: Json | null;
          processing_started_at?: string | null;
          status?: string;
          transaction_id?: string | null;
        };
        Relationships: [];
      };
      purchase_intents: {
        Row: {
          course_id: string;
          created_at: string;
          environment: string;
          expires_at: string;
          id: string;
          paddle_transaction_id: string | null;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          environment: string;
          expires_at?: string;
          id?: string;
          paddle_transaction_id?: string | null;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          environment?: string;
          expires_at?: string;
          id?: string;
          paddle_transaction_id?: string | null;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          action: string;
          request_count: number;
          subject_hash: string;
          window_started_at: string;
        };
        Insert: {
          action: string;
          request_count?: number;
          subject_hash: string;
          window_started_at?: string;
        };
        Update: {
          action?: string;
          request_count?: number;
          subject_hash?: string;
          window_started_at?: string;
        };
        Relationships: [];
      };
      practice_submissions: {
        Row: {
          code: string;
          created_at: string;
          exercise_id: string;
          id: string;
          output: string | null;
          passed: boolean;
          user_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          exercise_id: string;
          id?: string;
          output?: string | null;
          passed?: boolean;
          user_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          exercise_id?: string;
          id?: string;
          output?: string | null;
          passed?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_payment_event: {
        Args: {
          p_environment: string;
          p_event_id: string;
          p_event_type: string;
          p_payload: Json;
          p_transaction_id: string | null;
        };
        Returns: boolean;
      };
      complete_course_purchase: {
        Args: {
          p_customer_id: string | null;
          p_environment: string;
          p_intent_id: string;
          p_transaction_id: string;
        };
        Returns: string;
      };
      consume_rate_limit: {
        Args: {
          p_action: string;
          p_max_requests: number;
          p_subject_hash: string;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
