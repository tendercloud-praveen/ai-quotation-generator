import axiosInstance from "../api/axiosInstance";

// Forgot password - send OTP
export const forgotPasswordApi = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

// Reset password - verify OTP and update password
export const resetPasswordApi = async (passwordData) => {
  const response = await axiosInstance.post(
    "/auth/reset-password",
    passwordData,
  );
  return response.data;
};
