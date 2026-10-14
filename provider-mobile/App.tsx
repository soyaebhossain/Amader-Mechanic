import React from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from './src/api/queryClient';
import { ProviderEarningsScreen } from './src/screens/ProviderEarningsScreen';

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <ProviderEarningsScreen />
    </PersistQueryClientProvider>
  );
}
