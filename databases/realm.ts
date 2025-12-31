// databases/realm.ts
import { Platform } from 'react-native';

// Platform-specific imports
let realmInstance: any = null;
let isInitializing = false;

export const getRealm = async () => {
  // Return existing instance if available
  if (realmInstance) {
    return realmInstance;
  }

  // Check if we're on a native platform (Android/iOS)
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    try {
      // Prevent multiple concurrent initializations
      if (isInitializing) {
        while (isInitializing) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return realmInstance;
      }

      isInitializing = true;
      console.log('Initializing Realm...', Platform.OS);
      
      // Import the native implementation directly
      const realmModule = await import('./realm.native');
      
      console.log('Realm module imported successfully');
      realmInstance = await realmModule.getRealm();
      
      console.log('Realm instance created successfully');
      return realmInstance;
    } catch (error: any) {
      console.error('Error loading Realm:', error);
      realmInstance = null; // Reset on error
      throw new Error(`Failed to load Realm on ${Platform.OS}: ${error?.message || 'Unknown error'}`);
    } finally {
      isInitializing = false;
    }
  }
  
  // For web or other platforms, throw a more descriptive error
  throw new Error(`Realm is only available on native platforms (Android/iOS). Current platform: ${Platform.OS}`);
};
