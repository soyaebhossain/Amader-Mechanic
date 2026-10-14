import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCustomerVehicles, useCreateVehicle } from '../hooks/useVehicles';
import { CustomerVehicle, VehicleCategory } from '../types/vehicle';
import { bn } from '../i18n/bn';

interface Props {
  onBack: () => void;
}

const CATEGORIES: { label: string; value: VehicleCategory }[] = [
  { label: 'কার / সিডান', value: 'PRIVATE_CAR' },
  { label: 'মোটরসাইকেল', value: 'MOTORCYCLE' },
  { label: 'মাইক্রোবাস', value: 'MICROBUS' },
  { label: 'পিকআপ / ভ্যান', value: 'VAN' },
  { label: 'বাস', value: 'BUS' },
  { label: 'ট্রাক', value: 'TRUCK' },
  { label: 'সিএনজি / অটো', value: 'THREE_WHEELER' },
];

export const VehiclesScreen: React.FC<Props> = ({ onBack }) => {
  const { data: vehicles = [], isLoading, refetch } = useCustomerVehicles();
  const createMutation = useCreateVehicle();

  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState<VehicleCategory>('PRIVATE_CAR');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [regNo, setRegNo] = useState('');
  const [color, setColor] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const handleCreateVehicle = () => {
    if (!make.trim() || !model.trim() || !regNo.trim()) {
      Alert.alert('তথ্য অসম্পূর্ণ', 'অনুগ্রহ করে ব্র্যান্ড, মডেল এবং রেজিস্ট্রেশন নম্বর প্রদান করুন।');
      return;
    }

    createMutation.mutate(
      {
        category,
        make: make.trim(),
        model: model.trim(),
        registration_number: regNo.trim(),
        color: color.trim() || undefined,
        is_primary: isPrimary,
      },
      {
        onSuccess: () => {
          Alert.alert('সফল', 'নতুন গাড়ি সফলভাবে যুক্ত হয়েছে।');
          setModalVisible(false);
          setMake('');
          setModel('');
          setRegNo('');
          setColor('');
          setIsPrimary(false);
        },
        onError: (err: any) => {
          Alert.alert('ব্যর্থ', err.response?.data?.detail || 'গাড়ি যোগ করতে সমস্যা হয়েছে।');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{bn.vehicles.title}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={26} color="#0D9488" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-sport-outline" size={56} color="#94A3B8" />
            <Text style={styles.emptyText}>{bn.vehicles.emptyList}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>+ প্রথম গাড়ি যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.vehicleCard}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryBadge}>
                <Ionicons
                  name={item.category === 'MOTORCYCLE' ? 'bicycle-outline' : 'car-outline'}
                  size={16}
                  color="#0F766E"
                />
                <Text style={styles.categoryText}>{item.category.replace('_', ' ')}</Text>
              </View>

              {item.is_primary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryText}>ডিফল্ট</Text>
                </View>
              )}
            </View>

            <Text style={styles.vehicleTitle}>
              {item.make} {item.model}
            </Text>
            <Text style={styles.regNumber}>{item.registration_number}</Text>
            {item.color ? <Text style={styles.colorText}>রং: {item.color}</Text> : null}
          </View>
        )}
      />

      {/* Add Vehicle Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{bn.vehicles.addVehicle}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{bn.vehicles.category}</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              keyExtractor={(i) => i.value}
              style={{ maxHeight: 42, marginVertical: 6 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryPill, category === item.value && styles.categoryPillActive]}
                  onPress={() => setCategory(item.value)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      category === item.value && styles.categoryPillTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <Text style={styles.label}>{bn.vehicles.make}</Text>
            <TextInput
              style={styles.input}
              placeholder={bn.vehicles.makePlaceholder}
              placeholderTextColor="#94A3B8"
              value={make}
              onChangeText={setMake}
            />

            <Text style={styles.label}>{bn.vehicles.model}</Text>
            <TextInput
              style={styles.input}
              placeholder={bn.vehicles.modelPlaceholder}
              placeholderTextColor="#94A3B8"
              value={model}
              onChangeText={setModel}
            />

            <Text style={styles.label}>{bn.vehicles.regNo}</Text>
            <TextInput
              style={styles.input}
              placeholder={bn.vehicles.regPlaceholder}
              placeholderTextColor="#94A3B8"
              value={regNo}
              onChangeText={setRegNo}
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsPrimary(!isPrimary)}
            >
              <Ionicons
                name={isPrimary ? 'checkbox' : 'square-outline'}
                size={20}
                color={isPrimary ? '#0D9488' : '#94A3B8'}
              />
              <Text style={styles.checkboxText}>{bn.vehicles.setPrimary}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, createMutation.isPending && styles.btnDisabled]}
              onPress={handleCreateVehicle}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>{bn.vehicles.saveVehicle}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  list: {
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  addBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  primaryBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  primaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  regNumber: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  colorText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 10,
    marginBottom: 4,
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  categoryPillActive: {
    backgroundColor: '#0D9488',
  },
  categoryPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 18,
  },
  checkboxText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
