
export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  university: string; // This will be a UUID string
  isEmailVerified: boolean;
  dateJoined: string;
  isActive: boolean;
  bio?: string;
  expertise?: string[];
};

export type Review = {
  id: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  user?: User;
};

export type Tag = {
  id: string;
  name: string;
}

export type Video = {
  id: string;
  title: string;
  video_file: string;
  created_at: string;
  updated_at: string;
}

export type Note = {
  id: string;
  title: string;
  note_file: string;
  created_at: string;
  updated_at: string;
}

export type Contribution = {
  id: string;
  user: string;
  title: string;
  description: string;
  price: string;
  course_code: string | null;
  thumbnail_image: string;
  department: {
    id: string;
    name: string;
  };
  related_University: {
    id: string;
    name: string;
  };
  tags: Tag[];
  videos: Video[];
  notes: Note[];
  ratings: string;
  created_at: string;
  updated_at: string;
};
