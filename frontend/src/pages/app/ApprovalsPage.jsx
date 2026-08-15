import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Pencil,
  Clock,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card } from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Textarea } from "../../components/Field";
import { QuotationStatusBadge } from "../../components/Badge";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import EmptyState from "../../components/EmptyState";
import { useToast } from "../../components/Toast";
import { formatINR, formatDate } from "../../lib/validate";
import { useRole } from "../../lib/RoleContext";
import {
  getPendingQuotationsApi,
  getManagerQuotationStatusApi,
  getQuotationApprovalDetailsApi,
  approveQuotationApi,
  rejectQuotationApi,
  requestQuotationChangesApi,
  updateQuotationPricesApi,
} from "../../services/managerService";
import { getAdminQuotationStatusApi } from "../../services/adminService";

export default function ApprovalsPage() {
  const toast = useToast();
  const { user, effectiveRole } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(
    () => searchParams.get("tab") || "pending_approval",
  );

  /*
   * ==========================================
   * DATABASE QUOTATIONS
   * ==========================================
   */
  const [quotations, setQuotations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  /*
   * ==========================================
   * ACTION MODAL
   * ==========================================
   */

  const [actionModal, setActionModal] = useState(null);

  const [comment, setComment] = useState("");

  /*
   * ==========================================
   * EDIT PRICE
   * ==========================================
   */

  const [editPrices, setEditPrices] = useState(null);

  /*
   * ==========================================
   * SYNC TAB WITH URL
   * ==========================================
   */

  useEffect(() => {
    const urlTab = searchParams.get("tab");

    if (urlTab && urlTab !== tab) {
      setTab(urlTab);
    }
  }, [searchParams, tab]);

  const changeTab = (newTab) => {
    setTab(newTab);

    setSearchParams({
      tab: newTab,
    });
  };

  /*
   * ==========================================
   * NORMALIZE BACKEND QUOTATION
   * ==========================================
   *
   * This converts DB/API data into the
   * existing UI structure.
   *
   * No localStorage.
   * No lib/data.js.
   */

  const normalizeQuotation = useCallback((q) => {
    const quotation = q?.quotation || q?.data || q;

    const items =
      quotation?.items || quotation?.quotation_items || quotation?.lines || [];

    const createdBy =
      quotation?.created_by ||
      quotation?.sales_rep ||
      quotation?.salesperson ||
      {};

    const customer = quotation?.customer || quotation?.customer_details || {};

    return {
      id: quotation?.quotation_id ?? quotation?.id,

      quotationNumber:
        quotation?.quotation_number ?? quotation?.quotationNumber,

      customerId:
        quotation?.customer_id ?? quotation?.customerId ?? customer?.id,

      customerName:
        quotation?.customer_name ??
        customer?.name ??
        customer?.full_name ??
        customer?.fullName ??
        "—",

      inquiryId: quotation?.inquiry_id ?? quotation?.inquiryId,

      inquiryText: quotation?.inquiry_text ?? quotation?.inquiryText ?? "",

      salesRepId:
        createdBy?.user_id ??
        createdBy?.id ??
        quotation?.sales_rep_id ??
        quotation?.salesRepId,

      salesRepName:
        createdBy?.name ??
        createdBy?.full_name ??
        createdBy?.fullName ??
        quotation?.sales_rep_name,

      salesRepEmail: createdBy?.email ?? quotation?.sales_rep_email,

      lines: items.map((item) => ({
        id: item?.quotation_item_id ?? item?.id,

        productId: item?.product_id ?? item?.productId,

        name: item?.product_name ?? item?.name ?? "—",

        qty: Number(item?.quantity ?? item?.qty ?? 0),

        unit: item?.unit ?? "",

        sellingPrice: Number(item?.unit_price ?? item?.sellingPrice ?? 0),

        costPrice: Number(item?.cost_price ?? item?.costPrice ?? 0),

        gstPercentage: Number(item?.gst_percentage ?? item?.gstPercentage ?? 0),

        subtotal: Number(item?.subtotal ?? 0),

        gstAmount: Number(item?.gst_amount ?? 0),

        total: Number(item?.total_price ?? item?.total ?? 0),

        margin: Number(item?.margin ?? 0),

        sku: item?.sku ?? "",
      })),

      subtotal: Number(quotation?.subtotal ?? 0),

      tax: Number(quotation?.total_gst ?? quotation?.tax ?? 0),

      grandTotal: Number(quotation?.grand_total ?? quotation?.grandTotal ?? 0),

      margin: Number(quotation?.margin ?? 0),

      status: String(quotation?.status ?? "").toLowerCase(),

      assignedManagerId: quotation?.manager_id ?? quotation?.managerId,

      assignedManagerName: quotation?.manager_name ?? quotation?.managerName,

      submittedAt: quotation?.submitted_at ?? quotation?.submittedAt,

      createdAt: quotation?.created_at ?? quotation?.createdAt,

      updatedAt: quotation?.updated_at ?? quotation?.updatedAt,

      comments: quotation?.comments ?? quotation?.comment ?? "",

      customer,
    };
  }, []);

  /*
   * ==========================================
   * GET PENDING QUOTATIONS FROM DB
   * ==========================================
   *
   * GET
   * /quotation-approval/pending
   */

  const loadPendingQuotations = useCallback(async () => {
    try {
      setLoading(true);

      const status =
        tab === "pending_approval"
          ? "PENDING"
          : tab === "approved"
            ? "APPROVED"
            : "REJECTED";

      const response =
        effectiveRole?.toLowerCase() === "admin"
          ? await getAdminQuotationStatusApi(status)
          : await getManagerQuotationStatusApi(status);

      console.log("Quotation GET response:", response);

      const raw =
        response?.quotations ||
        response?.pending_quotations ||
        response?.data ||
        response ||
        [];

      const list = Array.isArray(raw) ? raw : [];

      setQuotations(list.map(normalizeQuotation));
    } catch (error) {
      console.error("Failed to load quotations:", error);

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to load quotations.",
      );
    } finally {
      setLoading(false);
    }
  }, [effectiveRole, tab, normalizeQuotation, toast]);

  /*
   * LOAD WHEN PAGE OPENS
   */

  useEffect(() => {
    loadPendingQuotations();
  }, [effectiveRole, tab, normalizeQuotation, toast]);

  /*
   * ==========================================
   * GET SINGLE QUOTATION FROM DB
   * ==========================================
   *
   * GET
   * /quotation-approval/{quotation_id}
   */

  const refreshQuotationDetails = async (quotationId) => {
    const response = await getQuotationApprovalDetailsApi(quotationId);

    console.log("GET quotation details:", response);

    const fresh = normalizeQuotation(response);

    setQuotations((previous) => {
      const exists = previous.some((q) => q.id === fresh.id);

      if (!exists) {
        return [...previous, fresh];
      }

      return previous.map((q) => (q.id === fresh.id ? fresh : q));
    });

    return fresh;
  };

  /*
   * ==========================================
   * BACKEND IS SOURCE OF TRUTH
   * ==========================================
   */

  const scoped = quotations;

  /*
   * ==========================================
   * STATUS GROUPS
   * ==========================================
   */

  const pending = scoped.filter(
    (q) => q.status === "pending_approval" || q.status === "pending",
  );

  const approved = scoped.filter((q) => q.status === "approved");

  const rejected = scoped.filter((q) => q.status === "rejected");

  const tabData = {
    pending_approval: pending,

    approved: approved,

    rejected: rejected,
  };

  const current = tabData[tab] || [];

  /*
   * ==========================================
   * SEARCH
   * ==========================================
   */

  const filtered = useMemo(() => {
    return current.filter((q) => {
      const customerName = q.customerName || "—";

      return (
        !search || customerName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [current, search]);

  /*
   * ==========================================
   * OPEN APPROVAL ACTION
   * ==========================================
   */

  const openAction = async (quotation, action) => {
    try {
      setActionLoading(true);

      /*
       * Always get latest DB data.
       */

      const fresh = await refreshQuotationDetails(quotation.id);

      setActionModal({
        quotation: fresh,

        action: action,
      });

      setComment(fresh.comments || "");
    } catch (error) {
      console.error("Failed to load quotation details:", error);

      toast.error(
        error?.response?.data?.detail || "Failed to load quotation details.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * ==========================================
   * APPROVE / REJECT / REQUEST CHANGES
   * ==========================================
   */

  const doAction = async () => {
    if (!actionModal?.quotation?.id) {
      toast.error("Invalid quotation.");

      return;
    }

    const { quotation, action } = actionModal;

    try {
      setActionLoading(true);

      let response;

      /*
       * APPROVE
       */

      if (action === "approve") {
        response = await approveQuotationApi(quotation.id, comment);
      } else if (action === "reject") {
        /*
         * REJECT
         */
        response = await rejectQuotationApi(quotation.id, comment);
      } else {
        /*
         * REQUEST CHANGES
         */
        response = await requestQuotationChangesApi(quotation.id, comment);
      }

      console.log("Quotation action response:", response);

      toast.success(
        action === "approve"
          ? "Quotation approved!"
          : action === "reject"
            ? "Quotation rejected."
            : "Changes requested.",
      );

      setActionModal(null);

      setComment("");

      /*
       * IMPORTANT:
       *
       * Do not use:
       *
       * updateQuotation()
       *
       * Instead reload DB/API.
       */

      await loadPendingQuotations();
    } catch (error) {
      console.error("Quotation action failed:", error);

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to process quotation.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * ==========================================
   * OPEN EDIT PRICES
   * ==========================================
   */

  const openEditPrices = async (quotation) => {
    try {
      setActionLoading(true);

      const fresh = await refreshQuotationDetails(quotation.id);

      setEditPrices({
        id: fresh.id,

        lines: fresh.lines.map((line) => ({
          ...line,
        })),
      });
    } catch (error) {
      console.error("Failed to load quotation:", error);

      toast.error("Failed to load quotation details.");
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * ==========================================
   * UPDATE PRICE IN UI
   * ==========================================
   */

  const updateEditPrice = (index, patch) => {
    setEditPrices((state) => ({
      ...state,

      lines: state.lines.map((line, i) => {
        if (i !== index) {
          return line;
        }

        const next = {
          ...line,
          ...patch,
        };

        next.total = Number(next.sellingPrice || 0) * Number(next.qty || 0);

        next.margin =
          (Number(next.sellingPrice || 0) - Number(next.costPrice || 0)) *
          Number(next.qty || 0);

        return next;
      }),
    }));
  };

  /*
   * ==========================================
   * SAVE PRICES TO DB
   * ==========================================
   *
   * PUT
   * /quotation-approval/{quotation_id}/prices
   */

  const saveEditPrices = async () => {
    if (!editPrices?.id) {
      toast.error("Invalid quotation.");
      return;
    }

    try {
      setActionLoading(true);

      const items = editPrices.lines.map((line) => ({
        quotation_item_id: Number(line.id),
        selling_price: Number(line.sellingPrice || 0),
      }));

      console.log("Updating quotation prices:", {
        quotationId: editPrices.id,
        items,
      });

      const response = await updateQuotationPricesApi(editPrices.id, items);

      console.log("Price update response:", response);

      toast.success("Prices updated.");

      setEditPrices(null);

      // Get fresh data from DB
      await loadPendingQuotations();
    } catch (error) {
      console.error("Failed to update prices:", error);

      console.error("Backend response:", error?.response?.data);

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to update prices.",
      );
    } finally {
      setActionLoading(false);
    }
  };

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

        const percentage = q.grandTotal
          ? ((margin / q.grandTotal) * 100).toFixed(0)
          : "0";

        return (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {formatINR(margin)} ({percentage}%)
          </span>
        );
      },
    },

    {
      key: "createdAt",

      header: "Submitted",

      sortable: true,

      render: (q) => (
        <span className="text-slate-500 dark:text-slate-400">
          {formatDate(q.submittedAt || q.createdAt)}
        </span>
      ),
    },

    {
      key: "status",

      header: "Status",

      render: (q) => <QuotationStatusBadge status={q.status} />,
    },
  ];

  const actionLabels = {
    approve: "Approve Quotation",

    reject: "Reject Quotation",

    request_changes: "Request Changes",
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          {
            label: "Approvals",
          },
        ]}
      />

      <PageHeader
        title="Approvals"
        subtitle="Review, approve, or reject pending quotations with margin control."
      />

      {/* =====================================
          TABS
          ===================================== */}

      <div className="flex items-center gap-2">
        {[
          {
            key: "pending_approval",

            label: "Pending",

            count: pending.length,

            icon: Clock,

            tone: "text-amber-600",
          },

          {
            key: "approved",

            label: "Approved",

            count: approved.length,

            icon: CheckCircle2,

            tone: "text-emerald-600",
          },

          {
            key: "rejected",

            label: "Rejected",

            count: rejected.length,

            icon: XCircle,

            tone: "text-red-600",
          },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => changeTab(item.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === item.key
                ? "bg-brand-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <item.icon
              size={16}
              className={tab === item.key ? "text-white" : item.tone}
            />

            {item.label}

            <span
              className={`px-1.5 py-0.5 rounded text-xs ${
                tab === item.key
                  ? "bg-white/20"
                  : "bg-slate-100 dark:bg-slate-700"
              }`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* =====================================
          SEARCH
          ===================================== */}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by customer…"
        />
      </div>

      {/* =====================================
          TABLE
          ===================================== */}

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading quotations...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Nothing to review"
            description={
              tab === "pending_approval"
                ? "No quotations awaiting approval."
                : `No ${tab} quotations.`
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={8}
            actions={(q) => (
              <div className="flex items-center justify-end gap-1">
                {tab === "pending_approval" && (
                  <>
                    {/* APPROVE */}

                    <button
                      disabled={actionLoading}
                      onClick={() => openAction(q, "approve")}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 transition"
                      title="Approve"
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    {/* REJECT */}

                    <button
                      disabled={actionLoading}
                      onClick={() => openAction(q, "reject")}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition"
                      title="Reject"
                    >
                      <XCircle size={16} />
                    </button>

                    {/* REQUEST CHANGES */}

                    <button
                      disabled={actionLoading}
                      onClick={() => openAction(q, "request_changes")}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 transition"
                      title="Request Changes"
                    >
                      <MessageSquare size={16} />
                    </button>

                    {/* EDIT PRICE */}

                    <button
                      disabled={actionLoading}
                      onClick={() => openEditPrices(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"
                      title="Edit Price"
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                )}
              </div>
            )}
          />
        )}
      </Card>

      {/* =====================================
          APPROVE / REJECT / REQUEST CHANGES
          ===================================== */}

      <Modal
        open={!!actionModal}
        onClose={() => {
          if (!actionLoading) {
            setActionModal(null);
          }
        }}
        title={actionModal ? actionLabels[actionModal.action] : ""}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={actionLoading}
              onClick={() => setActionModal(null)}
            >
              Cancel
            </Button>

            <Button
              variant={
                actionModal?.action === "approve"
                  ? "success"
                  : actionModal?.action === "reject"
                    ? "danger"
                    : "primary"
              }
              disabled={actionLoading}
              onClick={doAction}
            >
              {actionLoading
                ? "Processing..."
                : actionModal?.action === "approve"
                  ? "Approve"
                  : actionModal?.action === "reject"
                    ? "Reject"
                    : "Send Request"}
            </Button>
          </>
        }
      >
        {actionModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Customer</p>

                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {actionModal.quotation.customerName || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Amount</p>

                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {formatINR(actionModal.quotation.grandTotal)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">Line Items</p>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Product</th>

                      <th className="px-3 py-2 text-right">Price</th>

                      <th className="px-3 py-2 text-right">Margin</th>
                    </tr>
                  </thead>

                  <tbody>
                    {actionModal.quotation.lines.map((line, index) => (
                      <tr
                        key={line.id ?? index}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {line.name}
                        </td>

                        <td className="px-3 py-2 text-right">
                          {formatINR(line.sellingPrice)}
                        </td>

                        <td className="px-3 py-2 text-right text-emerald-600">
                          {formatINR(line.margin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Textarea
              label="Comments (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={
                actionModal.action === "reject"
                  ? "Reason for rejection…"
                  : actionModal.action === "request_changes"
                    ? "What changes are needed…"
                    : "Approval note…"
              }
            />
          </div>
        )}
      </Modal>

      {/* =====================================
          EDIT PRICES
          ===================================== */}

      <Modal
        open={!!editPrices}
        onClose={() => {
          if (!actionLoading) {
            setEditPrices(null);
          }
        }}
        title="Edit Quotation Prices"
        subtitle="Adjust selling prices before approving"
        size="xl"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={actionLoading}
              onClick={() => setEditPrices(null)}
            >
              Cancel
            </Button>

            <Button disabled={actionLoading} onClick={saveEditPrices}>
              {actionLoading ? "Saving..." : "Save Prices"}
            </Button>
          </>
        }
      >
        {editPrices && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>

                  <th className="px-4 py-2 text-right">Qty</th>

                  <th className="px-4 py-2 text-right">Cost</th>

                  <th className="px-4 py-2 text-right">Selling</th>

                  <th className="px-4 py-2 text-right">Margin</th>

                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {editPrices.lines.map((line, index) => (
                  <tr
                    key={line.id ?? index}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-2">
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {line.name}
                      </p>

                      <p className="text-xs text-slate-400 font-mono">
                        {line.sku}
                      </p>
                    </td>

                    <td className="px-4 py-2 text-right">{line.qty}</td>

                    <td className="px-4 py-2 text-right text-slate-500">
                      {formatINR(line.costPrice)}
                    </td>

                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        value={line.sellingPrice}
                        onChange={(e) =>
                          updateEditPrice(index, {
                            sellingPrice: Number(e.target.value),
                          })
                        }
                        className="w-24 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                      />
                    </td>

                    <td className="px-4 py-2 text-right text-emerald-600">
                      {formatINR(line.margin)}
                    </td>

                    <td className="px-4 py-2 text-right font-semibold">
                      {formatINR(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
