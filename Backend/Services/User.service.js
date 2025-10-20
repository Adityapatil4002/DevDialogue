import userModel from "../Models/user.model.js";

export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const hashedPassword = await userModel.hashPassword(password);
  const user = await userModel.create({
    email,
    password: hashedPassword,
  });
  return user;
};

// Group all functions under one object for default export
const userService = {
  createUser,
};

export default userService;
