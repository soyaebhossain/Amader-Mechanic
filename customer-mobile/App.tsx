import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Ionicons } from '@expo/vector-icons';
import { queryClient, asyncStoragePersister } from './src/api/queryClient';
import { HomeScreen } from './src/screens/HomeScreen';
import { RequestAssistanceScreen } from './src/screens/RequestAssistanceScreen';
import { ActiveBookingScreen } from './src/screens/ActiveBookingScreen';
import { VehiclesScreen } from './src/screens/VehiclesScreen';
import { ServiceCategory } from './src/types/service';
import { bn } from './src/i18n/bn';

type CurrentScreen = 'HOME' | 'REQUEST' | 'TRACKER' | 'VEHICLES';

function MainNavigator() {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>();

  const navigateToRequest = (category?: ServiceCategory) => {
    setSelectedCategory(category);
    setCurrentScreen('REQUEST');
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {currentScreen === 'HOME' && (
          <HomeScreen
            onNavigateRequest={navigateToRequest}
            onNavigateActiveBooking={() => setCurrentScreen('TRACKER')}
            onNavigateVehicles={() => setCurrentScreen('VEHICLES')}
          />
        )}

        {currentScreen === 'REQUEST' && (
          <RequestAssistanceScreen
            initialCategory={selectedCategory}
            onSuccess={() => setCurrentScreen('TRACKER')}
            onCancel={() => setCurrentScreen('HOME')}
            onNavigateVehicles={() => setCurrentScreen('VEHICLES')}
          />
        )}

        {currentScreen === 'TRACKER' && (
          <ActiveBookingScreen
            onBackToHome={() => setCurrentScreen('HOME')}
            onRequestNew={() => setCurrentScreen('REQUEST')}
          />
        )}

        {currentScreen === 'VEHICLES' && (
          <VehiclesScreen onBack={() => setCurrentScreen('HOME')} />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('HOME')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentScreen === 'HOME' ? 'home' : 'home-outline'}
            size={22}
            color={currentScreen === 'HOME' ? '#0D9488' : '#64748B'}
          />
          <Text style={[styles.tabLabel, currentScreen === 'HOME' && styles.tabLabelActive]}>
            {bn.tabs.home}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('REQUEST')}
          activeOpacity={0.7}
        >
          <View style={styles.requestCenterPill}>
            <Ionicons name="flash" size={20} color="#FFFFFF" />
          </View>
          <Text style={[styles.tabLabel, currentScreen === 'REQUEST' && styles.tabLabelActive]}>
            {bn.tabs.request}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('TRACKER')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentScreen === 'TRACKER' ? 'navigate' : 'navigate-outline'}
            size={22}
            color={currentScreen === 'TRACKER' ? '#0D9488' : '#64748B'}
          />
          <Text style={[styles.tabLabel, currentScreen === 'TRACKER' && styles.tabLabelActive]}>
            {bn.tabs.activity}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('VEHICLES')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentScreen === 'VEHICLES' ? 'car-sport' : 'car-sport-outline'}
            size={22}
            color={currentScreen === 'VEHICLES' ? '#0D9488' : '#64748B'}
          />
          <Text style={[styles.tabLabel, currentScreen === 'VEHICLES' && styles.tabLabelActive]}>
            {bn.tabs.vehicles}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <MainNavigator />
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingBottom: 14,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#0D9488',
    fontWeight: '800',
  },
  requestCenterPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
});
