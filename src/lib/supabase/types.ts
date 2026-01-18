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
      purchase_status: "draft" | "approved" | "ordered" | "received";
    };
  };
}
