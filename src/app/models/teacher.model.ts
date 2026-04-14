export interface Role {
  id: string;
  name: string;
}

export interface UserRef {
  id: string;
  name?: string;
  email?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  user?: UserRef;
  role?: Role;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CollectionResponse<T> {
  message?: string;
  data: T[];
}
