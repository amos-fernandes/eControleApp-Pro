// databases/realm.ts
import { Platform } from 'react-native';
import { getRealm as getRealmNative } from './realm.native';

// Platform-specific imports
let realmInstance: any = null;

export const getRealm = async () => {
  // Return existing instance if available
  if (realmInstance) {
    return realmInstance;
  }

  // Check if we're on a native platform (Android/iOS)
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    try {
      console.log('Initializing Realm...', Platform.OS);
      
      // Call the native implementation directly
      realmInstance = await getRealmNative();
      
      console.log('Realm instance created successfully');
      return realmInstance;
    } catch (error: any) {
      console.error('Error loading Realm:', error);
      realmInstance = null; // Reset on error
      throw new Error(`Failed to load Realm on ${Platform.OS}: ${error?.message || 'Unknown error'}`);
    }
  }
  
  // For web or other platforms, throw a more descriptive error
  throw new Error(`Realm is only available on native platforms (Android/iOS). Current platform: ${Platform.OS}`);
};
