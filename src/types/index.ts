export interface UserSession {
  id: string;
  username: string;
  name: string;
  lastName: string;
  role: string;
}

export interface User {
  id: string | null;
  username?: string;
  password?: string;
  name: string;
  lastName: string;
  description: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
  role: string;
}

export interface Project {
  id: string | null;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface ApiConfiguration {
  id: string;
  format: 'JSON' | 'SCHEMA';
  apiType: 'REST' | 'GRAPHQL';
  rulesDescription: string;
}

export interface DocumentationSetting {
  id: string | null;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
  baseEndpoint: string;
  apiType: string;
  proyectoId: string;
}