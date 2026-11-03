import client from './client';
import { KnowledgeGraph, GraphNode } from '../types';

export const getGraph = async (): Promise<KnowledgeGraph> => {
  const response = await client.get('/graph');
  return response.data;
};

export const getEntity = async (id: string): Promise<GraphNode> => {
  const response = await client.get(`/graph/entity/${id}`);
  return response.data;
};

export const queryGraph = async (query: string): Promise<KnowledgeGraph> => {
  const response = await client.post('/graph/query', { query });
  return response.data;
};
