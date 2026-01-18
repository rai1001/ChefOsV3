export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      org_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: string;
          is_active: boolean | null;
        };
        Insert: {
          org_id: string;
          user_id: string;
          role: string;
          is_active?: boolean | null;
        };
        Update: {
          org_id?: string;
          user_id?: string;
          role?: string;
          is_active?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          }
        ];
      };
      hotels: {
        Row: {
          id: string;
          org_id: string;
          name: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hotels_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          org_id: string;
          hotel_id: string;
          title: string;
          starts_at: string;
          ends_at: string;
          status: Database["public"]["Enums"]["event_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          hotel_id: string;
          title: string;
          starts_at: string;
          ends_at: string;
          status?: Database["public"]["Enums"]["event_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          hotel_id?: string;
          title?: string;
          starts_at?: string;
          ends_at?: string;
          status?: Database["public"]["Enums"]["event_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_hotel_id_fkey";
            columns: ["hotel_id"];
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          }
        ];
      };
      spaces: {
        Row: {
          id: string;
          org_id: string;
          hotel_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          hotel_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          hotel_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "spaces_hotel_id_fkey";
            columns: ["hotel_id"];
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "spaces_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          }
        ];
      };
      space_bookings: {
        Row: {
          id: string;
          org_id: string;
          event_id: string;
          space_id: string;
          starts_at: string;
          ends_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          event_id: string;
          space_id: string;
          starts_at: string;
          ends_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          event_id?: string;
          space_id?: string;
          starts_at?: string;
          ends_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "space_bookings_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "space_bookings_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "space_bookings_space_id_fkey";
            columns: ["space_id"];
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          }
        ];
      };
      event_services: {
        Row: {
          id: string;
          org_id: string;
          event_id: string;
          service_type: Database["public"]["Enums"]["event_service_type"];
          format: Database["public"]["Enums"]["event_service_format"];
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          event_id: string;
          service_type: Database["public"]["Enums"]["event_service_type"];
          format: Database["public"]["Enums"]["event_service_format"];
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          event_id?: string;
          service_type?: Database["public"]["Enums"]["event_service_type"];
          format?: Database["public"]["Enums"]["event_service_format"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_services_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_services_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          }
        ];
      };
      suppliers: {
        Row: {
          id: string;
          org_id: string;
          name: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suppliers_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          unit: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          unit: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          }
        ];
      };
      purchase_orders: {
        Row: {
          id: string;
          org_id: string;
          hotel_id: string;
          supplier_id: string | null;
          status: Database["public"]["Enums"]["purchase_status"] | null;
          total_estimated: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          hotel_id: string;
          supplier_id?: string | null;
          status?: Database["public"]["Enums"]["purchase_status"] | null;
          total_estimated?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          hotel_id?: string;
          supplier_id?: string | null;
          status?: Database["public"]["Enums"]["purchase_status"] | null;
          total_estimated?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_orders_hotel_id_fkey";
            columns: ["hotel_id"];
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey";
            columns: ["supplier_id"];
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      event_status: "draft" | "confirmed" | "cancelled";
      event_service_type: "coffee_break" | "dinner" | "production";
      event_service_format: "de_pie" | "sentado";
      purchase_status: "draft" | "approved" | "ordered" | "received";
    };
  };
}
