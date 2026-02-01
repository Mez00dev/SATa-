import React from 'react';
import { TopicStat } from '../types';

interface RadarChartProps {
  stats: Record<string, TopicStat>;
  size?: number;
  color?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({ stats, size = 300, color = "#6366f1" }) => {
  const topics = Object.keys(stats);
  // Default to 6 points if empty to show a nice hexagon shape
  const labels = topics.length > 0 ? topics : ['Algebra', 'Geometry', 'Data', 'Grammar', 'Reading', 'Rhetoric'];
  const count = labels.length;
  const radius = size / 2;
  const center = size / 2;
  const angleSlice = (Math.PI * 2) / count;

  // Calculate points
  const getCoordinates = (value: number, index: number, maxRadius: number) => {
    const angle = index * angleSlice - Math.PI / 2; // Start from top
    return {
      x: center + Math.cos(angle) * maxRadius * value,
      y: center + Math.sin(angle) * maxRadius * value,
    };
  };

  const dataPoints = labels.map((label, i) => {
    const stat = stats[label];
    if (!stat || stat.total === 0) return { x: center, y: center }; // Center if no data
    const ratio = stat.correct / stat.total;
    return getCoordinates(ratio, i, radius - 20); // -20 for padding
  });

  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Grid lines
  const levels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grids */}
        {levels.map((level, i) => {
           const gridPoints = labels.map((_, idx) => {
              const p = getCoordinates(level, idx, radius - 20);
              return `${p.x},${p.y}`;
           }).join(' ');
           return (
             <polygon 
                key={i} 
                points={gridPoints} 
                fill="none" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="1" 
                strokeDasharray={level === 1 ? "0" : "4 4"}
             />
           );
        })}

        {/* Axes */}
        {labels.map((label, i) => {
           const end = getCoordinates(1.1, i, radius - 20);
           const p = getCoordinates(1, i, radius - 20);
           return (
             <g key={i}>
                <line x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text 
                  x={end.x} 
                  y={end.y} 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="text-[9px] uppercase font-bold fill-white/50"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {label.split(' ')[0]} {/* Shorten label */}
                </text>
             </g>
           );
        })}

        {/* Data Shape */}
        {dataPoints.length > 0 && (
          <>
            <polygon points={polygonPoints} fill={color} fillOpacity="0.3" stroke={color} strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="1" />
            ))}
          </>
        )}
      </svg>
    </div>
  );
};

export default RadarChart;