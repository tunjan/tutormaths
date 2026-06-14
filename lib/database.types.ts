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
      assignment_files: {
        Row: {
          assignment_id: string
          created_at: string
          file_path: string
          id: string
          mime_type: string
          size_bytes: number | null
          sort_order: number
        }
        Insert: {
          assignment_id: string
          created_at?: string
          file_path: string
          id?: string
          mime_type: string
          size_bytes?: number | null
          sort_order?: number
        }
        Update: {
          assignment_id?: string
          created_at?: string
          file_path?: string
          id?: string
          mime_type?: string
          size_bytes?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "assignment_files_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          category_id: string | null
          completion_pct: number
          created_at: string
          description: string | null
          due_at: string
          file_path: string | null
          id: string
          latex_body: string | null
          review_status: Database["public"]["Enums"]["review_status"]
          reviewed_at: string | null
          student_id: string
          student_opened_at: string | null
          title: string
          tutor_id: string
          type: Database["public"]["Enums"]["assignment_type"]
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          completion_pct?: number
          created_at?: string
          description?: string | null
          due_at: string
          file_path?: string | null
          id?: string
          latex_body?: string | null
          review_status?: Database["public"]["Enums"]["review_status"]
          reviewed_at?: string | null
          student_id: string
          student_opened_at?: string | null
          title: string
          tutor_id: string
          type: Database["public"]["Enums"]["assignment_type"]
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          completion_pct?: number
          created_at?: string
          description?: string | null
          due_at?: string
          file_path?: string | null
          id?: string
          latex_body?: string | null
          review_status?: Database["public"]["Enums"]["review_status"]
          reviewed_at?: string | null
          student_id?: string
          student_opened_at?: string | null
          title?: string
          tutor_id?: string
          type?: Database["public"]["Enums"]["assignment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          assignment_id: string
          author_id: string
          body: string
          created_at: string
          id: string
        }
        Insert: {
          assignment_id: string
          author_id: string
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          assignment_id?: string
          author_id?: string
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      library_documents: {
        Row: {
          category_id: string
          created_at: string
          file_path: string
          id: string
          mime_type: string
          size_bytes: number | null
          title: string
          uploaded_by: string
        }
        Insert: {
          category_id: string
          created_at?: string
          file_path: string
          id?: string
          mime_type: string
          size_bytes?: number | null
          title: string
          uploaded_by: string
        }
        Update: {
          category_id?: string
          created_at?: string
          file_path?: string
          id?: string
          mime_type?: string
          size_bytes?: number | null
          title?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          assignment_id: string | null
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          assignment_id?: string | null
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          assignment_id?: string | null
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      reminders_sent: {
        Row: {
          assignment_id: string
          id: string
          sent_at: string
          student_id: string
          window_hours: number
        }
        Insert: {
          assignment_id: string
          id?: string
          sent_at?: string
          student_id: string
          window_hours: number
        }
        Update: {
          assignment_id?: string
          id?: string
          sent_at?: string
          student_id?: string
          window_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "reminders_sent_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_sent_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_invites: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          created_at: string
          created_by: string
          full_name: string
          id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          created_by: string
          full_name?: string
          id?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          created_by?: string
          full_name?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_invites_accepted_user_id_fkey"
            columns: ["accepted_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          created_at: string
          file_path: string
          id: string
          mime_type: string
          size_bytes: number | null
          student_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          file_path: string
          id?: string
          mime_type: string
          size_bytes?: number | null
          student_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          file_path?: string
          id?: string
          mime_type?: string
          size_bytes?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_settings: {
        Row: {
          reminder_windows: number[]
          tutor_id: string
          updated_at: string
        }
        Insert: {
          reminder_windows?: number[]
          tutor_id: string
          updated_at?: string
        }
        Update: {
          reminder_windows?: number[]
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_settings_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      is_tutor: { Args: never; Returns: boolean }
      request_more_homework: {
        Args: { p_message?: string | null }
        Returns: undefined
      }
    }
    Enums: {
      assignment_type: "problem_set" | "reading_notes"
      notification_type:
        | "assignment_created"
        | "tutor_comment"
        | "student_comment"
        | "submission_updated"
        | "homework_requested"
        | "reminder"
        | "work_approved"
        | "work_returned"
      review_status: "assigned" | "submitted" | "approved" | "needs_work"
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
      assignment_type: ["problem_set", "reading_notes"],
      notification_type: [
        "assignment_created",
        "tutor_comment",
        "student_comment",
        "submission_updated",
        "homework_requested",
        "reminder",
        "work_approved",
        "work_returned",
      ],
      review_status: ["assigned", "submitted", "approved", "needs_work"],
    },
  },
} as const
