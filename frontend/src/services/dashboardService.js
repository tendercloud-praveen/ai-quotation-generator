import axiosInstance from "../api/axiosinstance";

export const getManagerDashboardApi = async () => {
  const response = await axiosInstance.get("/manager/dashboard/dashboard");
  return response.data;
};

export const getAdminDashboardApi = async () => {
  const response = await axiosInstance.get("/admin/dashboard/quotations");
  return response.data;
};

export const getSalesDashboardApi = async () => {
  const response = await axiosInstance.get("/sales/dashboard/dashboard");
  return response.data;
};

export const getSalesQuotationRevenueTrendApi = async (salespersonId) => {
  const response = await axiosInstance.get(
    `/dashboard/salesperson/${salespersonId}/quotation-revenue-trend`,
  );

  return response.data;
};

export const getManagerQuotationRevenueTrendApi = async (managerId) => {
  const response = await axiosInstance.get(
    `/dashboard/manager/${managerId}/quotation-revenue-trend`,
  );

  return response.data;
};

export const getAdminQuotationRevenueTrendApi = async () => {
  const response = await axiosInstance.get(
    "/dashboard/quotation-revenue-trend",
  );

  return response.data;
};
