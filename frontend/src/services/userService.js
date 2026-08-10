import axiosInstance from "../api/axiosinstance";

// // Fetch all users from Database
// export const fetchUsersApi = async () => {
//   const response = await axiosInstance.get("/users/");
//   return response.data;
// };

// Create a new user account (POST /users/create)
export const createUserApi = async (userData) => {
  const response = await axiosInstance.post("/users/create", userData);
  return response.data;
};

// Fetch single user by ID (GET /users/{user_id})
export const getUserByIdApi = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

// Update existing user (PUT /users/{user_id})
export const updateUserApi = async (userId, patchData) => {
  const response = await axiosInstance.put(`/users/${userId}`, patchData);
  return response.data;
};

// Delete user from Database (DELETE /users/{user_id})
export const deleteUserApi = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};
