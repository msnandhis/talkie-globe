// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eowxynfgftqhtvuxaxlk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvd3h5bmZnZnRxaHR2dXhheGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMTczNjUsImV4cCI6MjA1NTc5MzM2NX0.1AMzLiGGi7dTO0tyZSWhW48FbPZ6jVHjuYaFQNOU1wU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);