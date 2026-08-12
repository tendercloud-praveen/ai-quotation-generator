import axiosInstance from "../api/axiosinstance";

// Fetch all users
export const fetchUsersApi = async () => {
  const response = await axiosInstance.get("/users/");
  return response.data;
};

// Create a new user
export const createUserApi = async (userData) => {
  const response = await axiosInstance.post("/users/create", userData);
  return response.data;
};

// Fetch single user by ID
export const getUserByIdApi = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

// Update existing user
export const updateUserApi = async (userId, patchData) => {
  const response = await axiosInstance.put(`/users/${userId}`, patchData);
  return response.data;
};

// Delete user
export const deleteUserApi = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};

// Create product
export const createProductApi = async (productData) => {
  const response = await axiosInstance.post("/products/", productData);
  return response.data;
};
