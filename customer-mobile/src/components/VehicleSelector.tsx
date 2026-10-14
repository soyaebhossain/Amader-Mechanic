import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomerVehicle } from '../types/vehicle';

interface Props {
  vehicles: CustomerVehicle[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicle: CustomerVehicle) => void;
  onAddNewVehicle: () => void;
}

export const VehicleSelector: React.FC<Props> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onAddNewVehicle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {vehicles.map((v) => {
        const isSelected = selectedVehicleId === v.id;

        return (
          <TouchableOpacity
            key={v.id}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelectVehicle(v)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={v.category === 'MOTORCYCLE' ? 'bicycle-outline' : 'car-outline'}
              size={18}
              color={isSelected ? '#0D9488' : '#64748B'}
            />
            <View>
              <Text style={[styles.makeModelText, isSelected && styles.textSelected]}>
                {v.make} {v.model}
              </Text>
              <Text style={styles.regNoText}>{v.registration_number}</Text>
            </View>
            {v.is_primary && (
              <View style={styles.primaryTag}>
                <Text style={styles.primaryText}>ডিফল্ট</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.addPill}
        onPress={onAddNewVehicle}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={20} color="#0D9488" />
        <Text style={styles.addText}>নতুন গাড়ি</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  pillSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  makeModelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  textSelected: {
    color: '#0F766E',
  },
  regNoText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  primaryTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  primaryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: '#F0FDFA',
  },
  addText: {
    color: '#0D9488',
    fontSize: 13,
    fontWeight: '700',
  },
});
