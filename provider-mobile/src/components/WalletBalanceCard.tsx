import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProviderWalletBalance } from '../types/earnings';
import { bn } from '../i18n/bn';

interface Props {
  data: ProviderWalletBalance;
  onRequestWithdrawal: () => void;
  onEditPayoutAccount?: () => void;
}

export const WalletBalanceCard: React.FC<Props> = ({
  data,
  onRequestWithdrawal,
  onEditPayoutAccount,
}) => {
  const canWithdraw =
    data.withdrawable_balance >= data.minimum_withdrawal_limit &&
    !data.payout_account.hold_payouts &&
    data.payout_account.is_verified;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>{bn.earnings.availableBalance}</Text>
          <Text style={styles.primaryBalance}>
            ৳ {data.withdrawable_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.walletBadge}>
          <Ionicons name="wallet-outline" size={24} color="#0D9488" />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.subMetric}>
          <Text style={styles.subLabel}>{bn.earnings.pendingClearance}</Text>
          <Text style={styles.subValue}>৳ {data.pending_clearance.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.subMetric}>
          <Text style={styles.subLabel}>{bn.earnings.lifetimeEarnings}</Text>
          <Text style={styles.subValue}>৳ {data.lifetime_earnings.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Payout destination information and edit trigger */}
      {data.payout_account && (
        <View style={styles.payoutAccountRow}>
          <View style={styles.accountInfo}>
            <Ionicons
              name={data.payout_account.preferred_method === 'BKASH' ? 'phone-portrait-outline' : 'business-outline'}
              size={15}
              color="#94A3B8"
            />
            <Text style={styles.accountIdentifierText}>
              {data.payout_account.preferred_method === 'BKASH' ? 'বিকাশ: ' : 'ব্যাংক: '}
              {data.payout_account.target_identifier || 'অ্যাকাউন্ট সংযুক্ত নেই'}
            </Text>
            {data.payout_account.is_verified ? (
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            ) : (
              <Text style={styles.unverifiedBadge}>অযাচাইকৃত</Text>
            )}
          </View>
          {onEditPayoutAccount && (
            <TouchableOpacity
              onPress={onEditPayoutAccount}
              style={styles.editAccountButton}
              activeOpacity={0.7}
            >
              <Text style={styles.editAccountText}>পরিবর্তন</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {data.payout_account.hold_payouts ? (
        <View style={styles.holdBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
          <Text style={styles.holdText}>{bn.earnings.accountOnHold}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.withdrawButton, !canWithdraw && styles.disabledButton]}
          disabled={!canWithdraw}
          onPress={onRequestWithdrawal}
          activeOpacity={0.8}
        >
          <Text style={styles.withdrawText}>{bn.earnings.withdrawNow}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {data.withdrawable_balance < data.minimum_withdrawal_limit && !data.payout_account.hold_payouts && (
        <Text style={styles.minLimitText}>{bn.earnings.minLimitNotice}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryBalance: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  walletBadge: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    padding: 10,
    borderRadius: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  subMetric: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#334155',
    marginHorizontal: 16,
  },
  subLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  subValue: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  payoutAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  accountIdentifierText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  unverifiedBadge: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  editAccountButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
  },
  editAccountText: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '600',
  },
  withdrawButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#334155',
  },
  withdrawText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  holdBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  holdText: {
    color: '#F87171',
    fontSize: 12,
    flex: 1,
  },
  minLimitText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
