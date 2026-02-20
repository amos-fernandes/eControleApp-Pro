export const getCredentials = jest.fn().mockReturnValue({
  accessToken: "mock-access-token",
  client: "mock-client",
  uid: "mock-uid",
});

export const insertMTR = jest.fn();
export const updateMTRStatus = jest.fn();
export const getMTRById = jest.fn();
export const insertServiceOrder = jest.fn();

export default {
  getCredentials,
  insertMTR,
  updateMTRStatus,
  getMTRById,
  insertServiceOrder,
};
