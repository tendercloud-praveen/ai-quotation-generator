import axiosInstance from "../api/axiosinstance";

export const saveQuotationApi = async (quotationData) => {
  const response = await axiosInstance.post("/quotations/", quotationData);

  return response.data;
};

export const getQuotationsApi = async () => {
  const response = await axiosInstance.get("/quotations/");
  return response.data;
};
