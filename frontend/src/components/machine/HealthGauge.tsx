import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface Props {
  score: number;
}

const HealthGauge: React.FC<Props> = ({ score }) => {
  const data = [{ name: 'health', value: score }];
  
  let color = '#22C55E'; // Green
  if (score < 50) color = '#EF4444'; // Red
  else if (score < 80) color = '#EAB308'; // Yellow

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={15} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#F1F5F9' }}
            dataKey="value"
            fill={color}
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <span className="text-4xl font-bold text-slate-800">{score}%</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
};

export default HealthGauge;
