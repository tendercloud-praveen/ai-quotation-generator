import axiosInstance from "../api/axiosinstance";

// ============================================================
// GET ALL CUSTOMERS
// ============================================================

export const getCustomersApi = async () => {
  const response = await axiosInstance.get("/customers/");
  return response.data;
};

// ============================================================
// GET CUSTOMER BY ID
// ============================================================

export const getCustomerApi = async (customerId) => {
  const response = await axiosInstance.get(
    `/customers/${customerId}`
  );

  return response.data;
};

// ============================================================
// CREATE CUSTOMER
// ============================================================

export const createCustomerApi = async (customerData) => {
  const response = await axiosInstance.post(
    "/customers/",
    customerData
  );

  return response.data;
};

// ============================================================
// UPDATE CUSTOMER
// ============================================================

export const updateCustomerApi = async (
  customerId,
  customerData
) => {
  const response = await axiosInstance.put(
    `/customers/${customerId}`,
    customerData
  );

  return response.data;
};

// ============================================================
// DELETE CUSTOMER
// ============================================================

export const deleteCustomerApi = async (customerId) => {
  const response = await axiosInstance.delete(
    `/customers/${customerId}`
  );

  return response.data;
};