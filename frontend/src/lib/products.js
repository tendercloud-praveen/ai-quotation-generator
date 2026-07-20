// Product storage helpers built on top of the generic storage layer.
// All products live in one array under STORAGE_KEYS.PRODUCTS and each
// product carries a companyId for multi-tenant isolation.
import {
  STORAGE_KEYS,
  PRODUCT_STATUS,
  readJSON,
  writeJSON,
  generateId,
} from "./storage";

export { PRODUCT_STATUS };

export function getProducts() {
  return readJSON(STORAGE_KEYS.PRODUCTS, []);
}

export function saveProducts(products) {
  return writeJSON(STORAGE_KEYS.PRODUCTS, products);
}

export function getProductsByCompany(companyId) {
  if (!companyId) return [];
  return getProducts().filter((p) => p.companyId === companyId);
}

export function productCodeExistsInCompany(companyId, code, excludeId = null) {
  const normalized = String(code).trim().toLowerCase();
  return getProducts().some(
    (p) =>
      p.companyId === companyId &&
      String(p.productCode).trim().toLowerCase() === normalized &&
      p.id !== excludeId
  );
}

export function createProduct({
  companyId,
  productCode,
  productName,
  category,
  brand,
  description,
  costPrice,
  sellingPrice,
  gstPercentage,
  unit,
  stockQuantity,
  status,
}) {
  const products = getProducts();
  const now = new Date().toISOString();
  const product = {
    id: generateId(),
    companyId,
    productCode: productCode.trim(),
    productName: productName.trim(),
    category: category.trim(),
    brand: (brand || "").trim(),
    description: (description || "").trim(),
    costPrice: Number(costPrice),
    sellingPrice: Number(sellingPrice),
    gstPercentage: gstPercentage === "" || gstPercentage == null ? 0 : Number(gstPercentage),
    unit: (unit || "").trim(),
    stockQuantity: stockQuantity === "" || stockQuantity == null ? 0 : Number(stockQuantity),
    status: status || PRODUCT_STATUS.ACTIVE,
    createdAt: now,
    updatedAt: now,
  };
  products.push(product);
  saveProducts(products);
  return product;
}

export function updateProductById(id, patch) {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const next = {
    ...products[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  products[idx] = next;
  saveProducts(products);
  return next;
}

export function deleteProductById(id) {
  const products = getProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return false;
  saveProducts(next);
  return true;
}
