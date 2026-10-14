import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Quote } from '../types/quote';
import { bn } from '../i18n/bn';

interface Props {
  quote: Quote;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isSubmitting?: boolean;
}

export const QuoteApprovalCard: React.FC<Props> = ({
  quote,
  onApprove,
  onReject,
  isSubmitting,
}) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      Alert.alert('কারণ লিখুন', 'অনুগ্রহ করে কোটেশন প্রত্যাখ্যানের কারণ উল্লেখ করুন।');
      return;
    }
    setRejectModalVisible(false);
    onReject(rejectReason.trim());
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="receipt-outline" size={22} color="#0D9488" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{bn.quote.title}</Text>
          <Text style={styles.quoteNumber}>নং: {quote.quote_number || 'QT-001'}</Text>
        </View>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>ভার্সন {quote.version || 1}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{bn.quote.itemizedBreakdown}</Text>

      {/* Itemized Table */}
      <View style={styles.table}>
        {quote.items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Text style={styles.itemMeta}>
                {item.quantity} x ৳{item.unit_price} ({item.item_type})
              </Text>
            </View>
            <Text style={styles.itemTotal}>৳{item.total_price.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>সাব-টোটাল</Text>
          <Text style={styles.summaryVal}>৳{quote.subtotal.toFixed(2)}</Text>
        </View>

        {quote.vat_amount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{bn.quote.vat} (৫%)</Text>
            <Text style={styles.summaryVal}>৳{quote.vat_amount.toFixed(2)}</Text>
          </View>
        )}

        <View style={[styles.summaryRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>{bn.quote.total}</Text>
          <Text style={styles.grandTotalVal}>৳{quote.total_amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.noticeBox}>
        <Ionicons name="information-circle-outline" size={16} color="#0284C7" />
        <Text style={styles.noticeText}>{bn.quote.notice}</Text>
      </View>

      {/* Action Buttons */}
      {quote.status === 'SUBMITTED' ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => setRejectModalVisible(true)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.rejectBtnText}>{bn.quote.rejectBtn}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.approveBtn, isSubmitting && styles.btnDisabled]}
            onPress={onApprove}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.approveBtnText}>{bn.quote.approveBtn}</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusBox}>
          <Ionicons
            name={quote.status === 'APPROVED' ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={quote.status === 'APPROVED' ? '#10B981' : '#EF4444'}
          />
          <Text
            style={[
              styles.statusNoticeText,
              { color: quote.status === 'APPROVED' ? '#047857' : '#B91C1C' },
            ]}
          >
            {quote.status === 'APPROVED'
              ? 'কোটেশনটি আপনার দ্বারা অনুমোদিত হয়েছে'
              : 'কোটেশনটি বাতিল করা হয়েছে'}
          </Text>
        </View>
      )}

      {/* Rejection Reason Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.rejectModal}>
            <Text style={styles.modalTitle}>প্রত্যাখ্যানের কারণ লিখুন</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="যেমন: চার্জ অতিরিক্ত মনে হচ্ছে..."
              placeholderTextColor="#94A3B8"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.cancelText}>ফিরে যান</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRejectBtn}
                onPress={handleConfirmReject}
              >
                <Text style={styles.confirmRejectText}>নিশ্চিত করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  quoteNumber: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  versionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  table: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  itemDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  grandTotalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D9488',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginVertical: 14,
  },
  noticeText: {
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  approveBtn: {
    flex: 2,
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  statusNoticeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rejectModal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#64748B',
    fontWeight: '600',
  },
  confirmRejectBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmRejectText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
