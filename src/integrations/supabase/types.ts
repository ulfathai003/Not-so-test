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
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          id: string
          payment_mode: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          payment_mode?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          payment_mode?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_mode: string | null
          receipt_number: string | null
          student_id: string
          transaction_ref: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string | null
          receipt_number?: string | null
          student_id: string
          transaction_ref?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string | null
          receipt_number?: string | null
          student_id?: string
          transaction_ref?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          contact_method: string | null
          created_at: string
          created_by: string | null
          follow_up_date: string
          id: string
          next_follow_up: string | null
          notes: string | null
          outcome: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          contact_method?: string | null
          created_at?: string
          created_by?: string | null
          follow_up_date?: string
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          outcome?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          contact_method?: string | null
          created_at?: string
          created_by?: string | null
          follow_up_date?: string
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          outcome?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          aadhar_number: string | null
          abc_id: string | null
          address: string | null
          admission_session: string | null
          batch_year: number
          category: string | null
          city: string | null
          counsellor_name: string | null
          course_code: string | null
          course_name: string | null
          created_at: string
          current_semester: number | null
          deb_id: string | null
          district: string | null
          dob: string | null
          doc_id_proof: boolean | null
          doc_marksheet_10: boolean | null
          doc_marksheet_12: boolean | null
          doc_marksheet_degree: boolean | null
          doc_photo: boolean | null
          doc_signature: boolean | null
          duration_years: number | null
          edu_10_board: string | null
          edu_10_marks: string | null
          edu_10_percentage: number | null
          edu_10_result: string | null
          edu_10_year: number | null
          edu_12_board: string | null
          edu_12_marks: string | null
          edu_12_percentage: number | null
          edu_12_result: string | null
          edu_12_year: number | null
          edu_degree_marks: string | null
          edu_degree_percentage: number | null
          edu_degree_result: string | null
          edu_degree_university: string | null
          edu_degree_year: number | null
          email: string
          employment_status: string | null
          enrollment_date: string
          enrollment_number: string | null
          father_name: string | null
          fee_paid: number | null
          fee_pending: number | null
          full_name: string
          gender: string | null
          id: string
          last_payment_date: string | null
          lead_source: string | null
          location: string
          marital_status: string | null
          medium_of_instruction: string | null
          mother_name: string | null
          next_due_date: string | null
          notes: string | null
          payment_mode: string | null
          payment_status: string | null
          phone: string | null
          pincode: string | null
          program: Database["public"]["Enums"]["program_type"]
          referral_name: string | null
          religion: string | null
          specialization: string
          state: string | null
          status: Database["public"]["Enums"]["student_status"]
          study_mode: string | null
          total_fee: number | null
          total_semesters: number | null
          university: string
          updated_at: string
        }
        Insert: {
          aadhar_number?: string | null
          abc_id?: string | null
          address?: string | null
          admission_session?: string | null
          batch_year: number
          category?: string | null
          city?: string | null
          counsellor_name?: string | null
          course_code?: string | null
          course_name?: string | null
          created_at?: string
          current_semester?: number | null
          deb_id?: string | null
          district?: string | null
          dob?: string | null
          doc_id_proof?: boolean | null
          doc_marksheet_10?: boolean | null
          doc_marksheet_12?: boolean | null
          doc_marksheet_degree?: boolean | null
          doc_photo?: boolean | null
          doc_signature?: boolean | null
          duration_years?: number | null
          edu_10_board?: string | null
          edu_10_marks?: string | null
          edu_10_percentage?: number | null
          edu_10_result?: string | null
          edu_10_year?: number | null
          edu_12_board?: string | null
          edu_12_marks?: string | null
          edu_12_percentage?: number | null
          edu_12_result?: string | null
          edu_12_year?: number | null
          edu_degree_marks?: string | null
          edu_degree_percentage?: number | null
          edu_degree_result?: string | null
          edu_degree_university?: string | null
          edu_degree_year?: number | null
          email: string
          employment_status?: string | null
          enrollment_date?: string
          enrollment_number?: string | null
          father_name?: string | null
          fee_paid?: number | null
          fee_pending?: number | null
          full_name: string
          gender?: string | null
          id?: string
          last_payment_date?: string | null
          lead_source?: string | null
          location: string
          marital_status?: string | null
          medium_of_instruction?: string | null
          mother_name?: string | null
          next_due_date?: string | null
          notes?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          phone?: string | null
          pincode?: string | null
          program: Database["public"]["Enums"]["program_type"]
          referral_name?: string | null
          religion?: string | null
          specialization: string
          state?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          study_mode?: string | null
          total_fee?: number | null
          total_semesters?: number | null
          university: string
          updated_at?: string
        }
        Update: {
          aadhar_number?: string | null
          abc_id?: string | null
          address?: string | null
          admission_session?: string | null
          batch_year?: number
          category?: string | null
          city?: string | null
          counsellor_name?: string | null
          course_code?: string | null
          course_name?: string | null
          created_at?: string
          current_semester?: number | null
          deb_id?: string | null
          district?: string | null
          dob?: string | null
          doc_id_proof?: boolean | null
          doc_marksheet_10?: boolean | null
          doc_marksheet_12?: boolean | null
          doc_marksheet_degree?: boolean | null
          doc_photo?: boolean | null
          doc_signature?: boolean | null
          duration_years?: number | null
          edu_10_board?: string | null
          edu_10_marks?: string | null
          edu_10_percentage?: number | null
          edu_10_result?: string | null
          edu_10_year?: number | null
          edu_12_board?: string | null
          edu_12_marks?: string | null
          edu_12_percentage?: number | null
          edu_12_result?: string | null
          edu_12_year?: number | null
          edu_degree_marks?: string | null
          edu_degree_percentage?: number | null
          edu_degree_result?: string | null
          edu_degree_university?: string | null
          edu_degree_year?: number | null
          email?: string
          employment_status?: string | null
          enrollment_date?: string
          enrollment_number?: string | null
          father_name?: string | null
          fee_paid?: number | null
          fee_pending?: number | null
          full_name?: string
          gender?: string | null
          id?: string
          last_payment_date?: string | null
          lead_source?: string | null
          location?: string
          marital_status?: string | null
          medium_of_instruction?: string | null
          mother_name?: string | null
          next_due_date?: string | null
          notes?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          phone?: string | null
          pincode?: string | null
          program?: Database["public"]["Enums"]["program_type"]
          referral_name?: string | null
          religion?: string | null
          specialization?: string
          state?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          study_mode?: string | null
          total_fee?: number | null
          total_semesters?: number | null
          university?: string
          updated_at?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_email: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student" | "super_admin" | "center" | "staff"
      program_type:
        | "BBA"
        | "MBA"
        | "10th"
        | "12th Arts"
        | "12th Commerce"
        | "12th Science"
      student_status: "active" | "inactive" | "graduated" | "suspended" | "lead"
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
      app_role: ["super_admin", "admin", "center", "staff", "student"],
      program_type: [
        "BBA",
        "MBA",
        "10th",
        "12th Arts",
        "12th Commerce",
        "12th Science",
      ],
      student_status: ["active", "inactive", "graduated", "suspended", "lead"],
    },
  },
} as const
