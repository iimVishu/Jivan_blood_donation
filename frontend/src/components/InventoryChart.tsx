"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'A+', units: 120 },
  { name: 'A-', units: 45 },
  { name: 'B+', units: 150 },
  { name: 'B-', units: 30 },
  { name: 'AB+', units: 80 },
  { name: 'AB-', units: 15 },
  { name: 'O+', units: 200 },
  { name: 'O-', units: 60 },
];

const COLORS = ['#ef4444', '#f87171', '#ef4444', '#f87171', '#ef4444', '#f87171', '#ef4444', '#f87171'];

export default function InventoryChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
          <Tooltip 
            cursor={{ fill: '#fef2f2' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Bar dataKey="units" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
