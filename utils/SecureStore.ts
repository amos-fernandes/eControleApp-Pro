import * as SecureStore from "expo-secure-store"

export async function SaveDataToSecureStore(key: string, value: any): Promise<void> {
  await SecureStore.setItemAsync(key, value)
}

export async function GetDataFromSecureStore(key: string): Promise<any> {
  return await SecureStore.getItemAsync(key)
}

export async function DeleteDataFromSecureStore(key: string): Promise<void> {
  return await SecureStore.deleteItemAsync(key)
}
