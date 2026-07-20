// Customer storage helpers built on top of the generic storage layer.
// All customers live in one array under STORAGE_KEYS.CUSTOMERS and each
// customer carries a companyId for multi-tenant isolation plus a
// createdBy user id for Sales Rep "own customer" edit checks.
import {
  STORAGE_KEYS,
  CUSTOMER_STATUS,
  readJSON,
  writeJSON,
  generateId,
} from "./storage";

export { CUSTOMER_STATUS };

export function getCustomers() {
  return readJSON(STORAGE_KEYS.CUSTOMERS, []);
}

export function saveCustomers(customers) {
  return writeJSON(STORAGE_KEYS.CUSTOMERS, customers);
}

export function getCustomersByCompany(companyId) {
  if (!companyId) return [];
  return getCustomers().filter((c) => c.companyId === companyId);
}

// Auto-generate a unique, readable customer code within a company.
// Format: CUST-<seq> where seq is the next number after the highest
// existing sequence for that company (starts at 1001).
export function generateCustomerCode(companyId) {
  const existing = getCustomersByCompany(companyId);
  let maxSeq = 1000;
  for (const c of existing) {
    const m = String(c.customerCode || "").match(/(\d+)\s*$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n > maxSeq) maxSeq = n;
    }
  }
  return `CUST-${maxSeq + 1}`;
}

export function customerCodeExistsInCompany(companyId, code, excludeId = null) {
  const normalized = String(code).trim().toLowerCase();
  return getCustomers().some(
    (c) =>
      c.companyId === companyId &&
      String(c.customerCode).trim().toLowerCase() === normalized &&
      c.id !== excludeId
  );
}

export function createCustomer({
  companyId,
  createdBy,
  customerCode,
  customerName,
  contactPerson,
  email,
  mobile,
  companyName,
  gstNumber,
  address,
  city,
  state,
  country,
  pincode,
  status,
}) {
  const customers = getCustomers();
  const now = new Date().toISOString();
  const customer = {
    id: generateId(),
    companyId,
    createdBy: createdBy || null,
    customerCode: customerCode.trim(),
    customerName: customerName.trim(),
    contactPerson: contactPerson.trim(),
    email: (email || "").trim(),
    mobile: (mobile || "").trim(),
    companyName: companyName.trim(),
    gstNumber: (gstNumber || "").trim(),
    address: (address || "").trim(),
    city: (city || "").trim(),
    state: (state || "").trim(),
    country: (country || "").trim(),
    pincode: (pincode || "").trim(),
    status: status || CUSTOMER_STATUS.ACTIVE,
    createdAt: now,
    updatedAt: now,
  };
  customers.push(customer);
  saveCustomers(customers);
  return customer;
}

export function updateCustomerById(id, patch) {
  const customers = getCustomers();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = {
    ...customers[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  customers[idx] = next;
  saveCustomers(customers);
  return next;
}

export function deleteCustomerById(id) {
  const customers = getCustomers();
  const next = customers.filter((c) => c.id !== id);
  if (next.length === customers.length) return false;
  saveCustomers(next);
  return true;
}
