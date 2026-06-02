export type UserRole = 'user' | 'admin' | 'client';
export type ClientPackage = 'basic' | 'standard' | 'premium';
export type ClientStatus = 'active' | 'inactive' | 'trial';
export type ContentStatus = 'draft' | 'approved' | 'delivered';
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';
export type ContentIdeaFormat = 'post' | 'reel' | 'story';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ClientRow {
  id: string;
  name: string;
  business_name: string | null;
  business_type: string;
  email: string | null;
  phone: string | null;
  instagram_handle: string | null;
  package: ClientPackage;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentVariation {
  caption: string;
  cta: string;
  reelHook: string;
  hashtags: string[];
}

export interface GeneratedContentRow {
  id: string;
  user_id: string | null;
  client_id: string | null;
  business_type: string;
  tone: string;
  platform: string;
  offer: string | null;
  variations: ContentVariation[];
  selected_variation: number;
  status: ContentStatus;
  created_at: string;
}

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  business_type: string;
  business_name: string | null;
  city: string | null;
  service_interest: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface ContentIdea {
  title: string;
  description: string;
  format: ContentIdeaFormat;
  hook: string;
}

export interface ContentIdeasRow {
  id: string;
  user_id: string | null;
  client_id: string | null;
  business_type: string;
  ideas: ContentIdea[];
  created_at: string;
}

export interface ReelScript {
  hook: string;
  talkingPoints: string[];
  cta: string;
  duration: string;
  visualSuggestions: string[];
}

export interface ReelScriptRow {
  id: string;
  user_id: string | null;
  client_id: string | null;
  business_type: string;
  topic: string;
  tone: string;
  script: ReelScript;
  created_at: string;
}

export interface BookingRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_type: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: BookingStatus;
  created_at: string;
}

type TableDefinition<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: TableDefinition<UserRow>;
      clients: TableDefinition<ClientRow>;
      generated_content: TableDefinition<GeneratedContentRow>;
      leads: TableDefinition<LeadRow>;
      content_ideas: TableDefinition<ContentIdeasRow>;
      reel_scripts: TableDefinition<ReelScriptRow>;
      bookings: TableDefinition<BookingRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
