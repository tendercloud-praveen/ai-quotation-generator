import { read, write, uid } from './storage';
import { getUsers } from './users';

const PKEY = 'products';
const CKEY = 'customers';
const IKEY = 'inquiries';
const QKEY = 'quotations';
const SEED_KEY = 'seeded';

export const CATEGORIES = [
  'Pumps', 'Valves', 'Motors', 'Bearings', 'Gears', 'Sensors', 'Controllers', 'Hydraulics', 'Fasteners', 'Tools',
];
export const UNITS = ['Nos', 'Set', 'Pair', 'Meter', 'Kg', 'Litre', 'Box', 'Lot'];

export function getProducts() { return read(PKEY, []); }
export function saveProducts(p) { write(PKEY, p); }
export function addProduct(p) {
  const list = getProducts();
  const item = { id: uid('prd'), createdAt: new Date().toISOString(), ...p };
  list.push(item); saveProducts(list); return item;
}
export function updateProduct(id, patch) {
  const list = getProducts();
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...patch }; saveProducts(list); return list[i];
}
export function deleteProduct(id) { saveProducts(getProducts().filter((x) => x.id !== id)); }

export function getCustomers() { return read(CKEY, []); }
export function saveCustomers(c) { write(CKEY, c); }
export function addCustomer(c) {
  const list = getCustomers();
  const item = { id: uid('cust'), createdAt: new Date().toISOString(), ...c };
  list.push(item); saveCustomers(list); return item;
}
export function updateCustomer(id, patch) {
  const list = getCustomers();
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...patch }; saveCustomers(list); return list[i];
}
export function deleteCustomer(id) { saveCustomers(getCustomers().filter((x) => x.id !== id)); }

export function getInquiries() { return read(IKEY, []); }
export function saveInquiries(i) { write(IKEY, i); }
export function addInquiry(i) {
  const list = getInquiries();
  const item = { id: uid('inq'), status: 'new', createdAt: new Date().toISOString(), ...i };
  list.push(item); saveInquiries(list); return item;
}
export function updateInquiry(id, patch) {
  const list = getInquiries();
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...patch }; saveInquiries(list); return list[i];
}
export function deleteInquiry(id) { saveInquiries(getInquiries().filter((x) => x.id !== id)); }

export function getQuotations() { return read(QKEY, []); }
export function saveQuotations(q) { write(QKEY, q); }
export function addQuotation(q) {
  const list = getQuotations();
  const item = { id: uid('quo'), createdAt: new Date().toISOString(), ...q };
  list.push(item); saveQuotations(list); return item;
}
export function updateQuotation(id, patch) {
  const list = getQuotations();
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...patch }; saveQuotations(list); return list[i];
}
export function deleteQuotation(id) { saveQuotations(getQuotations().filter((x) => x.id !== id)); }

export function maybeSeed() {
  if (read(SEED_KEY, false)) return;
  const users = getUsers();
  if (users.length === 0) return; // no company yet
  const admin = users.find((u) => u.role === 'admin');
  const company = admin?.companyName || 'Acme Manufacturing';
  const salesRep = users.find((u) => u.role === 'sales_rep') || admin;
  const manager = users.find((u) => u.role === 'manager') || admin;

  const products = seedProducts();
  saveProducts(products);
  const customers = seedCustomers();
  saveCustomers(customers);
  const inquiries = seedInquiries(customers, salesRep);
  saveInquiries(inquiries);
  const quotations = seedQuotations(inquiries, products, salesRep, manager);
  saveQuotations(quotations);

  write(SEED_KEY, true);
}

// Assign sample inquiries & quotations to a newly created sales rep so they have data.
export function seedForSalesRep(salesRep) {
  if (!salesRep || salesRep.role !== 'sales_rep') return;
  const customers = getCustomers();
  const products = getProducts();
  if (customers.length === 0 || products.length === 0) return;

  const inquiries = seedInquiries(customers, salesRep);
  saveInquiries([...getInquiries(), ...inquiries]);
  const quotations = seedQuotations(inquiries, products, salesRep, null);
  saveQuotations([...getQuotations(), ...quotations]);
}

function seedProducts() {
  const defs = [
    ['CMP-150', 'Pumps', 'Centrifugal Monoblock Pump 1.5HP', 'Nos', 18500, 14200],
    ['CMP-300', 'Pumps', 'Centrifugal Monoblock Pump 3HP', 'Nos', 32500, 25400],
    ['SBP-050', 'Pumps', 'Submersible Borewell Pump 0.5HP', 'Nos', 12700, 9100],
    ['GBV-100', 'Valves', 'Gate Valve Flanged 100mm', 'Nos', 4800, 3100],
    ['CKV-050', 'Valves', 'Check Valve 50mm', 'Nos', 1650, 980],
    ['BLV-025', 'Valves', 'Ball Valve SS 25mm', 'Nos', 920, 540],
    ['ACM-550', 'Motors', 'AC Induction Motor 5.5kW 3-Phase', 'Nos', 24800, 18900],
    ['ACM-220', 'Motors', 'AC Induction Motor 2.2kW 3-Phase', 'Nos', 12600, 9400],
    ['DCM-075', 'Motors', 'DC Motor 0.75kW 1500RPM', 'Nos', 9800, 7100],
    ['BRG-6204', 'Bearings', 'Deep Groove Ball Bearing 6204 ZZ', 'Nos', 240, 130],
    ['BRG-6308', 'Bearings', 'Deep Groove Ball Bearing 6308 2RS', 'Nos', 680, 390],
    ['HGR-080', 'Gears', 'Helical Gear Module 8:1 Ratio', 'Set', 5600, 3800],
    ['BGR-060', 'Gears', 'Bevel Gear Pair 60mm', 'Pair', 3200, 2050],
    ['PRS-010', 'Sensors', 'Proximity Sensor Inductive M12', 'Nos', 1450, 820],
    ['PRS-018', 'Sensors', 'Photoelectric Sensor 18m Range', 'Nos', 2100, 1300],
    ['PLC-1200', 'Controllers', 'Programmable Logic Controller 12 I/O', 'Nos', 18900, 13600],
    ['VFD-040', 'Controllers', 'Variable Frequency Drive 4kW', 'Nos', 14200, 10100],
    ['HYC-063', 'Hydraulics', 'Hydraulic Cylinder Bore 63mm Stroke 300', 'Nos', 7800, 5400],
    ['HYP-025', 'Hydraulics', 'Hydraulic Gear Pump 25cc/rev', 'Nos', 11200, 8100],
    ['BLT-080', 'Fasteners', 'Hex Bolt M8x80 Grade 8.8 (Box 100)', 'Box', 1100, 640],
    ['NUT-010', 'Fasteners', 'Hex Nut M10 Grade 8 (Box 200)', 'Box', 720, 380],
    ['DRL-13MM', 'Tools', 'Cobalt Drill Bit 13mm', 'Nos', 540, 280],
    ['WRC-150', 'Tools', 'Adjustable Wrench 150mm', 'Nos', 380, 190],
  ];
  return defs.map(([sku, cat, desc, unit, sp, cp]) => ({
    id: uid('prd'), sku, category: cat, name: desc, unit,
    sellingPrice: sp, costPrice: cp,
    description: `${desc}. Manufactured to ISO standards with ${cat.toLowerCase().slice(0, -1)}-grade materials.`,
    createdAt: new Date().toISOString(),
  }));
}

function seedCustomers() {
  const defs = [
    ['TechNova Industries', 'Rahul Mehta', 'rahul@technova.in', '9876543210', 'Pune, Maharashtra'],
    ['Bharat Steel Works', 'Suresh Patil', 'suresh@bharatsteel.in', '9822012345', 'Nagpur, Maharashtra'],
    ['GreenField Agro', 'Anita Desai', 'anita@greenfield.in', '9930011223', 'Nashik, Maharashtra'],
    ['Orbit Aerospace', 'Karan Singh', 'karan@orbitaero.in', '9001122334', 'Bengaluru, Karnataka'],
    ['MarineTech Pvt Ltd', 'Vijay Iyer', 'vijay@marinetech.in', '9445566778', 'Chennai, Tamil Nadu'],
    ['Precision Gear Co', 'Meera Nair', 'meera@precisiongear.in', '8012345678', 'Coimbatore, Tamil Nadu'],
    ['Apex Constructions', 'Deepak Rao', 'deepak@apexcon.in', '7711889900', 'Hyderabad, Telangana'],
    ['Zenith Pharma Equip', 'Priya Shah', 'priya@zenithpe.in', '9090909090', 'Ahmedabad, Gujarat'],
  ];
  return defs.map(([name, contact, email, mobile, address]) => ({
    id: uid('cust'), name, contactPerson: contact, email, mobile, address,
    createdAt: new Date().toISOString(),
  }));
}

function seedInquiries(customers, salesRep) {
  const reqs = [
    'Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm for our cooling line.',
    'Looking for 5 AC motors 2.2kW and 10 proximity sensors for conveyor automation.',
    'Require 3 hydraulic cylinders 63mm and 1 gear pump 25cc for press machine.',
    'Quotation for 8 ball bearings 6308 and 4 helical gear modules.',
    'Need a PLC with 12 I/O and 2 VFD 4kW for packaging line upgrade.',
    'Want 20 boxes of hex bolts M8x80 and 15 boxes hex nuts M10.',
    'Require 3 submersible pumps 0.5HP for irrigation setup.',
    'Need 6 check valves 50mm and 4 ball valves SS 25mm.',
  ];
  return reqs.map((text, i) => ({
    id: uid('inq'),
    customerId: customers[i % customers.length].id,
    text,
    status: i < 4 ? 'processed' : 'new',
    salesRepId: salesRep?.id || null,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function seedQuotations(inquiries, products, salesRep, manager) {
  const out = [];
  const statuses = ['draft', 'pending_approval', 'approved', 'rejected', 'dispatched'];
  inquiries.slice(0, 6).forEach((inq, idx) => {
    const lines = [];
    const picks = products.slice(idx * 2, idx * 2 + 2);
    picks.forEach((p) => {
      const qty = 1 + (idx % 4);
      lines.push({
        productId: p.id, sku: p.sku, name: p.name, unit: p.unit,
        qty, sellingPrice: p.sellingPrice, costPrice: p.costPrice,
        margin: (p.sellingPrice - p.costPrice) * qty,
        total: p.sellingPrice * qty,
      });
    });
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const tax = Math.round(subtotal * 0.18);
    const status = statuses[idx % statuses.length];
    out.push({
      id: uid('quo'),
      inquiryId: inq.id,
      customerId: inq.customerId,
      salesRepId: salesRep?.id || null,
      approverId: status === 'approved' || status === 'rejected' ? manager?.id || null : null,
      lines,
      subtotal, taxRate: 18, tax, grandTotal: subtotal + tax,
      status,
      comments: status === 'rejected' ? 'Margins too thin — please revise selling price.' : '',
      aiMatch: { confidence: 0.82 + (idx % 5) * 0.03, matched: picks.length },
      createdAt: new Date(Date.now() - idx * 43200000).toISOString(),
      dispatchedAt: status === 'dispatched' ? new Date().toISOString() : null,
    });
  });
  return out;
}
