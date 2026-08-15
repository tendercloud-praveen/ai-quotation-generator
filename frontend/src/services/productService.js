import axiosInstance from "../api/axiosinstance";

// Create product
export const createProductApi = async (productData) => {
  const response = await axiosInstance.post("/products/", productData);
  return response.data;
};

// Update product
export const updateProductApi = async (productId, productData) => {
  const response = await axiosInstance.put(
    `/products/${productId}`,
    productData,
  );

  return response.data;
};

export const getProductsApi = () => {
  return axiosInstance.get("/products/");
};

export const getProductApi = (productId) => {
  return axiosInstance.get(`/products/${productId}`);
};
