import { useState, useEffect } from 'react';
import { MachineHealth, SensorData, PredictionResult } from '../types';
import * as api from '../api/machine';

export const useMachineHealth = () => {
  const [healthStatus, setHealthStatus] = useState<MachineHealth | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock initial data
    setHealthStatus({
      machineId: 'IRB-6700-01',
      healthScore: 85,
      status: 'Warning',
      lastUpdated: new Date().toISOString()
    });
    setPredictions([
      {
        status: 'Warning',
        healthScore: 85,
        predictedFault: 'Bearing Wear (Axis 2)',
        confidence: 0.78,
        recommendedInspection: 'Inspect axis 2 lubrication and listen for abnormal noise.'
      }
    ]);
  }, []);

  const analyzeSensorData = async (data: SensorData[]) => {
    setLoading(true);
    try {
      const result = await api.analyzeData(data);
      setPredictions(prev => [result, ...prev]);
      setHealthStatus(prev => prev ? { ...prev, healthScore: result.healthScore, status: result.status } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { healthStatus, predictions, loading, analyzeSensorData };
};
