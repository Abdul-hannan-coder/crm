export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface Session {
  user: User;
}
