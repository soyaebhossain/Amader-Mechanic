import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceRequest } from '../types/request';
import { bn } from '../i18n/bn';

interface Props {
  request: ServiceRequest;
  onOpenQuote?: () => void;
  onOpenPayment?: () => void;
}

export const LiveStatusTracker: React.FC<Props> = ({
  request,
  onOpenQuote,
  onOpenPayment,
}) => {
  const status = request.status;
  const provider = request.assigned_provider;

  const isMatching = status === 'matching' || status === 'requested';
  const isEnRouteOrArrived = status === 'assigned' || status === 'en_route' || status === 'arrived';
  const isInspection = status === 'inspection' || status === 'awaiting_quote_approval';
  const isInProgress = status === 'in_progress';
  const isCompletedOrPayment = status === 'awaiting_payment' || status === 'completed';

  const handleCallProvider = () => {
    if (provider?.phone) {
      Linking.openURL(`tel:${provider.phone}`);
    }
  };

  return (
    <View style={styles.card}>
      {/* Incident Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.requestNumLabel}>
            {bn.tracker.requestNumber}: <Text style={styles.requestNum}>{request.request_number || request.id.slice(0, 8)}</Text>
          </Text>
          <Text style={styles.serviceName}>{request.service_category.name_bn}</Text>
        </View>

        <View style={[styles.statusBadge, isMatching ? styles.badgeYellow : styles.badgeGreen]}>
          {isMatching && <ActivityIndicator size="small" color="#D97706" style={{ marginRight: 4 }} />}
          <Text style={[styles.statusBadgeText, isMatching ? styles.textYellow : styles.textGreen]}>
            {bn.tracker.statusLabels[status] || status}
          </Text>
        </View>
      </View>

      {/* Progress Steps Timeline */}
      <View style={styles.timeline}>
        <View style={styles.step}>
          <View style={[styles.dot, styles.dotActive]} />
          <Text style={styles.stepText}>অনুরোধ</Text>
        </View>
        <View style={[styles.line, (isEnRouteOrArrived || isInspection || isInProgress || isCompletedOrPayment) && styles.lineActive]} />

        <View style={styles.step}>
          <View style={[styles.dot, (isEnRouteOrArrived || isInspection || isInProgress || isCompletedOrPayment) && styles.dotActive]} />
          <Text style={styles.stepText}>নিযুক্ত</Text>
        </View>
        <View style={[styles.line, (isInspection || isInProgress || isCompletedOrPayment) && styles.lineActive]} />

        <View style={styles.step}>
          <View style={[styles.dot, (isInspection || isInProgress || isCompletedOrPayment) && styles.dotActive]} />
          <Text style={styles.stepText}>পরিদর্শন</Text>
        </View>
        <View style={[styles.line, (isInProgress || isCompletedOrPayment) && styles.lineActive]} />

        <View style={styles.step}>
          <View style={[styles.dot, (isInProgress || isCompletedOrPayment) && styles.dotActive]} />
          <Text style={styles.stepText}>মেরামত</Text>
        </View>
        <View style={[styles.line, isCompletedOrPayment && styles.lineActive]} />

        <View style={styles.step}>
          <View style={[styles.dot, isCompletedOrPayment && styles.dotActive]} />
          <Text style={styles.stepText}>পরিশোধ</Text>
        </View>
      </View>

      {/* Location Details */}
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={16} color="#DC2626" />
        <View style={{ flex: 1 }}>
          <Text style={styles.locationAddress} numberOfLines={2}>
            {request.pickup_address}
          </Text>
          {request.pickup_landmark ? (
            <Text style={styles.locationLandmark}>ল্যান্ডমার্ক: {request.pickup_landmark}</Text>
          ) : null}
        </View>
      </View>

      {/* Matching Radar Notice */}
      {isMatching && (
        <View style={styles.matchingBanner}>
          <Ionicons name="radio-outline" size={20} color="#0D9488" />
          <Text style={styles.matchingText}>
            আপনার অবস্থানের কাছাকাছি ৫ কিলোমিটারের মধ্যে যোগ্য মেকানিকদের সাথে সংযোগ স্থাপন করা হচ্ছে...
          </Text>
        </View>
      )}

      {/* Assigned Provider Profile Card */}
      {provider && (
        <View style={styles.providerCard}>
          <View style={styles.providerAvatar}>
            <Ionicons name="person" size={24} color="#0F766E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <View style={styles.providerMeta}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.providerRating}>{provider.rating?.toFixed(1) || '৫.০'}</Text>
              <Text style={styles.providerCompleted}>• {provider.total_completed_jobs || 12}টি কাজ সম্পন্ন</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCallProvider}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
            <Text style={styles.callButtonText}>কল</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quote Approval Alert Banner */}
      {status === 'awaiting_quote_approval' && (
        <TouchableOpacity
          style={styles.quoteAlertBanner}
          onPress={onOpenQuote}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.quoteAlertTitle}>নতুন কোটেশন অনুমোদনের জন্য প্রস্তুত!</Text>
            <Text style={styles.quoteAlertSubtitle}>কাজের বিবরণ ও খরচের তালিকা যাচাই করে সম্মতি দিন</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={26} color="#0D9488" />
        </TouchableOpacity>
      )}

      {/* Payment Alert Banner */}
      {status === 'awaiting_payment' && (
        <TouchableOpacity
          style={styles.paymentAlertBanner}
          onPress={onOpenPayment}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentAlertTitle}>কাজ সম্পন্ন হয়েছে — বিল পরিশোধ করুন</Text>
            <Text style={styles.paymentAlertSubtitle}>বিকাশ, নগদ বা কার্ডের মাধ্যমে পেমেন্ট সম্পন্ন করুন</Text>
          </View>
          <Ionicons name="wallet" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestNumLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  requestNum: {
    fontWeight: '700',
    color: '#0F172A',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeYellow: {
    backgroundColor: '#FEF3C7',
  },
  textYellow: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  textGreen: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 18,
    paddingHorizontal: 4,
  },
  step: {
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginBottom: 4,
  },
  dotActive: {
    backgroundColor: '#0D9488',
    transform: [{ scale: 1.2 }],
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  lineActive: {
    backgroundColor: '#0D9488',
  },
  stepText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  locationAddress: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  locationLandmark: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  matchingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  matchingText: {
    flex: 1,
    fontSize: 12,
    color: '#0F766E',
    lineHeight: 18,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  providerRating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  providerCompleted: {
    fontSize: 11,
    color: '#64748B',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  quoteAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    borderWidth: 1.5,
    borderColor: '#FACC15',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  quoteAlertTitle: {
    color: '#854D0E',
    fontSize: 13,
    fontWeight: '700',
  },
  quoteAlertSubtitle: {
    color: '#A16207',
    fontSize: 11,
    marginTop: 2,
  },
  paymentAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  paymentAlertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  paymentAlertSubtitle: {
    color: '#CCFBF1',
    fontSize: 11,
    marginTop: 2,
  },
});
