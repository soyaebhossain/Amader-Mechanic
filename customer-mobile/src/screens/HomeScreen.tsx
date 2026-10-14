import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { ServiceCategoryGrid } from '../components/ServiceCategoryGrid';
import { useCustomerVehicles } from '../hooks/useVehicles';
import { useServiceCategories } from '../hooks/useServiceCatalog';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { ServiceCategory } from '../types/service';
import { bn } from '../i18n/bn';

interface Props {
  onNavigateRequest: (category?: ServiceCategory) => void;
  onNavigateActiveBooking: () => void;
  onNavigateVehicles: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onNavigateRequest,
  onNavigateActiveBooking,
  onNavigateVehicles,
}) => {
  const { data: vehicles = [], refetch: refetchVehicles } = useCustomerVehicles();
  const { data: categories = [], isLoading: isCategoriesLoading } = useServiceCategories();
  const { data: activeRequest, refetch: refetchActive } = useActiveRequest();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchVehicles(), refetchActive()]);
    setRefreshing(false);
  }, [refetchVehicles, refetchActive]);

  const primaryVehicle = vehicles.find((v) => v.is_primary) || vehicles[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Incident Alert Banner */}
        {activeRequest && activeRequest.status !== 'completed' && activeRequest.status !== 'closed' && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={onNavigateActiveBooking}
            activeOpacity={0.8}
          >
            <View style={styles.pulseDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerTitle}>চলমান রোডসাইড রিকোয়েস্ট ট্র্যাকিং</Text>
              <Text style={styles.activeBannerSub}>{bn.tracker.statusLabels[activeRequest.status]}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0F766E" />
          </TouchableOpacity>
        )}

        {/* Hero Emergency Dispatch Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>{bn.home.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{bn.home.heroSubtitle}</Text>
          </View>

          <TouchableOpacity
            style={styles.emergencyBtn}
            onPress={() => onNavigateRequest()}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={20} color="#FFFFFF" />
            <Text style={styles.emergencyBtnText}>{bn.home.emergencyButton}</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Vehicle Quick Widget */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{bn.home.myPrimaryVehicle}</Text>
          <TouchableOpacity onPress={onNavigateVehicles}>
            <Text style={styles.seeAllText}>সব দেখুন</Text>
          </TouchableOpacity>
        </View>

        {primaryVehicle ? (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleIconBadge}>
              <Ionicons
                name={primaryVehicle.category === 'MOTORCYCLE' ? 'bicycle' : 'car'}
                size={24}
                color="#0D9488"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleName}>{primaryVehicle.make} {primaryVehicle.model}</Text>
              <Text style={styles.vehicleReg}>{primaryVehicle.registration_number}</Text>
            </View>
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>ডিফল্ট</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.noVehicleCard}
            onPress={onNavigateVehicles}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={22} color="#0D9488" />
            <Text style={styles.noVehicleText}>{bn.home.noPrimaryVehicle}</Text>
          </TouchableOpacity>
        )}

        {/* Services Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{bn.home.quickServices}</Text>
        </View>

        <ServiceCategoryGrid
          categories={categories}
          onSelectCategory={(cat) => onNavigateRequest(cat)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    gap: 12,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0D9488',
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F766E',
  },
  activeBannerSub: {
    fontSize: 12,
    color: '#115E59',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  heroTextCol: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 18,
  },
  emergencyBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '600',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  vehicleIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  vehicleReg: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  noVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  noVehicleText: {
    color: '#0D9488',
    fontWeight: '700',
    fontSize: 13,
  },
});
