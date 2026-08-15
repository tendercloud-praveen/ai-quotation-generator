import axiosInstance from "../api/axiosinstance";

//save draft quotation
export const saveQuotationApi = async (quotationData) => {
  const response = await axiosInstance.post("/quotations/", quotationData);

  return response.data;
};

export const getQuotationsApi = async () => {
  const response = await axiosInstance.get("/quotations/");
  return response.data;
};

// Submit quotation to selected manager
export const submitQuotationApi = async (quotationId, managerId) => {
  const response = await axiosInstance.post(
    `/quotations/${quotationId}/submit`,
    {
      manager_id: Number(managerId),
    },
  );

  return response.data;
};

export const getManagersApi = async () => {
  const response = await axiosInstance.get("/managers/");
  return response.data;
};
