
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  provider: 'email' | 'google';
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  sources?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdatedAt: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  embedding?: number[];
  createdAt: number;
}

export interface VectorMatch {
  document: KnowledgeDocument;
  score: number;
}

export interface SystemNotification {
  id: number;
  type: 'info' | 'success' | 'alert' | 'zap' | 'shield';
  title: string;
  message: string;
  time: string;
  read: boolean;
}
