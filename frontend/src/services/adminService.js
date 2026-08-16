import axiosInstance from "../api/axiosinstance";

export const getAdminQuotationStatusApi = async (status = "PENDING") => {
  const response = await axiosInstance.get("/admin/quotation-status/", {
    params: {
      status,
    },
  });

  return response.data;
};