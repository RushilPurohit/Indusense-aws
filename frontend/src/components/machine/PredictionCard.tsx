import React from 'react';
import { PredictionResult } from '../../types';
import { AlertTriangle, Wrench, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';
import HealthGauge from './HealthGauge';

interface Props {
  prediction: PredictionResult;
}

const PredictionCard: React.FC<Props> = ({ prediction }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">AI Diagnostics</h3>
        <Badge type={prediction.status} />
      </div>
      
      <div className="p-6">
        <HealthGauge score={prediction.healthScore} />
        
        <div className="mt-6 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <h4 className="flex items-center text-sm font-bold text-orange-800 mb-1">
              <AlertTriangle className="w-4 h-4 mr-1.5" /> Predicted Fault
            </h4>
            <p className="text-sm text-orange-900 font-medium">{prediction.predictedFault}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-orange-700">Model Confidence</span>
              <span className="font-bold text-orange-800">{Math.round(prediction.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-1.5 mt-1">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${prediction.confidence * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="flex items-center text-sm font-bold text-blue-800 mb-1">
              <Wrench className="w-4 h-4 mr-1.5" /> Recommended Action
            </h4>
            <p className="text-sm text-blue-900">{prediction.recommendedInspection}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
