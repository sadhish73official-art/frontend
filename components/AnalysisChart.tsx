import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AnalysisResult } from '../types';

interface AnalysisChartProps {
  data: AnalysisResult;
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Security', count: data.open_passwords.length + data.open_keys.length, color: '#ef4444' }, // red-500
    { name: 'Linting', count: data.lint_issues.length, color: '#f59e0b' }, // amber-500
    { name: 'Suggestions', count: data.optimization.length, color: '#3b82f6' }, // blue-500
    { name: 'Duplicates', count: data.duplicate_code.exact_duplicates.length, color: '#8b5cf6' }, // violet-500
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};