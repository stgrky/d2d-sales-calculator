import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Partner {
  id: string;
  partner_code: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  display_address: string | null;
  display_phone: string | null;
  display_email: string | null;
  display_website: string | null;
  pricing_overrides: any | null;
  is_active: boolean;
  can_create_quotes: boolean;
  can_edit_pricing: boolean;
  notes: string | null;
}

export async function getAllPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('is_active', true)
    .order('company_name');
  
  if (error) {
    console.error('Error loading partners:', error);
    return [];
  }
  return data || [];
}

// Generate unique quote number with partner prefix
export function generateQuoteNumber(partnerCode?: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Use first 2 letters of partner code, or "AQ" for Aquaria
  let prefix = "AQ";
  if (partnerCode && partnerCode !== "AQUARIA_HQ") {
    prefix = partnerCode.substring(0, 2).toUpperCase();
  }
  
  return `${prefix}-${year}${month}${day}-${random}`;
}

// Quote Config interface (matching your current state)
export interface QuoteConfig {
  model: string;
  unitPad: boolean;
  mobility: boolean;
  tank: string;
  tankPad: boolean;
  city: string;
  sensor: string;
  filter: string;
  filterQty: number;
  pump: string;
  connection: string;
  trenchingSections: Array<{ type: string; distance: number }>;
  ab_trenchingSections: Array<{ type: string; distance: number }>;
  panelUpgrade: string;
  warranty: string;
  demolition: { enabled: boolean; distance: number };
  customAdjs: Array<{
    enabled: boolean;
    label: string;
    amount: number;
    notes: string;
  }>;
}

export interface Quote {
  id?: string;
  quote_number: string;
  created_at?: string;
  updated_at?: string;
  
  // Customer info
  customer_company: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service_street: string;
  service_city: string;
  service_state: string;
  service_zip: string;
  po_number: string | null;
  
  // Partner info
  partner_id: string | null;
  partner_name: string | null;
  partner_logo_url: string | null;
  
  // Configuration
  quote_config: QuoteConfig;
  
  // Pricing
  original_total: number | null;
  discount_amount: number;
  final_total: number;
  partner_pricing: any | null;
  
  // Status
  status: 'draft' | 'sent' | 'accepted' | 'ordered';
  notes: string | null;
}

// Save a new quote
export async function saveQuote(quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving quote:', error);
    return null;
  }
  
  return data;
}

// Update existing quote
export async function updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating quote:', error);
    return null;
  }
  
  return data;
}

// Get all quotes (optionally filter by partner)
export async function getQuotes(partnerId?: string): Promise<Quote[]> {
  let query = supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error loading quotes:', error);
    return [];
  }
  
  return data || [];
}

// Get single quote by ID
export async function getQuote(id: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error loading quote:', error);
    return null;
  }
  
  return data;
}

// Get quote by quote number
export async function getQuoteByNumber(quoteNumber: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('quote_number', quoteNumber)
    .single();
  
  if (error) {
    console.error('Error loading quote:', error);
    return null;
  }
  
  return data;
}

// Delete quote
export async function deleteQuote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting quote:', error);
    return false;
  }
  
  return true;
}