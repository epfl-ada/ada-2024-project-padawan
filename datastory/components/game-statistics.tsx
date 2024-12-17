'use client';

import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export function GameStatistics() {
  // Placeholder data (replace with real values)
  const stats = [
    { label: 'Genre', value: 'Action' },
    { label: 'Studio', value: 'Epic Games' },
    { label: 'Videos Published', value: 1240 },
    { label: 'Channels', value: 85 },
    { label: 'Subscribers Median', value: 20000},
    { label: 'Percentage of gaming videos', value: '20%'},
  ];


  // Line chart data for likes/views over time
  const likesViewsData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Likes/Views Over Time',
        data: [3000, 4500, 2800, 8000, 5600, 7000],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
      },
    ],
  };

  // Histogram data for video durations
  const videoDurationData = {
    labels: ['0-5 min', '5-10 min', '10-20 min', '20-30 min', '30+ min'],
    datasets: [
      {
        label: 'Video Durations',
        data: [200, 300, 150, 50, 20],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-6 gap-4 p-6 rounded-lg">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-zinc-500 bg-opacity-80 p-6 col-span-2 rounded-lg shadow-md flex flex-col items-start"
        >
          <h3 className="text-lg font-pixel text-white-500">{stat.label}</h3>
          <p className="text-2xl font-pixel text-white-900">{stat.value}</p>
        </div>
      ))}
      <div className="col-span-3 bg-zinc-700 bg-opacity-90 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-pixel text-white">
          Likes/Views Over Time
        </h3>
        <div className="h-72">
          <Line data={likesViewsData} options={chartOptions} />
        </div>
      </div>
      <div className="col-span-3 bg-zinc-700 bg-opacity-90 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-pixel text-white">
          Distribution of Video Length
        </h3>
        <div className="h-72">
          <Line data={videoDurationData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
