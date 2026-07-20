import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardCheck, CheckCircle2, XCircle, MessageSquare, Pencil, Clock, Eye, Send,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Card, CardHeader, CardBody } from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Textarea } from '../../components/Field';
import { QuotationStatusBadge } from '../../components/Badge';
import DataTable from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { useStore } from '../../lib/useStore';
import { getQuotations, updateQuotation, getCustomers } from '../../lib/data';
import { addNotification } from '../../lib/notifications';
import { formatINR, formatDate } from '../../lib/validate';
import { useRole } from '../../lib/RoleContext';

export default function ApprovalsPage() {
  useStore(() => {});
  const toast = useToast();
  const { user, effectiveRole } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(() => searchParams.get('tab') || 'pending_approval');
  const [actionModal, setActionModal] = useState(null); // { quotation, action }
  const [comment, setComment] = useState('');
  const [editPrices, setEditPrices] = useState(null);

  // Sync tab with URL query param
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== tab) setTab(urlTab);
  }, [searchParams]);

  const changeTab = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const quotations = getQuotations();
  const customers = getCustomers();

  // Managers only see quotations assigned to them; admin sees all.
  const scoped = effectiveRole === 'manager'
    ? quotations.filter((q) => q.assignedManagerId === user.id)
    : quotations;

  const pending = scoped.filter((q) => q.status === 'pending_approval');
  const approved = scoped.filter((q) => q.status === 'approved');
  const rejected = scoped.filter((q) => q.status === 'rejected');

  const tabData = { pending_approval: pending, approved, rejected };
  const current = tabData[tab] || [];

  const filtered = useMemo(() => {
    return current.filter((q) => {
      const cust = customers.find((c) => c.id === q.customerId);
      return !search || (cust?.name || '').toLowerCase().includes(search.toLowerCase());
    });
  }, [current, customers, search]);

  const openAction = (quotation, action) => {
    setActionModal({ quotation, action });
    setComment(quotation.comments || '');
  };

  const doAction = () => {
    const { quotation, action } = actionModal;
    const statusMap = { approve: 'approved', reject: 'rejected', request_changes: 'pending_approval' };
    const newStatus = statusMap[action];
    updateQuotation(quotation.id, {
      status: newStatus,
      approverId: user.id,
      comments: comment,
    });
    // Notify the sales rep who created the quotation
    if (quotation.salesRepId) {
      const notifType = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'changes_requested';
      const title = action === 'approve'
        ? 'Quotation approved'
        : action === 'reject'
          ? 'Quotation rejected'
          : 'Changes requested on your quotation';
      const desc = action === 'approve'
        ? `${user.fullName} approved your quotation (${formatINR(quotation.grandTotal)}). You can now download and dispatch it.`
        : action === 'reject'
          ? `${user.fullName} rejected your quotation (${formatINR(quotation.grandTotal)}).`
          : `${user.fullName} requested changes on your quotation (${formatINR(quotation.grandTotal)}).`;
      addNotification({
        userId: quotation.salesRepId,
        type: notifType,
        title,
        desc,
        quotationId: quotation.id,
      });
    }
    toast.success(action === 'approve' ? 'Quotation approved!' : action === 'reject' ? 'Quotation rejected.' : 'Changes requested.');
    setActionModal(null);
    setComment('');
  };

  const openEditPrices = (q) => {
    setEditPrices({ id: q.id, lines: q.lines.map((l) => ({ ...l })) });
  };

  const updateEditPrice = (idx, patch) => {
    setEditPrices((s) => ({
      ...s,
      lines: s.lines.map((l, i) => {
        if (i !== idx) return l;
        const next = { ...l, ...patch };
        next.total = next.sellingPrice * next.qty;
        next.margin = (next.sellingPrice - next.costPrice) * next.qty;
        return next;
      }),
    }));
  };

  const saveEditPrices = () => {
    const subtotal = editPrices.lines.reduce((s, l) => s + l.total, 0);
    const tax = Math.round(subtotal * 0.18);
    updateQuotation(editPrices.id, { lines: editPrices.lines, subtotal, tax, grandTotal: subtotal + tax });
    toast.success('Prices updated.');
    setEditPrices(null);
  };

  const dispatch = (q) => {
    updateQuotation(q.id, { status: 'dispatched', dispatchedAt: new Date().toISOString() });
    toast.success('Quotation dispatched!');
  };

  const columns = [
    { key: 'customer', header: 'Customer', sortable: true, render: (q) => {
      const c = customers.find((x) => x.id === q.customerId);
      return <span className="font-medium text-slate-700 dark:text-slate-200">{c?.name || '—'}</span>;
    }},
    { key: 'grandTotal', header: 'Amount', sortable: true, render: (q) => <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(q.grandTotal)}</span> },
    { key: 'margin', header: 'Margin', render: (q) => {
      const m = q.lines.reduce((s, l) => s + l.margin, 0);
      const pct = ((m / q.grandTotal) * 100).toFixed(0);
      return <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatINR(m)} ({pct}%)</span>;
    }},
    { key: 'createdAt', header: 'Submitted', sortable: true, render: (q) => <span className="text-slate-500 dark:text-slate-400">{formatDate(q.createdAt)}</span> },
  ];

  const actionLabels = { approve: 'Approve Quotation', reject: 'Reject Quotation', request_changes: 'Request Changes' };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Approvals' }]} />
      <PageHeader title="Approvals" subtitle="Review, approve, or reject pending quotations with margin control." />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: 'pending_approval', label: 'Pending', count: pending.length, icon: Clock, tone: 'text-amber-600' },
          { key: 'approved', label: 'Approved', count: approved.length, icon: CheckCircle2, tone: 'text-emerald-600' },
          { key: 'rejected', label: 'Rejected', count: rejected.length, icon: XCircle, tone: 'text-red-600' },
        ].map((t) => (
          <button key={t.key} onClick={() => changeTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
            <t.icon size={16} className={tab === t.key ? 'text-white' : t.tone} />
            {t.label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${tab === t.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by customer…" />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="Nothing to review" description={tab === 'pending_approval' ? 'No quotations awaiting approval.' : `No ${tab} quotations.`} />
        ) : (
          <DataTable columns={columns} rows={filtered} pageSize={8} actions={(q) => (
            <div className="flex items-center justify-end gap-1">
              {tab === 'pending_approval' && (
                <>
                  <button onClick={() => openAction(q, 'approve')} className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 transition" title="Approve"><CheckCircle2 size={16} /></button>
                  <button onClick={() => openAction(q, 'reject')} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition" title="Reject"><XCircle size={16} /></button>
                  <button onClick={() => openAction(q, 'request_changes')} className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 transition" title="Request Changes"><MessageSquare size={16} /></button>
                  <button onClick={() => openEditPrices(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition" title="Edit Price"><Pencil size={16} /></button>
                </>
              )}
              {tab === 'approved' && (
                <button onClick={() => dispatch(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 transition" title="Dispatch"><Send size={16} /></button>
              )}
            </div>
          )} />
        )}
      </Card>

      {/* Action modal */}
      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={actionModal ? actionLabels[actionModal.action] : ''} size="md" footer={
        <>
          <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
          <Button variant={actionModal?.action === 'approve' ? 'success' : actionModal?.action === 'reject' ? 'danger' : 'primary'} onClick={doAction}>
            {actionModal?.action === 'approve' ? 'Approve' : actionModal?.action === 'reject' ? 'Reject' : 'Send Request'}
          </Button>
        </>
      }>
        {actionModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400">Customer</p><p className="font-medium text-slate-700 dark:text-slate-200">{customers.find((c) => c.id === actionModal.quotation.customerId)?.name}</p></div>
              <div><p className="text-xs text-slate-400">Amount</p><p className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(actionModal.quotation.grandTotal)}</p></div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Line Items</p>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                    <tr><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2 text-right">Price</th><th className="px-3 py-2 text-right">Margin</th></tr>
                  </thead>
                  <tbody>
                    {actionModal.quotation.lines.map((l, i) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{l.name}</td>
                        <td className="px-3 py-2 text-right">{formatINR(l.sellingPrice)}</td>
                        <td className="px-3 py-2 text-right text-emerald-600">{formatINR(l.margin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Textarea label="Comments (optional)" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder={actionModal.action === 'reject' ? 'Reason for rejection…' : actionModal.action === 'request_changes' ? 'What changes are needed…' : 'Approval note…'} />
          </div>
        )}
      </Modal>

      {/* Edit prices modal */}
      <Modal open={!!editPrices} onClose={() => setEditPrices(null)} title="Edit Quotation Prices" subtitle="Adjust selling prices before approving" size="xl" footer={
        <>
          <Button variant="secondary" onClick={() => setEditPrices(null)}>Cancel</Button>
          <Button onClick={saveEditPrices}>Save Prices</Button>
        </>
      }>
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
                {editPrices.lines.map((l, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2"><p className="font-medium text-slate-700 dark:text-slate-200">{l.name}</p><p className="text-xs text-slate-400 font-mono">{l.sku}</p></td>
                    <td className="px-4 py-2 text-right">{l.qty}</td>
                    <td className="px-4 py-2 text-right text-slate-500">{formatINR(l.costPrice)}</td>
                    <td className="px-4 py-2 text-right"><input type="number" value={l.sellingPrice} onChange={(e) => updateEditPrice(i, { sellingPrice: +e.target.value })} className="w-24 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm" /></td>
                    <td className="px-4 py-2 text-right text-emerald-600">{formatINR(l.margin)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatINR(l.total)}</td>
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
