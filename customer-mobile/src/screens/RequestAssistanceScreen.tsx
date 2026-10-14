import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VehicleSelector } from '../components/VehicleSelector';
import { useCustomerVehicles } from '../hooks/useVehicles';
import { useServiceCategories } from '../hooks/useServiceCatalog';
import { useCreateServiceRequest } from '../hooks/useCreateRequest';
import { ServiceCategory } from '../types/service';
import { CustomerVehicle } from '../types/vehicle';
import { RequestUrgency } from '../types/request';
import { bn } from '../i18n/bn';

interface Props {
  initialCategory?: ServiceCategory;
  onSuccess: () => void;
  onCancel: () => void;
  onNavigateVehicles: () => void;
}

export const RequestAssistanceScreen: React.FC<Props> = ({
  initialCategory,
  onSuccess,
  onCancel,
  onNavigateVehicles,
}) => {
  const { data: vehicles = [] } = useCustomerVehicles();
  const { data: categories = [] } = useServiceCategories();
  const createMutation = useCreateServiceRequest();

  // Selected State
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(
    vehicles.find((v) => v.is_primary) || vehicles[0] || null
  );
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(
    initialCategory || categories[0] || null
  );

  // Location State (Defaults to Dhaka Central coordinates 23.8103, 90.4125)
  const [address, setAddress] = useState('তেজগাঁও শিল্প এলাকা, বিজয় সরণি মোড়, ঢাকা');
  const [landmark, setLandmark] = useState('প্রধান পেট্রোল পাম্পের বিপরীত পাশে');
  const [coords, setCoords] = useState({ latitude: 23.8103, longitude: 90.4125 });

  // Details & Urgency State
  const [problemDescription, setProblemDescription] = useState('');
  const [urgency, setUrgency] = useState<RequestUrgency>('HIGH');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleSimulateGPS = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setIsDetectingLocation(false);
      setAddress('বনানী ১১ নম্বর রোড, ব্লক ডি, ঢাকা');
      setCoords({ latitude: 23.7937, longitude: 90.4066 });
      Alert.alert('জিপিএস লোকেশন আপডেট', 'বর্তমান অবস্থান সফলভাবে নির্ধারণ করা হয়েছে।');
    }, 700);
  };

  const handleSubmitRequest = () => {
    if (!selectedVehicle) {
      Alert.alert('গাড়ি নির্বাচন করুন', 'অনুরোধ পাঠানোর আগে অনুগ্রহ করে আপনার গাড়ি নির্বাচন করুন বা নতুন গাড়ি যোগ করুন।');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('সার্ভিস নির্বাচন করুন', 'অনুগ্রহ করে কি ধরণের সমস্যা হয়েছে তা নির্বাচন করুন।');
      return;
    }

    if (!address.trim()) {
      Alert.alert('ঠিকানা দিন', 'আপনার বর্তমান রাস্তার ঠিকানা উল্লেখ করুন।');
      return;
    }

    createMutation.mutate(
      {
        vehicle_id: selectedVehicle.id,
        service_category_id: selectedCategory.id,
        pickup_address: address.trim(),
        pickup_landmark: landmark.trim() || undefined,
        pickup_latitude: coords.latitude,
        pickup_longitude: coords.longitude,
        problem_description: problemDescription.trim() || `${selectedCategory.name_bn} প্রয়োজন`,
        urgency,
      },
      {
        onSuccess: () => {
          Alert.alert('অনুরোধ পাঠানো হয়েছে', 'নিকটস্থ মেকানিক খোঁজা হচ্ছে।');
          onSuccess();
        },
        onError: (err: any) => {
          const msg = err.response?.data?.detail || 'অনুরোধ পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
          Alert.alert('ব্যর্থ', msg);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>জরুরি মেকানিক সার্ভিস রিকোয়েস্ট</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Step 1: Vehicle selection */}
        <Text style={styles.sectionHeading}>{bn.request.step1Title}</Text>

        <Text style={styles.fieldLabel}>{bn.request.selectVehicle}</Text>
        <VehicleSelector
          vehicles={vehicles}
          selectedVehicleId={selectedVehicle?.id}
          onSelectVehicle={setSelectedVehicle}
          onAddNewVehicle={onNavigateVehicles}
        />

        {/* Category Pill Picker */}
        <Text style={styles.fieldLabel}>সার্ভিসের ধরন</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
          {categories.map((cat) => {
            const isCatSelected = selectedCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isCatSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, isCatSelected && styles.categoryChipTextActive]}>
                  {cat.name_bn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Step 2: Location */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>{bn.request.step2Title}</Text>

        <View style={styles.gpsRow}>
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleSimulateGPS}
            disabled={isDetectingLocation}
          >
            {isDetectingLocation ? (
              <ActivityIndicator size="small" color="#0D9488" />
            ) : (
              <Ionicons name="locate" size={16} color="#0D9488" />
            )}
            <Text style={styles.gpsText}>{bn.request.detectGps}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.fieldLabel}>রাস্তার বিস্তারিত ঠিকানা</Text>
        <TextInput
          style={styles.input}
          placeholder={bn.request.addressPlaceholder}
          placeholderTextColor="#94A3B8"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.fieldLabel}>নিকটবর্তী ল্যান্ডমার্ক</Text>
        <TextInput
          style={styles.input}
          placeholder={bn.request.landmarkPlaceholder}
          placeholderTextColor="#94A3B8"
          value={landmark}
          onChangeText={setLandmark}
        />

        {/* Step 3: Details & Urgency */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>{bn.request.step3Title}</Text>

        <Text style={styles.fieldLabel}>{bn.request.problemDescription}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={bn.request.problemPlaceholder}
          placeholderTextColor="#94A3B8"
          value={problemDescription}
          onChangeText={setProblemDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.fieldLabel}>{bn.request.urgencyLabel}</Text>
        <View style={styles.urgencyRow}>
          <TouchableOpacity
            style={[styles.urgencyPill, urgency === 'NORMAL' && styles.urgencyNormalActive]}
            onPress={() => setUrgency('NORMAL')}
          >
            <Text style={[styles.urgencyText, urgency === 'NORMAL' && styles.urgencyTextActive]}>
              {bn.request.urgencyNormal}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.urgencyPill, urgency === 'HIGH' && styles.urgencyHighActive]}
            onPress={() => setUrgency('HIGH')}
          >
            <Text style={[styles.urgencyText, urgency === 'HIGH' && styles.urgencyTextActive]}>
              {bn.request.urgencyHigh}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.urgencyPill, urgency === 'CRITICAL_HIGHWAY' && styles.urgencyCriticalActive]}
            onPress={() => setUrgency('CRITICAL_HIGHWAY')}
          >
            <Text style={[styles.urgencyText, urgency === 'CRITICAL_HIGHWAY' && styles.urgencyTextActive]}>
              {bn.request.urgencyHighway}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirmation Button */}
        <TouchableOpacity
          style={[styles.submitButton, createMutation.isPending && styles.btnDisabled]}
          onPress={handleSubmitRequest}
          disabled={createMutation.isPending}
          activeOpacity={0.8}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>{bn.request.confirmRequestBtn}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 10,
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  gpsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  gpsText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  urgencyRow: {
    gap: 8,
    marginTop: 4,
  },
  urgencyPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  urgencyNormalActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  urgencyHighActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  urgencyCriticalActive: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  urgencyText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  urgencyTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
