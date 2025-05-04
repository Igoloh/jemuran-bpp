import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { activityDetails, budgetCodes } = useAppContext();

  // PPIS section groupings
  const ppisGroups = {
    IPDS: ['2896.BMA.004', '2897.BMA.004', '2897.QDB.003', '2900.BMA.005', '2901.CAN.004'],
    NERACA: ['2898.BMA.007', '2899.BMA.006'],
    DISTRIBUSI: ['2902.BMA.004', '2902.BMA.006', '2903.BMA.009', '2908.BMA.004', '2908.BMA.009'],
    SOSIAL: ['2905.BMA.004', '2905.BMA.006', '2906.BMA.003', '2906.BMA.006', '2907.BMA.006', '2907.BMA.008'],
    PRODUKSI: ['2904.BMA.006', '2909.BMA.005', '2910.BMA.007', '2910.BMA.008']
  };

  // Calculate summary statistics using volume * value
  const totalOriginalValue = activityDetails.reduce((sum, item) => sum + (item.volumeOriginal * item.valueOriginal), 0);
  const totalRevisedValue = activityDetails.reduce((sum, item) => sum + (item.volumeRevised * item.valueRevised), 0);
  const totalDifference = totalRevisedValue - totalOriginalValue;
  const percentChange = totalOriginalValue ? (totalDifference / totalOriginalValue) * 100 : 0;

  // Calculate program distribution data
  const programTotals = budgetCodes.reduce((acc, code) => {
    const programDetails = activityDetails.filter(detail => detail.budgetCodeId === code.id);
    const programTotal = programDetails.reduce((sum, detail) => sum + (detail.volumeRevised * detail.valueRevised), 0);
    acc[code.program] = (acc[code.program] || 0) + programTotal;
    return acc;
  }, {} as Record<string, number>);

  const programData = {
    labels: ['Dukman', 'PPIS'],
    datasets: [
      {
        data: [
          programTotals['Dukman'] || 0,
          programTotals['PPIS'] || 0
        ],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderColor: ['#2563eb', '#059669'],
        borderWidth: 1,
      },
    ],
  };

  // Calculate quarterly withdrawal data
  const quarterlyTotals = budgetCodes.reduce(
    (acc, code) => {
      const withdrawal = code.quarterly_withdrawal || { q1: 0, q2: 0, q3: 0, q4: 0 };
      acc.q1 += withdrawal.q1 || 0;
      acc.q2 += withdrawal.q2 || 0;
      acc.q3 += withdrawal.q3 || 0;
      acc.q4 += withdrawal.q4 || 0;
      return acc;
    },
    { q1: 0, q2: 0, q3: 0, q4: 0 }
  );

  const quarterlyData = {
    labels: ['Triwulan I', 'Triwulan II', 'Triwulan III', 'Triwulan IV'],
    datasets: [
      {
        data: [quarterlyTotals.q1, quarterlyTotals.q2, quarterlyTotals.q3, quarterlyTotals.q4],
        backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
        borderColor: ['#d97706', '#059669', '#2563eb', '#7c3aed'],
        borderWidth: 1,
      },
    ],
  };

  // Calculate detailed grouping data
  const detailedGroupTotals = budgetCodes.reduce((acc, code) => {
    const details = activityDetails.filter(detail => detail.budgetCodeId === code.id);
    const total = details.reduce((sum, detail) => sum + (detail.volumeRevised * detail.valueRevised), 0);

    if (code.program === 'PPIS') {
      // Find which PPIS group this code belongs to
      for (const [group, codes] of Object.entries(ppisGroups)) {
        if (codes.includes(code.roCode)) {
          acc[group] = (acc[group] || 0) + total;
          break;
        }
      }
    } else {
      // Dukman grouping based on component code
      const group = code.componentCode === '001' ? 'BELANJA PEGAWAI - 51' : 'BELANJA BARANG - 52';
      acc[group] = (acc[group] || 0) + total;
    }

    return acc;
  }, {} as Record<string, number>);

  const detailedGroupData = {
    labels: [
      'IPDS', 'NERACA', 'DISTRIBUSI', 'SOSIAL', 'PRODUKSI',
      'BELANJA PEGAWAI - 51', 'BELANJA BARANG - 52'
    ],
    datasets: [
      {
        data: [
          detailedGroupTotals['IPDS'] || 0,
          detailedGroupTotals['NERACA'] || 0,
          detailedGroupTotals['DISTRIBUSI'] || 0,
          detailedGroupTotals['SOSIAL'] || 0,
          detailedGroupTotals['PRODUKSI'] || 0,
          detailedGroupTotals['BELANJA PEGAWAI - 51'] || 0,
          detailedGroupTotals['BELANJA BARANG - 52'] || 0
        ],
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
          '#6366f1', '#14b8a6'
        ],
        borderColor: [
          '#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777',
          '#4f46e5', '#0d9488'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculate percentages for quarterly withdrawals
  const totalWithdrawal = Object.values(quarterlyTotals).reduce((sum, value) => sum + value, 0);
  const quarterlyPercentages = {
    q1: totalWithdrawal ? (quarterlyTotals.q1 / totalWithdrawal) * 100 : 0,
    q2: totalWithdrawal ? (quarterlyTotals.q2 / totalWithdrawal) * 100 : 0,
    q3: totalWithdrawal ? (quarterlyTotals.q3 / totalWithdrawal) * 100 : 0,
    q4: totalWithdrawal ? (quarterlyTotals.q4 / totalWithdrawal) * 100 : 0,
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Monitoring</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Anggaran Semula</h2>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{formatCurrency(totalOriginalValue)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Anggaran Revisi</h2>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{formatCurrency(totalRevisedValue)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Selisih Anggaran</h2>
          <div className="mt-2 flex items-center">
            <p className={`text-3xl font-semibold ${totalDifference > 0 ? 'text-green-600' : totalDifference < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(totalDifference)}
            </p>
            <span className={`ml-2 text-sm ${totalDifference > 0 ? 'text-green-600' : totalDifference < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              ({percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Program Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Distribusi Program</h2>
          <div className="h-64 flex justify-center">
            <div className="w-64">
              <Doughnut 
                data={programData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw as number;
                          const total = programTotals['Dukman'] + programTotals['PPIS'];
                          const percentage = total ? ((value / total) * 100).toFixed(1) : '0';
                          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Quarterly Withdrawal Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Rencana Penarikan per Triwulan</h2>
          <div className="h-64 flex justify-center">
            <div className="w-64">
              <Doughnut 
                data={quarterlyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw as number;
                          const percentage = ((value / totalWithdrawal) * 100).toFixed(1);
                          return `${formatCurrency(value)} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Grouping Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Distribusi per Seksi dan Jenis Belanja</h2>
          <div className="h-64 flex justify-center">
            <div className="w-96">
              <Doughnut 
                data={detailedGroupData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw as number;
                          const total = Object.values(detailedGroupTotals).reduce((sum, v) => sum + v, 0);
                          const percentage = total ? ((value / total) * 100).toFixed(1) : '0';
                          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quarterly Withdrawal Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detail Rencana Penarikan</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { quarter: 'I', value: quarterlyTotals.q1, percent: quarterlyPercentages.q1 },
              { quarter: 'II', value: quarterlyTotals.q2, percent: quarterlyPercentages.q2 },
              { quarter: 'III', value: quarterlyTotals.q3, percent: quarterlyPercentages.q3 },
              { quarter: 'IV', value: quarterlyTotals.q4, percent: quarterlyPercentages.q4 },
            ].map(({ quarter, value, percent }) => (
              <div key={quarter} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Triwulan {quarter}</h4>
                <p className="mt-2 text-xl font-semibold text-gray-900">{formatCurrency(value)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {percent.toFixed(1)}% dari total
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;