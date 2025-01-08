export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: 'founder' | 'developer';
  background?: string;
  expertise?: string;
  github_username?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  created_at: string;
}

export interface StartupIdea {
  id: string;
  founder_id: string;
  title: string;
  description: string;
  required_skills: string[];
  compensation_type: 'equity' | 'monetary' | 'both';
  equity_percentage?: number;
  monetary_compensation?: number;
  terms_and_conditions?: string;
  has_nda: boolean;
  created_at: string;
}

export interface Application {
  id: string;
  idea_id: string;
  developer_id: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}