import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, ArrowUp, ArrowDown, Trash2, Plus, Edit, ArrowRight } from 'lucide-react';

const Reports: React.FC = () => {
  const { activityLogs, budgetCodes, activityDetails } = useAppContext();
  const [dateFilter, setDateFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [quarterlyWithdrawal, setQuarterlyWithdrawal] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter logs based on date, program, and type
  const filteredLogs = activityLogs.filter(log => {
    const budgetCode = budgetCodes.find(code => code.id === log.budgetCodeId);
    const matchesProgram = programFilter === 'all' || (budgetCode && budgetCode.program === programFilter);
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    
    if (dateFilter === 'today') {
      const today = new Date();
      const logDate = new Date(log.timestamp);
      return matchesProgram && matchesType && 
        today.getDate() === logDate.getDate() &&
        today.getMonth() === logDate.getMonth() &&
        today.getFullYear() === logDate.getFullYear();
    }
    
    return matchesProgram && matchesType;
  });

  // Get activity details for a specific log
  const getActivityDetails = (log: typeof activityLogs[0]) => {
    return activityDetails.find(detail => detail.id === log.activityId);
  };

  // Calculate total withdrawal
  const totalWithdrawal = Object.values(quarterlyWithdrawal).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Aktivitas Revisi</h1>
        
        <div className="flex space-x-4">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
          </select>
          
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">Semua Program</option>
            <option value="Dukman">Dukman</option>
            <option value="PPIS">PPIS</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">Semua Jenis Perubahan</option>
            <option value="create">Penambahan</option>
            <option value="update">Perubahan</option>
            <option value="delete">Penghapusan</option>
          </select>
        </div>
      </div>

      {/* Quarterly Withdrawal Planning */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Rencana Penarikan Triwulan
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
            {['I', 'II', 'III', 'IV'].map((quarter, index) => (
              <div key={quarter}>
                <label htmlFor={`q${index + 1}`} className="block text-sm font-medium text-gray-700">
                  Triwulan {quarter}
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name={`q${index + 1}`}
                    id={`q${index + 1}`}
                    min="0"
                    value={quarterlyWithdrawal[`q${index + 1}` as keyof typeof quarterlyWithdrawal]}
                    onChange={(e) => setQuarterlyWithdrawal(prev => ({
                      ...prev,
                      [`q${index + 1}`]: Number(e.target.value)
                    }))}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Total Penarikan: {formatCurrency(totalWithdrawal)}
            </div>
            <button
              type="button"
              onClick={() => {/* Handle save */}}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Simpan Rencana
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="divide-y divide-gray-200">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const budgetCode = budgetCodes.find(code => code.id === log.budgetCodeId);
              const activityDetail = getActivityDetails(log);
              
              return (
                <div key={log.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        log.type === 'create' ? 'bg-green-100' :
                        log.type === 'update' ? 'bg-blue-100' :
                        'bg-red-100'
                      }`}>
                        {log.type === 'create' ? (
                          <Plus className={`h-5 w-5 text-green-600`} />
                        ) : log.type === 'update' ? (
                          <Edit className={`h-5 w-5 text-blue-600`} />
                        ) : (
                          <Trash2 className={`h-5 w-5 text-red-600`} />
                        )}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          {log.type === 'create' ? 'Penambahan Data Baru' :
                           log.type === 'update' ? 'Perubahan Data' :
                           'Penghapusan Data'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {budgetCode?.program} - {budgetCode?.roCode}
                      </p>
                      <p className="text-sm text-gray-500">
                        Komponen: {budgetCode?.componentCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div className="col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Detail Program</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <div className="space-y-1">
                              <p>RO: {budgetCode?.roTitle}</p>
                              <p>Komponen: {budgetCode?.componentTitle}</p>
                            </div>
                          </dd>
                        </div>

                        <div className="col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Detail Kegiatan</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <div className="space-y-2">
                              <div>
                                <p className="font-medium">Kode Kegiatan: {log.details.activityCode}</p>
                                <p>{log.details.activityTitle}</p>
                              </div>
                              
                              {log.type !== 'delete' && (
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div>
                                    <p className="text-sm text-gray-500">Volume</p>
                                    <div className="flex items-center space-x-2">
                                      <span>{log.details.volumeOriginal}</span>
                                      <ArrowRight className="h-4 w-4 text-gray-400" />
                                      <span className="font-medium">{log.details.volumeRevised}</span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-500">Nilai</p>
                                    <div className="flex items-center space-x-2">
                                      <span>{formatCurrency(log.details.valueOriginal || 0)}</span>
                                      <ArrowRight className="h-4 w-4 text-gray-400" />
                                      <span className="font-medium">
                                        {formatCurrency(log.details.valueRevised || 0)}
                                      </span>
                                    </div>
                                  </div>

                                  {activityDetail && (
                                    <div>
                                      <p className="text-sm text-gray-500">Satuan</p>
                                      <p>{activityDetail.unit}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </dd>
                        </div>

                        {log.type === 'update' && (
                          <div className="col-span-2 mt-2">
                            <dt className="text-sm font-medium text-gray-500">Perubahan</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Selisih Volume</p>
                                  <p className={`font-medium ${
                                    (log.details.volumeRevised || 0) - (log.details.volumeOriginal || 0) > 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {(log.details.volumeRevised || 0) - (log.details.volumeOriginal || 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Selisih Nilai</p>
                                  <p className={`font-medium ${
                                    (log.details.valueRevised || 0) - (log.details.valueOriginal || 0) > 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {formatCurrency(
                                      (log.details.valueRevised || 0) - (log.details.valueOriginal || 0)
                                    )}
                                  </p>
                                </div>
                              </div>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-500">
              Tidak ada aktivitas yang tercatat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;