import client from './client';
import { SensorData, PredictionResult } from '../types';

export const predictFromCSV = async (file: File): Promise<PredictionResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/machine/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeData = async (data: SensorData[]): Promise<PredictionResult> => {
  const response = await client.post('/machine/analyze', { data });
  return response.data;
};

export const getPredictions = async (): Promise<PredictionResult[]> => {
  return [];
};
