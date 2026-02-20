export const retrieveDomain = jest.fn().mockResolvedValue({
  data: "http://mock-domain.com",
});

export default {
  retrieveDomain,
};
