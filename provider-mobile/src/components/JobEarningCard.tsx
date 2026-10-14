import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobEarningSummary } from '../types/earnings';
import { bn } from '../i18n/bn';

export const JobEarningCard: React.FC<{ item: JobEarningSummary }> = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.vehiclePill}>
          <Ionicons name="construct-outline" size={14} color="#0D9488" />
          <Text style={styles.vehicleText}>{item.vehicle_type}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.completed_at).toLocaleDateString('bn-BD')}</Text>
      </View>

      <Text style={styles.address} numberOfLines={1}>
        <Ionicons name="location-outline" size={12} color="#64748B" /> {item.pickup_address}
      </Text>

      <View style={styles.accountingTable}>
        <View style={styles.row}>
          <Text style={styles.accountLabel}>{bn.earnings.gross}</Text>
          <Text style={styles.accountVal}>৳ {item.gross_service_amount.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.accountLabel}>{bn.earnings.platformFee}</Text>
          <Text style={styles.accountDeduct}>- ৳ {item.platform_fee_deducted.toFixed(2)}</Text>
        </View>
        <View style={[styles.row, styles.netRow]}>
          <Text style={styles.netLabel}>{bn.earnings.netProfit}</Text>
          <Text style={styles.netVal}>+ ৳ {item.provider_net_earning.toFixed(2)}</Text>
        </View>
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vehicleText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
  },
  address: {
    color: '#475569',
    fontSize: 13,
    marginTop: 8,
  },
  accountingTable: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  accountLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  accountVal: {
    fontSize: 12,
    color: '#1E293B',
  },
  accountDeduct: {
    fontSize: 12,
    color: '#DC2626',
  },
  netRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  netVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
});
