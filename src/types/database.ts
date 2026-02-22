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
      users: {
        Row: {
          id: string; // Changed to match BetterAuth TEXT type
          username: string;
          password_hash: string;
          created_at: string | null;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          created_at?: string | null;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          created_at?: string | null;
          last_login?: string | null;
        };
      };
      jobs: {
        Row: {
          id: string;
          job_id: string;
          title: string;
          company: string;
          location: string | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string | null;
          employment_type: string | null;
          remote_allowed: boolean | null;
          description: string | null;
          required_skills: string[] | null;
          apply_url: string;
          source: string | null;
          raw_data: Json | null;
          status: string | null;
          ai_content_generated: boolean | null;
          ai_thread_primary: string | null;
          ai_thread_reply: string | null;
          ai_model_used: string | null;
          posted_to_x: boolean | null;
          posted_at: string | null;
          x_tweet_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          title: string;
          company: string;
          location?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          employment_type?: string | null;
          remote_allowed?: boolean | null;
          description?: string | null;
          required_skills?: string[] | null;
          apply_url: string;
          source?: string | null;
          raw_data?: Json | null;
          status?: string | null;
          ai_content_generated?: boolean | null;
          ai_thread_primary?: string | null;
          ai_thread_reply?: string | null;
          ai_model_used?: string | null;
          posted_to_x?: boolean | null;
          posted_at?: string | null;
          x_tweet_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          title?: string;
          company?: string;
          location?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          employment_type?: string | null;
          remote_allowed?: boolean | null;
          description?: string | null;
          required_skills?: string[] | null;
          apply_url?: string;
          source?: string | null;
          raw_data?: Json | null;
          status?: string | null;
          ai_content_generated?: boolean | null;
          ai_thread_primary?: string | null;
          ai_thread_reply?: string | null;
          ai_model_used?: string | null;
          posted_to_x?: boolean | null;
          posted_at?: string | null;
          x_tweet_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string | null;
          activity_type: string;
          title: string;
          description: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          activity_type: string;
          title: string;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          activity_type?: string;
          title?: string;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
      };
      settings: {
        Row: {
          id: string;
          user_id: string | null;
          setting_key: string;
          setting_value: Json;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          setting_key: string;
          setting_value: Json;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          setting_key?: string;
          setting_value?: Json;
          updated_at?: string | null;
        };
      };
      job_fetch_config: {
        Row: {
          id: string;
          user_id: string | null;
          search_query: string;
          location: string | null;
          remote_only: boolean | null;
          employment_types: string[] | null;
          salary_min: number | null;
          date_posted: string | null;
          num_results: number | null;
          last_run_at: string | null;
          last_run_results_count: number | null;
          last_run_new_jobs: number | null;
          last_run_duplicates: number | null;
          is_default: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          search_query: string;
          location?: string | null;
          remote_only?: boolean | null;
          employment_types?: string[] | null;
          salary_min?: number | null;
          date_posted?: string | null;
          num_results?: number | null;
          last_run_at?: string | null;
          last_run_results_count?: number | null;
          last_run_new_jobs?: number | null;
          last_run_duplicates?: number | null;
          is_default?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          search_query?: string;
          location?: string | null;
          remote_only?: boolean | null;
          employment_types?: string[] | null;
          salary_min?: number | null;
          date_posted?: string | null;
          num_results?: number | null;
          last_run_at?: string | null;
          last_run_results_count?: number | null;
          last_run_new_jobs?: number | null;
          last_run_duplicates?: number | null;
          is_default?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}
