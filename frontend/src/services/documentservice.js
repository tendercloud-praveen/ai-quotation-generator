import axiosInstance from "../api/axiosinstance";

export const registerUser = async (payload) => {
  const response = await axiosInstance.post("/users/register", payload);
  return response.data;
};

// export const loginUser = async (payload) => {
//   const formData = new URLSearchParams();

//   formData.append("grant_type", "password");
//   formData.append("username", payload.email);
//   formData.append("password", payload.password);
//   formData.append("scope", "");
//   formData.append("client_id", "string");
//   formData.append("client_secret", "string");

//   const response = await axiosInstance.post("/users/login", formData, {
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//   });

//   return response.data;
// };

export const loginUser = async ({ email, password }) => {
  const formData = new URLSearchParams();

  formData.append("grant_type", "password");
  formData.append("username", email);
  formData.append("password", password);
  formData.append("scope", "");
  formData.append("client_id", "string");
  formData.append("client_secret", "string");

  const response = await axiosInstance.post("/users/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

// export const loginUser = async ({ email, password }) => {
//   const response = await axiosInstance.post("/users/login/", {
//     email: email.trim(),
//     password,
//   });

//   return response.data;
// };

// export const createUserApi = async (userData) => {
//   const response = await axiosInstance.post("/users/create", userData);

//   return response.data;
// };
