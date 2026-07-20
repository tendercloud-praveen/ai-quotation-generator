import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Sparkles, ArrowRight, Upload, Trash2, Eye,
  Camera, File as FileIcon, X, RefreshCw, CheckCircle2, Image as ImageIcon,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Select, Textarea } from '../../components/Field';
import Badge from '../../components/Badge';
import DataTable from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { useStore } from '../../lib/useStore';
import { getInquiries, addInquiry, updateInquiry, deleteInquiry, getCustomers } from '../../lib/data';
import { aiMatch } from '../../lib/ai';
import { formatDate } from '../../lib/validate';
import { useRole } from '../../lib/RoleContext';

const SAMPLE_INQUIRIES = [
  'Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm for our cooling line.',
  'Looking for 5 AC motors 2.2kW and 10 proximity sensors for conveyor automation.',
  'Require 3 hydraulic cylinders 63mm and 1 gear pump 25cc for press machine.',
  'Want 20 boxes of hex bolts M8x80 and 15 boxes hex nuts M10.',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilePreview({ file, previewUrl, onRemove, onReplace }) {
  const isImage = file?.type?.startsWith('image/');
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden animate-scale-in">
      <div className="flex items-stretch gap-3 p-3">
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 grid place-items-center">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400">
              <FileIcon size={24} />
              <span className="text-[10px] font-semibold uppercase">PDF</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)} · {file.type || 'file'}</p>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={onReplace} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              <RefreshCw size={12} /> Replace
            </button>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <button onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400">
              <Trash2 size={12} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InquiriesPage() {
  useStore(() => {});
  const navigate = useNavigate();
  const toast = useToast();
  const { user, effectiveRole } = useRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', text: '' });
  const [errors, setErrors] = useState({});
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewInquiry, setViewInquiry] = useState(null);

  // File upload state
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const inquiries = getInquiries();
  const customers = getCustomers();

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      const mine = effectiveRole === 'sales_rep' ? i.salesRepId === user.id : true;
      const cust = customers.find((c) => c.id === i.customerId);
      const matches = !search || i.text.toLowerCase().includes(search.toLowerCase()) || (cust?.name || '').toLowerCase().includes(search.toLowerCase());
      const statusOk = statusFilter === 'all' || i.status === statusFilter;
      return mine && matches && statusOk;
    });
  }, [inquiries, customers, search, statusFilter, effectiveRole, user.id]);

  const validateFile = (f) => {
    if (!f) return 'No file selected.';
    if (f.size > MAX_FILE_SIZE) return 'File is too large (max 10MB).';
    if (f.type && !ACCEPTED_TYPES.includes(f.type)) return 'Only images and PDFs are supported.';
    return null;
  };

  const acceptFile = (f) => {
    const err = validateFile(f);
    if (err) { toast.error(err); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
    setFile(f);
    setPreviewUrl(url);
    setUploadSheetOpen(false);
    toast.success(`File attached: ${f.name}`);
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  };

  const openUploadSheet = () => setUploadSheetOpen(true);

  const runAi = () => {
    if (!form.text.trim()) { setErrors({ text: 'Enter inquiry text first' }); return; }
    setAiLoading(true);
    setTimeout(() => {
      const result = aiMatch(form.text);
      setAiResult(result);
      setAiLoading(false);
      toast.success(`AI matched ${result.matches.length} products with ${Math.round(result.confidence * 100)}% confidence.`);
    }, 900);
  };

  const processInquiry = () => {
    if (!form.customerId) { setErrors({ customerId: 'Select a customer' }); return; }
    if (!form.text.trim() && !file) { setErrors({ text: 'Enter inquiry text or upload a file' }); return; }
    setProcessing(true);
    // Placeholder extraction — in production this would call an OCR/AI service.
    setTimeout(() => {
      let extracted = form.text.trim();
      if (!extracted && file) {
        extracted = `Extracted from ${file.name}: Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm for cooling line.`;
        setForm((f) => ({ ...f, text: extracted }));
      }
      setProcessing(false);
      runAi();
    }, 1200);
  };

  const save = () => {
    const e = {};
    if (!form.customerId) e.customerId = 'Select a customer';
    if (!form.text.trim()) e.text = 'Inquiry text is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    const inq = addInquiry({ customerId: form.customerId, text: form.text, salesRepId: user.id });
    if (aiResult) updateInquiry(inq.id, { status: 'processed', aiMatch: aiResult });
    toast.success('Inquiry created. AI match complete!');
    closeModal();
    navigate('/app/quotations');
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ customerId: '', text: '' });
    setAiResult(null);
    setErrors({});
    removeFile();
    setProcessing(false);
  };

  const remove = () => { deleteInquiry(deleteId); toast.success('Inquiry deleted.'); setDeleteId(null); };

  const columns = [
    { key: 'customer', header: 'Customer', sortable: true, render: (i) => {
      const c = customers.find((x) => x.id === i.customerId);
      return <span className="font-medium text-slate-700 dark:text-slate-200">{c?.name || '—'}</span>;
    }},
    { key: 'text', header: 'Inquiry', render: (i) => <span className="text-slate-600 dark:text-slate-300 truncate max-w-[300px] block">{i.text}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (i) => <Badge tone={i.status === 'processed' ? 'success' : 'warning'} dot>{i.status === 'processed' ? 'Processed' : 'New'}</Badge> },
    { key: 'createdAt', header: 'Created', sortable: true, render: (i) => <span className="text-slate-500 dark:text-slate-400">{formatDate(i.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Inquiries' }]} />
      <PageHeader title="Inquiries" subtitle="Capture customer inquiries and run AI product matching." actions={<Button onClick={() => { setForm({ customerId: '', text: '' }); setAiResult(null); setErrors({}); removeFile(); setModalOpen(true); }}><Plus size={16} /> New Inquiry</Button>} />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search inquiries…" />
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'new', 'processed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No inquiries yet" description="Create your first inquiry to let AI match products automatically." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> New Inquiry</Button>} />
        ) : (
          <DataTable columns={columns} rows={filtered} pageSize={8} actions={(i) => (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => setViewInquiry(i)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"><Eye size={16} /></button>
              <button onClick={() => setDeleteId(i.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition"><Trash2 size={16} /></button>
            </div>
          )} />
        )}
      </Card>

      {/* New Inquiry Modal */}
      <Modal open={modalOpen} onClose={closeModal} title="New Inquiry" subtitle="Describe the customer's requirement — AI will match products." size="xl" footer={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto sm:justify-end">
          <Button variant="secondary" onClick={closeModal} className="w-full sm:w-auto">Cancel</Button>
          {!aiResult && (
            <Button variant="outline" onClick={processInquiry} loading={processing} className="w-full sm:w-auto">
              {processing ? <><RefreshCw size={16} className="animate-spin" /> Processing…</> : <><Sparkles size={16} /> Process Inquiry</>}
            </Button>
          )}
          {aiResult && (
            <Button variant="outline" onClick={runAi} loading={aiLoading} className="w-full sm:w-auto"><Sparkles size={16} /> Re-run Match</Button>
          )}
          <Button onClick={save} className="w-full sm:w-auto">Create & Continue</Button>
        </div>
      }>
        <div className="space-y-5">
          <Select label="Customer" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} error={errors.customerId} required>
            <option value="">Select a customer…</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Inquiry Text<span className="text-red-500 ml-0.5">*</span></label>
              <div className="flex items-center gap-2">
                {SAMPLE_INQUIRIES.slice(0, 2).map((s, i) => (
                  <button key={i} onClick={() => setForm({ ...form, text: s })} className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">Sample {i + 1}</button>
                ))}
              </div>
            </div>
            <Textarea value={form.text} onChange={(e) => { setForm({ ...form, text: e.target.value }); setErrors({ ...errors, text: undefined }); }} error={errors.text} rows={4} placeholder="e.g. Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm…" />
          </div>

          {/* File upload */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Attachment <span className="text-slate-400 font-normal">(optional)</span></label>
            {!file ? (
              <button
                type="button"
                onClick={openUploadSheet}
                className="w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 p-5 text-center transition group"
              >
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/50 mx-auto mb-2.5 transition">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload a photo or PDF</p>
                <p className="text-xs text-slate-400 mt-0.5">Take a photo with your camera or choose a file</p>
              </button>
            ) : (
              <FilePreview file={file} previewUrl={previewUrl} onRemove={removeFile} onReplace={openUploadSheet} />
            )}
          </div>

          {/* Processing / loading state */}
          {processing && (
            <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent" />
                <div>
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Processing inquiry…</p>
                  <p className="text-xs text-brand-600/70 dark:text-brand-400/70 mt-0.5">Extracting text and preparing for AI matching.</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Match results */}
          {aiLoading && !processing && (
            <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent" />
                <p className="text-sm font-medium text-brand-700 dark:text-brand-300">AI is analyzing the inquiry and matching products…</p>
              </div>
            </div>
          )}

          {aiResult && !aiLoading && !processing && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 animate-scale-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="font-semibold text-emerald-800 dark:text-emerald-200">AI Match Results</span>
                </div>
                <Badge tone="success">{Math.round(aiResult.confidence * 100)}% confidence</Badge>
              </div>
              {aiResult.matches.length === 0 ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">No matching products found. Try rephrasing the inquiry.</p>
              ) : (
                <div className="space-y-2">
                  {aiResult.matches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg px-3 py-2.5 border border-emerald-100 dark:border-emerald-900">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-semibold text-brand-600 shrink-0">{m.product.sku}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{m.product.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge tone="default">Qty: {m.qty}</Badge>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">₹{m.product.sellingPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-1">Click "Create & Continue" to generate a quotation from these matches.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Upload bottom sheet */}
      <Modal open={uploadSheetOpen} onClose={() => setUploadSheetOpen(false)} title="Upload Attachment" subtitle="Take a photo or choose an image / PDF" size="sm" footer={
        <Button variant="secondary" onClick={() => setUploadSheetOpen(false)} className="w-full sm:w-auto">Cancel</Button>
      }>
        <div className="space-y-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
          >
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <Camera size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Take Photo</p>
              <p className="text-xs text-slate-400">Use your device camera</p>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
          >
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <ImageIcon size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upload Image / PDF</p>
              <p className="text-xs text-slate-400">JPG, PNG, WebP or PDF (max 10MB)</p>
            </div>
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); e.target.value = ''; }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); e.target.value = ''; }}
        />
      </Modal>

      {/* View inquiry modal */}
      <Modal open={!!viewInquiry} onClose={() => setViewInquiry(null)} title="Inquiry Details" size="lg">
        {viewInquiry && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400">Customer</p><p className="font-medium text-slate-700 dark:text-slate-200">{customers.find((c) => c.id === viewInquiry.customerId)?.name || '—'}</p></div>
              <div><p className="text-xs text-slate-400">Status</p><Badge tone={viewInquiry.status === 'processed' ? 'success' : 'warning'} dot>{viewInquiry.status === 'processed' ? 'Processed' : 'New'}</Badge></div>
              <div><p className="text-xs text-slate-400">Created</p><p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(viewInquiry.createdAt)}</p></div>
            </div>
            <div><p className="text-xs text-slate-400 mb-1">Inquiry Text</p><div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-200">{viewInquiry.text}</div></div>
            <div className="flex justify-end">
              <Button onClick={() => { setViewInquiry(null); navigate('/app/quotations'); }}>Generate Quotation <ArrowRight size={16} /></Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete inquiry?" message="This inquiry will be permanently removed." confirmLabel="Delete" />
    </div>
  );
}
