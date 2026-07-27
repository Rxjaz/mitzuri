export type User = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};
