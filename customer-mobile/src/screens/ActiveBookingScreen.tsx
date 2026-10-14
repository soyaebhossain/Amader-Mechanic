import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LiveStatusTracker } from '../components/LiveStatusTracker';
import { QuoteApprovalCard } from '../components/QuoteApprovalCard';
import { PaymentActionSheet } from '../components/PaymentActionSheet';
import { useActiveRequest, useApproveQuote, useRejectQuote } from '../hooks/useActiveRequest';
import { bn } from '../i18n/bn';

interface Props {
  onBackToHome: () => void;
  onRequestNew: () => void;
}

export const ActiveBookingScreen: React.FC<Props> = ({ onBackToHome, onRequestNew }) => {
  const { data: request, isLoading, refetch } = useActiveRequest();
  const approveQuoteMutation = useApproveQuote();
  const rejectQuoteMutation = useRejectQuote();

  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleApproveQuote = (quoteId: string) => {
    approveQuoteMutation.mutate(
      { quoteId },
      {
        onSuccess: () => {
          Alert.alert('কোটেশন অনুমোদিত', 'মেকানিক এখন অনুমোদিত কাজ শুরু করবেন।');
        },
        onError: (err: any) => {
          Alert.alert('ব্যর্থ', err.response?.data?.detail || 'অনুমোদনে সমস্যা হয়েছে।');
        },
      }
    );
  };

  const handleRejectQuote = (quoteId: string, reason: string) => {
    rejectQuoteMutation.mutate(
      { quoteId, reason },
      {
        onSuccess: () => {
          Alert.alert('কোটেশন বাতিল', 'মেকানিককে অবহিত করা হয়েছে।');
        },
        onError: (err: any) => {
          Alert.alert('ব্যর্থ', err.response?.data?.detail || 'বাতিলকরণে সমস্যা হয়েছে।');
        },
      }
    );
  };

  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBackToHome}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>লাইভ ট্র্যাকার</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={64} color="#94A3B8" />
          <Text style={styles.emptyTitle}>বর্তমানে কোনো সক্রিয় রিকোয়েস্ট নেই</Text>
          <Text style={styles.emptySubtitle}>
            জরুরি সময়ে আপনার যে কোনো গাড়ির সহায়তায় আমরা প্রস্তুত রয়েছি।
          </Text>

          <TouchableOpacity style={styles.requestNewBtn} onPress={onRequestNew}>
            <Text style={styles.requestNewText}>জরুরি মেকানিক ডাকুন</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBackToHome}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{bn.tracker.title}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="reload" size={20} color="#0D9488" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
        contentContainerStyle={styles.scroll}
      >
        {/* Real-time Status Card */}
        <LiveStatusTracker
          request={request}
          onOpenQuote={() => {}}
          onOpenPayment={() => setPaymentSheetVisible(true)}
        />

        {/* Itemized Quote Section if submitted */}
        {request.active_quote && (
          <QuoteApprovalCard
            quote={request.active_quote}
            onApprove={() => handleApproveQuote(request.active_quote!.id)}
            onReject={(reason) => handleRejectQuote(request.active_quote!.id, reason)}
            isSubmitting={approveQuoteMutation.isPending || rejectQuoteMutation.isPending}
          />
        )}
      </ScrollView>

      {/* Payment Action Sheet */}
      {request.active_quote && (
        <PaymentActionSheet
          visible={paymentSheetVisible}
          onClose={() => setPaymentSheetVisible(false)}
          requestId={request.id}
          totalAmount={request.active_quote.total_amount}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  requestNewBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  requestNewText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
