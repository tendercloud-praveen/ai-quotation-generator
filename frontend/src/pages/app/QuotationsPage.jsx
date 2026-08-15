// import { useMemo, useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import {
//   FileCheck2, Eye, Download, Send, Pencil, Trash2,
//   FileText, CheckCircle2, XCircle, Clock, Save,
// } from 'lucide-react';
// import PageHeader from '../../components/PageHeader';
// import Breadcrumbs from '../../components/Breadcrumbs';
// import { Card, CardHeader, CardBody } from '../../components/Card';
// import Button from '../../components/Button';
// import Modal from '../../components/Modal';
// import { Select, Input, Textarea } from '../../components/Field';
// import { QuotationStatusBadge } from '../../components/Badge';
// import DataTable from '../../components/DataTable';
// import SearchBar from '../../components/SearchBar';
// import EmptyState from '../../components/EmptyState';
// import { ConfirmDialog } from '../../components/ConfirmDialog';
// import { useToast } from '../../components/Toast';
// import { useStore } from '../../lib/useStore';
// import {
//   getQuotations, updateQuotation, deleteQuotation,
//   getCustomers, getInquiries,
// } from '../../lib/data';
// import { getManagers } from '../../lib/users';
// import { addNotification } from '../../lib/notifications';
// import { formatINR, formatDate, formatDateTime } from '../../lib/validate';
// import { useRole } from '../../lib/RoleContext';
// import { generateQuotationPDF } from '../../lib/pdf';

// const STATUS_FLOW = ['draft', 'pending_approval', 'approved', 'rejected', 'dispatched'];

// export default function QuotationsPage() {
//   useStore(() => {});
//   const navigate = useNavigate();
//   const toast = useToast();
//   const { user, effectiveRole } = useRole();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');

//   // Sync status filter with URL query param
//   useEffect(() => {
//     const urlStatus = searchParams.get('status');
//     if (urlStatus && urlStatus !== statusFilter) setStatusFilter(urlStatus);
//   }, [searchParams]);

//   const changeStatusFilter = (s) => {
//     setStatusFilter(s);
//     if (s === 'all') setSearchParams({});
//     else setSearchParams({ status: s });
//   };
//   const [viewId, setViewId] = useState(null);
//   const [editId, setEditId] = useState(null);
//   const [deleteId, setDeleteId] = useState(null);
//   const [assignModal, setAssignModal] = useState(null); // { quotation }
//   const [assignManagerId, setAssignManagerId] = useState('');

//   const managers = getManagers();

//   const quotations = getQuotations();
//   const customers = getCustomers();
//   const inquiries = getInquiries();

//   // Edit state
//   const [editLines, setEditLines] = useState([]);
//   const [editComment, setEditComment] = useState('');

//   const filtered = useMemo(() => {
//     return quotations.filter((q) => {
//       // Sales rep only sees their own quotations; manager only sees quotations assigned to them
//       const mine = effectiveRole === 'sales_rep'
//         ? q.salesRepId === user.id
//         : effectiveRole === 'manager'
//           ? q.assignedManagerId === user.id
//           : true;
//       const cust = customers.find((c) => c.id === q.customerId);
//       const matches = !search || (cust?.name || '').toLowerCase().includes(search.toLowerCase());
//       const statusOk = statusFilter === 'all' || q.status === statusFilter;
//       return mine && matches && statusOk;
//     });
//   }, [quotations, customers, search, statusFilter, effectiveRole, user.id]);

//   const submitForApproval = (q) => {
//     if (managers.length === 0) { toast.error('No managers available to approve. Ask your admin to create a manager account.'); return; }
//     setAssignModal({ quotation: q });
//     setAssignManagerId('');
//   };

//   const confirmAssignManager = () => {
//     if (!assignManagerId) { toast.error('Select a manager to assign.'); return; }
//     const mgr = managers.find((m) => m.id === assignManagerId);
//     if (!mgr) { toast.error('Invalid manager.'); return; }
//     const q = assignModal.quotation;
//     updateQuotation(q.id, {
//       status: 'pending_approval',
//       assignedManagerId: mgr.id,
//       assignedManagerName: mgr.fullName,
//     });
//     addNotification({
//       userId: mgr.id,
//       type: 'assigned',
//       title: 'New quotation awaiting approval',
//       desc: `${user.fullName} assigned you a quotation (${formatINR(q.grandTotal)}).`,
//       quotationId: q.id,
//     });
//     toast.success(`Quotation sent to ${mgr.fullName} for approval.`);
//     setAssignModal(null);
//     setAssignManagerId('');
//   };

//   const dispatch = (q) => {
//     updateQuotation(q.id, { status: 'dispatched', dispatchedAt: new Date().toISOString() });
//     toast.success('Quotation dispatched to customer!');
//   };

//   const downloadPDF = (q) => {
//     const cust = customers.find((c) => c.id === q.customerId);
//     generateQuotationPDF(q, cust, user);
//     toast.success('PDF downloaded.');
//   };

//   const remove = () => { deleteQuotation(deleteId); toast.success('Quotation deleted.'); setDeleteId(null); };

//   const openEdit = (q) => {
//     setEditId(q.id);
//     setEditLines(q.lines.map((l) => ({ ...l })));
//     setEditComment(q.comments || '');
//   };

//   const saveEdit = () => {
//     const { subtotal, tax, grandTotal } = calcTotals(editLines);
//     updateQuotation(editId, { lines: editLines, subtotal, tax, grandTotal, comments: editComment });
//     toast.success('Quotation updated.');
//     setEditId(null);
//   };

//   const updateEditLine = (idx, patch) => {
//     setEditLines((ls) => ls.map((l, i) => {
//       if (i !== idx) return l;
//       const next = { ...l, ...patch };
//       next.total = next.sellingPrice * next.qty;
//       next.margin = (next.sellingPrice - next.costPrice) * next.qty;
//       return next;
//     }));
//   };

//   const viewQuotation = quotations.find((q) => q.id === viewId);
//   const editQuotation = quotations.find((q) => q.id === editId);

//   const columns = [
//     { key: 'customer', header: 'Customer', sortable: true, render: (q) => {
//       const c = customers.find((x) => x.id === q.customerId);
//       return <span className="font-medium text-slate-700 dark:text-slate-200">{c?.name || '—'}</span>;
//     }},
//     { key: 'grandTotal', header: 'Amount', sortable: true, render: (q) => <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(q.grandTotal)}</span> },
//     { key: 'margin', header: 'Margin', render: (q) => {
//       const m = q.lines.reduce((s, l) => s + l.margin, 0);
//       return <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatINR(m)}</span>;
//     }},
//     { key: 'status', header: 'Status', sortable: true, render: (q) => <QuotationStatusBadge status={q.status} /> },
//     { key: 'createdAt', header: 'Created', sortable: true, render: (q) => <span className="text-slate-500 dark:text-slate-400">{formatDate(q.createdAt)}</span> },
//   ];

//   return (
//     <div className="space-y-6">
//       <Breadcrumbs items={[{ label: 'Quotations' }]} />
//       <PageHeader title="Quotations" subtitle="Track and manage quotations through the approval workflow." />

//       <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
//         <SearchBar value={search} onChange={setSearch} placeholder="Search by customer…" />
//         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
//           {['all', ...STATUS_FLOW].map((s) => (
//             <button key={s} onClick={() => changeStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
//               {s === 'all' ? 'All' : s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
//             </button>
//           ))}
//         </div>
//       </div>

//       <Card>
//         {filtered.length === 0 ? (
//           <EmptyState icon={FileCheck2} title="No quotations found" description="Create a quotation from the Inquiries page to get started." />
//         ) : (
//           <DataTable columns={columns} rows={filtered} pageSize={8} actions={(q) => (
//             <div className="flex items-center justify-end gap-1">
//               <button onClick={() => setViewId(q.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition" title="View"><Eye size={16} /></button>
//               <button onClick={() => downloadPDF(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition" title="Download PDF"><Download size={16} /></button>
//               {q.status === 'draft' && (
//                 <>
//                   <button onClick={() => submitForApproval(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 transition" title="Submit for Approval"><Send size={16} /></button>
//                   <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition" title="Edit"><Pencil size={16} /></button>
//                   <button onClick={() => setDeleteId(q.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition" title="Delete"><Trash2 size={16} /></button>
//                 </>
//               )}
//               {q.status === 'approved' && (
//                 <button onClick={() => dispatch(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 transition" title="Dispatch"><Send size={16} /></button>
//               )}
//             </div>
//           )} />
//         )}
//       </Card>

//       {/* View Quotation Modal */}
//       <Modal open={!!viewId} onClose={() => setViewId(null)} title="Quotation Details" size="xl" footer={
//         viewQuotation && (
//           <>
//             <Button variant="secondary" onClick={() => setViewId(null)}>Close</Button>
//             <Button variant="outline" onClick={() => downloadPDF(viewQuotation)}><Download size={16} /> Download PDF</Button>
//             {viewQuotation.status === 'draft' && <Button onClick={() => { submitForApproval(viewQuotation); setViewId(null); }}><Send size={16} /> Submit for Approval</Button>}
//             {viewQuotation.status === 'approved' && <Button variant="success" onClick={() => { dispatch(viewQuotation); setViewId(null); }}><Send size={16} /> Dispatch</Button>}
//           </>
//         )
//       }>
//         {viewQuotation && <QuotationDetail q={viewQuotation} customers={customers} inquiries={inquiries} user={user} />}
//       </Modal>

//       {/* Edit Quotation Modal */}
//       <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Quotation" subtitle="Adjust prices, quantities, and add comments" size="xl" footer={
//         <>
//           <Button variant="secondary" onClick={() => setEditId(null)}>Cancel</Button>
//           <Button onClick={saveEdit}><Save size={16} /> Save Changes</Button>
//         </>
//       }>
//         {editQuotation && (
//           <div className="space-y-4">
//             <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
//               <table className="w-full text-sm">
//                 <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
//                   <tr>
//                     <th className="px-3 py-2 text-left">Product</th>
//                     <th className="px-3 py-2 text-right">Qty</th>
//                     <th className="px-3 py-2 text-right">Cost</th>
//                     <th className="px-3 py-2 text-right">Selling</th>
//                     <th className="px-3 py-2 text-right">Margin</th>
//                     <th className="px-3 py-2 text-right">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {editLines.map((l, i) => (
//                     <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
//                       <td className="px-3 py-2"><p className="font-medium text-slate-700 dark:text-slate-200">{l.name}</p><p className="text-xs text-slate-400 font-mono">{l.sku}</p></td>
//                       <td className="px-3 py-2 text-right"><input type="number" min="1" value={l.qty} onChange={(e) => updateEditLine(i, { qty: Math.max(1, +e.target.value) })} className="w-16 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm" /></td>
//                       <td className="px-3 py-2 text-right text-slate-500">{formatINR(l.costPrice)}</td>
//                       <td className="px-3 py-2 text-right"><input type="number" value={l.sellingPrice} onChange={(e) => updateEditLine(i, { sellingPrice: +e.target.value })} className="w-24 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm" /></td>
//                       <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400">{formatINR(l.margin)}</td>
//                       <td className="px-3 py-2 text-right font-semibold">{formatINR(l.total)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex justify-end">
//               <div className="text-right space-y-1">
//                 <p className="text-sm text-slate-500 dark:text-slate-400">Subtotal: <span className="font-semibold">{formatINR(calcTotals(editLines).subtotal)}</span></p>
//                 <p className="text-sm text-slate-500 dark:text-slate-400">GST (18%): <span className="font-semibold">{formatINR(calcTotals(editLines).tax)}</span></p>
//                 <p className="text-base font-bold text-slate-800 dark:text-slate-100">Grand Total: {formatINR(calcTotals(editLines).grandTotal)}</p>
//               </div>
//             </div>
//             <Textarea label="Comments" value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} placeholder="Add notes for the approver or sales rep…" />
//           </div>
//         )}
//       </Modal>

//       {/* Assign Manager Modal */}
//       <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Send for Approval" subtitle="Select a manager to review this quotation" size="md" footer={
//         <>
//           <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
//           <Button onClick={confirmAssignManager}><Send size={16} /> Send for Approval</Button>
//         </>
//       }>
//         {assignModal && (
//           <div className="space-y-4">
//             <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
//               <p className="text-xs text-slate-400">Quotation amount</p>
//               <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatINR(assignModal.quotation.grandTotal)}</p>
//             </div>
//             <Select label="Assign to Manager" value={assignManagerId} onChange={(e) => setAssignManagerId(e.target.value)} required>
//               <option value="">Choose a manager…</option>
//               {managers.map((m) => (
//                 <option key={m.id} value={m.id}>{m.fullName} — {m.email}</option>
//               ))}
//             </Select>
//             {managers.length === 0 && (
//               <p className="text-sm text-amber-600 dark:text-amber-400">No managers are available. Contact your admin to create one.</p>
//             )}
//           </div>
//         )}
//       </Modal>

//       <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete quotation?" message="This quotation will be permanently removed." confirmLabel="Delete" />
//     </div>
//   );
// }

// function QuotationDetail({ q, customers, inquiries, user }) {
//   const cust = customers.find((c) => c.id === q.customerId);
//   const inq = inquiries.find((i) => i.id === q.inquiryId);
//   return (
//     <div className="space-y-5">
//       <div className="grid grid-cols-2 gap-4">
//         <div><p className="text-xs text-slate-400">Customer</p><p className="font-semibold text-slate-700 dark:text-slate-200">{cust?.name}</p></div>
//         <div><p className="text-xs text-slate-400">Status</p><QuotationStatusBadge status={q.status} /></div>
//         <div><p className="text-xs text-slate-400">Created</p><p className="font-medium text-slate-700 dark:text-slate-200">{formatDateTime(q.createdAt)}</p></div>
//         <div><p className="text-xs text-slate-400">AI Confidence</p><p className="font-medium text-slate-700 dark:text-slate-200">{q.aiMatch ? `${Math.round(q.aiMatch.confidence * 100)}%` : '—'}</p></div>
//       </div>

//       {inq && (
//         <div><p className="text-xs text-slate-400 mb-1">Inquiry</p><div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-600 dark:text-slate-300">{inq.text}</div></div>
//       )}

//       <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
//         <table className="w-full text-sm">
//           <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
//             <tr>
//               <th className="px-4 py-2 text-left">Product</th>
//               <th className="px-4 py-2 text-right">Qty</th>
//               <th className="px-4 py-2 text-right">Price</th>
//               <th className="px-4 py-2 text-right">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {q.lines.map((l, i) => (
//               <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
//                 <td className="px-4 py-2"><p className="font-medium text-slate-700 dark:text-slate-200">{l.name}</p><p className="text-xs text-slate-400 font-mono">{l.sku}</p></td>
//                 <td className="px-4 py-2 text-right">{l.qty} {l.unit}</td>
//                 <td className="px-4 py-2 text-right">{formatINR(l.sellingPrice)}</td>
//                 <td className="px-4 py-2 text-right font-semibold">{formatINR(l.total)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex justify-end">
//         <div className="text-right space-y-1">
//           <p className="text-sm text-slate-500 dark:text-slate-400">Subtotal: <span className="font-semibold">{formatINR(q.subtotal)}</span></p>
//           <p className="text-sm text-slate-500 dark:text-slate-400">GST (18%): <span className="font-semibold">{formatINR(q.tax)}</span></p>
//           <p className="text-lg font-bold text-slate-800 dark:text-slate-100">Grand Total: {formatINR(q.grandTotal)}</p>
//         </div>
//       </div>

//       {q.comments && (
//         <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3">
//           <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Comments</p>
//           <p className="text-sm text-amber-800 dark:text-amber-200">{q.comments}</p>
//         </div>
//       )}
//     </div>
//   );
// }

import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileCheck2,
  Eye,
  Download,
  Send,
  Pencil,
  Trash2,
  Clock,
  Save,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card } from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Select, Input, Textarea } from "../../components/Field";
import { QuotationStatusBadge } from "../../components/Badge";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import EmptyState from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";
import { useStore } from "../../lib/useStore";

import {
  getQuotations,
  updateQuotation,
  deleteQuotation,
  getCustomers,
  getInquiries,
} from "../../lib/data";

import {
  getQuotationsApi,
  submitQuotationApi,
  getManagersApi,
} from "../../services/quotationService";

import { addNotification } from "../../lib/notifications";
import { formatINR, formatDate, formatDateTime } from "../../lib/validate";

import { useRole } from "../../lib/RoleContext";
import { generateQuotationPDF } from "../../lib/pdf";

const STATUS_FLOW = [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "dispatched",
];

export default function QuotationsPage() {
  useStore(() => {});

  const navigate = useNavigate();
  const toast = useToast();

  const { user, effectiveRole } = useRole();

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || "all",
  );

  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  /*
   * Manager assignment state
   */
  const [assignModal, setAssignModal] = useState(null);
  const [assignManagerId, setAssignManagerId] = useState("");

  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [submittingQuotation, setSubmittingQuotation] = useState(false);

  const [quotations, setQuotations] = useState([]);

  const customers = getCustomers();
  const inquiries = getInquiries();

  /*
   * Edit state
   */
  const [editLines, setEditLines] = useState([]);
  const [editComment, setEditComment] = useState("");

  /*
   * Sync status filter with URL
   */
  useEffect(() => {
    const urlStatus = searchParams.get("status");

    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  const changeStatusFilter = (s) => {
    setStatusFilter(s);

    if (s === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ status: s });
    }
  };

  /*
   * ==========================================
   * GET QUOTATIONS
   * ==========================================
   */
  useEffect(() => {
    const loadQuotations = async () => {
      try {
        const response = await getQuotationsApi();

        const apiQuotations = response?.quotations || [];

        const formattedQuotations = apiQuotations.map((q) => ({
          id: q.quotation_id,

          quotationNumber: q.quotation_number,

          inquiryText: q.inquiry_text,

          salesRepId: q.created_by?.user_id,

          salesRepName: q.created_by?.name,

          salesRepEmail: q.created_by?.email,

          customerId: q.customer_id,

          inquiryId: q.inquiry_id,

          lines: (q.items || []).map((item) => ({
            id: item.quotation_item_id,

            productId: item.product_id,

            name: item.product_name,

            qty: item.quantity,

            unit: item.unit,

            sellingPrice: item.unit_price,

            costPrice: item.cost_price,

            gstPercentage: item.gst_percentage,

            subtotal: item.subtotal,

            gstAmount: item.gst_amount,

            total: item.total_price,

            margin: item.margin,

            sku: item.sku || "",
          })),

          subtotal: q.subtotal,

          tax: q.total_gst,

          grandTotal: q.grand_total,

          margin: q.margin,

          status: q.status?.toLowerCase(),

          assignedManagerId: q.manager_id,

          assignedManagerName: q.manager_name,

          submittedAt: q.submitted_at,

          createdAt: q.created_at,

          updatedAt: q.updated_at,

          comments: "",

          aiMatch: null,
        }));

        setQuotations(formattedQuotations);
      } catch (error) {
        console.error("Failed to load quotations:", error);

        toast.error("Failed to load quotations.");
      }
    };

    loadQuotations();
  }, []);

  /*
   * ==========================================
   * GET MANAGERS
   * ==========================================
   */
  useEffect(() => {
    const loadManagers = async () => {
      try {
        setLoadingManagers(true);

        const response = await getManagersApi();

        console.log("Managers API response:", response);

        const apiManagers = response?.managers || [];

        const formattedManagers = apiManagers.map((manager) => ({
          id: manager.id,

          fullName: manager.full_name,

          email: manager.email,

          mobileNumber: manager.mobile_number,

          role: manager.role,
        }));

        setManagers(formattedManagers);
      } catch (error) {
        console.error("Failed to load managers:", error);

        toast.error("Failed to load managers.");
      } finally {
        setLoadingManagers(false);
      }
    };

    loadManagers();
  }, []);

  /*
   * ==========================================
   * FILTER QUOTATIONS
   * ==========================================
   */
  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      /*
       * Sales representative:
       * only their own quotations
       *
       * Manager:
       * only quotations assigned to them
       *
       * Admin:
       * all quotations
       */
      const mine =
        effectiveRole === "sales_rep"
          ? q.salesRepId === user.id
          : effectiveRole === "manager"
            ? q.assignedManagerId === user.id
            : true;

      const cust = customers.find((c) => c.id === q.customerId);

      const matches =
        !search ||
        (cust?.name || "").toLowerCase().includes(search.toLowerCase());

      const statusOk = statusFilter === "all" || q.status === statusFilter;

      return mine && matches && statusOk;
    });
  }, [quotations, customers, search, statusFilter, effectiveRole, user.id]);

  /*
   * ==========================================
   * OPEN SEND FOR APPROVAL MODAL
   * ==========================================
   */
  const submitForApproval = (q) => {
    if (!q?.id) {
      toast.error("Invalid quotation.");
      return;
    }

    if (managers.length === 0) {
      toast.error(
        "No managers available to approve. Ask your admin to create a manager account.",
      );

      return;
    }

    setAssignModal({
      quotation: q,
    });

    setAssignManagerId("");
  };

  /*
   * ==========================================
   * POST /quotations/{quotation_id}/submit
   * ==========================================
   */
  const confirmAssignManager = async () => {
    if (!assignManagerId) {
      toast.error("Select a manager to assign.");
      return;
    }

    const managerId = Number(assignManagerId);

    if (!managerId) {
      toast.error("Invalid manager.");
      return;
    }

    const manager = managers.find((m) => Number(m.id) === managerId);

    if (!manager) {
      toast.error("Invalid manager.");
      return;
    }

    const quotation = assignModal?.quotation;

    if (!quotation?.id) {
      toast.error("Invalid quotation.");
      return;
    }

    try {
      setSubmittingQuotation(true);

      console.log("Submitting quotation:", quotation.id);

      console.log("Selected manager:", manager);

      /*
       * REAL BACKEND API
       *
       * POST
       * /quotations/{quotation_id}/submit
       *
       * Body:
       * {
       *   manager_id: 2
       * }
       */
      const response = await submitQuotationApi(quotation.id, manager.id);

      console.log("Submit quotation response:", response);

      /*
       * Update local UI after successful API call.
       */
      setQuotations((prev) =>
        prev.map((q) =>
          q.id === quotation.id
            ? {
                ...q,

                status: "pending_approval",

                assignedManagerId: manager.id,

                assignedManagerName: manager.fullName,
              }
            : q,
        ),
      );

      /*
       * Keep your existing notification logic.
       */
      addNotification({
        userId: manager.id,

        type: "assigned",

        title: "New quotation awaiting approval",

        desc: `${user.fullName} assigned you a quotation (${formatINR(
          quotation.grandTotal,
        )}).`,

        quotationId: quotation.id,
      });

      toast.success(`Quotation sent to ${manager.fullName} for approval.`);

      setAssignModal(null);

      setAssignManagerId("");
    } catch (error) {
      console.error("Failed to submit quotation:", error);

      /*
       * Show backend error if available.
       */
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to send quotation for approval.";

      toast.error(message);
    } finally {
      setSubmittingQuotation(false);
    }
  };

  /*
   * ==========================================
   * DISPATCH
   * ==========================================
   */
  const dispatch = (q) => {
    updateQuotation(q.id, {
      status: "dispatched",

      dispatchedAt: new Date().toISOString(),
    });

    toast.success("Quotation dispatched to customer!");
  };

  /*
   * ==========================================
   * DOWNLOAD PDF
   * ==========================================
   */
  const downloadPDF = (q) => {
    const cust = customers.find((c) => c.id === q.customerId);

    generateQuotationPDF(q, cust, user);

    toast.success("PDF downloaded.");
  };

  /*
   * ==========================================
   * DELETE
   * ==========================================
   */
  const remove = () => {
    deleteQuotation(deleteId);

    toast.success("Quotation deleted.");

    setDeleteId(null);
  };

  /*
   * ==========================================
   * EDIT
   * ==========================================
   */
  const openEdit = (q) => {
    setEditId(q.id);

    setEditLines(
      q.lines.map((l) => ({
        ...l,
      })),
    );

    setEditComment(q.comments || "");
  };

  const calcTotals = (lines) => {
    const subtotal = lines.reduce(
      (sum, line) => sum + Number(line.total || 0),
      0,
    );

    const tax = Math.round(subtotal * 0.18);

    const grandTotal = subtotal + tax;

    return {
      subtotal,
      tax,
      grandTotal,
    };
  };

  const saveEdit = () => {
    const { subtotal, tax, grandTotal } = calcTotals(editLines);

    updateQuotation(editId, {
      lines: editLines,

      subtotal,

      tax,

      grandTotal,

      comments: editComment,
    });

    toast.success("Quotation updated.");

    setEditId(null);
  };

  const updateEditLine = (idx, patch) => {
    setEditLines((lines) =>
      lines.map((line, i) => {
        if (i !== idx) {
          return line;
        }

        const next = {
          ...line,
          ...patch,
        };

        next.total = next.sellingPrice * next.qty;

        next.margin = (next.sellingPrice - next.costPrice) * next.qty;

        return next;
      }),
    );
  };

  const viewQuotation = quotations.find((q) => q.id === viewId);

  const editQuotation = quotations.find((q) => q.id === editId);

  /*
   * ==========================================
   * TABLE COLUMNS
   * ==========================================
   */
  const columns = [
    {
      key: "customer",

      header: "Customer",

      sortable: true,

      render: (q) => {
        const c = customers.find((x) => x.id === q.customerId);

        return (
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {c?.name || "—"}
          </span>
        );
      },
    },

    {
      key: "grandTotal",

      header: "Amount",

      sortable: true,

      render: (q) => (
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {formatINR(q.grandTotal)}
        </span>
      ),
    },

    {
      key: "margin",

      header: "Margin",

      render: (q) => {
        const margin = q.lines.reduce(
          (sum, line) => sum + Number(line.margin || 0),
          0,
        );

        return (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {formatINR(margin)}
          </span>
        );
      },
    },

    {
      key: "status",

      header: "Status",

      sortable: true,

      render: (q) => <QuotationStatusBadge status={q.status} />,
    },

    {
      key: "createdAt",

      header: "Created",

      sortable: true,

      render: (q) => (
        <span className="text-slate-500 dark:text-slate-400">
          {formatDate(q.createdAt)}
        </span>
      ),
    },
  ];

  /*
   * ==========================================
   * UI
   * ==========================================
   */
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          {
            label: "Quotations",
          },
        ]}
      />

      <PageHeader
        title="Quotations"
        subtitle="Track and manage quotations through the approval workflow."
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by customer…"
        />

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {["all", ...STATUS_FLOW].map((status) => (
            <button
              key={status}
              onClick={() => changeStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                statusFilter === status
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {status === "all"
                ? "All"
                : status
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No quotations found"
            description="Create a quotation from the Inquiries page to get started."
          />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={8}
            actions={(q) => (
              <div className="flex items-center justify-end gap-1">
                {/* VIEW */}
                <button
                  onClick={() => setViewId(q.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition"
                  title="View"
                >
                  <Eye size={16} />
                </button>

                {/* DOWNLOAD */}
                <button
                  onClick={() => downloadPDF(q)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                  title="Download PDF"
                >
                  <Download size={16} />
                </button>

                {/* SEND FOR APPROVAL */}
                {q.status === "draft" && (
                  <>
                    <button
                      onClick={() => submitForApproval(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                      title="Submit for Approval"
                    >
                      <Send size={16} />
                    </button>

                    <button
                      onClick={() => openEdit(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => setDeleteId(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}

                {/* DISPATCH */}
                {q.status === "approved" && (
                  <button
                    onClick={() => dispatch(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition"
                    title="Dispatch"
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>
            )}
          />
        )}
      </Card>

      {/* =====================================
          VIEW QUOTATION MODAL
          ===================================== */}

      <Modal
        open={!!viewId}
        onClose={() => setViewId(null)}
        title="Quotation Details"
        size="xl"
        footer={
          viewQuotation && (
            <>
              <Button variant="secondary" onClick={() => setViewId(null)}>
                Close
              </Button>

              <Button
                variant="outline"
                onClick={() => downloadPDF(viewQuotation)}
              >
                <Download size={16} />
                Download PDF
              </Button>

              {viewQuotation.status === "draft" && (
                <Button
                  onClick={() => {
                    submitForApproval(viewQuotation);

                    setViewId(null);
                  }}
                >
                  <Send size={16} />
                  Submit for Approval
                </Button>
              )}

              {viewQuotation.status === "approved" && (
                <Button
                  variant="success"
                  onClick={() => {
                    dispatch(viewQuotation);

                    setViewId(null);
                  }}
                >
                  <Send size={16} />
                  Dispatch
                </Button>
              )}
            </>
          )
        }
      >
        {viewQuotation && (
          <QuotationDetail
            q={viewQuotation}
            customers={customers}
            inquiries={inquiries}
            user={user}
          />
        )}
      </Modal>

      {/* =====================================
          EDIT QUOTATION MODAL
          ===================================== */}

      <Modal
        open={!!editId}
        onClose={() => setEditId(null)}
        title="Edit Quotation"
        subtitle="Adjust prices, quantities, and add comments"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditId(null)}>
              Cancel
            </Button>

            <Button onClick={saveEdit}>
              <Save size={16} />
              Save Changes
            </Button>
          </>
        }
      >
        {editQuotation && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>

                    <th className="px-3 py-2 text-right">Qty</th>

                    <th className="px-3 py-2 text-right">Cost</th>

                    <th className="px-3 py-2 text-right">Selling</th>

                    <th className="px-3 py-2 text-right">Margin</th>

                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {editLines.map((line, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2">
                        <p className="font-medium">{line.name}</p>

                        <p className="text-xs text-slate-400 font-mono">
                          {line.sku}
                        </p>
                      </td>

                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min="1"
                          value={line.qty}
                          onChange={(e) =>
                            updateEditLine(index, {
                              qty: Math.max(1, +e.target.value),
                            })
                          }
                          className="w-16 text-right rounded border px-2 py-1 text-sm"
                        />
                      </td>

                      <td className="px-3 py-2 text-right">
                        {formatINR(line.costPrice)}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          value={line.sellingPrice}
                          onChange={(e) =>
                            updateEditLine(index, {
                              sellingPrice: +e.target.value,
                            })
                          }
                          className="w-24 text-right rounded border px-2 py-1 text-sm"
                        />
                      </td>

                      <td className="px-3 py-2 text-right text-emerald-600">
                        {formatINR(line.margin)}
                      </td>

                      <td className="px-3 py-2 text-right font-semibold">
                        {formatINR(line.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="text-right space-y-1">
                <p>
                  Subtotal:{" "}
                  <span className="font-semibold">
                    {formatINR(calcTotals(editLines).subtotal)}
                  </span>
                </p>

                <p>
                  GST (18%):{" "}
                  <span className="font-semibold">
                    {formatINR(calcTotals(editLines).tax)}
                  </span>
                </p>

                <p className="text-base font-bold">
                  Grand Total: {formatINR(calcTotals(editLines).grandTotal)}
                </p>
              </div>
            </div>

            <Textarea
              label="Comments"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={3}
              placeholder="Add notes for the approver or sales rep…"
            />
          </div>
        )}
      </Modal>

      {/* =====================================
          SEND TO MANAGER MODAL
          ===================================== */}

      <Modal
        open={!!assignModal}
        onClose={() => {
          if (!submittingQuotation) {
            setAssignModal(null);
          }
        }}
        title="Send for Approval"
        subtitle="Select a manager to review this quotation"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={submittingQuotation}
              onClick={() => setAssignModal(null)}
            >
              Cancel
            </Button>

            <Button
              disabled={submittingQuotation || !assignManagerId}
              onClick={confirmAssignManager}
            >
              <Send size={16} />

              {submittingQuotation ? "Sending..." : "Send for Approval"}
            </Button>
          </>
        }
      >
        {assignModal && (
          <div className="space-y-4">
            {/* QUOTATION AMOUNT */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
              <p className="text-xs text-slate-400">Quotation amount</p>

              <p className="text-lg font-bold">
                {formatINR(assignModal.quotation.grandTotal)}
              </p>
            </div>

            {/* MANAGER DROPDOWN */}
            <Select
              label="Assign to Manager"
              value={assignManagerId}
              onChange={(e) => setAssignManagerId(e.target.value)}
              required
              disabled={loadingManagers || submittingQuotation}
            >
              <option value="">
                {loadingManagers ? "Loading managers..." : "Choose a manager…"}
              </option>

              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName} — {manager.email}
                </option>
              ))}
            </Select>

            {/* NO MANAGERS */}
            {!loadingManagers && managers.length === 0 && (
              <p className="text-sm text-amber-600">
                No managers are available. Contact your admin to create one.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* =====================================
          DELETE
          ===================================== */}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete quotation?"
        message="This quotation will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

/*
 * ==========================================
 * QUOTATION DETAIL
 * ==========================================
 */

function QuotationDetail({ q, customers, inquiries, user }) {
  const cust = customers.find((c) => c.id === q.customerId);

  const inq = inquiries.find((i) => i.id === q.inquiryId);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400">Customer</p>

          <p className="font-semibold">{cust?.name}</p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Status</p>

          <QuotationStatusBadge status={q.status} />
        </div>

        <div>
          <p className="text-xs text-slate-400">Created</p>

          <p className="font-medium">{formatDateTime(q.createdAt)}</p>
        </div>

        <div>
          <p className="text-xs text-slate-400">AI Confidence</p>

          <p className="font-medium">
            {q.aiMatch ? `${Math.round(q.aiMatch.confidence * 100)}%` : "—"}
          </p>
        </div>
      </div>

      {inq && (
        <div>
          <p className="text-xs text-slate-400 mb-1">Inquiry</p>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm">
            {inq.text}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>

              <th className="px-4 py-2 text-right">Qty</th>

              <th className="px-4 py-2 text-right">Price</th>

              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {q.lines.map((line, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">
                  <p className="font-medium">{line.name}</p>

                  <p className="text-xs text-slate-400 font-mono">{line.sku}</p>
                </td>

                <td className="px-4 py-2 text-right">
                  {line.qty} {line.unit}
                </td>

                <td className="px-4 py-2 text-right">
                  {formatINR(line.sellingPrice)}
                </td>

                <td className="px-4 py-2 text-right font-semibold">
                  {formatINR(line.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="text-right space-y-1">
          <p>
            Subtotal:{" "}
            <span className="font-semibold">{formatINR(q.subtotal)}</span>
          </p>

          <p>
            GST (18%): <span className="font-semibold">{formatINR(q.tax)}</span>
          </p>

          <p className="text-lg font-bold">
            Grand Total: {formatINR(q.grandTotal)}
          </p>
        </div>
      </div>

      {q.comments && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs font-semibold mb-1">Comments</p>

          <p className="text-sm">{q.comments}</p>
        </div>
      )}
    </div>
  );
}
