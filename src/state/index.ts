// Export all stores
export { useAuthStore, initializeAuthStore } from './authStore';
export { useWalletStore, initializeWalletStore } from './walletStore';
export { useTransactionStore, initializeTransactionStore } from './transactionStore';
export { useContactStore, initializeContactStore } from './contactStore';
export { useSettingsStore, initializeSettingsStore } from './settingsStore';

// Initialize all stores
export const initializeAllStores = async () => {
  try {
    // Initialize stores in order (some depend on others)
    await initializeSettingsStore();
    await initializeAuthStore();
    await initializeWalletStore();
    await initializeContactStore();
    await initializeTransactionStore();
    
    console.log('All stores initialized successfully');
  } catch (error) {
    console.error('Failed to initialize stores:', error);
    throw error;
  }
};