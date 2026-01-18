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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
