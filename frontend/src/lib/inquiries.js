// Inquiry storage helpers built on top of the generic storage layer.
import {
  STORAGE_KEYS,
  INQUIRY_STATUS,
  INQUIRY_PRIORITY,
  readJSON,
  writeJSON,
  generateId,
} from "./storage";

export { INQUIRY_STATUS, INQUIRY_PRIORITY };

export function getInquiries() {
  return readJSON(STORAGE_KEYS.INQUIRIES, []);
}

export function saveInquiries(inquiries) {
  return writeJSON(STORAGE_KEYS.INQUIRIES, inquiries);
}

export function getInquiriesByCompany(companyId) {
  if (!companyId) return [];
  return getInquiries().filter((i) => i.companyId === companyId);
}

// Auto-generate a unique inquiry number within a company.
// Format: INQ-<seq> where seq is the next number after the highest
// existing sequence for that company (starts at 1001).
export function generateInquiryNumber(companyId) {
  const existing = getInquiriesByCompany(companyId);
  let maxSeq = 1000;
  for (const i of existing) {
    const m = String(i.inquiryNumber || "").match(/(\d+)\s*$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n > maxSeq) maxSeq = n;
    }
  }
  return `INQ-${maxSeq + 1}`;
}

export function inquiryNumberExistsInCompany(companyId, number, excludeId = null) {
  const normalized = String(number).trim().toLowerCase();
  return getInquiries().some(
    (i) =>
      i.companyId === companyId &&
      String(i.inquiryNumber).trim().toLowerCase() === normalized &&
      i.id !== excludeId
  );
}

export function createInquiry({
  companyId,
  createdBy,
  inquiryNumber,
  inquiryDate,
  customerId,
  customerName,
  contactPerson,
  productId,
  productName,
  quantity,
  unit,
  expectedPrice,
  priority,
  status,
  notes,
}) {
  const inquiries = getInquiries();
  const now = new Date().toISOString();
  const inquiry = {
    id: generateId(),
    companyId,
    createdBy: createdBy || null,
    inquiryNumber: inquiryNumber.trim(),
    inquiryDate,
    customerId: customerId || null,
    customerName: customerName || "",
    contactPerson: contactPerson || "",
    productId: productId || null,
    productName: productName || "",
    quantity: Number(quantity),
    unit: unit || "",
    expectedPrice: expectedPrice === "" || expectedPrice == null ? null : Number(expectedPrice),
    priority: priority || INQUIRY_PRIORITY.MEDIUM,
    status: status || INQUIRY_STATUS.NEW,
    notes: (notes || "").trim(),
    createdAt: now,
    updatedAt: now,
  };
  inquiries.push(inquiry);
  saveInquiries(inquiries);
  return inquiry;
}

export function updateInquiryById(id, patch) {
  const inquiries = getInquiries();
  const idx = inquiries.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const next = {
    ...inquiries[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  inquiries[idx] = next;
  saveInquiries(inquiries);
  return next;
}

export function deleteInquiryById(id) {
  const inquiries = getInquiries();
  const next = inquiries.filter((i) => i.id !== id);
  if (next.length === inquiries.length) return false;
  saveInquiries(next);
  return true;
}
