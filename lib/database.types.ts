export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          cover_image: string;
          created_at: string;
          teacher_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          cover_image?: string;
          created_at?: string;
          teacher_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          cover_image?: string;
          created_at?: string;
          teacher_id?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
      };
    };
  };
}
