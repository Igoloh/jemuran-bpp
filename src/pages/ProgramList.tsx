import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { FileText, Trash2, ChevronLeft, ChevronRight, Plus, Copy, Edit, ClipboardPaste } from 'lucide-react';

const ProgramList: React.FC = () => {
  const { budgetCodes, deleteBudgetCode, addBudgetCode, updateBudgetCode } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Dukman' | 'PPIS'>('Dukman');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    program: 'Dukman' as 'Dukman' | 'PPIS',
    roCode: '',
    roTitle: '',
    componentCode: '',
    componentTitle: ''
  });
  const [copiedProgram, setCopiedProgram] = useState<typeof formData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoCode, setSelectedRoCode] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSpendingType, setSelectedSpendingType] = useState('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    programId: string | null;
    programTitle: string;
  }>({
    isOpen: false,
    programId: null,
    programTitle: ''
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

  const dukmanRoCodes = ['2886.EBA.956', '2886.EBA.962', '2886.EBA.994', '2886.EBD.955'].sort();
  const ppisRoCodes = Object.values(ppisGroups).flat().sort();

  // Get group name for a PPIS RO code
  const getPPISGroup = (roCode: string): string => {
    for (const [group, codes] of Object.entries(ppisGroups)) {
      if (codes.includes(roCode)) {
        return group;
      }
    }
    return '';
  };

  // Get spending type for a Dukman component code
  const getDukmanSpendingType = (componentCode: string): string => {
    if (componentCode === '001') {
      return 'BELANJA PEGAWAI - 51';
    }
    return 'BELANJA BARANG - 52';
  };

  const getComponentCodes = (program: 'Dukman' | 'PPIS', roCode: string) => {
    if (program === 'Dukman') {
      if (roCode === '2886.EBA.994') {
        return ['001', '002'].sort();
      }
      return ['051'];
    }
    return ['005', '051', '052', '053', '054', '056', '506', '516', '519'].sort();
  };

  const dukmanComponentTitles: Record<string, string> = {
    '051': 'Tanpa Komponen',
    '001': 'Gaji dan Tunjangan',
    '002': 'Operasional dan Pemeliharaan Kantor'
  };

  const ppisComponentTitles: Record<string, string> = {
    '005': 'Dukungan Penyelenggaraan Tugas dan Fungsi Unit',
    '051': 'Persiapan',
    '052': 'Pengumpulan Data',
    '053': 'Pengolahan',
    '054': 'Analisis, Diseminasi dan Evaluasi',
    '056': 'Pengembangan Infrastruktur dan Layanan Teknologi Informasi dan Komunikasi',
    '506': 'Pemutakhiran Kerangka Geospasial dan Muatan Wilkerstat',
    '516': 'Updating Direktori Usaha/Perusahaan Ekonomi Lanjutan',
    '519': 'Penyusunan Bahan Publisitas'
  };

  const filteredBudgetCodes = budgetCodes
    .filter(code => {
      const matchesProgram = code.program === activeTab;
      const matchesRoCode = !selectedRoCode || code.roCode === selectedRoCode;
      const matchesSection = selectedSection === 'all' || 
        (activeTab === 'PPIS' ? getPPISGroup(code.roCode) === selectedSection : true);
      const matchesSpendingType = selectedSpendingType === 'all' || 
        (activeTab === 'Dukman' ? getDukmanSpendingType(code.componentCode) === selectedSpendingType : true);
      
      return matchesProgram && matchesRoCode && matchesSection && matchesSpendingType;
    })
    .sort((a, b) => {
      if (activeTab === 'PPIS') {
        // First sort by group
        const groupA = getPPISGroup(a.roCode);
        const groupB = getPPISGroup(b.roCode);
        const groupCompare = groupA.localeCompare(groupB);
        if (groupCompare !== 0) return groupCompare;
      } else {
        // First sort by spending type
        const typeA = getDukmanSpendingType(a.componentCode);
        const typeB = getDukmanSpendingType(b.componentCode);
        const typeCompare = typeA.localeCompare(typeB);
        if (typeCompare !== 0) return typeCompare;
      }
      
      // Then sort by RO code
      const roCodeCompare = a.roCode.localeCompare(b.roCode);
      if (roCodeCompare !== 0) return roCodeCompare;
      
      // Finally sort by component code
      return a.componentCode.localeCompare(b.componentCode);
    });

  const totalPages = Math.ceil(filteredBudgetCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredBudgetCodes.slice(startIndex, endIndex);

  // Group items by section/spending type
  const groupedItems = currentItems.reduce((acc, code) => {
    const group = activeTab === 'PPIS'
      ? getPPISGroup(code.roCode)
      : getDukmanSpendingType(code.componentCode);
    
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(code);
    return acc;
  }, {} as Record<string, typeof currentItems>);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'program') {
      setFormData({
        program: value as 'Dukman' | 'PPIS',
        roCode: '',
        roTitle: '',
        componentCode: '',
        componentTitle: ''
      });
      setSelectedSection('all');
      setSelectedSpendingType('all');
    } else if (name === 'roCode') {
      setFormData(prev => ({
        ...prev,
        roCode: value,
        componentCode: '',
        componentTitle: ''
      }));
    } else if (name === 'componentCode') {
      const componentTitle = formData.program === 'Dukman' 
        ? dukmanComponentTitles[value]
        : ppisComponentTitles[value];
      
      setFormData(prev => ({
        ...prev,
        componentCode: value,
        componentTitle: componentTitle || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEdit = (code: typeof budgetCodes[0]) => {
    setFormData({
      program: code.program,
      roCode: code.roCode || '',
      roTitle: code.roTitle || '',
      componentCode: code.componentCode || '',
      componentTitle: code.componentTitle || ''
    });
    setEditingId(code.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCopy = (code: typeof budgetCodes[0]) => {
    const programData = {
      program: code.program,
      roCode: code.roCode || '',
      roTitle: code.roTitle || '',
      componentCode: code.componentCode || '',
      componentTitle: code.componentTitle || ''
    };
    setCopiedProgram(programData);
  };

  const handleDeleteClick = (code: typeof budgetCodes[0]) => {
    setDeleteConfirmation({
      isOpen: true,
      programId: code.id,
      programTitle: code.roTitle
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.programId) {
      await deleteBudgetCode(deleteConfirmation.programId);
      setDeleteConfirmation({
        isOpen: false,
        programId: null,
        programTitle: ''
      });
    }
  };

  const handlePaste = () => {
    if (copiedProgram) {
      setFormData(copiedProgram);
      setIsEditing(false);
      setEditingId(null);
      setIsModalOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      program: 'Dukman',
      roCode: '',
      roTitle: '',
      componentCode: '',
      componentTitle: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await updateBudgetCode(editingId, formData);
      } else {
        await addBudgetCode(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving budget code:', error);
    }
  };

  const currentComponentCodes = getComponentCodes(formData.program, formData.roCode);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedRoCode, selectedSection, selectedSpendingType]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Program</h1>
        <div className="flex space-x-2">
          {copiedProgram && (
            <button
              onClick={handlePaste}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ClipboardPaste className="h-4 w-4 mr-2" />
              Tempel Program
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Program
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('Dukman');
                setSelectedRoCode('');
                setSelectedSection('all');
                setSelectedSpendingType('all');
              }}
              className={`${
                activeTab === 'Dukman'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Dukman
            </button>
            <button
              onClick={() => {
                setActiveTab('PPIS');
                setSelectedRoCode('');
                setSelectedSection('all');
                setSelectedSpendingType('all');
              }}
              className={`${
                activeTab === 'PPIS'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              PPIS
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            {activeTab === 'PPIS' ? (
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">Semua Seksi</option>
                {Object.keys(ppisGroups).map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            ) : (
              <select
                value={selectedSpendingType}
                onChange={(e) => setSelectedSpendingType(e.target.value)}
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">Semua Jenis Belanja</option>
                {Object.keys(dukmanGroups).map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            )}
            <select
              value={selectedRoCode}
              onChange={(e) => setSelectedRoCode(e.target.value)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Semua Kode RO</option>
              {(activeTab === 'Dukman' ? dukmanRoCodes : ppisRoCodes).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {currentItems.length > 0 ? (
            Object.entries(groupedItems).map(([group, codes]) => (
              <li key={group} className="divide-y divide-gray-100">
                <div className="bg-gray-50 px-4 py-3">
                  <h3 className="text-sm font-medium text-gray-900">{group}</h3>
                </div>
                {codes.map((code) => (
                  <div key={code.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{code.roCode?.substring(0, 2) || '--'}</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{code.roTitle}</p>
                          <p className="text-sm text-gray-500">
                            Kode RO: {code.roCode} | Kode Komponen: {code.componentCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCopy(code)}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          title="Salin Program"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(code)}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Edit Program"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(code)}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Hapus Program"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Judul Komponen: {code.componentTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-gray-500">
              Tidak ada data program {activeTab} yang tersedia.
            </li>
          )}
        </ul>

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

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isEditing ? 'Edit Program' : 'Tambah Program Baru'}
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                        Program
                      </label>
                      <select
                        name="program"
                        id="program"
                        required
                        value={formData.program}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="Dukman">Dukman</option>
                        <option value="PPIS">PPIS</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="roCode" className="block text-sm font-medium text-gray-700">
                        Kode RO
                      </label>
                      <select
                        name="roCode"
                        id="roCode"
                        required
                        value={formData.roCode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Pilih Kode RO</option>
                        {formData.program === 'Dukman'
                          ? dukmanRoCodes.map(code => (
                              <option key={code} value={code}>{code}</option>
                            ))
                          : Object.entries(ppisGroups).map(([group, codes]) => (
                              <optgroup key={group} label={group}>
                                {codes.map(code => (
                                  <option key={code} value={code}>{code}</option>
                                ))}
                              </optgroup>
                            ))
                        }
                      </select>
                    </div>

                    <div>
                      <label htmlFor="roTitle" className="block text-sm font-medium text-gray-700">
                        Judul RO
                      </label>
                      <input
                        type="text"
                        name="roTitle"
                        id="roTitle"
                        required
                        value={formData.roTitle}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="componentCode" className="block text-sm font-medium text-gray-700">
                        Kode Komponen
                      </label>
                      <select
                        name="componentCode"
                        id="componentCode"
                        required
                        value={formData.componentCode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Pilih Kode Komponen</option>
                        {currentComponentCodes.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="componentTitle" className="block text-sm font-medium text-gray-700">
                        Judul Komponen
                      </label>
                      <input
                        type="text"
                        name="componentTitle"
                        id="componentTitle"
                        required
                        value={formData.componentTitle}
                        readOnly
                        className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        {isEditing ? 'Simpan Perubahan' : 'Simpan'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation.isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm: max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0  flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Hapus Program
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Apakah Anda yakin ingin menghapus program "{deleteConfirmation.programTitle}"? 
                      Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
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
                  onClick={() => setDeleteConfirmation({ isOpen: false, programId: null, programTitle: '' })}
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

export default ProgramList;