import client from './client';
import { ModelMetrics } from '../types';

export const getModelPerformance = async (): Promise<ModelMetrics[]> => {
  const response = await client.get('/models/performance');
  return response.data;
};

export const getModelStatus = async (modelName: string): Promise<{ status: string }> => {
  const response = await client.get(`/models/${modelName}/status`);
  return response.data;
};
