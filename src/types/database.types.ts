export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  gigacoffee: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          fcm_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          fcm_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          fcm_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: { id: string; name: "admin" | "staff" | "member" }
        Insert: { id?: string; name: "admin" | "staff" | "member" }
        Update: { id?: string; name?: "admin" | "staff" | "member" }
        Relationships: []
      }
      user_roles: {
        Row: { user_id: string; role_id: string; granted_by: string | null; granted_at: string }
        Insert: { user_id: string; role_id: string; granted_by?: string | null; granted_at?: string }
        Update: { user_id?: string; role_id?: string; granted_by?: string | null; granted_at?: string }
        Relationships: []
      }
      categories: {
        Row: { id: string; name: string; slug: string; sort_order: number; is_active: boolean }
        Insert: { id?: string; name: string; slug: string; sort_order?: number; is_active?: boolean }
        Update: { id?: string; name?: string; slug?: string; sort_order?: number; is_active?: boolean }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          category_id: string
          name: string
          price: number
          image_url: string | null
          is_available: boolean
          options: Json
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          price: number
          image_url?: string | null
          is_available?: boolean
          options?: Json
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          price?: number
          image_url?: string | null
          is_available?: boolean
          options?: Json
          created_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: { product_id: string; quantity: number; low_stock_threshold: number; updated_at: string }
        Insert: { product_id: string; quantity?: number; low_stock_threshold?: number; updated_at?: string }
        Update: { product_id?: string; quantity?: number; low_stock_threshold?: number; updated_at?: string }
        Relationships: []
      }
      stock_histories: {
        Row: {
          id: string
          product_id: string
          change_qty: number
          reason: string | null
          type: "in" | "out" | "adjust" | "cancel"
          ref_order_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          change_qty: number
          reason?: string | null
          type: "in" | "out" | "adjust" | "cancel"
          ref_order_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          change_qty?: number
          reason?: string | null
          type?: "in" | "out" | "adjust" | "cancel"
          ref_order_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled"
          total_amount: number
          memo: string | null
          delivery_type: string
          delivery_address: Json | null
          delivery_fee: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled"
          total_amount: number
          memo?: string | null
          delivery_type?: string
          delivery_address?: Json | null
          delivery_fee?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled"
          total_amount?: number
          memo?: string | null
          delivery_type?: string
          delivery_address?: Json | null
          delivery_fee?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_settings: {
        Row: {
          type: string
          fee: number
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          type: string
          fee?: number
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          type?: string
          fee?: number
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          options: Json
          line_total: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          options?: Json
          line_total: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          options?: Json
          line_total?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          portone_payment_id: string
          merchant_uid: string
          method: "card" | "kakao_pay" | "naver_pay" | "toss" | "bank_transfer"
          status: "pending" | "paid" | "failed" | "cancelled" | "refunded"
          amount: number
          raw_response: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          portone_payment_id: string
          merchant_uid: string
          method: "card" | "kakao_pay" | "naver_pay" | "toss" | "bank_transfer"
          status?: "pending" | "paid" | "failed" | "cancelled" | "refunded"
          amount: number
          raw_response?: Json
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          portone_payment_id?: string
          merchant_uid?: string
          method?: "card" | "kakao_pay" | "naver_pay" | "toss" | "bank_transfer"
          status?: "pending" | "paid" | "failed" | "cancelled" | "refunded"
          amount?: number
          raw_response?: Json
          created_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          author_id: string
          category: "notice" | "qna" | "review" | "free"
          title: string
          content: string
          is_pinned: boolean
          is_hidden: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          category: "notice" | "qna" | "review" | "free"
          title: string
          content: string
          is_pinned?: boolean
          is_hidden?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          category?: "notice" | "qna" | "review" | "free"
          title?: string
          content?: string
          is_pinned?: boolean
          is_hidden?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          is_hidden: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          is_hidden?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          is_hidden?: boolean
          created_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          id: string
          type: "kakao" | "push" | "sms"
          recipient_id: string
          event_type: string
          payload: Json
          status: "success" | "failed" | "pending"
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: "kakao" | "push" | "sms"
          recipient_id: string
          event_type: string
          payload?: Json
          status?: "success" | "failed" | "pending"
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: "kakao" | "push" | "sms"
          recipient_id?: string
          event_type?: string
          payload?: Json
          status?: "success" | "failed" | "pending"
          sent_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
