import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Plus, Edit, Trash2, Copy, ClipboardPaste, Save } from 'lucide-react';

const DetailEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { budgetCodes, activityDetails, addActivityDetail, updateActivityDetail, deleteActivityDetail } = useAppContext();
  
  // Activity code mappings - sorted
  const activityCodes = {
    PPIS: ['521811', '524113', '522151', '524114', '521213', '521211', '522119', '521219'].sort(),
    Dukman: {
      '001': ['511111', '511119', '511121', '511122', '511123', '511124', '511125', '511126', '511129', '511151', '512211', '512411'].sort(),
      '051': ['521111', '521115', '521252', '521811', '522111', '522191', '523111', '523121', '524111'].sort(),
      '002': ['521111', '521115', '521252', '521811', '522111', '522191', '523111', '523121', '524111'].sort() // Same as '051'
    }
  };

  // Activity titles mapping
  const activityTitles: Record<string, string> = {
    '521211': 'Belanja Bahan',
    '521213': 'Belanja Honor Output Kegiatan',
    '521219': 'Belanja Barang Non Operasional Lainnya',
    '521811': 'Belanja Barang Persediaan Barang Konsumsi',
    '522119': 'Belanja Langganan Daya dan Jasa Lainnya',
    '522151': 'Belanja Jasa Profesi',
    '524113': 'Belanja Perjalanan Dinas Dalam Kota',
    '524114': 'Belanja Perjalanan Dinas Paket Meeting Dalam Kota',
    '521111': 'Belanja Keperluan Perkantoran',
    '521115': 'Belanja Honor Operasional Satuan Kerja',
    '521252': 'Belanja Peralatan dan Mesin - Ekstrakomptabel',
    '522111': 'Belanja Langganan Listrik',
    '522191': 'Belanja Jasa Lainnya',
    '523111': 'Belanja Pemeliharaan Gedung dan Bangunan',
    '523121': 'Belanja Pemeliharaan Peralatan dan Mesin',
    '524111': 'Belanja Perjalanan Dinas Biasa',
    '511111': 'Belanja Gaji Pokok PNS',
    '511119': 'Belanja Pembulatan Gaji PNS',
    '511121': 'Belanja Tunj. Suami/Istri PNS',
    '511122': 'Belanja Tunj. Anak PNS',
    '511123': 'Belanja Tunj. Struktural PNS',
    '511124': 'Belanja Tunj. Fungsional PNS',
    '511125': 'Belanja Tunj. PPh PNS',
    '511126': 'Belanja Tunj. Beras PNS',
    '511129': 'Belanja Uang Makan PNS',
    '511151': 'Belanja Tunjangan Umum PNS',
    '512211': 'Belanja Uang Lembur',
    '512411': 'Belanja Pegawai (Tunjangan Khusus/Kegiatan)'
  };

  // Unit mappings based on program and component - sorted
  const unitOptions = {
    PPIS: ['BS', 'Dok', 'KG', 'LMBR', 'O-B', 'O-J', 'O-JP', 'O-K', 'O-P', 'Paket', 'RESP', 'Ruta', 'SGMEN', 'Set'],
    Dukman: {
      '001': ['BLN', 'THN'].sort(),
      '002': ['M2/THN', 'O-B', 'O-P', 'Paket', 'THN', 'U/THN', 'Unit'].sort(), // Same as 'other'
      other: ['M2/THN', 'O-B', 'O-P', 'Paket', 'THN', 'U/THN', 'Unit'].sort()
    }
  };

  // Add state for copied activity
  const [copiedActivity, setCopiedActivity] = useState<Partial<ActivityDetail> | null>(null);

  // Find the budget code
  const budgetCode = budgetCodes.find(code => code.id === id);
  
  // Get available activity codes based on program and component
  const getAvailableActivityCodes = () => {
    if (!budgetCode) return [];
    
    if (budgetCode.program === 'PPIS') {
      return activityCodes.PPIS;
    } else {
      return activityCodes.Dukman[budgetCode.componentCode as '001' | '051' | '002'] || [];
    }
  };

  // Get available units based on program and component
  const getAvailableUnits = () => {
    if (!budgetCode) return [];
    
    if (budgetCode.program === 'PPIS') {
      return unitOptions.PPIS;
    } else {
      return budgetCode.componentCode === '001' 
        ? unitOptions.Dukman['001']
        : budgetCode.componentCode === '002'
          ? unitOptions.Dukman['002']
          : unitOptions.Dukman.other;
    }
  };

  // Get activity details for this budget code and group by code
  const filteredDetails = activityDetails.filter(detail => detail.budgetCodeId === id);
  const groupedDetails = filteredDetails.reduce((groups, detail) => {
    const code = detail.activityCode;
    if (!groups[code]) {
      groups[code] = [];
    }
    groups[code].push(detail);
    return groups;
  }, {} as Record<string, typeof activityDetails>);

  // Sort grouped details by activity code
  const sortedActivityCodes = Object.keys(groupedDetails).sort();
  
  // State for new/edit activity form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    activityCode: '',
    activityTitle: '',
    details: '',
    unit: '',
    volumeOriginal: 0,
    volumeRevised: 0,
    valueOriginal: 0,
    valueRevised: 0
  });

  // Format number with thousand separators
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Parse formatted number back to numeric value
  const parseFormattedNumber = (value: string) => {
    return parseInt(value.replace(/\D/g, '')) || 0;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'activityCode') {
      // Auto-set activity title based on code
      setFormData(prev => ({
        ...prev,
        activityCode: value,
        activityTitle: activityTitles[value] || ''
      }));
    } else if (['valueOriginal', 'valueRevised'].includes(name)) {
      // For value fields, parse the formatted number
      const numericValue = parseFormattedNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (['volumeOriginal', 'volumeRevised'].includes(name)) {
      // For volume fields, ensure minimum value of 0
      const numValue = Math.max(0, parseFloat(value) || 0);
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentActivityId) {
      // Update existing activity
      updateActivityDetail(currentActivityId, formData);
    } else {
      // Add new activity
      addActivityDetail({
        ...formData,
        budgetCodeId: id || ''
      });
    }
    
    // Reset form and state
    resetForm();
  };
  
  // Reset form and state
  const resetForm = () => {
    setFormData({
      activityCode: '',
      activityTitle: '',
      details: '',
      unit: '',
      volumeOriginal: 0,
      volumeRevised: 0,
      valueOriginal: 0,
      valueRevised: 0
    });
    setIsFormOpen(false);
    setIsEditing(false);
    setCurrentActivityId(null);
  };
  
  // Edit activity
  const handleEdit = (activity: typeof activityDetails[0]) => {
    setFormData({
      activityCode: activity.activityCode,
      activityTitle: activity.activityTitle,
      details: activity.details || '',
      unit: activity.unit,
      volumeOriginal: activity.volumeOriginal,
      volumeRevised: activity.volumeRevised,
      valueOriginal: activity.valueOriginal,
      valueRevised: activity.valueRevised
    });
    setCurrentActivityId(activity.id);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Add copy handler
  const handleCopy = (activity: typeof activityDetails[0]) => {
    const activityData = {
      activityCode: activity.activityCode,
      activityTitle: activity.activityTitle,
      details: activity.details,
      unit: activity.unit,
      volumeOriginal: activity.volumeOriginal,
      volumeRevised: activity.volumeRevised,
      valueOriginal: activity.valueOriginal,
      valueRevised: activity.valueRevised
    };
    setCopiedActivity(activityData);
  };

  // Add paste handler
  const handlePaste = () => {
    if (copiedActivity) {
      setFormData({
        ...copiedActivity,
        budgetCodeId: id || ''
      });
      setIsFormOpen(true);
      setIsEditing(false);
      setCurrentActivityId(null);
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  // Calculate totals
  const totalOriginal = filteredDetails.reduce((sum, detail) => sum + (detail.volumeOriginal * detail.valueOriginal), 0);
  const totalRevised = filteredDetails.reduce((sum, detail) => sum + (detail.volumeRevised * detail.valueRevised), 0);
  const totalDifference = totalRevised - totalOriginal;
  
  if (!budgetCode) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">Kode anggaran tidak ditemukan.</p>
        <button
          onClick={() => navigate('/budget-codes')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Kode Anggaran
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/budget-codes')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detail Kegiatan</h1>
        </div>
        <div className="flex space-x-2">
          {copiedActivity && (
            <button
              onClick={handlePaste}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              
              <ClipboardPaste className="h-4 w-4 mr-2" />
              Tempel Kegiatan
            </button>
          )}
          <button
            onClick={() => {
              setIsFormOpen(true);
              setIsEditing(false);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kegiatan
          </button>
        </div>
      </div>
      
      {/* Budget Code Info */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informasi Kode Anggaran</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Program</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  budgetCode.program === 'Dukman' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {budgetCode.program}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Kode RO</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{budgetCode.roCode}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Judul RO</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{budgetCode.roTitle}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Kode Komponen</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{budgetCode.componentCode}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Judul Komponen</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{budgetCode.componentTitle}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Activity Form */}
      {isFormOpen && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isEditing ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="activityCode" className="block text-sm font-medium text-gray-700">
                    Kode Kegiatan
                  </label>
                  <select
                    name="activityCode"
                    id="activityCode"
                    value={formData.activityCode}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Pilih Kode Kegiatan</option>
                    {getAvailableActivityCodes().map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                
                <div className="sm:col-span-4">
                  <label htmlFor="activityTitle" className="block text-sm font-medium text-gray-700">
                    Judul Kegiatan
                  </label>
                  <input
                    type="text"
                    name="activityTitle"
                    id="activityTitle"
                    value={formData.activityTitle}
                    readOnly
                    className="mt-1 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                    Detail
                  </label>
                  <textarea
                    name="details"
                    id="details"
                    rows={3}
                    value={formData.details}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                    Satuan
                  </label>
                  <select
                    name="unit"
                    id="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Pilih Satuan</option>
                    {getAvailableUnits().map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="volumeOriginal" className="block text-sm font-medium text-gray-700">
                        Volume Semula
                      </label>
                      <input
                        type="number"
                        name="volumeOriginal"
                        id="volumeOriginal"
                        min="0"
                        value={formData.volumeOriginal}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="volumeRevised" className="block text-sm font-medium text-gray-700">
                        Volume Menjadi
                      </label>
                      <input
                        type="number"
                        name="volumeRevised"
                        id="volumeRevised"
                        min="0"
                        value={formData.volumeRevised}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="valueOriginal" className="block text-sm font-medium text-gray-700">
                        Nilai Semula
                      </label>
                      <input
                        type="text"
                        name="valueOriginal"
                        id="valueOriginal"
                        value={formatNumber(formData.valueOriginal)}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="valueRevised" className="block text-sm font-medium text-gray-700">
                        Nilai Menjadi
                      </label>
                      <input
                        type="text"
                        name="valueRevised"
                        id="valueRevised"
                        value={formatNumber(formData.valueRevised)}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Simpan Perubahan' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Activity Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Daftar Kegiatan</h3>
          <div className="flex space-x-4">
            <div className="text-sm text-gray-500">
              Total Semula: <span className="font-medium">{formatCurrency(totalOriginal)}</span>
            </div>
            <div className="text-sm text-gray-500">
              Total Menjadi: <span className="font-medium">{formatCurrency(totalRevised)}</span>
            </div>
            <div className="text-sm">
              Selisih: <span className={`font-medium ${totalDifference > 0 ? 'text-green-600' : totalDifference < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {formatCurrency(totalDifference)}
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {sortedActivityCodes.map((code) => {
            const activities = groupedDetails[code];
            return (
              <div key={code} className="border-t border-gray-200">
                <div className="bg-gray-50 px-6 py-3">
                  <h4 className="text-sm font-medium text-gray-700">Kode Kegiatan: {code}</h4>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Judul Kegiatan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detail
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satuan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume Semula
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume Menjadi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nilai Semula
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nilai Menjadi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Semula
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Menjadi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Selisih
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => {
                      const totalOriginal = activity.volumeOriginal * activity.valueOriginal;
                      const totalRevised = activity.volumeRevised * activity.valueRevised;
                      const totalDifference = totalRevised - totalOriginal;
                      
                      return (
                        <tr key={activity.id}>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {activity.activityTitle}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {activity.details}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {activity.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.volumeOriginal}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.volumeRevised}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(activity.valueOriginal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(activity.valueRevised)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(totalOriginal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(totalRevised)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={totalDifference > 0 ? 'text-green-600' : totalDifference < 0 ? 'text-red-600' : 'text-gray-500'}>
                              {formatCurrency(totalDifference)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleCopy(activity)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Salin Kegiatan"
                              >
                                <Copy className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(activity)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit Kegiatan"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => deleteActivityDetail(activity.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Hapus Kegiatan"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
          {filteredDetails.length === 0 && (
            <div className="px-6 py-4 text-center text-sm text-gray-500">
              Belum ada data kegiatan. Silakan tambahkan kegiatan baru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailEntry;