-- 00059_v3_enums.sql
-- ADR-0015: crea los 21 enums v3_* con valores copiados 1:1 de los enums v2.
-- Idempotente: cada bloque valida existencia antes de crear. Dollar tags
-- nombrados por enum (feedback_supabase_dollar_tags).

-- v3_app_role (13 valores)
do $enum_v3_app_role$
begin
  if not exists (select 1 from pg_type where typname = 'v3_app_role') then
    create type public.v3_app_role as enum (
      'superadmin','direction','admin','head_chef','sous_chef','cook',
      'commercial','procurement','warehouse','room','reception','operations','maintenance'
    );
  end if;
end $enum_v3_app_role$;

-- v3_alias_source (3 valores)
do $enum_v3_alias_source$
begin
  if not exists (select 1 from pg_type where typname = 'v3_alias_source') then
    create type public.v3_alias_source as enum ('manual','ocr','voice');
  end if;
end $enum_v3_alias_source$;

-- v3_event_status (8 valores, ADR-0008)
do $enum_v3_event_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_event_status') then
    create type public.v3_event_status as enum (
      'draft','pending_confirmation','confirmed','in_preparation',
      'in_operation','completed','cancelled','archived'
    );
  end if;
end $enum_v3_event_status$;

-- v3_event_type (7 valores, ADR-0008 - inglés)
do $enum_v3_event_type$
begin
  if not exists (select 1 from pg_type where typname = 'v3_event_type') then
    create type public.v3_event_type as enum (
      'banquet','buffet','coffee_break','cocktail','room_service','catering','restaurant'
    );
  end if;
end $enum_v3_event_type$;

-- v3_menu_type (5 valores)
do $enum_v3_menu_type$
begin
  if not exists (select 1 from pg_type where typname = 'v3_menu_type') then
    create type public.v3_menu_type as enum ('buffet','seated','cocktail','tasting','daily');
  end if;
end $enum_v3_menu_type$;

-- v3_service_type (4 valores)
do $enum_v3_service_type$
begin
  if not exists (select 1 from pg_type where typname = 'v3_service_type') then
    create type public.v3_service_type as enum ('buffet','seated','cocktail','mixed');
  end if;
end $enum_v3_service_type$;

-- v3_recipe_status (5 valores)
do $enum_v3_recipe_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_recipe_status') then
    create type public.v3_recipe_status as enum (
      'draft','review_pending','approved','deprecated','archived'
    );
  end if;
end $enum_v3_recipe_status$;

-- v3_recipe_category (13 valores)
do $enum_v3_recipe_category$
begin
  if not exists (select 1 from pg_type where typname = 'v3_recipe_category') then
    create type public.v3_recipe_category as enum (
      'cold_starters','hot_starters','soups_creams','fish','meat','sides',
      'desserts','bakery','sauces_stocks','mise_en_place','buffet',
      'room_service','cocktail_pieces'
    );
  end if;
end $enum_v3_recipe_category$;

-- v3_recipe_difficulty (4 valores)
do $enum_v3_recipe_difficulty$
begin
  if not exists (select 1 from pg_type where typname = 'v3_recipe_difficulty') then
    create type public.v3_recipe_difficulty as enum ('easy','medium','hard','expert');
  end if;
end $enum_v3_recipe_difficulty$;

-- v3_storage_type (3 valores)
do $enum_v3_storage_type$
begin
  if not exists (select 1 from pg_type where typname = 'v3_storage_type') then
    create type public.v3_storage_type as enum ('ambient','refrigerated','frozen');
  end if;
end $enum_v3_storage_type$;

-- v3_unit_type (4 valores)
do $enum_v3_unit_type$
begin
  if not exists (select 1 from pg_type where typname = 'v3_unit_type') then
    create type public.v3_unit_type as enum ('weight','volume','count','length');
  end if;
end $enum_v3_unit_type$;

-- v3_expiry_treatment (6 valores)
do $enum_v3_expiry_treatment$
begin
  if not exists (select 1 from pg_type where typname = 'v3_expiry_treatment') then
    create type public.v3_expiry_treatment as enum (
      'fresh','cooked','frozen','preserved','chilled','other'
    );
  end if;
end $enum_v3_expiry_treatment$;

-- v3_incident_severity (3 valores)
do $enum_v3_incident_severity$
begin
  if not exists (select 1 from pg_type where typname = 'v3_incident_severity') then
    create type public.v3_incident_severity as enum ('info','warning','critical');
  end if;
end $enum_v3_incident_severity$;

-- v3_incident_type (6 valores)
do $enum_v3_incident_type$
begin
  if not exists (select 1 from pg_type where typname = 'v3_incident_type') then
    create type public.v3_incident_type as enum (
      'delay','quality','quantity','wrong_product','no_delivery','other'
    );
  end if;
end $enum_v3_incident_type$;

-- v3_import_kind (1 valor)
do $enum_v3_import_kind$
begin
  if not exists (select 1 from pg_type where typname = 'v3_import_kind') then
    create type public.v3_import_kind as enum ('recipes');
  end if;
end $enum_v3_import_kind$;

-- v3_import_status (5 valores)
do $enum_v3_import_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_import_status') then
    create type public.v3_import_status as enum (
      'pending','running','completed','partial','failed'
    );
  end if;
end $enum_v3_import_status$;

-- v3_vip_level (4 valores) - usado por clients.vip_level
do $enum_v3_vip_level$
begin
  if not exists (select 1 from pg_type where typname = 'v3_vip_level') then
    create type public.v3_vip_level as enum ('standard','silver','gold','platinum');
  end if;
end $enum_v3_vip_level$;

-- v3_department (10 valores) - usado por event_operational_impact.department
do $enum_v3_department$
begin
  if not exists (select 1 from pg_type where typname = 'v3_department') then
    create type public.v3_department as enum (
      'cocina_caliente','cocina_fria','pasteleria','panaderia','charcuteria',
      'pescaderia','garde_manger','servicio','economato','general'
    );
  end if;
end $enum_v3_department$;

-- v3_pr_status (5 valores)
do $enum_v3_pr_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_pr_status') then
    create type public.v3_pr_status as enum (
      'draft','pending_approval','approved','consolidated','cancelled'
    );
  end if;
end $enum_v3_pr_status$;

-- v3_po_status (8 valores)
do $enum_v3_po_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_po_status') then
    create type public.v3_po_status as enum (
      'draft','pending_approval','approved','sent','confirmed_by_supplier','partially_received',
      'received', 'cancelled'
    );
  end if;
end $enum_v3_po_status$;

-- v3_quality_status (3 valores)
do $enum_v3_quality_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_quality_status') then
    create type public.v3_quality_status as enum ('accepted','rejected','partial');
  end if;
end $enum_v3_quality_status$;

-- v3_ocr_review_status (5 valores)
do $enum_v3_ocr_review_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_ocr_review_status') then
    create type public.v3_ocr_review_status as enum (
      'auto_matched','pending_review','product_unknown','reviewed_ok','reviewed_fixed'
    );
  end if;
end $enum_v3_ocr_review_status$;

-- v3_urgency_level (3 valores)
do $enum_v3_urgency_level$
begin
  if not exists (select 1 from pg_type where typname = 'v3_urgency_level') then
    create type public.v3_urgency_level as enum ('normal','urgent','critical');
  end if;
end $enum_v3_urgency_level$;
