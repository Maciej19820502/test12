export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          topic_title: string | null;
          topic_description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic_title?: string | null;
          topic_description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic_title?: string | null;
          topic_description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_cards: {
        Row: {
          id: string;
          project_id: string;
          section_1: string | null;
          section_2: string | null;
          section_3: string | null;
          section_4: string | null;
          section_5: string | null;
          section_6: string | null;
          section_7: string | null;
          section_8: string | null;
          version: number;
          source_tool: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          section_1?: string | null;
          section_2?: string | null;
          section_3?: string | null;
          section_4?: string | null;
          section_5?: string | null;
          section_6?: string | null;
          section_7?: string | null;
          section_8?: string | null;
          version?: number;
          source_tool?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          section_1?: string | null;
          section_2?: string | null;
          section_3?: string | null;
          section_4?: string | null;
          section_5?: string | null;
          section_6?: string | null;
          section_7?: string | null;
          section_8?: string | null;
          version?: number;
          source_tool?: string | null;
          created_at?: string;
        };
      };
      tool_sessions: {
        Row: {
          id: string;
          user_id: string;
          tool_name: "A" | "B" | "C" | "D" | "E";
          status: "not_started" | "in_progress" | "completed";
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_name: "A" | "B" | "C" | "D" | "E";
          status?: "not_started" | "in_progress" | "completed";
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_name?: "A" | "B" | "C" | "D" | "E";
          status?: "not_started" | "in_progress" | "completed";
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      cfo_reviews: {
        Row: {
          id: string;
          project_id: string;
          review_text: string | null;
          requirements: string | null;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          review_text?: string | null;
          requirements?: string | null;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          review_text?: string | null;
          requirements?: string | null;
          approved?: boolean;
          created_at?: string;
        };
      };
      pm_reviews: {
        Row: {
          id: string;
          project_id: string;
          recommendations: string | null;
          improved_timeline: string | null;
          e1_score: number | null;
          e2_score: number | null;
          e3_score: number | null;
          e4_score: number | null;
          e5_score: number | null;
          average_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          recommendations?: string | null;
          improved_timeline?: string | null;
          e1_score?: number | null;
          e2_score?: number | null;
          e3_score?: number | null;
          e4_score?: number | null;
          e5_score?: number | null;
          average_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          recommendations?: string | null;
          improved_timeline?: string | null;
          e1_score?: number | null;
          e2_score?: number | null;
          e3_score?: number | null;
          e4_score?: number | null;
          e5_score?: number | null;
          average_score?: number | null;
          created_at?: string;
        };
      };
      defense_results: {
        Row: {
          id: string;
          project_id: string;
          decision: string | null;
          notes_summary: string | null;
          transcript: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          decision?: string | null;
          notes_summary?: string | null;
          transcript?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          decision?: string | null;
          notes_summary?: string | null;
          transcript?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
