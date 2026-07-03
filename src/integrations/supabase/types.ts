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
      gallery_images: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string
          project_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          image_url: string
          project_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          project_id?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          logo_url: string | null
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_gallery: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          project_id: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          project_id: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: []
      }
      project_notes: {
        Row: {
          author: string
          created_at: string
          id: string
          project_id: string
          text: string
        }
        Insert: {
          author?: string
          created_at?: string
          id?: string
          project_id: string
          text: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          project_id?: string
          text?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          category: string | null
          completion_date: string | null
          created_at: string
          department: string | null
          description: string | null
          detailed_address: string | null
          district: string | null
          end_date: string | null
          id: string
          image_url: string | null
          impact_stat: string | null
          is_umbrella: boolean | null
          latitude: number | null
          longitude: number | null
          manager_name: string | null
          neighborhood: string | null
          organization_id: string
          planned_date: string | null
          progress: number | null
          start_date: string | null
          status: string
          sub_locations: Json | null
          title: string
        }
        Insert: {
          budget?: number | null
          category?: string | null
          completion_date?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          detailed_address?: string | null
          district?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impact_stat?: string | null
          is_umbrella?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          neighborhood?: string | null
          organization_id: string
          planned_date?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string
          sub_locations?: Json | null
          title: string
        }
        Update: {
          budget?: number | null
          category?: string | null
          completion_date?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          detailed_address?: string | null
          district?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impact_stat?: string | null
          is_umbrella?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          neighborhood?: string | null
          organization_id?: string
          planned_date?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string
          sub_locations?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      share_grants: {
        Row: {
          access_level: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          granted_user_id: string
          id: string
          owner_org_id: string
          project_id: string | null
          revoked_at: string | null
        }
        Insert: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          granted_user_id: string
          id?: string
          owner_org_id: string
          project_id?: string | null
          revoked_at?: string | null
        }
        Update: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          granted_user_id?: string
          id?: string
          owner_org_id?: string
          project_id?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_grants_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_grants_granted_user_id_fkey"
            columns: ["granted_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_grants_owner_org_id_fkey"
            columns: ["owner_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_grants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_organization_id: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      has_active_share: {
        Args: { p_owner_org_id: string; p_project_id: string }
        Returns: boolean
      }
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
    Enums: {},
  },
} as const
