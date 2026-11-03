import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { ProcessingStatus } from '../../types';

interface Props {
  status: ProcessingStatus;
}

const steps = [
  'Uploading',
  'OCR',
  'Layout Analysis',
  'Table Analysis',
  'Embedding',
  'Knowledge Graph',
  'Ready'
];

const ProcessingSteps: React.FC<Props> = ({ status }) => {
  const stepName = status?.currentStep || status?.step || 'Uploading';
  const currentIndex = Math.max(0, steps.findIndex(s => s.toLowerCase().includes(stepName.toLowerCase().slice(0, 4))));

  return (
    <div className="py-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step} className="flex items-start mb-4 last:mb-0">
            <div className="flex flex-col items-center mr-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                isCompleted ? 'bg-green-100 border-green-500 text-green-600' :
                isCurrent ? 'border-primary text-primary' :
                'border-slate-200 text-slate-300'
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : 
                 isCurrent ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 <span className="text-xs font-medium">{index + 1}</span>}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-6 my-1 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`}></div>
              )}
            </div>
            <div className="pt-1 flex-1">
              <p className={`font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                {step}
              </p>
              {isCurrent && status.progress > 0 && (
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${status.progress}%` }}></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {status?.error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          Error: {status.error}
        </div>
      )}
    </div>
  );
};

export default ProcessingSteps;
