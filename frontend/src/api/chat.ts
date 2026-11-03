import client from './client';
import { QueryResponse } from '../types';

export const sendQuery = async (query: string): Promise<QueryResponse> => {
  const response = await client.post('/chat/query', { query });
  return response.data;
};

export const sendMultiDocumentQuery = async (query: string, documentIds: string[]): Promise<QueryResponse> => {
  const response = await client.post('/chat/multi-query', { query, documentIds });
  return response.data;
};

export const getChatHistory = async (): Promise<any[]> => {
  const response = await client.get('/chat/history');
  return response.data;
};

export const clearHistory = async (): Promise<void> => {
  await client.post('/chat/clear');
};
