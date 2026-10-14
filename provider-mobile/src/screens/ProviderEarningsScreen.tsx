import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { JobEarningCard } from '../components/JobEarningCard';
import { PayoutHistoryCard } from '../components/PayoutHistoryCard';
import { PayoutAccountModal } from '../components/PayoutAccountModal';
import {
  useProviderWallet,
  useProviderJobEarnings,
  useProviderPayoutHistory,
  useRequestPayoutWithdrawal,
  EARNINGS_KEYS,
} from '../hooks/useProviderEarnings';
import { JobEarningSummary, PayoutDisbursementRecord } from '../types/earnings';
import { bn } from '../i18n/bn';

export const ProviderEarningsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'JOBS' | 'PAYOUTS'>('JOBS');
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const qc = useQueryClient();

  // Queries
  const { data: wallet, isLoading: isWalletLoading, isError: isWalletError } = useProviderWallet();
  const { data: jobs = [], isLoading: isJobsLoading } = useProviderJobEarnings();
  const { data: payouts = [], isLoading: isPayoutsLoading } = useProviderPayoutHistory();

  // Mutation
  const withdrawMutation = useRequestPayoutWithdrawal();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.wallet() }),
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.jobs() }),
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.payouts() }),
    ]);
    setRefreshing(false);
  }, [qc]);

  const handleWithdrawalRequest = () => {
    if (!wallet) return;

    Alert.alert(
      'টাকা উত্তোলনের নিশ্চিতকরণ',
      `আপনার ${
        wallet.payout_account.preferred_method === 'BKASH' ? 'বিকাশ নম্বরে' : 'ব্যাংক অ্যাকাউন্টে'
      } (${wallet.payout_account.target_identifier}) ৳ ${wallet.withdrawable_balance.toFixed(2)} উত্তোলনের অনুরোধ পাঠাতে চান?`,
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'হ্যাঁ, পাঠিয়ে দিন',
          onPress: () => {
            withdrawMutation.mutate(
              { amount: wallet.withdrawable_balance },
              {
                onSuccess: () => {
                  Alert.alert('সফল', 'আপনার উত্তোলনের অনুরোধ সফলভাবে সিস্টেমে গ্রহণ করা হয়েছে।');
                },
                onError: (error: any) => {
                  const message = error.response?.data?.detail || 'উত্তোলন প্রক্রিয়াকরণে সমস্যা হয়েছে।';
                  Alert.alert('ব্যর্থ', message);
                },
              }
            );
          },
        },
      ]
    );
  };

  const isLoading = isWalletLoading && !wallet;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  if (isWalletError && !wallet) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>সার্ভার থেকে তথ্য পাওয়া যায়নি। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করুন।</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={activeTab === 'JOBS' ? jobs : payouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          activeTab === 'JOBS' ? (
            <JobEarningCard item={item as JobEarningSummary} />
          ) : (
            <PayoutHistoryCard item={item as PayoutDisbursementRecord} />
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
        ListHeaderComponent={
          <>
            <View style={styles.screenHeader}>
              <Text style={styles.screenTitle}>{bn.earnings.title}</Text>
            </View>

            {wallet && (
              <WalletBalanceCard
                data={wallet}
                onRequestWithdrawal={handleWithdrawalRequest}
                onEditPayoutAccount={() => setPayoutModalVisible(true)}
              />
            )}

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'JOBS' && styles.activeTab]}
                onPress={() => setActiveTab('JOBS')}
              >
                <Text style={[styles.tabText, activeTab === 'JOBS' && styles.activeTabText]}>
                  {bn.earnings.recentJobs}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'PAYOUTS' && styles.activeTab]}
                onPress={() => setActiveTab('PAYOUTS')}
              >
                <Text style={[styles.tabText, activeTab === 'PAYOUTS' && styles.activeTabText]}>
                  {bn.earnings.payoutHistory}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isJobsLoading || isPayoutsLoading ? (
              <ActivityIndicator size="small" color="#0D9488" />
            ) : (
              <Text style={styles.emptyText}>
                {activeTab === 'JOBS' ? bn.earnings.emptyJobs : bn.earnings.emptyPayouts}
              </Text>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {wallet && (
        <PayoutAccountModal
          visible={payoutModalVisible}
          onClose={() => setPayoutModalVisible(false)}
          initialData={{
            preferred_method: wallet.payout_account.preferred_method,
            bkash_wallet_number:
              wallet.payout_account.preferred_method === 'BKASH'
                ? wallet.payout_account.target_identifier
                : undefined,
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 4,
    marginTop: 20,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
