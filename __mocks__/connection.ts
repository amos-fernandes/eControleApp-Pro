export default {
  post: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
  get: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
  put: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
  delete: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
};
