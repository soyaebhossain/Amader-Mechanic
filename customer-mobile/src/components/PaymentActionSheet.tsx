import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInitiateCheckout } from '../hooks/useActiveRequest';
import { bn } from '../i18n/bn';

interface Props {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  totalAmount: number;
}

export const PaymentActionSheet: React.FC<Props> = ({
  visible,
  onClose,
  requestId,
  totalAmount,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'CASH'>('BKASH');
  const checkoutMutation = useInitiateCheckout();

  const handleProcessPayment = () => {
    checkoutMutation.mutate(
      { requestId, provider: selectedMethod },
      {
        onSuccess: (data) => {
          if (selectedMethod === 'CASH') {
            Alert.alert(
              'ক্যাশ পেমেন্ট নিশ্চিতকরণ',
              'মেকানিককে সরাসরি নগদ টাকা প্রদান করুন। মেকানিক অ্যাপে রিসিভ নিশ্চিত করলে আপনার পেমেন্ট কমপ্লিট হবে।',
              [{ text: 'ঠিক আছে', onPress: onClose }]
            );
          } else if (data.checkout_url) {
            // Open payment gateway browser / deep link
            Linking.openURL(data.checkout_url);
            onClose();
          } else {
            Alert.alert('পেমেন্ট সফল', 'পেমেন্ট গেটওয়ে ট্রানজেকশন শুরু হয়েছে।');
            onClose();
          }
        },
        onError: (err: any) => {
          const msg = err.response?.data?.detail || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে।';
          Alert.alert('ব্যর্থ', msg);
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>{bn.payment.title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Bill summary */}
          <View style={styles.billBox}>
            <Text style={styles.billLabel}>{bn.payment.amountToPay}</Text>
            <Text style={styles.billAmount}>৳ {totalAmount.toFixed(2)}</Text>
          </View>

          <Text style={styles.chooseTitle}>{bn.payment.chooseMethod}</Text>

          {/* Methods */}
          <TouchableOpacity
            style={[styles.methodRow, selectedMethod === 'BKASH' && styles.methodSelected]}
            onPress={() => setSelectedMethod('BKASH')}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIconBadge, { backgroundColor: '#E2136E' }]}>
              <Text style={styles.methodBadgeText}>bK</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>{bn.payment.bkash}</Text>
              <Text style={styles.methodSub}>তাৎক্ষণিক ডিজিটাল ওয়ালেট পেমেন্ট</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'BKASH' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'BKASH' ? '#0D9488' : '#94A3B8'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodRow, selectedMethod === 'NAGAD' && styles.methodSelected]}
            onPress={() => setSelectedMethod('NAGAD')}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIconBadge, { backgroundColor: '#F7941D' }]}>
              <Text style={styles.methodBadgeText}>নগদ</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>{bn.payment.nagad}</Text>
              <Text style={styles.methodSub}>বাংলাদেশ ডাক বিভাগ ডিজিটাল লেনদেন</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'NAGAD' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'NAGAD' ? '#0D9488' : '#94A3B8'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodRow, selectedMethod === 'SSLCOMMERZ' && styles.methodSelected]}
            onPress={() => setSelectedMethod('SSLCOMMERZ')}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIconBadge, { backgroundColor: '#0284C7' }]}>
              <Ionicons name="card" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>{bn.payment.sslcommerz}</Text>
              <Text style={styles.methodSub}>ভিসা, মাস্টারকার্ড বা ইন্টারনেট ব্যাংকিং</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'SSLCOMMERZ' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'SSLCOMMERZ' ? '#0D9488' : '#94A3B8'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodRow, selectedMethod === 'CASH' && styles.methodSelected]}
            onPress={() => setSelectedMethod('CASH')}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIconBadge, { backgroundColor: '#059669' }]}>
              <Ionicons name="cash" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>{bn.payment.cash}</Text>
              <Text style={styles.methodSub}>অন-সাইট মেকানিককে নগদ টাকা দিন</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'CASH' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'CASH' ? '#0D9488' : '#94A3B8'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payNowBtn, checkoutMutation.isPending && styles.btnDisabled]}
            onPress={handleProcessPayment}
            disabled={checkoutMutation.isPending}
            activeOpacity={0.8}
          >
            {checkoutMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.payNowText}>{bn.payment.payNow} (৳ {totalAmount.toFixed(2)})</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  billBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  billLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  billAmount: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  chooseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginVertical: 5,
    gap: 12,
  },
  methodSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  methodIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  methodSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  payNowBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
  },
  payNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
