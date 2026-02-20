import * as FileSystem from "expo-file-system";

export const documentDirectory = "file:///document/directory/";

export const downloadAsync = jest.fn().mockImplementation(async (url: string, uri: string) => {
  return {
    uri,
    status: 200,
    headers: {},
    mimeType: "application/pdf",
  };
});

export const readAsStringAsync = jest.fn();
export const writeAsStringAsync = jest.fn();
export const deleteAsync = jest.fn();
export const getInfoAsync = jest.fn();
export const makeDirectoryAsync = jest.fn();
export const copyAsync = jest.fn();
export const moveAsync = jest.fn();
export const readDirectoryAsync = jest.fn();

export default {
  documentDirectory,
  downloadAsync,
  readAsStringAsync,
  writeAsStringAsync,
  deleteAsync,
  getInfoAsync,
  makeDirectoryAsync,
  copyAsync,
  moveAsync,
  readDirectoryAsync,
};
