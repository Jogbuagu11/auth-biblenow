export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bible_kjv: {
        Row: {
          book_name: string | null
          book_number: number | null
          chapter: number | null
          text: string | null
          verse: number | null
          verse_id: number
        }
        Insert: {
          book_name?: string | null
          book_number?: number | null
          chapter?: number | null
          text?: string | null
          verse?: number | null
          verse_id: number
        }
        Update: {
          book_name?: string | null
          book_number?: number | null
          chapter?: number | null
          text?: string | null
          verse?: number | null
          verse_id?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_references: {
        Row: {
          book_key: number
          chapter_nbr: number | null
          reference_list: string | null
          sort_order: number | null
          verse_nbr: number | null
          word: string | null
        }
        Insert: {
          book_key: number
          chapter_nbr?: number | null
          reference_list?: string | null
          sort_order?: number | null
          verse_nbr?: number | null
          word?: string | null
        }
        Update: {
          book_key?: number
          chapter_nbr?: number | null
          reference_list?: string | null
          sort_order?: number | null
          verse_nbr?: number | null
          word?: string | null
        }
        Relationships: []
      }
      email_verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      kjv_bible: {
        Row: {
          book: string
          chapter: number | null
          text: string | null
          verse: number | null
        }
        Insert: {
          book: string
          chapter?: number | null
          text?: string | null
          verse?: number | null
        }
        Update: {
          book?: string
          chapter?: number | null
          text?: string | null
          verse?: number | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          enable_realtime: boolean | null
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          enable_realtime?: boolean | null
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          enable_realtime?: boolean | null
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          enable_realtime: boolean | null
          id: string
          images: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          enable_realtime?: boolean | null
          id?: string
          images?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          enable_realtime?: boolean | null
          id?: string
          images?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayers: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayers_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          birthdate: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          has_completed_2fa: boolean | null
          has_completed_profile: boolean | null
          id: string
          is_verified: boolean | null
          location: string | null
          name: string | null
          phone: string | null
          phone_number: string | null
          phone_number_verified: boolean | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          has_completed_2fa?: boolean | null
          has_completed_profile?: boolean | null
          id: string
          is_verified?: boolean | null
          location?: string | null
          name?: string | null
          phone?: string | null
          phone_number?: string | null
          phone_number_verified?: boolean | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          has_completed_2fa?: boolean | null
          has_completed_profile?: boolean | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          name?: string | null
          phone?: string | null
          phone_number?: string | null
          phone_number_verified?: boolean | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      shares: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      strongs: {
        Row: {
          description: string | null
          lemma: string | null
          number: string
          pronounce: string | null
          xlit: string | null
        }
        Insert: {
          description?: string | null
          lemma?: string | null
          number: string
          pronounce?: string | null
          xlit?: string | null
        }
        Update: {
          description?: string | null
          lemma?: string | null
          number?: string
          pronounce?: string | null
          xlit?: string | null
        }
        Relationships: []
      }
      subscription_logs: {
        Row: {
          created_at: string | null
          event_data: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          event_data?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          event_data?: string | null
          id?: number
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_highlights: {
        Row: {
          book_name: string
          chapter: number
          content: string
          created_at: string | null
          id: string
          user_id: string
          verse: number
        }
        Insert: {
          book_name: string
          chapter: number
          content: string
          created_at?: string | null
          id?: string
          user_id: string
          verse: number
        }
        Update: {
          book_name?: string
          chapter?: number
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apple_subscription_webhook: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
