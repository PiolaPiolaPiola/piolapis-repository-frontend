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
  lastName: string;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
  role: string;
  code?: string | null;
  type?: string | null;
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

export interface Variable {
  id: string | null;
  name: string;
  description: string;
  code?: string | null;
  type?: string | null;
  dataType: string;
  exampleValue?: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface Documentation {
  id: string | null;
  name: string;
  description: string;
  code?: string | null;
  type?: string | null;
  proyectoId: string;
  configuracionDocumentacionId: string;
  plantillaDtoId: string;
  version: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface CodeMessage {
  id: string | null;
  name: string;
  description: string;
  code?: string | null;
  type?: string | null;
  httpCode: string;
  response: string;
  responseType: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface Project {
  id: string | null;
  name: string;
  description: string;
  type?: string | null;
  code?: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}