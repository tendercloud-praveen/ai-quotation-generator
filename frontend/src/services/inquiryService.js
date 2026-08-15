import axiosInstance from "../api/axiosinstance";

export const extractInquiryTextApi = async (text) => {
  const formData = new FormData();

  formData.append("text", text);

  const response = await axiosInstance.post(
    "/inquiries/extract-text",
    formData
  );

  return response.data;
};