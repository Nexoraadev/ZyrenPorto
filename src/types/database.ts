export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// Content Block types (for project case studies)
// ============================================
export type ContentBlockType = "text" | "image" | "embed" | "divider";

export interface ContentBlock {
  id: string;         // random client-side UUID
  type: ContentBlockType;
  title?: string;     // e.g. "Tujuan", "Problem Solving"
  content?: string;   // for type=text
  url?: string;       // for type=image or embed (Figma/Behance)
  caption?: string;   // optional caption for image blocks
}

export interface Database {
  public: {
    Tables: {
      project_categories: {
        Row: {
          id: string;
          name: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          name: string;
          order_index?: number;
        };
        Update: {
          id?: string;
          name?: string;
          order_index?: number;
        };
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          storage_path: string;
          url: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          project_id: string;
          storage_path: string;
          url: string;
          order_index?: number;
        };
        Update: {
          id?: string;
          project_id?: string;
          storage_path?: string;
          url?: string;
          order_index?: number;
        };
      };
      projects: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          long_description: string | null;
          tech_stack: string[];
          live_url: string | null;
          github_url: string | null;
          featured: boolean;
          order_index: number;
          category_id: string;
          video_url: string | null;
          nda_mode: boolean;
          content_blocks: ContentBlock[];
          year: string | null;
          client: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          long_description?: string | null;
          tech_stack?: string[];
          live_url?: string | null;
          github_url?: string | null;
          featured?: boolean;
          order_index?: number;
          category_id: string;
          video_url?: string | null;
          nda_mode?: boolean;
          content_blocks?: ContentBlock[];
          year?: string | null;
          client?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          long_description?: string | null;
          tech_stack?: string[];
          live_url?: string | null;
          github_url?: string | null;
          featured?: boolean;
          order_index?: number;
          category_id?: string;
          video_url?: string | null;
          nda_mode?: boolean;
          content_blocks?: ContentBlock[];
          year?: string | null;
          client?: string | null;
        };
      };
      project_skills: {
        Row: { project_id: string; skill_id: string; };
        Insert: { project_id: string; skill_id: string; };
        Update: { project_id?: string; skill_id?: string; };
      };
      certificates: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          issuer: string;
          issue_date: string | null;
          description: string | null;        // deskripsi singkat sertifikat (mode upload)
          file_url: string | null;           // public URL file di Supabase Storage
          file_storage_path: string | null;  // storage path untuk delete
          file_type: string | null;          // "image" | "pdf" | "other"
          linkedin_url: string | null;       // credential link (LinkedIn, Credly, dsb)
          order_index: number;
          category: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          issuer: string;
          issue_date?: string | null;
          description?: string | null;
          file_url?: string | null;
          file_storage_path?: string | null;
          file_type?: string | null;
          linkedin_url?: string | null;
          order_index?: number;
          category?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          issuer?: string;
          issue_date?: string | null;
          description?: string | null;
          file_url?: string | null;
          file_storage_path?: string | null;
          file_type?: string | null;
          linkedin_url?: string | null;
          order_index?: number;
          category?: string | null;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          level: number;
          icon: string | null;
          icon_size: number | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          level?: number;
          icon?: string | null;
          icon_size?: number | null;
          order_index?: number;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          level?: number;
          icon?: string | null;
          icon_size?: number | null;
          order_index?: number;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: Record<string, unknown>;
        };
        Insert: {
          key: string;
          value: Record<string, unknown>;
        };
        Update: {
          key?: string;
          value?: Record<string, unknown>;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ============================================
// Convenience types
// ============================================
export type Project         = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectCategory = Database["public"]["Tables"]["project_categories"]["Row"];
export type ProjectImage    = Database["public"]["Tables"]["project_images"]["Row"];
export type Skill           = Database["public"]["Tables"]["skills"]["Row"];
export type Certificate     = Database["public"]["Tables"]["certificates"]["Row"];

/** Helper: apakah sertifikat punya file upload */
export function certHasFile(cert: Certificate): boolean {
  return !!cert.file_url;
}
/** Helper: apakah sertifikat punya link verifikasi */
export function certHasLink(cert: Certificate): boolean {
  return !!cert.linkedin_url;
}

// Type gabungan untuk query dengan relasi (joins)
export type ProjectWithRelations = Project & {
  project_categories: ProjectCategory;
  project_images: ProjectImage[];
  project_skills?: Array<{ skill_id: string; skills: Skill }>;
};

// Type untuk admin list (hanya butuh nama category)
export type ProjectWithCategory = Project & {
  project_categories: { name: string } | null;
};

// ============================================
// Helper functions
// ============================================

/**
 * Ekstrak YouTube video ID dari berbagai format URL YouTube.
 * Mendukung: watch, youtu.be, embed
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Format: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Format: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

/**
 * Validasi apakah URL adalah URL YouTube yang valid.
 * Konsisten dengan extractYouTubeId — returns true iff extractYouTubeId returns non-null.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}
