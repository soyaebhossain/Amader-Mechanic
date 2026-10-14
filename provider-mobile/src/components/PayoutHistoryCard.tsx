import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PayoutDisbursementRecord } from '../types/earnings';
import { bn } from '../i18n/bn';

const STATUS_COLORS = {
  PAID: { bg: '#DCFCE7', text: '#15803D', icon: 'checkmark-circle' },
  QUEUED: { bg: '#FEF9C3', text: '#A16207', icon: 'time-outline' },
  SUBMITTED: { bg: '#E0F2FE', text: '#0369A1', icon: 'sync-outline' },
  FAILED: { bg: '#FEE2E2', text: '#B91C1C', icon: 'close-circle' },
  REJECTED: { bg: '#FEE2E2', text: '#B91C1C', icon: 'ban-outline' },
};

export const PayoutHistoryCard: React.FC<{ item: PayoutDisbursementRecord }> = ({ item }) => {
  const currentStatus = STATUS_COLORS[item.status] || STATUS_COLORS.QUEUED;

  return (
    <View style={styles.card}>
      <View style={styles.leftColumn}>
        <Text style={styles.methodTitle}>
          {item.payout_method === 'BKASH' ? bn.earnings.method.BKASH : bn.earnings.method.BANK_TRANSFER}
        </Text>
        <Text style={styles.destination}>{item.destination_target}</Text>
        <Text style={styles.batchRef}>{item.batch_reference}</Text>
        {item.gateway_trx_id && (
          <Text style={styles.trxId}>TrxID: {item.gateway_trx_id}</Text>
        )}
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.amount}>৳ {item.amount.toLocaleString('en-IN')}</Text>
        <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
          <Text style={[styles.statusText, { color: currentStatus.text }]}>
            {bn.earnings.status[item.status]}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleDateString('bn-BD')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leftColumn: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  destination: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  batchRef: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  trxId: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '500',
    marginTop: 2,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
});
