export type ContentType = 'image' | 'excel' | 'pdf';
export type SidebarPosition = 'left_top' | 'left_bottom' | 'right_top' | 'right_bottom';
export type SidebarContentType = 'image' | 'excel' | 'text';

export interface BoardContent {
  id: string;
  section: string | null;
  slot_key: string | null;
  title: string;
  content_type: ContentType;
  file_url: string | null;
  file_name: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RunningText {
  id: string;
  text: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SidebarContent {
  id: string;
  position: SidebarPosition;
  title: string;
  content_type: SidebarContentType;
  file_url: string | null;
  file_name: string | null;
  text_content: string | null;
  is_scroll?: boolean; // <-- TAMBAHKAN BARIS INI
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PanelSetting {
  id: string;
  position: SidebarPosition;
  title: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  display_name: string;
  created_at: string;
}

export const SIDEBAR_POSITIONS: { key: SidebarPosition; label: string }[] = [
  { key: 'left_top', label: 'Sidebar Kiri Atas' },
  { key: 'left_bottom', label: 'Sidebar Kiri Bawah' },
  { key: 'right_top', label: 'Sidebar Kanan Atas' },
  { key: 'right_bottom', label: 'Sidebar Kanan Bawah' },
];

export interface Database {
  public: {
    Tables: {
      board_content: {
        Row: BoardContent;
        Insert: Omit<BoardContent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BoardContent, 'id' | 'created_at' | 'updated_at'>>;
      };
      running_text: {
        Row: RunningText;
        Insert: Omit<RunningText, 'id' | 'created_at'>;
        Update: Partial<Omit<RunningText, 'id' | 'created_at'>>;
      };
      sidebar_content: {
        Row: SidebarContent;
        Insert: Omit<SidebarContent, 'id' | 'created_at'>;
        Update: Partial<Omit<SidebarContent, 'id' | 'created_at'>>;
      };
      panel_settings: {
        Row: PanelSetting;
        Insert: Omit<PanelSetting, 'id' | 'updated_at'>;
        Update: Partial<Omit<PanelSetting, 'id' | 'updated_at'>>;
      };
      admin_profiles: {
        Row: AdminProfile;
        Insert: {
          id: string;
          display_name?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AdminProfile, 'id' | 'created_at'>>;
      };
    };
  };
}
