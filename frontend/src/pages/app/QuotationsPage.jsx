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
  MessageCircle,
  X,
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
  downloadQuotationApi,
  dispatchQuotationApi,
  sendQuotationWhatsappApi,
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
  const [whatsappQuotation, setWhatsappQuotation] = useState(null);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

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
          customerName: q.customer_name,

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

          ai_confidence: q.ai_confidence,

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

      const response = await submitQuotationApi(quotation.id, manager.id);

      console.log("Submit quotation response:", response);

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
    if (!q?.id) {
      toast.error("Invalid quotation.");
      return;
    }

    if (q.status !== "approved") {
      toast.error("Only approved quotations can be dispatched.");
      return;
    }

    setWhatsappQuotation(q);
  };

  const sendQuotationToWhatsapp = async () => {
    if (!whatsappQuotation?.id) {
      toast.error("Invalid quotation.");
      return;
    }

    try {
      setSendingWhatsapp(true);

      const response = await sendQuotationWhatsappApi(whatsappQuotation.id);

      console.log("WhatsApp API response:", response);

      if (response?.success === false) {
        toast.error(response.message || "Failed to send quotation.");
        return;
      }

      setQuotations((prev) =>
        prev.map((quotation) =>
          quotation.id === whatsappQuotation.id
            ? {
                ...quotation,
                status: "dispatched",
                dispatchedAt: new Date().toISOString(),
              }
            : quotation,
        ),
      );

      toast.success(
        response?.message || "Quotation sent to customer on WhatsApp.",
      );

      setWhatsappQuotation(null);
    } catch (error) {
      console.error("WhatsApp quotation failed:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to send quotation on WhatsApp.";

      toast.error(message);
    } finally {
      setSendingWhatsapp(false);
    }
  };

  /*
   * ==========================================
   * DOWNLOAD PDF
   * ==========================================
   */
  const downloadPDF = async (q) => {
    if (!q?.id) {
      toast.error("Invalid quotation.");
      return;
    }

    try {
      const response = await downloadQuotationApi(q.id);

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `quotation-${q.id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded.");
    } catch (error) {
      console.error("Download quotation failed:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to download quotation.";

      toast.error(message);
    }
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

      render: (q) => (
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {q.customerName || "—"}
        </span>
      ),
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

      <Modal
        open={!!whatsappQuotation}
        onClose={() => {
          if (!sendingWhatsapp) {
            setWhatsappQuotation(null);
          }
        }}
        title="Send Quotation"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={sendingWhatsapp}
              onClick={() => setWhatsappQuotation(null)}
            >
              Cancel
            </Button>

            <Button
              variant="success"
              disabled={sendingWhatsapp}
              onClick={sendQuotationToWhatsapp}
            >
              <MessageCircle size={18} />

              {sendingWhatsapp ? "Sending..." : "Send on WhatsApp"}
            </Button>
          </>
        }
      >
        {whatsappQuotation && (
          <div className="space-y-5">
            {/* WhatsApp icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <MessageCircle size={34} className="text-emerald-600" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Send quotation to customer?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                The quotation PDF will be sent to the customer's WhatsApp.
              </p>
            </div>

            {/* Quotation information */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Quotation</span>

                <span className="font-semibold text-slate-900">
                  {whatsappQuotation.quotationNumber ||
                    `#${whatsappQuotation.id}`}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">Customer</span>

                <span className="font-semibold text-slate-900">
                  {whatsappQuotation.customerName || "Customer"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">Amount</span>

                <span className="font-semibold text-slate-900">
                  {formatINR(whatsappQuotation.grandTotal)}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex gap-2">
                <MessageCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-sm text-emerald-800">
                  Click <strong>Send on WhatsApp</strong> to send this approved
                  quotation to the selected customer.
                </p>
              </div>
            </div>
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
  const inq = inquiries.find((i) => i.id === q.inquiryId);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400">Customer</p>
          <p className="font-semibold">{q.customerName || "—"}</p>{" "}
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
            {q.ai_confidence !== null && q.ai_confidence !== undefined
              ? `${Math.round(q.ai_confidence * 100)}%`
              : "—"}
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
                  {formatINR(line.subtotal)}
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
