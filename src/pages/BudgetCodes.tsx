import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { FileText, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const BudgetCodes: React.FC = () => {
  const { budgetCodes, activityDetails, deleteBudgetCode, updateQuarterlyWithdrawal } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState<'all' | 'Dukman' | 'PPIS'>('all');
  const [filterRoCode, setFilterRoCode] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [editingWithdrawal, setEditingWithdrawal] = useState<string | null>(null);
  const [withdrawalForm, setWithdrawalForm] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0
  });
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    budgetCodeId: string | null;
    budgetCodeTitle: string;
  }>({
    isOpen: false,
    budgetCodeId: null,
    budgetCodeTitle: ''
  });
  const itemsPerPage = 10;

  // PPIS section groupings
  const ppisGroups = {
    IPDS: ['2896.BMA.004', '2897.BMA.004', '2897.QDB.003', '2900.BMA.005', '2901.CAN.004'],
    NERACA: ['2898.BMA.007', '2899.BMA.006'],
    DISTRIBUSI: ['2902.BMA.004', '2902.BMA.006', '2903.BMA.009', '2908.BMA.004', '2908.BMA.009'],
    SOSIAL: ['2905.BMA.004', '2905.BMA.006', '2906.BMA.003', '2906.BMA.006', '2907.BMA.006', '2907.BMA.008'],
    PRODUKSI: ['2904.BMA.006', '2909.BMA.005', '2910.BMA.007', '2910.BMA.008']
  };

  // Dukman groupings
  const dukmanGroups = {
    'BELANJA PEGAWAI - 51': ['001'],
    'BELANJA BARANG - 52': ['002', '051']
  };

  // Get section for a PPIS RO code
  const getPPISSection = (roCode: string): string => {
    for (const [section, codes] of Object.entries(ppisGroups)) {
      if (codes.includes(roCode)) {
        return section;
      }
    }
    return '';
  };

  // Get group for a Dukman component code
  const getDukmanGroup = (componentCode: string): string => {
    for (const [group, codes] of Object.entries(dukmanGroups)) {
      if (codes.includes(componentCode)) {
        return group;
      }
    }
    return 'BELANJA BARANG - 52'; // Default group for other codes
  };

  // Get unique RO codes for filter dropdown
  const uniqueRoCodes = Array.from(new Set(budgetCodes.map(code => code.roCode))).sort();

  // Filter and sort budget codes
  const filteredBudgetCodes = budgetCodes
    .filter(code => {
      const matchesSearch = 
        (code.roCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (code.roTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (code.componentCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (code.componentTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesProgram = filterProgram === 'all' || code.program === filterProgram;
      const matchesRoCode = !filterRoCode || code.roCode === filterRoCode;
      const matchesSection = filterSection === 'all' || 
        (code.program === 'PPIS' ? getPPISSection(code.roCode) === filterSection : getDukmanGroup(code.componentCode) === filterSection);
      
      return matchesSearch && matchesProgram && matchesRoCode && matchesSection;
    })
    .sort((a, b) => {
      if (a.program === 'PPIS') {
        // Sort PPIS by section
        const sectionA = getPPISSection(a.roCode);
        const sectionB = getPPISSection(b.roCode);
        const sectionCompare = sectionA.localeCompare(sectionB);
        if (sectionCompare !== 0) return sectionCompare;
      } else {
        // Sort Dukman by group
        const groupA = getDukmanGroup(a.componentCode);
        const groupB = getDukmanGroup(b.componentCode);
        const groupCompare = groupA.localeCompare(groupB);
        if (groupCompare !== 0) return groupCompare;
      }
      
      // Then sort by RO code
      const roCodeCompare = a.roCode.localeCompare(b.roCode);
      if (roCodeCompare !== 0) return roCodeCompare;
      
      // Finally sort by component code
      return a.componentCode.localeCompare(b.componentCode);
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredBudgetCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredBudgetCodes.slice(startIndex, endIndex);

  // Group items by section/group
  const groupedItems = currentItems.reduce((acc, code) => {
    const group = code.program === 'PPIS' 
      ? getPPISSection(code.roCode)
      : getDukmanGroup(code.componentCode);
    
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(code);
    return acc;
  }, {} as Record<string, typeof currentItems>);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total values for each budget code
  const getBudgetCodeTotals = (budgetCodeId: string) => {
    const details = activityDetails.filter(detail => detail.budgetCodeId === budgetCodeId);
    const originalTotal = details.reduce((sum, detail) => sum + (detail.volumeOriginal * detail.valueOriginal), 0);
    const revisedTotal = details.reduce((sum, detail) => sum + (detail.volumeRevised * detail.valueRevised), 0);
    
    return { originalTotal, revisedTotal, difference: revisedTotal - originalTotal };
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format number with thousand separators
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Parse formatted number back to numeric value
  const parseFormattedNumber = (value: string) => {
    return parseInt(value.replace(/\D/g, '')) || 0;
  };

  const handleWithdrawalEdit = (code: typeof budgetCodes[0]) => {
    setEditingWithdrawal(code.id);
    setWithdrawalForm(code.quarterly_withdrawal || { q1: 0, q2: 0, q3: 0, q4: 0 });
    setWithdrawalError(null);
  };

  const handleWithdrawalSave = (id: string) => {
    const { revisedTotal } = getBudgetCodeTotals(id);
    const totalWithdrawal = Object.values(withdrawalForm).reduce((sum, value) => sum + value, 0);

    if (totalWithdrawal !== revisedTotal) {
      setWithdrawalError(`Total penarikan (${formatCurrency(totalWithdrawal)}) harus sama dengan total menjadi (${formatCurrency(revisedTotal)})`);
      return;
    }

    updateQuarterlyWithdrawal(id, withdrawalForm);
    setEditingWithdrawal(null);
    setWithdrawalError(null);
  };

  const handleWithdrawalChange = (quarter: keyof typeof withdrawalForm, value: string) => {
    const numericValue = parseFormattedNumber(value);
    setWithdrawalForm(prev => ({
      ...prev,
      [quarter]: numericValue
    }));
    setWithdrawalError(null);
  };

  const handleDeleteClick = (code: typeof budgetCodes[0]) => {
    setDeleteConfirmation({
      isOpen: true,
      budgetCodeId: code.id,
      budgetCodeTitle: `${code.roCode} - ${code.roTitle}`
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.budgetCodeId) {
      await deleteBudgetCode(deleteConfirmation.budgetCodeId);
      setDeleteConfirmation({
        isOpen: false,
        budgetCodeId: null,
        budgetCodeTitle: ''
      });
    }
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProgram, filterRoCode, filterSection]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kode Anggaran</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Cari
            </label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Cari kode atau judul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700">
              Filter Program
            </label>
            <select
              id="program-filter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filterProgram}
              onChange={(e) => {
                setFilterProgram(e.target.value as 'all' | 'Dukman' | 'PPIS');
                setFilterSection('all');
              }}
            >
              <option value="all">Semua Program</option>
              <option value="Dukman">Dukman</option>
              <option value="PPIS">PPIS</option>
            </select>
          </div>
          {filterProgram !== 'all' && (
            <div>
              <label htmlFor="section-filter" className="block text-sm font-medium text-gray-700">
                Filter {filterProgram === 'PPIS' ? 'Seksi' : 'Jenis Belanja'}
              </label>
              <select
                id="section-filter"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="all">Semua {filterProgram === 'PPIS' ? 'Seksi' : 'Jenis Belanja'}</option>
                {filterProgram === 'PPIS'
                  ? Object.keys(ppisGroups).map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))
                  : Object.keys(dukmanGroups).map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))
                }
              </select>
            </div>
          )}
          <div>
            <label htmlFor="ro-code-filter" className="block text-sm font-medium text-gray-700">
              Filter Kode RO
            </label>
            <select
              id="ro-code-filter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filterRoCode}
              onChange={(e) => setFilterRoCode(e.target.value)}
            >
              <option value="">Semua Kode RO</option>
              {uniqueRoCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budget Codes Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="border-t border-gray-200">
              <div className="bg-gray-50 px-6 py-3">
                <h4 className="text-sm font-medium text-gray-700">{group}</h4>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode RO
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul RO
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Komponen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul Komponen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rencana Penarikan
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length > 0 ? (
                    items.map((code) => {
                      const { originalTotal, revisedTotal, difference } = getBudgetCodeTotals(code.id);
                      const isEditing = editingWithdrawal === code.id;
                      const withdrawal = isEditing ? withdrawalForm : (code.quarterly_withdrawal || { q1: 0, q2: 0, q3: 0, q4: 0 });
                      const totalWithdrawal = Object.values(withdrawal).reduce((sum, value) => sum + value, 0);
                      
                      return (
                        <tr key={code.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {code.roCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {code.roTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {code.componentCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {code.componentTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              code.program === 'Dukman' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {code.program}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(originalTotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(revisedTotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-500'}>
                              {formatCurrency(difference)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  {['I', 'II', 'III', 'IV'].map((quarter, index) => (
                                    <div key={quarter} className="col-span-1">
                                      <label className="block text-xs font-medium text-gray-700">
                                        TW {quarter}
                                      </label>
                                      <input
                                        type="text"
                                        value={formatNumber(withdrawal[`q${index + 1}` as keyof typeof withdrawal])}
                                        onChange={(e) => handleWithdrawalChange(
                                          `q${index + 1}` as keyof typeof withdrawal,
                                          e.target.value
                                        )}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                                {withdrawalError && (
                                  <p className="text-xs text-red-600">{withdrawalError}</p>
                                )}
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-gray-500">
                                    Total: {formatCurrency(totalWithdrawal)}
                                  </p>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => setEditingWithdrawal(null)}
                                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      onClick={() => handleWithdrawalSave(code.id)}
                                      className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                      Simpan
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {['I', 'II', 'III', 'IV'].map((quarter, index) => (
                                  <div key={quarter} className="flex justify-between text-xs">
                                    <span>TW {quarter}:</span>
                                    <span>{formatCurrency(withdrawal[`q${index + 1}` as keyof typeof withdrawal])}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between text-xs font-medium border-t pt-1">
                                  <span>Total:</span>
                                  <span className={totalWithdrawal !== revisedTotal ? 'text-red-600' : ''}>
                                    {formatCurrency(totalWithdrawal)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleWithdrawalEdit(code)}
                                  className="mt-2 w-full px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                                >
                                  Edit Penarikan
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                to={`/detail-entry/${code.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Kegiatan"
                              >
                                <FileText className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteClick(code)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada data kode anggaran yang tersedia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan{' '}
                  <span className="font-medium">{startIndex + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(endIndex, filteredBudgetCodes.length)}
                  </span>
                  {' '}dari{' '}
                  <span className="font-medium">{filteredBudgetCodes.length}</span>
                  {' '}hasil
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Hapus Kode Anggaran
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Apakah Anda yakin ingin menghapus kode anggaran "{deleteConfirmation.budgetCodeTitle}"? 
                      Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data kegiatan terkait.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation({ isOpen: false, budgetCodeId: null, budgetCodeTitle: '' })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCodes;