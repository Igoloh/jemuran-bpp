import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Toast from '../components/Toast';
import { supabase } from '../lib/supabase';
import type { BudgetCode, ActivityDetail, ActivityLog } from '../lib/supabase';

interface AppContextType {
  budgetCodes: BudgetCode[];
  activityDetails: ActivityDetail[];
  activityLogs: ActivityLog[];
  addBudgetCode: (budgetCode: Omit<BudgetCode, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateBudgetCode: (id: string, updates: Partial<BudgetCode>) => Promise<void>;
  addActivityDetail: (activityDetail: Omit<ActivityDetail, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateActivityDetail: (id: string, updates: Partial<ActivityDetail>) => Promise<void>;
  deleteBudgetCode: (id: string) => Promise<void>;
  deleteActivityDetail: (id: string) => Promise<void>;
  updateQuarterlyWithdrawal: (id: string, withdrawal: BudgetCode['quarterly_withdrawal']) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [budgetCodes, setBudgetCodes] = useState<BudgetCode[]>([]);
  const [activityDetails, setActivityDetails] = useState<ActivityDetail[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();

    const budgetCodesSubscription = supabase
      .channel('budget_codes_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budget_codes'
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setBudgetCodes(prev => [...prev, payload.new as BudgetCode]);
        } else if (payload.eventType === 'UPDATE') {
          setBudgetCodes(prev => 
            prev.map(code => code.id === payload.new.id ? payload.new as BudgetCode : code)
          );
        } else if (payload.eventType === 'DELETE') {
          setBudgetCodes(prev => prev.filter(code => code.id !== payload.old.id));
        }
      })
      .subscribe();

    const activityDetailsSubscription = supabase
      .channel('activity_details_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activity_details'
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setActivityDetails(prev => [...prev, payload.new as ActivityDetail]);
        } else if (payload.eventType === 'UPDATE') {
          setActivityDetails(prev =>
            prev.map(detail => detail.id === payload.new.id ? payload.new as ActivityDetail : detail)
          );
        } else if (payload.eventType === 'DELETE') {
          setActivityDetails(prev => prev.filter(detail => detail.id !== payload.old.id));
        }
      })
      .subscribe();

    const activityLogsSubscription = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs'
      }, payload => {
        setActivityLogs(prev => [payload.new as ActivityLog, ...prev]);
      })
      .subscribe();

    return () => {
      budgetCodesSubscription.unsubscribe();
      activityDetailsSubscription.unsubscribe();
      activityLogsSubscription.unsubscribe();
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [
        { data: budgetCodesData, error: budgetCodesError },
        { data: activityDetailsData, error: activityDetailsError },
        { data: activityLogsData, error: activityLogsError }
      ] = await Promise.all([
        supabase
          .from('budget_codes')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('activity_details')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (budgetCodesError) throw budgetCodesError;
      if (activityDetailsError) throw activityDetailsError;
      if (activityLogsError) throw activityLogsError;

      setBudgetCodes(budgetCodesData || []);
      setActivityDetails(activityDetailsData || []);
      setActivityLogs(activityLogsData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showToast('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addBudgetCode = async (budgetCode: Omit<BudgetCode, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budget_codes')
        .insert([{ ...budgetCode, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      showToast('Data Entri Berhasil Disimpan');
    } catch (error) {
      console.error('Error adding budget code:', error);
      showToast('Gagal menyimpan data');
      throw error;
    }
  };

  const updateBudgetCode = async (id: string, updates: Partial<BudgetCode>) => {
    try {
      const { error } = await supabase
        .from('budget_codes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      showToast('Data Entri Berhasil Disimpan');
    } catch (error) {
      console.error('Error updating budget code:', error);
      showToast('Gagal mengupdate data');
    }
  };

  const updateQuarterlyWithdrawal = async (id: string, withdrawal: BudgetCode['quarterly_withdrawal']) => {
    try {
      const { error } = await supabase
        .from('budget_codes')
        .update({ quarterly_withdrawal: withdrawal })
        .eq('id', id);

      if (error) throw error;
      showToast('Rencana Penarikan Berhasil Disimpan');
    } catch (error) {
      console.error('Error updating quarterly withdrawal:', error);
      showToast('Gagal mengupdate rencana penarikan');
    }
  };

  const addActivityDetail = async (activityDetail: Omit<ActivityDetail, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const budgetCodeExists = budgetCodes.some(code => code.id === activityDetail.budgetCodeId);
      if (!budgetCodeExists) {
        throw new Error('Budget code does not exist');
      }

      // Ensure default values for required fields
      const detailWithDefaults = {
        ...activityDetail,
        volumeOriginal: activityDetail.volumeOriginal || 0,
        volumeRevised: activityDetail.volumeRevised || 0,
        valueOriginal: activityDetail.valueOriginal || 0,
        valueRevised: activityDetail.valueRevised || 0
      };

      const { data, error } = await supabase
        .from('activity_details')
        .insert([detailWithDefaults])
        .select()
        .single();

      if (error) {
        if (error.code === '42501') {
          throw new Error('Anda tidak memiliki akses untuk menambahkan data pada kode anggaran ini');
        }
        throw error;
      }

      if (data) {
        const { error: logError } = await supabase
          .from('activity_logs')
          .insert([{
            type: 'create',
            activity_id: data.id,
            budget_code_id: detailWithDefaults.budgetCodeId,
            details: {
              activity_code: detailWithDefaults.activityCode,
              activity_title: detailWithDefaults.activityTitle,
              value_original: detailWithDefaults.valueOriginal,
              value_revised: detailWithDefaults.valueRevised,
              volume_original: detailWithDefaults.volumeOriginal,
              volume_revised: detailWithDefaults.volumeRevised
            }
          }]);

        if (logError) {
          console.error('Error creating activity log:', logError);
        }
      }

      showToast('Data Entri Berhasil Disimpan');
    } catch (error) {
      console.error('Error adding activity detail:', error);
      if (error instanceof Error) {
        showToast(error.message);
      } else {
        showToast('Gagal menyimpan data');
      }
      throw error;
    }
  };

  const updateActivityDetail = async (id: string, updates: Partial<ActivityDetail>) => {
    try {
      // First get the existing detail
      const { data: existingDetail, error: fetchError } = await supabase
        .from('activity_details')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Data aktivitas tidak ditemukan');
        }
        throw fetchError;
      }

      // If updating budget code ID, verify it exists
      if (updates.budgetCodeId) {
        const budgetCodeExists = budgetCodes.some(code => code.id === updates.budgetCodeId);
        if (!budgetCodeExists) {
          throw new Error('Kode anggaran tidak ditemukan');
        }
      }

      // Proceed with update
      const { data: updatedDetail, error: updateError } = await supabase
        .from('activity_details')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === '42501') {
          throw new Error('Anda tidak memiliki akses untuk mengubah data pada kode anggaran ini');
        }
        throw updateError;
      }

      // Create activity log
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert([{
          type: 'update',
          activity_id: id,
          budget_code_id: updatedDetail.budgetCodeId,
          details: {
            activity_code: updatedDetail.activityCode,
            activity_title: updatedDetail.activityTitle,
            value_original: updatedDetail.valueOriginal,
            value_revised: updatedDetail.valueRevised,
            volume_original: updatedDetail.volumeOriginal,
            volume_revised: updatedDetail.volumeRevised
          }
        }]);

      if (logError) {
        console.error('Error creating activity log:', logError);
      }

      showToast('Data Entri Berhasil Disimpan');
    } catch (error) {
      console.error('Error updating activity detail:', error);
      if (error instanceof Error) {
        showToast(error.message);
      } else {
        showToast('Gagal mengupdate data');
      }
      throw error;
    }
  };

  const deleteBudgetCode = async (id: string) => {
    try {
      const { data: detailsToDelete } = await supabase
        .from('activity_details')
        .select('*')
        .eq('budgetCodeId', id);

      const { error } = await supabase
        .from('budget_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (detailsToDelete) {
        const logPromises = detailsToDelete.map(detail =>
          supabase
            .from('activity_logs')
            .insert([{
              type: 'delete',
              activity_id: detail.id,
              budget_code_id: id,
              details: {
                activity_code: detail.activityCode,
                activity_title: detail.activityTitle
              }
            }])
        );

        await Promise.allSettled(logPromises);
      }

      showToast('Data Berhasil Dihapus');
    } catch (error) {
      console.error('Error deleting budget code:', error);
      showToast('Gagal menghapus data');
    }
  };

  const deleteActivityDetail = async (id: string) => {
    try {
      const { data: detailToDelete, error: fetchError } = await supabase
        .from('activity_details')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Data aktivitas tidak ditemukan');
        }
        throw fetchError;
      }

      const { error } = await supabase
        .from('activity_details')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '42501') {
          throw new Error('Anda tidak memiliki akses untuk menghapus data pada kode anggaran ini');
        }
        throw error;
      }

      const budgetCodeExists = budgetCodes.some(code => code.id === detailToDelete.budgetCodeId);
      if (budgetCodeExists) {
        const { error: logError } = await supabase
          .from('activity_logs')
          .insert([{
            type: 'delete',
            activity_id: id,
            budget_code_id: detailToDelete.budgetCodeId,
            details: {
              activity_code: detailToDelete.activityCode,
              activity_title: detailToDelete.activityTitle
            }
          }]);

        if (logError) {
          console.error('Error creating deletion log:', logError);
        }
      }

      showToast('Data Berhasil Dihapus');
    } catch (error) {
      console.error('Error deleting activity detail:', error);
      if (error instanceof Error) {
        showToast(error.message);
      } else {
        showToast('Gagal menghapus data');
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        budgetCodes,
        activityDetails,
        activityLogs,
        addBudgetCode,
        updateBudgetCode,
        addActivityDetail,
        updateActivityDetail,
        deleteBudgetCode,
        deleteActivityDetail,
        updateQuarterlyWithdrawal,
        isLoading
      }}
    >
      {children}
      {toastMessage && <Toast message={toastMessage} />}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};