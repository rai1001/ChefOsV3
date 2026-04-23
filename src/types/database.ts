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
      agent_configs: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          config: Json
          created_at: string
          hotel_id: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          config?: Json
          created_at?: string
          hotel_id: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          config?: Json
          created_at?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_configs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_suggestions: {
        Row: {
          action: Database["public"]["Enums"]["suggestion_action"]
          action_payload: Json
          agent_type: Database["public"]["Enums"]["agent_type"]
          context_id: string | null
          context_type: string | null
          created_at: string
          description: string
          evidence: Json
          expires_at: string | null
          hotel_id: string
          id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["suggestion_status"]
          title: string
          updated_at: string
        }
        Insert: {
          action?: Database["public"]["Enums"]["suggestion_action"]
          action_payload?: Json
          agent_type: Database["public"]["Enums"]["agent_type"]
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          description: string
          evidence?: Json
          expires_at?: string | null
          hotel_id: string
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          title: string
          updated_at?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["suggestion_action"]
          action_payload?: Json
          agent_type?: Database["public"]["Enums"]["agent_type"]
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          description?: string
          evidence?: Json
          expires_at?: string | null
          hotel_id?: string
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_suggestions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_date: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          auto_resolved_at: string | null
          created_at: string
          details: Json | null
          dismissed_at: string | null
          dismissed_by: string | null
          hotel_id: string
          id: string
          message: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Insert: {
          alert_date?: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          auto_resolved_at?: string | null
          created_at?: string
          details?: Json | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          hotel_id: string
          id?: string
          message?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Update: {
          alert_date?: string
          alert_type?: Database["public"]["Enums"]["alert_type"]
          auto_resolved_at?: string | null
          created_at?: string
          details?: Json | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          hotel_id?: string
          id?: string
          message?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      appcc_records: {
        Row: {
          checked_at: string | null
          checked_by: string | null
          corrective_action_taken: string | null
          created_at: string
          event_id: string | null
          hotel_id: string
          id: string
          observations: string | null
          record_date: string
          status: Database["public"]["Enums"]["appcc_record_status"]
          template_id: string
          updated_at: string
          value_measured: string | null
        }
        Insert: {
          checked_at?: string | null
          checked_by?: string | null
          corrective_action_taken?: string | null
          created_at?: string
          event_id?: string | null
          hotel_id: string
          id?: string
          observations?: string | null
          record_date?: string
          status?: Database["public"]["Enums"]["appcc_record_status"]
          template_id: string
          updated_at?: string
          value_measured?: string | null
        }
        Update: {
          checked_at?: string | null
          checked_by?: string | null
          corrective_action_taken?: string | null
          created_at?: string
          event_id?: string | null
          hotel_id?: string
          id?: string
          observations?: string | null
          record_date?: string
          status?: Database["public"]["Enums"]["appcc_record_status"]
          template_id?: string
          updated_at?: string
          value_measured?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appcc_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appcc_records_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appcc_records_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "appcc_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      appcc_templates: {
        Row: {
          category: Database["public"]["Enums"]["appcc_category"]
          control_point: string
          corrective_action: string
          created_at: string
          critical_limit: string
          description: string | null
          frequency: string
          hotel_id: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          responsible_role: Database["public"]["Enums"]["app_role"]
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["appcc_category"]
          control_point: string
          corrective_action: string
          created_at?: string
          critical_limit: string
          description?: string | null
          frequency?: string
          hotel_id: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          responsible_role?: Database["public"]["Enums"]["app_role"]
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["appcc_category"]
          control_point?: string
          corrective_action?: string
          created_at?: string
          critical_limit?: string
          description?: string | null
          frequency?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          responsible_role?: Database["public"]["Enums"]["app_role"]
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appcc_templates_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          hotel_id: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          hotel_id: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          hotel_id?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_job_logs: {
        Row: {
          created_at: string
          details: Json | null
          hotel_id: string
          id: string
          job_id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          hotel_id: string
          id?: string
          job_id: string
          level?: Database["public"]["Enums"]["log_level"]
          message: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          hotel_id?: string
          id?: string
          job_id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_job_logs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "automation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          created_by: string | null
          error: string | null
          hotel_id: string
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          max_attempts: number
          payload: Json
          result: Json | null
          scheduled_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          hotel_id: string
          id?: string
          job_type: Database["public"]["Enums"]["job_type"]
          max_attempts?: number
          payload?: Json
          result?: Json | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          hotel_id?: string
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          max_attempts?: number
          payload?: Json
          result?: Json | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_jobs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_triggers: {
        Row: {
          created_at: string
          delay_seconds: number
          hotel_id: string
          id: string
          is_active: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          payload_template: Json
          trigger_event: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delay_seconds?: number
          hotel_id: string
          id?: string
          is_active?: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          payload_template?: Json
          trigger_event: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delay_seconds?: number
          hotel_id?: string
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          payload_template?: Json
          trigger_event?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          hotel_id: string
          id: string
          is_active: boolean
          lifetime_value: number
          name: string
          notes: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
          vip_level: Database["public"]["Enums"]["vip_level"]
        }
        Insert: {
          company?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          lifetime_value?: number
          name: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          vip_level?: Database["public"]["Enums"]["vip_level"]
        }
        Update: {
          company?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          lifetime_value?: number
          name?: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          vip_level?: Database["public"]["Enums"]["vip_level"]
        }
        Relationships: [
          {
            foreignKeyName: "clients_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_events: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          created_at: string
          event_type: string
          hotel_id: string
          id: string
          payload: Json
          processed_at: string | null
          version: number
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          created_at?: string
          event_type: string
          hotel_id: string
          id?: string
          payload?: Json
          processed_at?: string | null
          version?: number
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          created_at?: string
          event_type?: string
          hotel_id?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "domain_events_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      event_menus: {
        Row: {
          created_at: string
          event_id: string
          hotel_id: string
          id: string
          menu_id: string | null
          menu_name: string
          servings_override: number | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          event_id: string
          hotel_id: string
          id?: string
          menu_id?: string | null
          menu_name: string
          servings_override?: number | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          event_id?: string
          hotel_id?: string
          id?: string
          menu_id?: string | null
          menu_name?: string
          servings_override?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_menus_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_menus_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      event_operational_impact: {
        Row: {
          department: Database["public"]["Enums"]["department"]
          event_id: string
          generated_at: string
          hotel_id: string
          id: string
          product_id: string | null
          product_name: string
          quantity_needed: number
          unit: string | null
        }
        Insert: {
          department?: Database["public"]["Enums"]["department"]
          event_id: string
          generated_at?: string
          hotel_id: string
          id?: string
          product_id?: string | null
          product_name: string
          quantity_needed?: number
          unit?: string | null
        }
        Update: {
          department?: Database["public"]["Enums"]["department"]
          event_id?: string
          generated_at?: string
          hotel_id?: string
          id?: string
          product_id?: string | null
          product_name?: string
          quantity_needed?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_operational_impact_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_operational_impact_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_operational_impact_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      event_spaces: {
        Row: {
          capacity: number | null
          created_at: string
          event_id: string
          hotel_id: string
          id: string
          notes: string | null
          setup_style: string | null
          setup_type: string | null
          space_name: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          event_id: string
          hotel_id: string
          id?: string
          notes?: string | null
          setup_style?: string | null
          setup_type?: string | null
          space_name: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          event_id?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          setup_style?: string | null
          setup_type?: string | null
          space_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_spaces_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_spaces_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      event_versions: {
        Row: {
          change_reason: string | null
          changed_by: string
          created_at: string
          data: Json
          event_id: string
          hotel_id: string
          id: string
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          changed_by: string
          created_at?: string
          data: Json
          event_id: string
          hotel_id: string
          id?: string
          version_number: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string
          created_at?: string
          data?: Json
          event_id?: string
          hotel_id?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_versions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_versions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actual_cost: number | null
          beo_number: string | null
          cancel_reason: string | null
          client_id: string | null
          created_at: string
          created_by: string
          end_time: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          guest_count: number
          hotel_id: string
          id: string
          name: string
          notes: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          setup_time: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"]
          teardown_time: string | null
          theoretical_cost: number | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          actual_cost?: number | null
          beo_number?: string | null
          cancel_reason?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          end_time?: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          guest_count?: number
          hotel_id: string
          id?: string
          name: string
          notes?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          setup_time?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          teardown_time?: string | null
          theoretical_cost?: number | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          actual_cost?: number | null
          beo_number?: string | null
          cancel_reason?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          end_time?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          guest_count?: number
          hotel_id?: string
          id?: string
          name?: string
          notes?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          setup_time?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          teardown_time?: string | null
          theoretical_cost?: number | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      expiry_rules: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          max_days_after_opening: number | null
          max_days_ambient: number | null
          notes: string | null
          product_id: string | null
          treatment: Database["public"]["Enums"]["expiry_treatment"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          max_days_after_opening?: number | null
          max_days_ambient?: number | null
          notes?: string | null
          product_id?: string | null
          treatment?: Database["public"]["Enums"]["expiry_treatment"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          max_days_after_opening?: number | null
          max_days_ambient?: number | null
          notes?: string | null
          product_id?: string | null
          treatment?: Database["public"]["Enums"]["expiry_treatment"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expiry_rules_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiry_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipt_lines: {
        Row: {
          created_at: string
          expiry_date: string | null
          hotel_id: string
          id: string
          lot_number: string | null
          ocr_match_confidence: number | null
          ocr_product_name_extracted: string | null
          ocr_raw_text: string | null
          ocr_review_status:
            | Database["public"]["Enums"]["ocr_review_status"]
            | null
          order_line_id: string | null
          quality_status: Database["public"]["Enums"]["quality_status"]
          quantity_received: number
          receipt_id: string
          rejection_reason: string | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          hotel_id: string
          id?: string
          lot_number?: string | null
          ocr_match_confidence?: number | null
          ocr_product_name_extracted?: string | null
          ocr_raw_text?: string | null
          ocr_review_status?:
            | Database["public"]["Enums"]["ocr_review_status"]
            | null
          order_line_id?: string | null
          quality_status?: Database["public"]["Enums"]["quality_status"]
          quantity_received: number
          receipt_id: string
          rejection_reason?: string | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          hotel_id?: string
          id?: string
          lot_number?: string | null
          ocr_match_confidence?: number | null
          ocr_product_name_extracted?: string | null
          ocr_raw_text?: string | null
          ocr_review_status?:
            | Database["public"]["Enums"]["ocr_review_status"]
            | null
          order_line_id?: string | null
          quality_status?: Database["public"]["Enums"]["quality_status"]
          quantity_received?: number
          receipt_id?: string
          rejection_reason?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_lines_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_order_line_id_fkey"
            columns: ["order_line_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_lines_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          created_at: string
          delivery_note_image: string | null
          delivery_note_image_hash: string | null
          delivery_note_number: string | null
          hotel_id: string
          id: string
          notes: string | null
          ocr_data: Json | null
          order_id: string
          receipt_number: string
          received_at: string
          received_by: string
          temperature_check: boolean | null
        }
        Insert: {
          created_at?: string
          delivery_note_image?: string | null
          delivery_note_image_hash?: string | null
          delivery_note_number?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          ocr_data?: Json | null
          order_id: string
          receipt_number: string
          received_at?: string
          received_by: string
          temperature_check?: boolean | null
        }
        Update: {
          created_at?: string
          delivery_note_image?: string | null
          delivery_note_image_hash?: string | null
          delivery_note_number?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          ocr_data?: Json | null
          order_id?: string
          receipt_number?: string
          received_at?: string
          received_by?: string
          temperature_check?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          name: string
          slug: string
          tenant_id: string
          timezone: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          tenant_id: string
          timezone?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          tenant_id?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string
          hotel_id: string
          key: string
          response_body: Json | null
          status_code: number
        }
        Insert: {
          created_at?: string
          hotel_id: string
          key: string
          response_body?: Json | null
          status_code?: number
        }
        Update: {
          created_at?: string
          hotel_id?: string
          key?: string
          response_body?: Json | null
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "idempotency_keys_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      import_runs: {
        Row: {
          created_by: string
          errors: Json
          failed_rows: number
          finished_at: string | null
          hotel_id: string
          id: string
          kind: Database["public"]["Enums"]["import_kind"]
          ok_rows: number
          started_at: string
          status: Database["public"]["Enums"]["import_status"]
          total_rows: number
        }
        Insert: {
          created_by: string
          errors?: Json
          failed_rows?: number
          finished_at?: string | null
          hotel_id: string
          id?: string
          kind: Database["public"]["Enums"]["import_kind"]
          ok_rows?: number
          started_at?: string
          status?: Database["public"]["Enums"]["import_status"]
          total_rows?: number
        }
        Update: {
          created_by?: string
          errors?: Json
          failed_rows?: number
          finished_at?: string | null
          hotel_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["import_kind"]
          ok_rows?: number
          started_at?: string
          status?: Database["public"]["Enums"]["import_status"]
          total_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_runs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          hotel_id: string
          id: string
          pms_integration_id: string | null
          pos_integration_id: string | null
          records_failed: number
          records_synced: number
          request_payload: Json | null
          response_payload: Json | null
          started_at: string
          status: Database["public"]["Enums"]["sync_log_status"]
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          hotel_id: string
          id?: string
          pms_integration_id?: string | null
          pos_integration_id?: string | null
          records_failed?: number
          records_synced?: number
          request_payload?: Json | null
          response_payload?: Json | null
          started_at?: string
          status?: Database["public"]["Enums"]["sync_log_status"]
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          hotel_id?: string
          id?: string
          pms_integration_id?: string | null
          pos_integration_id?: string | null
          records_failed?: number
          records_synced?: number
          request_payload?: Json | null
          response_payload?: Json | null
          started_at?: string
          status?: Database["public"]["Enums"]["sync_log_status"]
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_sync_logs_pms_integration_id_fkey"
            columns: ["pms_integration_id"]
            isOneToOne: false
            referencedRelation: "pms_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_sync_logs_pos_integration_id_fkey"
            columns: ["pos_integration_id"]
            isOneToOne: false
            referencedRelation: "pos_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string
          email: string
          expires_at: string
          hotel_id: string
          id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          hotel_id: string
          id?: string
          revoked_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          hotel_id?: string
          id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_order_items: {
        Row: {
          created_at: string
          fired_at: string | null
          hotel_id: string
          id: string
          notes: string | null
          order_id: string
          ready_at: string | null
          recipe_id: string | null
          servings: number
          sort_order: number
          status: Database["public"]["Enums"]["ko_item_status"]
          title: string
        }
        Insert: {
          created_at?: string
          fired_at?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          order_id: string
          ready_at?: string | null
          recipe_id?: string | null
          servings?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["ko_item_status"]
          title: string
        }
        Update: {
          created_at?: string
          fired_at?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          ready_at?: string | null
          recipe_id?: string | null
          servings?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["ko_item_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_order_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "kitchen_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_order_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_orders: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          event_id: string | null
          fired_at: string | null
          hotel_id: string
          id: string
          notes: string | null
          sequence_number: number
          station: Database["public"]["Enums"]["department"]
          status: Database["public"]["Enums"]["ko_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          event_id?: string | null
          fired_at?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          sequence_number?: number
          station: Database["public"]["Enums"]["department"]
          status?: Database["public"]["Enums"]["ko_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          event_id?: string | null
          fired_at?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          sequence_number?: number
          station?: Database["public"]["Enums"]["department"]
          status?: Database["public"]["Enums"]["ko_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_orders_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_snapshots: {
        Row: {
          avg_cost_per_pax: number | null
          created_at: string
          events_completed: number
          events_total_pax: number
          expiring_lots: number
          hotel_id: string
          id: string
          inventory_value: number
          low_stock_products: number
          pending_orders: number
          snapshot_date: string
          total_actual_cost: number
          total_theoretical_cost: number
          waste_records_7d: number
        }
        Insert: {
          avg_cost_per_pax?: number | null
          created_at?: string
          events_completed?: number
          events_total_pax?: number
          expiring_lots?: number
          hotel_id: string
          id?: string
          inventory_value?: number
          low_stock_products?: number
          pending_orders?: number
          snapshot_date: string
          total_actual_cost?: number
          total_theoretical_cost?: number
          waste_records_7d?: number
        }
        Update: {
          avg_cost_per_pax?: number | null
          created_at?: string
          events_completed?: number
          events_total_pax?: number
          expiring_lots?: number
          hotel_id?: string
          id?: string
          inventory_value?: number
          low_stock_products?: number
          pending_orders?: number
          snapshot_date?: string
          total_actual_cost?: number
          total_theoretical_cost?: number
          waste_records_7d?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_snapshots_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          allergens: string[]
          barcode: string
          created_at: string
          created_by: string | null
          elaborated_at: string | null
          event_id: string | null
          expires_at: string
          hotel_id: string
          id: string
          is_printed: boolean
          label_type: Database["public"]["Enums"]["label_type"]
          location: string | null
          lot_id: string | null
          name_free: string | null
          opened_at: string | null
          origin: Database["public"]["Enums"]["label_origin"]
          printed_at: string | null
          product_id: string | null
          quantity: number
          recipe_id: string | null
          task_id: string | null
          treatment: Database["public"]["Enums"]["treatment_type"]
          unit: string
          updated_at: string
        }
        Insert: {
          allergens?: string[]
          barcode: string
          created_at?: string
          created_by?: string | null
          elaborated_at?: string | null
          event_id?: string | null
          expires_at: string
          hotel_id: string
          id?: string
          is_printed?: boolean
          label_type?: Database["public"]["Enums"]["label_type"]
          location?: string | null
          lot_id?: string | null
          name_free?: string | null
          opened_at?: string | null
          origin?: Database["public"]["Enums"]["label_origin"]
          printed_at?: string | null
          product_id?: string | null
          quantity?: number
          recipe_id?: string | null
          task_id?: string | null
          treatment?: Database["public"]["Enums"]["treatment_type"]
          unit?: string
          updated_at?: string
        }
        Update: {
          allergens?: string[]
          barcode?: string
          created_at?: string
          created_by?: string | null
          elaborated_at?: string | null
          event_id?: string | null
          expires_at?: string
          hotel_id?: string
          id?: string
          is_printed?: boolean
          label_type?: Database["public"]["Enums"]["label_type"]
          location?: string | null
          lot_id?: string | null
          name_free?: string | null
          opened_at?: string | null
          origin?: Database["public"]["Enums"]["label_origin"]
          printed_at?: string | null
          product_id?: string | null
          quantity?: number
          recipe_id?: string | null
          task_id?: string | null
          treatment?: Database["public"]["Enums"]["treatment_type"]
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "workflow_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_active: boolean
          is_default: boolean
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_section_recipes: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          price: number | null
          recipe_id: string
          section_id: string
          servings_override: number | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          price?: number | null
          recipe_id: string
          section_id: string
          servings_override?: number | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          price?: number | null
          recipe_id?: string
          section_id?: string
          servings_override?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_section_recipes_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_section_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_section_recipes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "menu_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_sections: {
        Row: {
          course_type: string | null
          created_at: string
          hotel_id: string
          id: string
          menu_id: string
          name: string
          sort_order: number
        }
        Insert: {
          course_type?: string | null
          created_at?: string
          hotel_id: string
          id?: string
          menu_id: string
          name: string
          sort_order?: number
        }
        Update: {
          course_type?: string | null
          created_at?: string
          hotel_id?: string
          id?: string
          menu_id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_sections_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_sections_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          hotel_id: string
          id: string
          is_active: boolean
          is_template: boolean
          menu_type: Database["public"]["Enums"]["menu_type"]
          name: string
          notes: string | null
          target_food_cost_pct: number | null
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          is_template?: boolean
          menu_type?: Database["public"]["Enums"]["menu_type"]
          name: string
          notes?: string | null
          target_food_cost_pct?: number | null
          total_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          is_template?: boolean
          menu_type?: Database["public"]["Enums"]["menu_type"]
          name?: string
          notes?: string | null
          target_food_cost_pct?: number | null
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      mise_en_place_items: {
        Row: {
          created_at: string
          description: string
          done_at: string | null
          done_by: string | null
          hotel_id: string
          id: string
          is_done: boolean
          list_id: string
          quantity: number | null
          recipe_id: string | null
          sort_order: number
          unit: string | null
        }
        Insert: {
          created_at?: string
          description: string
          done_at?: string | null
          done_by?: string | null
          hotel_id: string
          id?: string
          is_done?: boolean
          list_id: string
          quantity?: number | null
          recipe_id?: string | null
          sort_order?: number
          unit?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          done_at?: string | null
          done_by?: string | null
          hotel_id?: string
          id?: string
          is_done?: boolean
          list_id?: string
          quantity?: number | null
          recipe_id?: string | null
          sort_order?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mise_en_place_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mise_en_place_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "mise_en_place_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mise_en_place_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      mise_en_place_lists: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department"]
          hotel_id: string
          id: string
          title: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          hotel_id: string
          id?: string
          title: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          hotel_id?: string
          id?: string
          title?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mise_en_place_lists_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mise_en_place_lists_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email: boolean
          hotel_id: string
          id: string
          in_app: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: boolean
          hotel_id: string
          id?: string
          in_app?: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: boolean
          hotel_id?: string
          id?: string
          in_app?: boolean
          notification_type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          hotel_id: string
          id: string
          is_read: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          hotel_id: string
          id?: string
          is_read?: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          hotel_id?: string
          id?: string
          is_read?: boolean
          notification_type?: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel: {
        Row: {
          active: boolean
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          hotel_id: string
          id: string
          name: string
          notes: string | null
          role: Database["public"]["Enums"]["personnel_role"]
          secondary_roles: Database["public"]["Enums"]["personnel_role"][]
          updated_at: string
          weekly_hours: number
        }
        Insert: {
          active?: boolean
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          hotel_id: string
          id?: string
          name: string
          notes?: string | null
          role?: Database["public"]["Enums"]["personnel_role"]
          secondary_roles?: Database["public"]["Enums"]["personnel_role"][]
          updated_at?: string
          weekly_hours?: number
        }
        Update: {
          active?: boolean
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          hotel_id?: string
          id?: string
          name?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["personnel_role"]
          secondary_roles?: Database["public"]["Enums"]["personnel_role"][]
          updated_at?: string
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "personnel_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      pms_integrations: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          credentials: Json
          hotel_id: string
          id: string
          is_active: boolean
          last_error: string | null
          last_sync_at: string | null
          name: string
          pms_type: Database["public"]["Enums"]["pms_type"]
          status: Database["public"]["Enums"]["integration_status"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          credentials?: Json
          hotel_id: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          name: string
          pms_type: Database["public"]["Enums"]["pms_type"]
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          credentials?: Json
          hotel_id?: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          name?: string
          pms_type?: Database["public"]["Enums"]["pms_type"]
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pms_integrations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_integrations: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          credentials: Json
          hotel_id: string
          id: string
          is_active: boolean
          last_error: string | null
          last_sync_at: string | null
          name: string
          pos_type: Database["public"]["Enums"]["pos_type"]
          status: Database["public"]["Enums"]["integration_status"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          credentials?: Json
          hotel_id: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          name: string
          pos_type: Database["public"]["Enums"]["pos_type"]
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          credentials?: Json
          hotel_id?: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          name?: string
          pos_type?: Database["public"]["Enums"]["pos_type"]
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_integrations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      price_change_log: {
        Row: {
          applied_recipe_count: number | null
          applied_to_recipes_at: string | null
          delta_pct: number | null
          detected_at: string
          hotel_id: string
          id: string
          new_unit_price: number
          old_unit_price: number | null
          product_id: string
          source: string
          source_ref_id: string | null
        }
        Insert: {
          applied_recipe_count?: number | null
          applied_to_recipes_at?: string | null
          delta_pct?: number | null
          detected_at?: string
          hotel_id: string
          id?: string
          new_unit_price: number
          old_unit_price?: number | null
          product_id: string
          source: string
          source_ref_id?: string | null
        }
        Update: {
          applied_recipe_count?: number | null
          applied_to_recipes_at?: string | null
          delta_pct?: number | null
          detected_at?: string
          hotel_id?: string
          id?: string
          new_unit_price?: number
          old_unit_price?: number | null
          product_id?: string
          source?: string
          source_ref_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_change_log_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_change_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          new_price: number
          offer_id: string | null
          old_price: number | null
          product_id: string
          recorded_at: string
          supplier_id: string
          variation_pct: number | null
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          new_price: number
          offer_id?: string | null
          old_price?: number | null
          product_id: string
          recorded_at?: string
          supplier_id: string
          variation_pct?: number | null
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          new_price?: number
          offer_id?: string | null
          old_price?: number | null
          product_id?: string
          recorded_at?: string
          supplier_id?: string
          variation_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "supplier_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_aliases: {
        Row: {
          alias_name: string
          confidence_score: number
          created_at: string
          hotel_id: string
          id: string
          product_id: string
          source_type: Database["public"]["Enums"]["alias_source"]
        }
        Insert: {
          alias_name: string
          confidence_score?: number
          created_at?: string
          hotel_id: string
          id?: string
          product_id: string
          source_type?: Database["public"]["Enums"]["alias_source"]
        }
        Update: {
          alias_name?: string
          confidence_score?: number
          created_at?: string
          hotel_id?: string
          id?: string
          product_id?: string
          source_type?: Database["public"]["Enums"]["alias_source"]
        }
        Relationships: [
          {
            foreignKeyName: "product_aliases_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_aliases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_supplier_refs: {
        Row: {
          conversion_factor: number
          created_at: string
          hotel_id: string
          id: string
          notes: string | null
          product_id: string
          purchase_unit_id: string | null
          supplier_code: string
          supplier_id: string
          supplier_name: string | null
          updated_at: string
        }
        Insert: {
          conversion_factor?: number
          created_at?: string
          hotel_id: string
          id?: string
          notes?: string | null
          product_id: string
          purchase_unit_id?: string | null
          supplier_code: string
          supplier_id: string
          supplier_name?: string | null
          updated_at?: string
        }
        Update: {
          conversion_factor?: number
          created_at?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          purchase_unit_id?: string | null
          supplier_code?: string
          supplier_id?: string
          supplier_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_supplier_refs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_supplier_refs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_supplier_refs_purchase_unit_id_fkey"
            columns: ["purchase_unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_supplier_refs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      production_plan_items: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"]
          event_id: string | null
          hotel_id: string
          id: string
          notes: string | null
          plan_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          recipe_id: string | null
          servings_needed: number
          sort_order: number
          started_at: string | null
          status: Database["public"]["Enums"]["plan_item_status"]
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          event_id?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          plan_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          recipe_id?: string | null
          servings_needed?: number
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["plan_item_status"]
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          event_id?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          plan_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          recipe_id?: string | null
          servings_needed?: number
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["plan_item_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_plan_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plan_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "production_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      production_plans: {
        Row: {
          created_at: string
          created_by: string
          hotel_id: string
          id: string
          notes: string | null
          plan_date: string
          status: Database["public"]["Enums"]["plan_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          hotel_id: string
          id?: string
          notes?: string | null
          plan_date: string
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          plan_date?: string
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_plans_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      production_tasks: {
        Row: {
          assigned_to: string | null
          blocked_reason: string | null
          completed_at: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"]
          description: string | null
          event_id: string | null
          hotel_id: string
          id: string
          plan_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          sort_order: number
          started_at: string | null
          status: Database["public"]["Enums"]["plan_item_status"]
          title: string
        }
        Insert: {
          assigned_to?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          description?: string | null
          event_id?: string | null
          hotel_id: string
          id?: string
          plan_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["plan_item_status"]
          title: string
        }
        Update: {
          assigned_to?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          description?: string | null
          event_id?: string | null
          hotel_id?: string
          id?: string
          plan_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["plan_item_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "production_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allergens: Json
          category_id: string | null
          created_at: string
          default_unit_id: string | null
          description: string | null
          hotel_id: string
          id: string
          is_active: boolean
          max_stock: number | null
          min_stock: number | null
          name: string
          reorder_point: number | null
          shelf_life_days: number | null
          sku: string | null
          storage_type: Database["public"]["Enums"]["storage_type"]
          updated_at: string
        }
        Insert: {
          allergens?: Json
          category_id?: string | null
          created_at?: string
          default_unit_id?: string | null
          description?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          max_stock?: number | null
          min_stock?: number | null
          name: string
          reorder_point?: number | null
          shelf_life_days?: number | null
          sku?: string | null
          storage_type?: Database["public"]["Enums"]["storage_type"]
          updated_at?: string
        }
        Update: {
          allergens?: Json
          category_id?: string | null
          created_at?: string
          default_unit_id?: string | null
          description?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          reorder_point?: number | null
          shelf_life_days?: number | null
          sku?: string | null
          storage_type?: Database["public"]["Enums"]["storage_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_default_unit_id_fkey"
            columns: ["default_unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_lines: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          notes: string | null
          order_id: string
          product_id: string
          quantity_ordered: number
          quantity_received: number
          sort_order: number
          unit_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          notes?: string | null
          order_id: string
          product_id: string
          quantity_ordered: number
          quantity_received?: number
          sort_order?: number
          unit_id?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string
          quantity_ordered?: number
          quantity_received?: number
          sort_order?: number
          unit_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_lines_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_lines_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          cancel_reason: string | null
          created_at: string
          created_by: string
          expected_delivery_date: string | null
          hotel_id: string
          id: string
          notes: string | null
          order_number: string
          payment_terms: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["po_status"]
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          cancel_reason?: string | null
          created_at?: string
          created_by: string
          expected_delivery_date?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          order_number: string
          payment_terms?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          cancel_reason?: string | null
          created_at?: string
          created_by?: string
          expected_delivery_date?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_terms?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_lines: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          notes: string | null
          product_id: string
          quantity_requested: number
          request_id: string
          sort_order: number
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          notes?: string | null
          product_id: string
          quantity_requested: number
          request_id: string
          sort_order?: number
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity_requested?: number
          request_id?: string
          sort_order?: number
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_lines_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_lines_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_lines_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          cancel_reason: string | null
          created_at: string
          event_id: string | null
          hotel_id: string
          id: string
          notes: string | null
          request_number: string
          requested_by: string
          status: Database["public"]["Enums"]["pr_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          cancel_reason?: string | null
          created_at?: string
          event_id?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          request_number: string
          requested_by: string
          status?: Database["public"]["Enums"]["pr_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          cancel_reason?: string | null
          created_at?: string
          event_id?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          request_number?: string
          requested_by?: string
          status?: Database["public"]["Enums"]["pr_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_buckets: {
        Row: {
          bucket_key: string
          refill_at: string
          tokens: number
          updated_at: string
        }
        Insert: {
          bucket_key: string
          refill_at: string
          tokens: number
          updated_at?: string
        }
        Update: {
          bucket_key?: string
          refill_at?: string
          tokens?: number
          updated_at?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          ingredient_name: string
          preparation_notes: string | null
          product_id: string | null
          quantity_gross: number
          quantity_net: number | null
          recipe_id: string
          sort_order: number
          unit_cost: number
          unit_id: string | null
          waste_pct: number
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          ingredient_name: string
          preparation_notes?: string | null
          product_id?: string | null
          quantity_gross: number
          quantity_net?: number | null
          recipe_id: string
          sort_order?: number
          unit_cost?: number
          unit_id?: string | null
          waste_pct?: number
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          ingredient_name?: string
          preparation_notes?: string | null
          product_id?: string | null
          quantity_gross?: number
          quantity_net?: number | null
          recipe_id?: string
          sort_order?: number
          unit_cost?: number
          unit_id?: string | null
          waste_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_ingredient_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          created_at: string
          duration_min: number | null
          equipment: string | null
          hotel_id: string
          id: string
          instruction: string
          notes: string | null
          recipe_id: string
          step_number: number
          temperature: string | null
        }
        Insert: {
          created_at?: string
          duration_min?: number | null
          equipment?: string | null
          hotel_id: string
          id?: string
          instruction: string
          notes?: string | null
          recipe_id: string
          step_number: number
          temperature?: string | null
        }
        Update: {
          created_at?: string
          duration_min?: number | null
          equipment?: string | null
          hotel_id?: string
          id?: string
          instruction?: string
          notes?: string | null
          recipe_id?: string
          step_number?: number
          temperature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_sub_recipes: {
        Row: {
          created_at: string
          id: string
          quantity: number
          recipe_id: string
          sub_recipe_id: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          recipe_id: string
          sub_recipe_id: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          recipe_id?: string
          sub_recipe_id?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_sub_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_sub_recipes_sub_recipe_id_fkey"
            columns: ["sub_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_sub_recipes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_versions: {
        Row: {
          change_reason: string | null
          changed_by: string
          created_at: string
          data: Json
          hotel_id: string
          id: string
          recipe_id: string
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string
          created_at?: string
          data: Json
          hotel_id: string
          id?: string
          recipe_id: string
          version_number: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string
          created_at?: string
          data?: Json
          hotel_id?: string
          id?: string
          recipe_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_versions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergens: Json
          approved_at: string | null
          approved_by: string | null
          category: Database["public"]["Enums"]["recipe_category"]
          cook_time_min: number | null
          cost_per_serving: number
          created_at: string
          created_by: string
          description: string | null
          dietary_tags: Json
          difficulty: Database["public"]["Enums"]["recipe_difficulty"]
          food_cost_pct: number
          hotel_id: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          prep_time_min: number | null
          rest_time_min: number | null
          servings: number
          status: Database["public"]["Enums"]["recipe_status"]
          subcategory: string | null
          target_price: number | null
          total_cost: number
          unit_cost: number | null
          updated_at: string
          yield_pct: number | null
          yield_qty: number | null
          yield_unit_id: string | null
        }
        Insert: {
          allergens?: Json
          approved_at?: string | null
          approved_by?: string | null
          category: Database["public"]["Enums"]["recipe_category"]
          cook_time_min?: number | null
          cost_per_serving?: number
          created_at?: string
          created_by?: string
          description?: string | null
          dietary_tags?: Json
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"]
          food_cost_pct?: number
          hotel_id: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          prep_time_min?: number | null
          rest_time_min?: number | null
          servings?: number
          status?: Database["public"]["Enums"]["recipe_status"]
          subcategory?: string | null
          target_price?: number | null
          total_cost?: number
          unit_cost?: number | null
          updated_at?: string
          yield_pct?: number | null
          yield_qty?: number | null
          yield_unit_id?: string | null
        }
        Update: {
          allergens?: Json
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["recipe_category"]
          cook_time_min?: number | null
          cost_per_serving?: number
          created_at?: string
          created_by?: string
          description?: string | null
          dietary_tags?: Json
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"]
          food_cost_pct?: number
          hotel_id?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          prep_time_min?: number | null
          rest_time_min?: number | null
          servings?: number
          status?: Database["public"]["Enums"]["recipe_status"]
          subcategory?: string | null
          target_price?: number | null
          total_cost?: number
          unit_cost?: number | null
          updated_at?: string
          yield_pct?: number | null
          yield_qty?: number | null
          yield_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_yield_unit_id_fkey"
            columns: ["yield_unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_task_templates: {
        Row: {
          byweekday: Json
          created_at: string
          department: Database["public"]["Enums"]["department"]
          description: string | null
          estimated_minutes: number | null
          hotel_id: string
          id: string
          is_active: boolean
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at: string
        }
        Insert: {
          byweekday?: Json
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          description?: string | null
          estimated_minutes?: number | null
          hotel_id: string
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at?: string
        }
        Update: {
          byweekday?: Json
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          description?: string | null
          estimated_minutes?: number | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_task_templates_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_assignments: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          notes: string | null
          origin: Database["public"]["Enums"]["schedule_origin"]
          personnel_id: string
          rule_id: string | null
          shift_id: string
          status: Database["public"]["Enums"]["schedule_status"]
          updated_at: string
          work_date: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          notes?: string | null
          origin?: Database["public"]["Enums"]["schedule_origin"]
          personnel_id: string
          rule_id?: string | null
          shift_id: string
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
          work_date: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          origin?: Database["public"]["Enums"]["schedule_origin"]
          personnel_id?: string
          rule_id?: string | null
          shift_id?: string
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignments_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "schedule_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shift_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_rules: {
        Row: {
          active: boolean
          created_at: string
          days_of_week: number[]
          hotel_id: string
          id: string
          max_persons: number | null
          min_persons: number
          priority: string
          role: Database["public"]["Enums"]["personnel_role"]
          shift_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          days_of_week: number[]
          hotel_id: string
          id?: string
          max_persons?: number | null
          min_persons?: number
          priority?: string
          role: Database["public"]["Enums"]["personnel_role"]
          shift_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          days_of_week?: number[]
          hotel_id?: string
          id?: string
          max_persons?: number | null
          min_persons?: number
          priority?: string
          role?: Database["public"]["Enums"]["personnel_role"]
          shift_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_rules_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_rules_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shift_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_definitions: {
        Row: {
          active: boolean
          created_at: string
          end_time: string
          hotel_id: string
          id: string
          name: string
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_time: string
          hotel_id: string
          id?: string
          name: string
          shift_type?: Database["public"]["Enums"]["shift_type"]
          start_time: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          end_time?: string
          hotel_id?: string
          id?: string
          name?: string
          shift_type?: Database["public"]["Enums"]["shift_type"]
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_definitions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_count_lines: {
        Row: {
          adjustment_applied: boolean
          count_id: string
          counted_qty: number | null
          created_at: string
          expected_qty: number | null
          hotel_id: string
          id: string
          lot_id: string | null
          notes: string | null
          product_id: string
          submitted_at: string | null
          submitted_by: string | null
          variance_qty: number | null
        }
        Insert: {
          adjustment_applied?: boolean
          count_id: string
          counted_qty?: number | null
          created_at?: string
          expected_qty?: number | null
          hotel_id: string
          id?: string
          lot_id?: string | null
          notes?: string | null
          product_id: string
          submitted_at?: string | null
          submitted_by?: string | null
          variance_qty?: number | null
        }
        Update: {
          adjustment_applied?: boolean
          count_id?: string
          counted_qty?: number | null
          created_at?: string
          expected_qty?: number | null
          hotel_id?: string
          id?: string
          lot_id?: string | null
          notes?: string | null
          product_id?: string
          submitted_at?: string | null
          submitted_by?: string | null
          variance_qty?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_count_lines_count_id_fkey"
            columns: ["count_id"]
            isOneToOne: false
            referencedRelation: "stock_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_lines_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_lines_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_counts: {
        Row: {
          closed_at: string | null
          count_type: Database["public"]["Enums"]["count_type"]
          created_at: string
          created_by: string
          hotel_id: string
          id: string
          is_blind: boolean
          label: string | null
          location_id: string | null
          notes: string | null
          reviewed_by: string | null
          started_at: string
          status: Database["public"]["Enums"]["count_status"]
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          count_type?: Database["public"]["Enums"]["count_type"]
          created_at?: string
          created_by: string
          hotel_id: string
          id?: string
          is_blind?: boolean
          label?: string | null
          location_id?: string | null
          notes?: string | null
          reviewed_by?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["count_status"]
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          count_type?: Database["public"]["Enums"]["count_type"]
          created_at?: string
          created_by?: string
          hotel_id?: string
          id?: string
          is_blind?: boolean
          label?: string | null
          location_id?: string | null
          notes?: string | null
          reviewed_by?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["count_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_counts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_counts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_lots: {
        Row: {
          created_at: string
          current_quantity: number
          expiry_date: string | null
          goods_receipt_line_id: string | null
          hotel_id: string
          id: string
          initial_quantity: number
          lot_number: string | null
          product_id: string
          received_at: string
          storage_location_id: string | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          current_quantity: number
          expiry_date?: string | null
          goods_receipt_line_id?: string | null
          hotel_id: string
          id?: string
          initial_quantity: number
          lot_number?: string | null
          product_id: string
          received_at?: string
          storage_location_id?: string | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          current_quantity?: number
          expiry_date?: string | null
          goods_receipt_line_id?: string | null
          hotel_id?: string
          id?: string
          initial_quantity?: number
          lot_number?: string | null
          product_id?: string
          received_at?: string
          storage_location_id?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_lots_goods_receipt_line_id_fkey"
            columns: ["goods_receipt_line_id"]
            isOneToOne: false
            referencedRelation: "goods_receipt_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_lots_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_lots_storage_location_id_fkey"
            columns: ["storage_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string
          from_location_id: string | null
          hotel_id: string
          id: string
          lot_id: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          to_location_id: string | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          from_location_id?: string | null
          hotel_id: string
          id?: string
          lot_id?: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          to_location_id?: string | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          from_location_id?: string | null
          hotel_id?: string
          id?: string
          lot_id?: string | null
          movement_type?: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          to_location_id?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_reservations: {
        Row: {
          created_at: string
          created_by: string
          event_id: string
          hotel_id: string
          id: string
          is_shortfall: boolean
          lot_id: string | null
          notes: string | null
          product_id: string
          qty_consumed: number
          qty_reserved: number
          status: Database["public"]["Enums"]["reservation_status"]
          unit_cost_at_reservation: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id: string
          hotel_id: string
          id?: string
          is_shortfall?: boolean
          lot_id?: string | null
          notes?: string | null
          product_id: string
          qty_consumed?: number
          qty_reserved: number
          status?: Database["public"]["Enums"]["reservation_status"]
          unit_cost_at_reservation?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string
          hotel_id?: string
          id?: string
          is_shortfall?: boolean
          lot_id?: string | null
          notes?: string | null
          product_id?: string
          qty_consumed?: number
          qty_reserved?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          unit_cost_at_reservation?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_locations: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_active: boolean
          location_type: Database["public"]["Enums"]["location_type"]
          name: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_active?: boolean
          location_type?: Database["public"]["Enums"]["location_type"]
          name: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          location_type?: Database["public"]["Enums"]["location_type"]
          name?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "storage_locations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_configs: {
        Row: {
          allows_urgent_delivery: boolean
          created_at: string
          cutoff_time: string | null
          delivery_days: Json
          hotel_id: string
          id: string
          lead_time_hours: number | null
          min_order_amount: number | null
          min_order_units: number | null
          reception_window_end: string | null
          reception_window_start: string | null
          supplier_id: string
          updated_at: string
        }
        Insert: {
          allows_urgent_delivery?: boolean
          created_at?: string
          cutoff_time?: string | null
          delivery_days?: Json
          hotel_id: string
          id?: string
          lead_time_hours?: number | null
          min_order_amount?: number | null
          min_order_units?: number | null
          reception_window_end?: string | null
          reception_window_start?: string | null
          supplier_id: string
          updated_at?: string
        }
        Update: {
          allows_urgent_delivery?: boolean
          created_at?: string
          cutoff_time?: string | null
          delivery_days?: Json
          hotel_id?: string
          id?: string
          lead_time_hours?: number | null
          min_order_amount?: number | null
          min_order_units?: number | null
          reception_window_end?: string | null
          reception_window_start?: string | null
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_configs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_configs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_incidents: {
        Row: {
          created_at: string
          description: string | null
          hotel_id: string
          id: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          occurred_at: string
          purchase_order_id: string | null
          recorded_by: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          supplier_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hotel_id: string
          id?: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          occurred_at?: string
          purchase_order_id?: string | null
          recorded_by?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          supplier_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hotel_id?: string
          id?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          occurred_at?: string
          purchase_order_id?: string | null
          recorded_by?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_incidents_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_incidents_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_incidents_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_offers: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_preferred: boolean
          min_quantity: number | null
          notes: string | null
          product_id: string
          sku_supplier: string | null
          supplier_id: string
          unit_id: string | null
          unit_price: number
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_preferred?: boolean
          min_quantity?: number | null
          notes?: string | null
          product_id: string
          sku_supplier?: string | null
          supplier_id: string
          unit_id?: string | null
          unit_price: number
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_preferred?: boolean
          min_quantity?: number | null
          notes?: string | null
          product_id?: string
          sku_supplier?: string | null
          supplier_id?: string
          unit_id?: string | null
          unit_price?: number
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_offers_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_offers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_offers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          delivery_days: Json
          email: string | null
          hotel_id: string
          id: string
          is_active: boolean
          min_order_amount: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          delivery_days?: Json
          email?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          delivery_days?: Json
          email?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      temperature_logs: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_within_range: boolean | null
          location: string
          logged_at: string
          logged_by: string | null
          lot_id: string | null
          max_allowed: number | null
          min_allowed: number | null
          notes: string | null
          product_id: string | null
          temperature: number
          unit: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_within_range?: boolean | null
          location: string
          logged_at?: string
          logged_by?: string | null
          lot_id?: string | null
          max_allowed?: number | null
          min_allowed?: number | null
          notes?: string | null
          product_id?: string | null
          temperature: number
          unit?: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_within_range?: boolean | null
          location?: string
          logged_at?: string
          logged_by?: string | null
          lot_id?: string | null
          max_allowed?: number | null
          min_allowed?: number | null
          notes?: string | null
          product_id?: string | null
          temperature?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "temperature_logs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperature_logs_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperature_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
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
      units_of_measure: {
        Row: {
          abbreviation: string
          base_unit_id: string | null
          conversion_factor: number
          created_at: string
          hotel_id: string
          id: string
          is_default: boolean
          name: string
          unit_type: Database["public"]["Enums"]["unit_type"]
        }
        Insert: {
          abbreviation: string
          base_unit_id?: string | null
          conversion_factor?: number
          created_at?: string
          hotel_id: string
          id?: string
          is_default?: boolean
          name: string
          unit_type: Database["public"]["Enums"]["unit_type"]
        }
        Update: {
          abbreviation?: string
          base_unit_id?: string | null
          conversion_factor?: number
          created_at?: string
          hotel_id?: string
          id?: string
          is_default?: boolean
          name?: string
          unit_type?: Database["public"]["Enums"]["unit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "units_of_measure_base_unit_id_fkey"
            columns: ["base_unit_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_of_measure_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_records: {
        Row: {
          created_at: string
          department: string | null
          hotel_id: string
          id: string
          lot_id: string | null
          product_id: string
          quantity: number
          reason: string | null
          recorded_by: string
          waste_type: Database["public"]["Enums"]["waste_type"]
        }
        Insert: {
          created_at?: string
          department?: string | null
          hotel_id: string
          id?: string
          lot_id?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          recorded_by: string
          waste_type: Database["public"]["Enums"]["waste_type"]
        }
        Update: {
          created_at?: string
          department?: string | null
          hotel_id?: string
          id?: string
          lot_id?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          recorded_by?: string
          waste_type?: Database["public"]["Enums"]["waste_type"]
        }
        Relationships: [
          {
            foreignKeyName: "waste_records_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_records_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_tasks: {
        Row: {
          actual_minutes: number | null
          assigned_to: string | null
          blocked_reason: string | null
          completed_at: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"]
          depends_on_task_id: string | null
          description: string | null
          estimated_minutes: number | null
          hotel_id: string
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          sort_order: number
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          actual_minutes?: number | null
          assigned_to?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          depends_on_task_id?: string | null
          description?: string | null
          estimated_minutes?: number | null
          hotel_id: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          actual_minutes?: number | null
          assigned_to?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          depends_on_task_id?: string | null
          description?: string | null
          estimated_minutes?: number | null
          hotel_id?: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_tasks_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "workflow_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_tasks_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_tasks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string
          event_id: string | null
          hotel_id: string
          id: string
          name: string
          notes: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id?: string | null
          hotel_id: string
          id?: string
          name: string
          notes?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string | null
          hotel_id?: string
          id?: string
          name?: string
          notes?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "production_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _calculate_recipe_cost_recursive: {
        Args: {
          p_depth: number
          p_hotel_id: string
          p_recipe_id: string
          p_visited_ids: string[]
        }
        Returns: Json
      }
      _create_agent_suggestion: {
        Args: {
          p_action: Database["public"]["Enums"]["suggestion_action"]
          p_action_payload: Json
          p_agent_type: Database["public"]["Enums"]["agent_type"]
          p_context_id?: string
          p_context_type?: string
          p_description: string
          p_evidence: Json
          p_expires_hours?: number
          p_hotel_id: string
          p_title: string
        }
        Returns: string
      }
      _recalc_recipes_using_product: {
        Args: {
          p_hotel_id: string
          p_new_unit_price: number
          p_product_id: string
        }
        Returns: number
      }
      accept_invite: { Args: { p_token: string }; Returns: Json }
      add_kitchen_order_item: {
        Args: {
          p_hotel_id: string
          p_notes?: string
          p_order_id: string
          p_recipe_id?: string
          p_servings?: number
          p_title: string
        }
        Returns: string
      }
      adjust_stock: {
        Args: {
          p_hotel_id: string
          p_lot_id: string
          p_new_quantity: number
          p_reason: string
        }
        Returns: undefined
      }
      approve_purchase_request: {
        Args: { p_hotel_id: string; p_request_id: string }
        Returns: undefined
      }
      approve_recipe: {
        Args: { p_hotel_id: string; p_recipe_id: string }
        Returns: undefined
      }
      approve_suggestion: {
        Args: { p_hotel_id: string; p_suggestion_id: string }
        Returns: Json
      }
      assign_workflow_task: {
        Args: { p_hotel_id: string; p_task_id: string; p_user_id: string }
        Returns: undefined
      }
      block_workflow_task: {
        Args: { p_hotel_id: string; p_reason: string; p_task_id: string }
        Returns: undefined
      }
      calculate_event_cost_estimate: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: number
      }
      calculate_real_cost: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: number
      }
      calculate_recipe_cost: {
        Args: { p_hotel_id: string; p_recipe_id: string }
        Returns: Json
      }
      cancel_job: {
        Args: { p_hotel_id: string; p_job_id: string }
        Returns: undefined
      }
      category_to_department: {
        Args: { p_cat: Database["public"]["Enums"]["recipe_category"] }
        Returns: Database["public"]["Enums"]["department"]
      }
      check_idempotency: {
        Args: { p_hotel_id: string; p_key: string }
        Returns: {
          found: boolean
          response_body: Json
          status_code: number
        }[]
      }
      check_membership:
        | {
            Args: { p_hotel_id: string }
            Returns: Database["public"]["Enums"]["app_role"]
          }
        | {
            Args: {
              p_hotel_id: string
              p_required_roles?: Database["public"]["Enums"]["app_role"][]
              p_user_id: string
            }
            Returns: Database["public"]["Enums"]["app_role"]
          }
      check_stock_alerts: { Args: { p_hotel_id: string }; Returns: Json }
      claim_next_job: {
        Args: { p_worker_id?: string }
        Returns: {
          attempts: number
          hotel_id: string
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          payload: Json
        }[]
      }
      cleanup_idempotency_keys: { Args: never; Returns: number }
      compare_supplier_prices: {
        Args: { p_hotel_id: string; p_product_ids: string[] }
        Returns: Json
      }
      complete_job: {
        Args: { p_job_id: string; p_result?: Json }
        Returns: undefined
      }
      complete_workflow_task: {
        Args: {
          p_actual_minutes?: number
          p_hotel_id: string
          p_task_id: string
        }
        Returns: undefined
      }
      consume_rate_limit: {
        Args: { p_key: string; p_max_tokens: number; p_window_seconds: number }
        Returns: {
          allowed: boolean
          remaining: number
          reset_at: string
        }[]
      }
      consume_reservation: {
        Args: { p_hotel_id: string; p_qty: number; p_reservation_id: string }
        Returns: undefined
      }
      create_appcc_record: {
        Args: {
          p_corrective_action_taken?: string
          p_event_id?: string
          p_hotel_id: string
          p_observations?: string
          p_record_date?: string
          p_status: Database["public"]["Enums"]["appcc_record_status"]
          p_template_id: string
          p_value_measured?: string
        }
        Returns: string
      }
      create_event: {
        Args: {
          p_client_id?: string
          p_end_time?: string
          p_event_date: string
          p_event_type: Database["public"]["Enums"]["event_type"]
          p_guest_count: number
          p_hotel_id: string
          p_name: string
          p_notes?: string
          p_service_type: Database["public"]["Enums"]["service_type"]
          p_start_time?: string
          p_venue?: string
        }
        Returns: string
      }
      create_hotel: {
        Args: {
          p_currency?: string
          p_name: string
          p_slug: string
          p_tenant_id: string
          p_timezone?: string
        }
        Returns: string
      }
      create_invite: {
        Args: {
          p_email: string
          p_hotel_id: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      create_kitchen_order: {
        Args: {
          p_event_id?: string
          p_hotel_id: string
          p_notes?: string
          p_station: Database["public"]["Enums"]["department"]
        }
        Returns: string
      }
      create_label: {
        Args: {
          p_allergens?: string[]
          p_elaborated_at?: string
          p_event_id?: string
          p_expires_at: string
          p_hotel_id: string
          p_label_type: Database["public"]["Enums"]["label_type"]
          p_location?: string
          p_lot_id?: string
          p_name_free?: string
          p_opened_at?: string
          p_origin?: Database["public"]["Enums"]["label_origin"]
          p_product_id?: string
          p_quantity?: number
          p_recipe_id?: string
          p_task_id?: string
          p_treatment?: Database["public"]["Enums"]["treatment_type"]
          p_unit?: string
        }
        Returns: {
          barcode: string
          label_id: string
        }[]
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_body?: string
          p_hotel_id: string
          p_severity: Database["public"]["Enums"]["alert_severity"]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      create_personnel: {
        Args: {
          p_contract_type?: Database["public"]["Enums"]["contract_type"]
          p_hotel_id: string
          p_name: string
          p_notes?: string
          p_role: Database["public"]["Enums"]["personnel_role"]
          p_weekly_hours?: number
        }
        Returns: string
      }
      create_pms_integration: {
        Args: {
          p_config?: Json
          p_credentials: Json
          p_hotel_id: string
          p_name: string
          p_pms_type: Database["public"]["Enums"]["pms_type"]
        }
        Returns: string
      }
      create_pos_integration: {
        Args: {
          p_config?: Json
          p_credentials: Json
          p_hotel_id: string
          p_name: string
          p_pos_type: Database["public"]["Enums"]["pos_type"]
        }
        Returns: string
      }
      create_purchase_request: {
        Args: {
          p_event_id?: string
          p_hotel_id: string
          p_lines?: Json
          p_notes?: string
          p_urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Returns: string
      }
      create_schedule_rule: {
        Args: {
          p_days_of_week: number[]
          p_hotel_id: string
          p_max_persons?: number
          p_min_persons?: number
          p_priority?: string
          p_role: Database["public"]["Enums"]["personnel_role"]
          p_shift_id: string
        }
        Returns: string
      }
      create_shift_definition: {
        Args: {
          p_end_time: string
          p_hotel_id: string
          p_name: string
          p_shift_type?: Database["public"]["Enums"]["shift_type"]
          p_start_time: string
        }
        Returns: string
      }
      create_tenant_with_hotel: {
        Args: {
          p_currency?: string
          p_hotel_name: string
          p_hotel_slug: string
          p_tenant_name: string
          p_timezone?: string
        }
        Returns: Json
      }
      deactivate_member: {
        Args: { p_hotel_id: string; p_target_user_id: string }
        Returns: undefined
      }
      delete_assignment: { Args: { p_id: string }; Returns: undefined }
      delete_schedule_rule: { Args: { p_id: string }; Returns: undefined }
      deprecate_recipe: {
        Args: { p_hotel_id: string; p_recipe_id: string }
        Returns: undefined
      }
      disable_pms_integration: {
        Args: { p_hotel_id: string; p_integration_id: string }
        Returns: undefined
      }
      disable_pos_integration: {
        Args: { p_hotel_id: string; p_integration_id: string }
        Returns: undefined
      }
      dismiss_alert: {
        Args: { p_alert_id: string; p_hotel_id: string }
        Returns: undefined
      }
      duplicate_recipe: {
        Args: { p_hotel_id: string; p_recipe_id: string }
        Returns: string
      }
      emit_event: {
        Args: {
          p_aggregate_id: string
          p_aggregate_type: string
          p_dedup_window_seconds?: number
          p_event_type: string
          p_hotel_id: string
          p_payload?: Json
        }
        Returns: string
      }
      enqueue_job: {
        Args: {
          p_hotel_id: string
          p_job_type: Database["public"]["Enums"]["job_type"]
          p_payload?: Json
          p_scheduled_at?: string
        }
        Returns: string
      }
      fail_job: {
        Args: { p_error: string; p_job_id: string; p_retry?: boolean }
        Returns: undefined
      }
      generate_daily_snapshot: { Args: { p_hotel_id: string }; Returns: string }
      generate_event_operational_impact: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: number
      }
      generate_event_workflow: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: string
      }
      generate_monthly_schedule: {
        Args: { p_hotel_id: string; p_month: number; p_year: number }
        Returns: number
      }
      generate_production_plan: {
        Args: { p_date: string; p_hotel_id: string }
        Returns: string
      }
      generate_purchase_order: {
        Args: {
          p_expected_delivery?: string
          p_hotel_id: string
          p_notes?: string
          p_payment_terms?: string
          p_request_ids: string[]
          p_supplier_id: string
        }
        Returns: string
      }
      generate_shopping_list: {
        Args: { p_date: string; p_hotel_id: string }
        Returns: Json
      }
      generate_tasks_from_recurring_templates: {
        Args: { p_date?: string; p_hotel_id: string }
        Returns: number
      }
      get_active_alerts: {
        Args: { p_hotel_id: string; p_limit?: number }
        Returns: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          details: Json
          id: string
          message: string
          related_entity_id: string
          related_entity_type: string
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
        }[]
      }
      get_active_hotel: { Args: never; Returns: Json }
      get_agent_configs: {
        Args: { p_hotel_id: string }
        Returns: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          config: Json
          is_active: boolean
        }[]
      }
      get_agent_suggestions: {
        Args: {
          p_hotel_id: string
          p_limit?: number
          p_status?: Database["public"]["Enums"]["suggestion_status"]
        }
        Returns: {
          action: Database["public"]["Enums"]["suggestion_action"]
          action_payload: Json
          agent_type: Database["public"]["Enums"]["agent_type"]
          context_id: string
          context_type: string
          created_at: string
          description: string
          evidence: Json
          expires_at: string
          id: string
          review_note: string
          reviewed_at: string
          reviewed_by: string
          status: Database["public"]["Enums"]["suggestion_status"]
          title: string
        }[]
      }
      get_appcc_records: {
        Args: {
          p_category?: Database["public"]["Enums"]["appcc_category"]
          p_date?: string
          p_hotel_id: string
        }
        Returns: {
          category: Database["public"]["Enums"]["appcc_category"]
          checked_at: string
          checked_by: string
          control_point: string
          corrective_action: string
          corrective_action_taken: string
          critical_limit: string
          frequency: string
          observations: string
          record_id: string
          sort_order: number
          status: Database["public"]["Enums"]["appcc_record_status"]
          template_id: string
          template_name: string
          value_measured: string
        }[]
      }
      get_catalog_prices: { Args: { p_hotel_id: string }; Returns: Json }
      get_cost_variance_report: {
        Args: {
          p_from?: string
          p_hotel_id: string
          p_min_variance_pct?: number
          p_to?: string
        }
        Returns: {
          actual_cost: number
          cost_per_pax_delta: number
          event_date: string
          event_id: string
          event_name: string
          guest_count: number
          service_type: Database["public"]["Enums"]["service_type"]
          theoretical_cost: number
          variance_abs: number
          variance_pct: number
        }[]
      }
      get_dashboard_data: { Args: { p_hotel_id: string }; Returns: Json }
      get_escandallo_live: {
        Args: { p_hotel_id: string; p_recipe_id: string }
        Returns: Json
      }
      get_event_beo: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: Json
      }
      get_event_reservations: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: Json
      }
      get_events_calendar: {
        Args: { p_from: string; p_hotel_id: string; p_to: string }
        Returns: Json
      }
      get_food_cost_by_event: {
        Args: { p_from?: string; p_hotel_id: string; p_to?: string }
        Returns: {
          actual_cost: number
          cost_per_pax_actual: number
          cost_per_pax_theoretical: number
          event_date: string
          event_id: string
          event_name: string
          event_type: Database["public"]["Enums"]["event_type"]
          guest_count: number
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["event_status"]
          theoretical_cost: number
          variance_abs: number
          variance_pct: number
        }[]
      }
      get_food_cost_by_service: {
        Args: { p_from?: string; p_hotel_id: string; p_to?: string }
        Returns: {
          avg_cost_per_pax: number
          avg_theoretical_per_event: number
          avg_variance_pct: number
          event_count: number
          service_type: Database["public"]["Enums"]["service_type"]
          total_actual_cost: number
          total_pax: number
          total_theoretical_cost: number
        }[]
      }
      get_integration_sync_logs: {
        Args: {
          p_hotel_id: string
          p_limit?: number
          p_pms_integration?: string
          p_pos_integration?: string
        }
        Returns: {
          completed_at: string
          error_message: string
          id: string
          pms_integration_id: string
          pos_integration_id: string
          records_failed: number
          records_synced: number
          response_payload: Json
          started_at: string
          status: Database["public"]["Enums"]["sync_log_status"]
          sync_type: string
        }[]
      }
      get_job_logs: {
        Args: { p_hotel_id: string; p_job_id: string }
        Returns: {
          created_at: string
          details: Json
          id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
        }[]
      }
      get_labels: {
        Args: {
          p_from?: string
          p_hotel_id: string
          p_to?: string
          p_type?: Database["public"]["Enums"]["label_type"]
        }
        Returns: {
          barcode: string
          created_at: string
          display_name: string
          elaborated_at: string
          expires_at: string
          hours_to_expiry: number
          id: string
          is_printed: boolean
          label_type: Database["public"]["Enums"]["label_type"]
          location: string
          origin: Database["public"]["Enums"]["label_origin"]
          printed_at: string
          quantity: number
          treatment: Database["public"]["Enums"]["treatment_type"]
          unit: string
        }[]
      }
      get_member_role: {
        Args: { p_hotel_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_notification_count: { Args: { p_hotel_id: string }; Returns: number }
      get_notification_preferences: {
        Args: { p_hotel_id: string }
        Returns: {
          email: boolean
          in_app: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
        }[]
      }
      get_pending_jobs: {
        Args: { p_hotel_id: string; p_limit?: number }
        Returns: {
          attempts: number
          completed_at: string
          created_at: string
          error: string
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          max_attempts: number
          payload: Json
          result: Json
          scheduled_at: string
          started_at: string
          status: Database["public"]["Enums"]["job_status"]
        }[]
      }
      get_pending_orders_by_supplier: {
        Args: { p_hotel_id: string }
        Returns: Json
      }
      get_personnel: {
        Args: { p_active_only?: boolean; p_hotel_id: string }
        Returns: Json
      }
      get_pms_integrations: {
        Args: { p_hotel_id: string }
        Returns: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          last_error: string
          last_sync_at: string
          name: string
          pms_type: Database["public"]["Enums"]["pms_type"]
          status: Database["public"]["Enums"]["integration_status"]
        }[]
      }
      get_pos_integrations: {
        Args: { p_hotel_id: string }
        Returns: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          last_error: string
          last_sync_at: string
          name: string
          pos_type: Database["public"]["Enums"]["pos_type"]
          status: Database["public"]["Enums"]["integration_status"]
        }[]
      }
      get_price_trend: {
        Args: { p_hotel_id: string; p_months?: number; p_product_id: string }
        Returns: Json
      }
      get_product_with_offers: {
        Args: { p_hotel_id: string; p_product_id: string }
        Returns: Json
      }
      get_production_summary: {
        Args: { p_date: string; p_hotel_id: string }
        Returns: Json
      }
      get_rate_limit_status: {
        Args: { p_key: string }
        Returns: {
          exists_: boolean
          reset_at: string
          tokens_remaining: number
        }[]
      }
      get_recipe_tech_sheet: {
        Args: { p_hotel_id: string; p_recipe_id: string }
        Returns: Json
      }
      get_schedule_assignments: {
        Args: { p_date_from: string; p_date_to: string; p_hotel_id: string }
        Returns: Json
      }
      get_schedule_rules: { Args: { p_hotel_id: string }; Returns: Json }
      get_shift_definitions: {
        Args: { p_active_only?: boolean; p_hotel_id: string }
        Returns: Json
      }
      get_stock_forensics: {
        Args: { p_hotel_id: string; p_months?: number; p_product_id: string }
        Returns: Json
      }
      get_stock_levels: {
        Args: { p_hotel_id: string; p_location_id?: string }
        Returns: Json
      }
      get_supplier_metrics: {
        Args: { p_hotel_id: string; p_supplier_id: string }
        Returns: Json
      }
      get_temperature_logs: {
        Args: {
          p_from?: string
          p_hotel_id: string
          p_location?: string
          p_to?: string
        }
        Returns: {
          id: string
          is_within_range: boolean
          location: string
          logged_at: string
          max_allowed: number
          min_allowed: number
          notes: string
          product_name: string
          temperature: number
          unit: string
        }[]
      }
      get_unread_notifications: {
        Args: { p_hotel_id: string; p_limit?: number }
        Returns: {
          action_url: string
          body: string
          created_at: string
          id: string
          is_read: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
        }[]
      }
      get_user_hotels: { Args: never; Returns: Json }
      get_workflow_detail: {
        Args: { p_hotel_id: string; p_workflow_id: string }
        Returns: Json
      }
      import_products_bulk: {
        Args: { p_hotel_id: string; p_products: Json }
        Returns: number
      }
      import_recipes_bulk: {
        Args: { p_hotel_id: string; p_payload: Json }
        Returns: Json
      }
      invite_member: {
        Args: {
          p_hotel_id: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: string
      }
      is_member_of: { Args: { p_hotel_id: string }; Returns: boolean }
      log_temperature: {
        Args: {
          p_hotel_id: string
          p_location: string
          p_lot_id?: string
          p_max_allowed?: number
          p_min_allowed?: number
          p_notes?: string
          p_product_id?: string
          p_temperature: number
        }
        Returns: string
      }
      mark_all_notifications_read: {
        Args: { p_hotel_id: string }
        Returns: number
      }
      mark_mise_en_place_item: {
        Args: { p_hotel_id: string; p_is_done: boolean; p_item_id: string }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { p_hotel_id: string; p_notification_id: string }
        Returns: undefined
      }
      mark_sync_complete: {
        Args: {
          p_error?: string
          p_log_id: string
          p_records_failed?: number
          p_records_synced?: number
          p_response?: Json
          p_status: Database["public"]["Enums"]["sync_log_status"]
        }
        Returns: undefined
      }
      match_product_by_alias: {
        Args: { p_hotel_id: string; p_limit?: number; p_query: string }
        Returns: Json
      }
      match_product_by_supplier_code: {
        Args: {
          p_hotel_id: string
          p_supplier_code: string
          p_supplier_id: string
        }
        Returns: Json
      }
      preview_invite: { Args: { p_token: string }; Returns: Json }
      print_label: { Args: { p_label_id: string }; Returns: undefined }
      process_ocr_receipt: {
        Args: {
          p_hotel_id: string
          p_image_hash?: string
          p_image_url?: string
          p_ocr_data: Json
          p_order_id: string
        }
        Returns: Json
      }
      receive_goods: {
        Args: {
          p_delivery_note_number?: string
          p_hotel_id: string
          p_lines: Json
          p_notes?: string
          p_order_id: string
          p_temperature_check?: boolean
        }
        Returns: string
      }
      record_supplier_incident: {
        Args: {
          p_description: string
          p_hotel_id: string
          p_incident_type: Database["public"]["Enums"]["incident_type"]
          p_occurred_at?: string
          p_purchase_order_id?: string
          p_severity?: Database["public"]["Enums"]["incident_severity"]
          p_supplier_id: string
        }
        Returns: string
      }
      record_waste: {
        Args: {
          p_department?: string
          p_hotel_id: string
          p_lot_id?: string
          p_product_id: string
          p_quantity?: number
          p_reason?: string
          p_waste_type?: Database["public"]["Enums"]["waste_type"]
        }
        Returns: string
      }
      reject_suggestion: {
        Args: { p_hotel_id: string; p_note?: string; p_suggestion_id: string }
        Returns: undefined
      }
      release_reservation: {
        Args: { p_hotel_id: string; p_reservation_id: string }
        Returns: undefined
      }
      reserve_stock_for_event: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: Json
      }
      resolve_ingredient_mapping_bulk: {
        Args: { p_hotel_id: string; p_mapping: Json }
        Returns: Json
      }
      review_stock_count: {
        Args: {
          p_apply_adjustments?: boolean
          p_count_id: string
          p_hotel_id: string
        }
        Returns: Json
      }
      revoke_invite: { Args: { p_invite_id: string }; Returns: undefined }
      run_all_automejora_agents: { Args: { p_hotel_id: string }; Returns: Json }
      run_compliance_reminder_agent: {
        Args: { p_hotel_id: string }
        Returns: number
      }
      run_event_planner_agent: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: number
      }
      run_forecast_prep_agent: { Args: { p_hotel_id: string }; Returns: number }
      run_kds_coordinator_agent: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: number
      }
      run_post_event_agent: {
        Args: { p_event_id: string; p_hotel_id: string }
        Returns: number
      }
      run_price_watcher_agent: { Args: { p_hotel_id: string }; Returns: number }
      run_recipe_cost_alert_agent: {
        Args: { p_hotel_id: string }
        Returns: number
      }
      run_shopping_optimizer_agent: {
        Args: { p_hotel_id: string }
        Returns: number
      }
      run_stock_optimizer_agent: {
        Args: { p_hotel_id: string }
        Returns: number
      }
      run_waste_analyzer_agent: {
        Args: { p_hotel_id: string }
        Returns: number
      }
      scale_recipe: {
        Args: {
          p_hotel_id: string
          p_new_servings: number
          p_recipe_id: string
        }
        Returns: Json
      }
      search_products: {
        Args: { p_category_id?: string; p_hotel_id: string; p_query: string }
        Returns: Json
      }
      seed_appcc_defaults: { Args: { p_hotel_id: string }; Returns: undefined }
      seed_default_categories: {
        Args: { p_hotel_id: string }
        Returns: undefined
      }
      seed_default_storage_locations: {
        Args: { p_hotel_id: string }
        Returns: undefined
      }
      seed_default_units: { Args: { p_hotel_id: string }; Returns: undefined }
      set_preferred_offer: {
        Args: { p_hotel_id: string; p_offer_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      start_stock_count: {
        Args: {
          p_count_type?: Database["public"]["Enums"]["count_type"]
          p_hotel_id: string
          p_is_blind?: boolean
          p_label?: string
          p_location_id?: string
        }
        Returns: string
      }
      start_workflow_task: {
        Args: { p_hotel_id: string; p_task_id: string }
        Returns: undefined
      }
      store_idempotency: {
        Args: {
          p_hotel_id: string
          p_key: string
          p_response: Json
          p_status_code?: number
        }
        Returns: undefined
      }
      submit_recipe_for_review: {
        Args: { p_hotel_id: string; p_recipe_id: string }
        Returns: undefined
      }
      submit_stock_count_line: {
        Args: {
          p_counted_qty: number
          p_hotel_id: string
          p_line_id: string
          p_notes?: string
        }
        Returns: undefined
      }
      switch_active_hotel: { Args: { p_hotel_id: string }; Returns: undefined }
      sync_escandallo_prices: {
        Args: { p_hotel_id: string; p_recipe_id: string }
        Returns: Json
      }
      trace_lot: { Args: { p_lot_id: string }; Returns: Json }
      transfer_stock: {
        Args: {
          p_hotel_id: string
          p_lot_id: string
          p_notes?: string
          p_quantity: number
          p_to_location_id: string
        }
        Returns: string
      }
      transition_event: {
        Args: {
          p_event_id: string
          p_hotel_id: string
          p_new_status: Database["public"]["Enums"]["event_status"]
          p_reason?: string
        }
        Returns: undefined
      }
      transition_plan_item: {
        Args: {
          p_hotel_id: string
          p_item_id: string
          p_new_status: Database["public"]["Enums"]["plan_item_status"]
        }
        Returns: undefined
      }
      transition_production_plan: {
        Args: {
          p_hotel_id: string
          p_new_status: Database["public"]["Enums"]["plan_status"]
          p_plan_id: string
        }
        Returns: undefined
      }
      transition_purchase_order: {
        Args: {
          p_hotel_id: string
          p_new_status: Database["public"]["Enums"]["po_status"]
          p_order_id: string
          p_reason?: string
        }
        Returns: undefined
      }
      transition_purchase_request: {
        Args: {
          p_hotel_id: string
          p_new_status: Database["public"]["Enums"]["pr_status"]
          p_reason?: string
          p_request_id: string
        }
        Returns: undefined
      }
      trigger_pms_sync: {
        Args: {
          p_hotel_id: string
          p_integration_id: string
          p_sync_type: string
        }
        Returns: string
      }
      trigger_pos_sync: {
        Args: {
          p_hotel_id: string
          p_integration_id: string
          p_sync_type: string
        }
        Returns: string
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_assignment: {
        Args: {
          p_id: string
          p_notes?: string
          p_shift_id?: string
          p_status?: Database["public"]["Enums"]["schedule_status"]
        }
        Returns: undefined
      }
      update_event: {
        Args: {
          p_change_reason?: string
          p_data: Json
          p_event_id: string
          p_hotel_id: string
        }
        Returns: undefined
      }
      update_kitchen_order_item_status: {
        Args: {
          p_hotel_id: string
          p_item_id: string
          p_status: Database["public"]["Enums"]["ko_item_status"]
        }
        Returns: undefined
      }
      update_member_role: {
        Args: {
          p_hotel_id: string
          p_new_role: Database["public"]["Enums"]["app_role"]
          p_target_user_id: string
        }
        Returns: undefined
      }
      update_personnel: {
        Args: {
          p_active?: boolean
          p_contract_type?: Database["public"]["Enums"]["contract_type"]
          p_id: string
          p_name?: string
          p_notes?: string
          p_role?: Database["public"]["Enums"]["personnel_role"]
          p_weekly_hours?: number
        }
        Returns: undefined
      }
      update_pms_integration: {
        Args: {
          p_config?: Json
          p_credentials?: Json
          p_hotel_id: string
          p_integration_id: string
          p_name?: string
        }
        Returns: undefined
      }
      update_pos_integration: {
        Args: {
          p_config?: Json
          p_credentials?: Json
          p_hotel_id: string
          p_integration_id: string
          p_name?: string
        }
        Returns: undefined
      }
      update_schedule_rule: {
        Args: {
          p_active?: boolean
          p_days_of_week?: number[]
          p_id: string
          p_max_persons?: number
          p_min_persons?: number
          p_priority?: string
          p_role?: Database["public"]["Enums"]["personnel_role"]
          p_shift_id?: string
        }
        Returns: undefined
      }
      update_shift_definition: {
        Args: {
          p_active?: boolean
          p_end_time?: string
          p_id: string
          p_name?: string
          p_shift_type?: Database["public"]["Enums"]["shift_type"]
          p_start_time?: string
        }
        Returns: undefined
      }
      upsert_agent_config: {
        Args: {
          p_agent_type: Database["public"]["Enums"]["agent_type"]
          p_config?: Json
          p_hotel_id: string
          p_is_active: boolean
        }
        Returns: undefined
      }
      upsert_notification_preference: {
        Args: {
          p_email: boolean
          p_hotel_id: string
          p_in_app: boolean
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: undefined
      }
      validate_event_transition: {
        Args: {
          p_from: Database["public"]["Enums"]["event_status"]
          p_to: Database["public"]["Enums"]["event_status"]
        }
        Returns: boolean
      }
      validate_po_transition: {
        Args: {
          p_from: Database["public"]["Enums"]["po_status"]
          p_to: Database["public"]["Enums"]["po_status"]
        }
        Returns: boolean
      }
      validate_pr_transition: {
        Args: {
          p_from: Database["public"]["Enums"]["pr_status"]
          p_to: Database["public"]["Enums"]["pr_status"]
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_type:
        | "price_watcher"
        | "waste_analyzer"
        | "stock_optimizer"
        | "recipe_cost_alert"
        | "compliance_reminder"
        | "event_planner"
        | "shopping_optimizer"
        | "kds_coordinator"
        | "post_event"
        | "forecast_prep"
      alert_severity: "info" | "warning" | "critical"
      alert_type:
        | "low_stock"
        | "expiring_soon"
        | "cost_overrun"
        | "food_cost_high"
        | "waste_high"
        | "pending_approvals"
        | "custom"
      alias_source: "manual" | "ocr" | "voice"
      app_role:
        | "superadmin"
        | "direction"
        | "admin"
        | "head_chef"
        | "sous_chef"
        | "cook"
        | "commercial"
        | "procurement"
        | "warehouse"
        | "room"
        | "reception"
        | "operations"
        | "maintenance"
      appcc_category:
        | "recepcion"
        | "almacen"
        | "preparacion"
        | "coccion"
        | "enfriamiento"
        | "servicio"
        | "limpieza"
      appcc_record_status: "ok" | "deviation" | "corrected" | "critical" | "na"
      contract_type:
        | "indefinido"
        | "temporal"
        | "formacion"
        | "autonomo"
        | "becario"
      count_status: "open" | "in_progress" | "review" | "closed"
      count_type: "full" | "partial" | "blind"
      department:
        | "cocina_caliente"
        | "cocina_fria"
        | "pasteleria"
        | "panaderia"
        | "charcuteria"
        | "pescaderia"
        | "garde_manger"
        | "servicio"
        | "economato"
        | "general"
      event_status:
        | "draft"
        | "pending_confirmation"
        | "confirmed"
        | "in_preparation"
        | "in_operation"
        | "completed"
        | "cancelled"
        | "archived"
      event_type:
        | "banquet"
        | "buffet"
        | "coffee_break"
        | "cocktail"
        | "room_service"
        | "catering"
        | "restaurant"
      expiry_treatment:
        | "fresh"
        | "cooked"
        | "frozen"
        | "preserved"
        | "chilled"
        | "other"
      import_kind: "recipes"
      import_status: "pending" | "running" | "completed" | "partial" | "failed"
      incident_severity: "info" | "warning" | "critical"
      incident_type:
        | "delay"
        | "quality"
        | "quantity"
        | "wrong_product"
        | "no_delivery"
        | "other"
      integration_status: "draft" | "active" | "error" | "disabled"
      job_status: "pending" | "running" | "completed" | "failed" | "cancelled"
      job_type:
        | "generate_workflow"
        | "generate_shopping_list"
        | "send_notification"
        | "generate_snapshot"
        | "reserve_stock"
        | "calculate_cost"
        | "export_pdf"
        | "sync_pms"
        | "sync_pos"
        | "run_agent"
        | "ocr_receipt"
      ko_item_status: "pending" | "in_progress" | "ready" | "skipped"
      ko_status:
        | "pending"
        | "acknowledged"
        | "in_progress"
        | "ready"
        | "delivered"
        | "cancelled"
      label_origin: "produccion" | "evento" | "recepcion" | "manual"
      label_type:
        | "preparacion"
        | "producto"
        | "sobras"
        | "congelado"
        | "descongelado"
        | "pasteurizado"
        | "regenerado"
      location_type: "dry" | "refrigerated" | "frozen" | "ambient"
      log_level: "info" | "warning" | "error"
      menu_type: "buffet" | "seated" | "cocktail" | "tasting" | "daily"
      movement_type:
        | "reception"
        | "consumption"
        | "waste"
        | "adjustment"
        | "transfer"
        | "return"
      notification_type:
        | "event_confirmed"
        | "event_completed"
        | "task_assigned"
        | "stock_alert"
        | "job_completed"
        | "job_failed"
        | "cost_alert"
        | "system"
      ocr_review_status:
        | "auto_matched"
        | "pending_review"
        | "product_unknown"
        | "reviewed_ok"
        | "reviewed_fixed"
      personnel_role:
        | "chef_ejecutivo"
        | "jefe_partida"
        | "cocinero"
        | "ayudante_cocina"
        | "fregador"
        | "pastelero"
        | "barista"
        | "camarero"
        | "otro"
      plan_item_status: "pending" | "in_progress" | "done" | "cancelled"
      plan_status: "draft" | "active" | "in_progress" | "completed"
      pms_type: "mews" | "opera_cloud" | "cloudbeds" | "protel"
      po_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "sent"
        | "confirmed_by_supplier"
        | "partially_received"
        | "received"
        | "cancelled"
      pos_type: "lightspeed" | "simphony" | "square" | "revel"
      pr_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "consolidated"
        | "cancelled"
      quality_status: "accepted" | "rejected" | "partial"
      recipe_category:
        | "cold_starters"
        | "hot_starters"
        | "soups_creams"
        | "fish"
        | "meat"
        | "sides"
        | "desserts"
        | "bakery"
        | "sauces_stocks"
        | "mise_en_place"
        | "buffet"
        | "room_service"
        | "cocktail_pieces"
      recipe_difficulty: "easy" | "medium" | "hard" | "expert"
      recipe_status:
        | "draft"
        | "review_pending"
        | "approved"
        | "deprecated"
        | "archived"
      reservation_status: "pending" | "partial" | "consumed" | "released"
      schedule_origin: "regla" | "evento" | "ajuste"
      schedule_status: "propuesto" | "confirmado" | "cancelado"
      service_type: "buffet" | "seated" | "cocktail" | "mixed"
      shift_type: "normal" | "refuerzo" | "evento"
      storage_type: "ambient" | "refrigerated" | "frozen"
      suggestion_action:
        | "enqueue_job"
        | "sync_recipe_costs"
        | "create_notification"
        | "none"
      suggestion_status:
        | "pending"
        | "approved"
        | "rejected"
        | "applied"
        | "expired"
      sync_log_status: "running" | "success" | "partial" | "failed"
      task_priority: "low" | "normal" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "blocked" | "done" | "cancelled"
      treatment_type:
        | "none"
        | "congelado"
        | "descongelado"
        | "pasteurizado"
        | "regenerado"
      unit_type: "weight" | "volume" | "count" | "length"
      urgency_level: "normal" | "urgent" | "critical"
      vip_level: "standard" | "silver" | "gold" | "platinum"
      waste_type:
        | "expired"
        | "damaged"
        | "overproduction"
        | "preparation"
        | "other"
      workflow_status: "draft" | "active" | "completed" | "cancelled"
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
      agent_type: [
        "price_watcher",
        "waste_analyzer",
        "stock_optimizer",
        "recipe_cost_alert",
        "compliance_reminder",
        "event_planner",
        "shopping_optimizer",
        "kds_coordinator",
        "post_event",
        "forecast_prep",
      ],
      alert_severity: ["info", "warning", "critical"],
      alert_type: [
        "low_stock",
        "expiring_soon",
        "cost_overrun",
        "food_cost_high",
        "waste_high",
        "pending_approvals",
        "custom",
      ],
      alias_source: ["manual", "ocr", "voice"],
      app_role: [
        "superadmin",
        "direction",
        "admin",
        "head_chef",
        "sous_chef",
        "cook",
        "commercial",
        "procurement",
        "warehouse",
        "room",
        "reception",
        "operations",
        "maintenance",
      ],
      appcc_category: [
        "recepcion",
        "almacen",
        "preparacion",
        "coccion",
        "enfriamiento",
        "servicio",
        "limpieza",
      ],
      appcc_record_status: ["ok", "deviation", "corrected", "critical", "na"],
      contract_type: [
        "indefinido",
        "temporal",
        "formacion",
        "autonomo",
        "becario",
      ],
      count_status: ["open", "in_progress", "review", "closed"],
      count_type: ["full", "partial", "blind"],
      department: [
        "cocina_caliente",
        "cocina_fria",
        "pasteleria",
        "panaderia",
        "charcuteria",
        "pescaderia",
        "garde_manger",
        "servicio",
        "economato",
        "general",
      ],
      event_status: [
        "draft",
        "pending_confirmation",
        "confirmed",
        "in_preparation",
        "in_operation",
        "completed",
        "cancelled",
        "archived",
      ],
      event_type: [
        "banquet",
        "buffet",
        "coffee_break",
        "cocktail",
        "room_service",
        "catering",
        "restaurant",
      ],
      expiry_treatment: [
        "fresh",
        "cooked",
        "frozen",
        "preserved",
        "chilled",
        "other",
      ],
      import_kind: ["recipes"],
      import_status: ["pending", "running", "completed", "partial", "failed"],
      incident_severity: ["info", "warning", "critical"],
      incident_type: [
        "delay",
        "quality",
        "quantity",
        "wrong_product",
        "no_delivery",
        "other",
      ],
      integration_status: ["draft", "active", "error", "disabled"],
      job_status: ["pending", "running", "completed", "failed", "cancelled"],
      job_type: [
        "generate_workflow",
        "generate_shopping_list",
        "send_notification",
        "generate_snapshot",
        "reserve_stock",
        "calculate_cost",
        "export_pdf",
        "sync_pms",
        "sync_pos",
        "run_agent",
        "ocr_receipt",
      ],
      ko_item_status: ["pending", "in_progress", "ready", "skipped"],
      ko_status: [
        "pending",
        "acknowledged",
        "in_progress",
        "ready",
        "delivered",
        "cancelled",
      ],
      label_origin: ["produccion", "evento", "recepcion", "manual"],
      label_type: [
        "preparacion",
        "producto",
        "sobras",
        "congelado",
        "descongelado",
        "pasteurizado",
        "regenerado",
      ],
      location_type: ["dry", "refrigerated", "frozen", "ambient"],
      log_level: ["info", "warning", "error"],
      menu_type: ["buffet", "seated", "cocktail", "tasting", "daily"],
      movement_type: [
        "reception",
        "consumption",
        "waste",
        "adjustment",
        "transfer",
        "return",
      ],
      notification_type: [
        "event_confirmed",
        "event_completed",
        "task_assigned",
        "stock_alert",
        "job_completed",
        "job_failed",
        "cost_alert",
        "system",
      ],
      ocr_review_status: [
        "auto_matched",
        "pending_review",
        "product_unknown",
        "reviewed_ok",
        "reviewed_fixed",
      ],
      personnel_role: [
        "chef_ejecutivo",
        "jefe_partida",
        "cocinero",
        "ayudante_cocina",
        "fregador",
        "pastelero",
        "barista",
        "camarero",
        "otro",
      ],
      plan_item_status: ["pending", "in_progress", "done", "cancelled"],
      plan_status: ["draft", "active", "in_progress", "completed"],
      pms_type: ["mews", "opera_cloud", "cloudbeds", "protel"],
      po_status: [
        "draft",
        "pending_approval",
        "approved",
        "sent",
        "confirmed_by_supplier",
        "partially_received",
        "received",
        "cancelled",
      ],
      pos_type: ["lightspeed", "simphony", "square", "revel"],
      pr_status: [
        "draft",
        "pending_approval",
        "approved",
        "consolidated",
        "cancelled",
      ],
      quality_status: ["accepted", "rejected", "partial"],
      recipe_category: [
        "cold_starters",
        "hot_starters",
        "soups_creams",
        "fish",
        "meat",
        "sides",
        "desserts",
        "bakery",
        "sauces_stocks",
        "mise_en_place",
        "buffet",
        "room_service",
        "cocktail_pieces",
      ],
      recipe_difficulty: ["easy", "medium", "hard", "expert"],
      recipe_status: [
        "draft",
        "review_pending",
        "approved",
        "deprecated",
        "archived",
      ],
      reservation_status: ["pending", "partial", "consumed", "released"],
      schedule_origin: ["regla", "evento", "ajuste"],
      schedule_status: ["propuesto", "confirmado", "cancelado"],
      service_type: ["buffet", "seated", "cocktail", "mixed"],
      shift_type: ["normal", "refuerzo", "evento"],
      storage_type: ["ambient", "refrigerated", "frozen"],
      suggestion_action: [
        "enqueue_job",
        "sync_recipe_costs",
        "create_notification",
        "none",
      ],
      suggestion_status: [
        "pending",
        "approved",
        "rejected",
        "applied",
        "expired",
      ],
      sync_log_status: ["running", "success", "partial", "failed"],
      task_priority: ["low", "normal", "high", "urgent"],
      task_status: ["todo", "in_progress", "blocked", "done", "cancelled"],
      treatment_type: [
        "none",
        "congelado",
        "descongelado",
        "pasteurizado",
        "regenerado",
      ],
      unit_type: ["weight", "volume", "count", "length"],
      urgency_level: ["normal", "urgent", "critical"],
      vip_level: ["standard", "silver", "gold", "platinum"],
      waste_type: [
        "expired",
        "damaged",
        "overproduction",
        "preparation",
        "other",
      ],
      workflow_status: ["draft", "active", "completed", "cancelled"],
    },
  },
} as const
