export const LoginSchema = {
  name: "User",
  properties: {
    _id: "string",
    email: "string",
    password: "string",
    created_at: "date",
  },
  primaryKey: "_id",
}
