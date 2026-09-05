/**
 * Supabase schema types.
 *
 * This template ships a permissive stub so it compiles against any project.
 * Generate real types for your own database with:
 *
 *   npx supabase gen types typescript --project-id <your-ref> > src/integrations/supabase/types.ts
 *
 * Do not commit types generated from a database containing production data —
 * the generated file names every table, column and enum in the schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Database = any;
