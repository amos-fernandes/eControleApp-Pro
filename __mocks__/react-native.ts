export const Alert = {
  alert: jest.fn(),
};

export const Linking = {
  openURL: jest.fn(),
};

export const Platform = {
  OS: 'ios', // Mock platform as iOS for tests
  select: (obj: any) => obj.ios || obj.android || obj.default,
  Version: 13,
};

export const View = "View";
export const Text = "Text";
export const TouchableOpacity = "TouchableOpacity";
export const Image = "Image";
export const ActivityIndicator = "ActivityIndicator";
export const ScrollView = "ScrollView";
export const SafeAreaView = "SafeAreaView";
export const RefreshControl = "RefreshControl";

export default {
  Alert,
  Linking,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  RefreshControl,
};
