import axiosInstance from "../api/axiosinstance";

export const extractInquiryTextApi = async (text, file = null) => {
  const formData = new FormData();

  formData.append("text", text || "");

  if (file) {
    formData.append("file", file);
  }

  const response = await axiosInstance.post(
    "/inquiries/extract-text",
    formData,
  );

  return response.data;
};