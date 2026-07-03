export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string | null;
          category: Database["public"]["Enums"]["article_category"];
          content: string;
          cover_image_url: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          personas: Database["public"]["Enums"]["persona_type"][];
          published_at: string | null;
          reading_minutes: number;
          slug: string;
          status: Database["public"]["Enums"]["article_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          category: Database["public"]["Enums"]["article_category"];
          content: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          personas?: Database["public"]["Enums"]["persona_type"][];
          published_at?: string | null;
          reading_minutes?: number;
          slug: string;
          status?: Database["public"]["Enums"]["article_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          category?: Database["public"]["Enums"]["article_category"];
          content?: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          personas?: Database["public"]["Enums"]["persona_type"][];
          published_at?: string | null;
          reading_minutes?: number;
          slug?: string;
          status?: Database["public"]["Enums"]["article_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      facilities: {
        Row: {
          address: string | null;
          city: string;
          created_at: string;
          description: string | null;
          email: string | null;
          id: string;
          is_verified: boolean;
          latitude: number | null;
          longitude: number | null;
          name: string;
          phone: string | null;
          postal_code: string | null;
          services: string[];
          submitted_by: string | null;
          target_ages: string[];
          type: Database["public"]["Enums"]["facility_type"];
          updated_at: string;
          voivodeship: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          city: string;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_verified?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          phone?: string | null;
          postal_code?: string | null;
          services?: string[];
          submitted_by?: string | null;
          target_ages?: string[];
          type: Database["public"]["Enums"]["facility_type"];
          updated_at?: string;
          voivodeship: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_verified?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          phone?: string | null;
          postal_code?: string | null;
          services?: string[];
          submitted_by?: string | null;
          target_ages?: string[];
          type?: Database["public"]["Enums"]["facility_type"];
          updated_at?: string;
          voivodeship?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      forum_replies: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          id: string;
          thread_id: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          id?: string;
          thread_id: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          thread_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "forum_replies_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "forum_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_threads: {
        Row: {
          author_id: string;
          body: string;
          category: string;
          created_at: string;
          id: string;
          is_locked: boolean;
          is_pinned: boolean;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          category: string;
          created_at?: string;
          id?: string;
          is_locked?: boolean;
          is_pinned?: boolean;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          category?: string;
          created_at?: string;
          id?: string;
          is_locked?: boolean;
          is_pinned?: boolean;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      glossary_terms: {
        Row: {
          created_at: string;
          id: string;
          long_definition: string | null;
          pronunciation: string | null;
          related_terms: string[];
          short_definition: string;
          slug: string;
          term: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          long_definition?: string | null;
          pronunciation?: string | null;
          related_terms?: string[];
          short_definition: string;
          slug: string;
          term: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          long_definition?: string | null;
          pronunciation?: string | null;
          related_terms?: string[];
          short_definition?: string;
          slug?: string;
          term?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          persona: Database["public"]["Enums"]["persona_type"] | null;
          pref_dyslexic_font: boolean;
          pref_font_scale: number;
          pref_sensory_mode: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          persona?: Database["public"]["Enums"]["persona_type"] | null;
          pref_dyslexic_font?: boolean;
          pref_font_scale?: number;
          pref_sensory_mode?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          persona?: Database["public"]["Enums"]["persona_type"] | null;
          pref_dyslexic_font?: boolean;
          pref_font_scale?: number;
          pref_sensory_mode?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "contributor" | "user";
      article_category:
        | "baza-wiedzy"
        | "zycie-codzienne"
        | "etapy-zycia"
        | "prawo-finanse"
        | "terapie"
        | "historie";
      article_status: "draft" | "published" | "archived";
      facility_type:
        "diagnostyk" | "terapeuta" | "osrodek" | "szkola" | "wtz" | "sds" | "autism_friendly";
      persona_type: "in_spectrum" | "close_one" | "professional";
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
    Enums: {
      app_role: ["admin", "moderator", "contributor", "user"],
      article_category: [
        "baza-wiedzy",
        "zycie-codzienne",
        "etapy-zycia",
        "prawo-finanse",
        "terapie",
        "historie",
      ],
      article_status: ["draft", "published", "archived"],
      facility_type: [
        "diagnostyk",
        "terapeuta",
        "osrodek",
        "szkola",
        "wtz",
        "sds",
        "autism_friendly",
      ],
      persona_type: ["in_spectrum", "close_one", "professional"],
    },
  },
} as const;
