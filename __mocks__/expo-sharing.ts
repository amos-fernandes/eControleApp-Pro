const isAvailableAsync = jest.fn().mockResolvedValue(true);
const shareAsync = jest.fn().mockResolvedValue(undefined);

export { isAvailableAsync, shareAsync };

export default {
  isAvailableAsync,
  shareAsync,
};
