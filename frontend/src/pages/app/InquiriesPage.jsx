// import { useMemo, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   FileText, Plus, Sparkles, Upload, Trash2, Eye,
//   Camera, File as FileIcon, X, RefreshCw, CheckCircle2, Image as ImageIcon,
//   Save, Send,
// } from 'lucide-react';
// import PageHeader from '../../components/PageHeader';
// import Breadcrumbs from '../../components/Breadcrumbs';
// import { Card } from '../../components/Card';
// import Button from '../../components/Button';
// import Modal from '../../components/Modal';
// import { Textarea } from '../../components/Field';
// import Badge from '../../components/Badge';
// import DataTable from '../../components/DataTable';
// import SearchBar from '../../components/SearchBar';
// import EmptyState from '../../components/EmptyState';
// import { ConfirmDialog } from '../../components/ConfirmDialog';
// import { useToast } from '../../components/Toast';
// import { useStore } from '../../lib/useStore';
// import { getInquiries, addInquiry, updateInquiry, deleteInquiry } from '../../lib/data';
// import { addQuotation } from '../../lib/data';
// import { aiMatch, buildQuotationLines } from '../../lib/ai';
// import { formatINR, formatDate } from '../../lib/validate';
// import { useRole } from '../../lib/RoleContext';

// const SAMPLE_INQUIRIES = [
//   'Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm for our cooling line.',
//   'Looking for 5 AC motors 2.2kW and 10 proximity sensors for conveyor automation.',
//   'Require 3 hydraulic cylinders 63mm and 1 gear pump 25cc for press machine.',
//   'Want 20 boxes of hex bolts M8x80 and 15 boxes hex nuts M10.',
// ];

// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

// function formatBytes(bytes) {
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// function FilePreview({ file, previewUrl, onRemove, onReplace }) {
//   const isImage = file?.type?.startsWith('image/');
//   return (
//     <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden animate-scale-in">
//       <div className="flex items-stretch gap-3 p-3">
//         <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 grid place-items-center">
//           {isImage && previewUrl ? (
//             <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
//           ) : (
//             <div className="flex flex-col items-center gap-1 text-slate-400">
//               <FileIcon size={24} />
//               <span className="text-[10px] font-semibold uppercase">PDF</span>
//             </div>
//           )}
//         </div>
//         <div className="flex-1 min-w-0 flex flex-col justify-center">
//           <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
//           <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)} · {file.type || 'file'}</p>
//           <div className="flex items-center gap-2 mt-2">
//             <button onClick={onReplace} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
//               <RefreshCw size={12} /> Replace
//             </button>
//             <span className="text-slate-300 dark:text-slate-600">·</span>
//             <button onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400">
//               <Trash2 size={12} /> Remove
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function InquiriesPage() {
//   useStore(() => {});
//   const navigate = useNavigate();
//   const toast = useToast();
//   const { user, effectiveRole } = useRole();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [modalOpen, setModalOpen] = useState(false);
//   const [form, setForm] = useState({ text: '' });
//   const [errors, setErrors] = useState({});
//   const [aiResult, setAiResult] = useState(null);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [lines, setLines] = useState([]);
//   const [deleteId, setDeleteId] = useState(null);
//   const [viewInquiry, setViewInquiry] = useState(null);

//   // File upload state
//   const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const cameraInputRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const inquiries = getInquiries();

//   const filtered = useMemo(() => {
//     return inquiries.filter((i) => {
//       const mine = effectiveRole === 'sales_rep' ? i.salesRepId === user.id : true;
//       const matches = !search || i.text.toLowerCase().includes(search.toLowerCase());
//       const statusOk = statusFilter === 'all' || i.status === statusFilter;
//       return mine && matches && statusOk;
//     });
//   }, [inquiries, search, statusFilter, effectiveRole, user.id]);

//   const validateFile = (f) => {
//     if (!f) return 'No file selected.';
//     if (f.size > MAX_FILE_SIZE) return 'File is too large (max 10MB).';
//     if (f.type && !ACCEPTED_TYPES.includes(f.type)) return 'Only images and PDFs are supported.';
//     return null;
//   };

//   const acceptFile = (f) => {
//     const err = validateFile(f);
//     if (err) { toast.error(err); return; }
//     if (previewUrl) URL.revokeObjectURL(previewUrl);
//     const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
//     setFile(f);
//     setPreviewUrl(url);
//     setUploadSheetOpen(false);
//     toast.success(`File attached: ${f.name}`);
//   };

//   const removeFile = () => {
//     if (previewUrl) URL.revokeObjectURL(previewUrl);
//     setFile(null);
//     setPreviewUrl(null);
//   };

//   const openUploadSheet = () => setUploadSheetOpen(true);

//   const runAi = () => {
//     if (!form.text.trim()) { setErrors({ text: 'Enter inquiry text first' }); return; }
//     setAiLoading(true);
//     setTimeout(() => {
//       const result = aiMatch(form.text);
//       setAiResult(result);
//       setLines(buildQuotationLines(result.matches));
//       setAiLoading(false);
//       toast.success(`AI matched ${result.matches.length} products with ${Math.round(result.confidence * 100)}% confidence.`);
//     }, 900);
//   };

//   const processInquiry = () => {
//     if (!form.text.trim() && !file) { setErrors({ text: 'Enter inquiry text or upload a file' }); return; }
//     setProcessing(true);
//     // Placeholder extraction — in production this would call an OCR/AI service.
//     setTimeout(() => {
//       let extracted = form.text.trim();
//       if (!extracted && file) {
//         extracted = `Extracted from ${file.name}: Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm for cooling line.`;
//         setForm((f) => ({ ...f, text: extracted }));
//       }
//       setProcessing(false);
//       runAi();
//     }, 1200);
//   };

//   const updateLine = (idx, patch) => {
//     setLines((ls) => ls.map((l, i) => {
//       if (i !== idx) return l;
//       const next = { ...l, ...patch };
//       next.total = next.sellingPrice * next.qty;
//       next.margin = (next.sellingPrice - next.costPrice) * next.qty;
//       return next;
//     }));
//   };

//   const removeLine = (idx) => setLines((ls) => ls.filter((_, i) => i !== idx));

//   const calcTotals = (ls) => {
//     const subtotal = ls.reduce((s, l) => s + l.total, 0);
//     const tax = Math.round(subtotal * 0.18);
//     return { subtotal, tax, grandTotal: subtotal + tax };
//   };

//   const createQuotationFromInquiry = (status = 'draft') => {
//     if (lines.length === 0) { toast.error('Run AI match or add products first.'); return; }
//     const { subtotal, tax, grandTotal } = calcTotals(lines);
//     const inq = addInquiry({ text: form.text, salesRepId: user.id, status: 'processed', aiMatch: aiResult });
//     const q = addQuotation({
//       inquiryId: inq.id,
//       customerId: null,
//       salesRepId: user.id,
//       lines,
//       subtotal, taxRate: 18, tax, grandTotal,
//       status,
//       comments: '',
//       aiMatch: aiResult,
//     });
//     toast.success(status === 'pending_approval' ? 'Quotation submitted for approval!' : 'Draft quotation saved.');
//     closeModal();
//     navigate('/app/quotations');
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setForm({ text: '' });
//     setAiResult(null);
//     setLines([]);
//     setErrors({});
//     removeFile();
//     setProcessing(false);
//   };

//   const remove = () => { deleteInquiry(deleteId); toast.success('Inquiry deleted.'); setDeleteId(null); };

//   const columns = [
//     { key: 'text', header: 'Inquiry', render: (i) => <span className="text-slate-600 dark:text-slate-300 truncate max-w-[400px] block">{i.text}</span> },
//     { key: 'status', header: 'Status', sortable: true, render: (i) => <Badge tone={i.status === 'processed' ? 'success' : 'warning'} dot>{i.status === 'processed' ? 'Processed' : 'New'}</Badge> },
//     { key: 'createdAt', header: 'Created', sortable: true, render: (i) => <span className="text-slate-500 dark:text-slate-400">{formatDate(i.createdAt)}</span> },
//   ];

//   return (
//     <div className="space-y-6">
//       <Breadcrumbs items={[{ label: 'Inquiries' }]} />
//       <PageHeader title="Inquiries" subtitle="Capture customer inquiries and run AI product matching." actions={<Button onClick={() => { setForm({ text: '' }); setAiResult(null); setLines([]); setErrors({}); removeFile(); setModalOpen(true); }}><Plus size={16} /> New Inquiry</Button>} />

//       <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
//         <SearchBar value={search} onChange={setSearch} placeholder="Search inquiries…" />
//         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
//           {['all', 'new', 'processed'].map((s) => (
//             <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
//               {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       <Card>
//         {filtered.length === 0 ? (
//           <EmptyState icon={FileText} title="No inquiries yet" description="Create your first inquiry to let AI match products automatically." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> New Inquiry</Button>} />
//         ) : (
//           <DataTable columns={columns} rows={filtered} pageSize={8} actions={(i) => (
//             <div className="flex items-center justify-end gap-1">
//               <button onClick={() => setViewInquiry(i)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"><Eye size={16} /></button>
//               <button onClick={() => setDeleteId(i.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition"><Trash2 size={16} /></button>
//             </div>
//           )} />
//         )}
//       </Card>

//       {/* New Inquiry Modal */}
//       <Modal open={modalOpen} onClose={closeModal} title="New Inquiry" subtitle="Describe the requirement — AI will match products." size="xl" footer={
//         <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto sm:justify-end">
//           <Button variant="secondary" onClick={closeModal} className="w-full sm:w-auto">Cancel</Button>
//           {!aiResult && (
//             <Button variant="outline" onClick={processInquiry} loading={processing} className="w-full sm:w-auto">
//               {processing ? <><RefreshCw size={16} className="animate-spin" /> Processing…</> : <><Sparkles size={16} /> Process Inquiry</>}
//             </Button>
//           )}
//           {aiResult && (
//             <Button variant="outline" onClick={runAi} loading={aiLoading} className="w-full sm:w-auto"><Sparkles size={16} /> Re-run Match</Button>
//           )}
//           {aiResult && (
//             <>
//               <Button variant="secondary" onClick={() => createQuotationFromInquiry('draft')} className="w-full sm:w-auto"><Save size={16} /> Save Draft</Button>
//               <Button onClick={() => createQuotationFromInquiry('pending_approval')} className="w-full sm:w-auto"><Send size={16} /> Submit for Approval</Button>
//             </>
//           )}
//         </div>
//       }>
//         <div className="space-y-5">
//           <div>
//             <div className="flex items-center justify-between mb-1.5">
//               <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Inquiry Text<span className="text-red-500 ml-0.5">*</span></label>
//               <div className="flex items-center gap-2">
//                 {SAMPLE_INQUIRIES.slice(0, 2).map((s, i) => (
//                   <button key={i} onClick={() => setForm({ ...form, text: s })} className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">Sample {i + 1}</button>
//                 ))}
//               </div>
//             </div>
//             <Textarea value={form.text} onChange={(e) => { setForm({ ...form, text: e.target.value }); setErrors({ ...errors, text: undefined }); }} error={errors.text} rows={4} placeholder="e.g. Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm…" />
//           </div>

//           {/* File upload */}
//           <div>
//             <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Attachment <span className="text-slate-400 font-normal">(optional)</span></label>
//             {!file ? (
//               <button
//                 type="button"
//                 onClick={openUploadSheet}
//                 className="w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 p-5 text-center transition group"
//               >
//                 <div className="grid place-items-center h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/50 mx-auto mb-2.5 transition">
//                   <Upload size={22} />
//                 </div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload a photo or PDF</p>
//                 <p className="text-xs text-slate-400 mt-0.5">Take a photo with your camera or choose a file</p>
//               </button>
//             ) : (
//               <FilePreview file={file} previewUrl={previewUrl} onRemove={removeFile} onReplace={openUploadSheet} />
//             )}
//           </div>

//           {/* Processing / loading state */}
//           {processing && (
//             <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 p-4">
//               <div className="flex items-center gap-3">
//                 <div className="animate-spin h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent" />
//                 <div>
//                   <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Processing inquiry…</p>
//                   <p className="text-xs text-brand-600/70 dark:text-brand-400/70 mt-0.5">Extracting text and preparing for AI matching.</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* AI Match loading */}
//           {aiLoading && !processing && (
//             <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 p-4">
//               <div className="flex items-center gap-3">
//                 <div className="animate-spin h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent" />
//                 <p className="text-sm font-medium text-brand-700 dark:text-brand-300">AI is analyzing the inquiry and matching products…</p>
//               </div>
//             </div>
//           )}

//           {/* AI Match results — editable */}
//           {aiResult && !aiLoading && !processing && (
//             <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 animate-scale-in">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2 size={18} className="text-emerald-600" />
//                   <span className="font-semibold text-emerald-800 dark:text-emerald-200">AI Match Results</span>
//                 </div>
//                 <Badge tone="success">{Math.round(aiResult.confidence * 100)}% confidence</Badge>
//               </div>
//               {lines.length === 0 ? (
//                 <p className="text-sm text-emerald-700 dark:text-emerald-300">No matching products found. Try rephrasing the inquiry.</p>
//               ) : (
//                 <>
//                   <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">Review and adjust quantities or prices as needed.</p>
//                   <div className="overflow-x-auto rounded-lg border border-emerald-100 dark:border-emerald-900">
//                     <table className="w-full text-sm">
//                       <thead className="bg-white dark:bg-slate-900 text-xs uppercase text-slate-500 dark:text-slate-400">
//                         <tr>
//                           <th className="px-3 py-2 text-left">Product</th>
//                           <th className="px-3 py-2 text-right">Qty</th>
//                           <th className="px-3 py-2 text-right">Selling Price</th>
//                           <th className="px-3 py-2 text-right">Total</th>
//                           <th className="px-3 py-2"></th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {lines.map((l, i) => (
//                           <tr key={i} className="border-t border-emerald-100 dark:border-emerald-900 bg-white dark:bg-slate-900">
//                             <td className="px-3 py-2">
//                               <p className="font-medium text-slate-700 dark:text-slate-200">{l.name}</p>
//                               <p className="text-xs text-slate-400 font-mono">{l.sku}</p>
//                             </td>
//                             <td className="px-3 py-2 text-right"><input type="number" min="1" value={l.qty} onChange={(e) => updateLine(i, { qty: Math.max(1, +e.target.value) })} className="w-16 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm" /></td>
//                             <td className="px-3 py-2 text-right"><input type="number" value={l.sellingPrice} onChange={(e) => updateLine(i, { sellingPrice: +e.target.value })} className="w-24 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm" /></td>
//                             <td className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">{formatINR(l.total)}</td>
//                             <td className="px-3 py-2 text-right"><button onClick={() => removeLine(i)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button></td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                   <div className="mt-3 flex justify-end">
//                     <div className="text-right space-y-1">
//                       <p className="text-sm text-slate-500 dark:text-slate-400">Subtotal: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(calcTotals(lines).subtotal)}</span></p>
//                       <p className="text-sm text-slate-500 dark:text-slate-400">GST (18%): <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(calcTotals(lines).tax)}</span></p>
//                       <p className="text-base text-slate-800 dark:text-slate-100 font-bold">Grand Total: {formatINR(calcTotals(lines).grandTotal)}</p>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </Modal>

//       {/* Upload bottom sheet */}
//       <Modal open={uploadSheetOpen} onClose={() => setUploadSheetOpen(false)} title="Upload Attachment" subtitle="Take a photo or choose an image / PDF" size="sm" footer={
//         <Button variant="secondary" onClick={() => setUploadSheetOpen(false)} className="w-full sm:w-auto">Cancel</Button>
//       }>
//         <div className="space-y-3">
//           <button
//             onClick={() => cameraInputRef.current?.click()}
//             className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
//           >
//             <div className="grid place-items-center h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
//               <Camera size={22} />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Take Photo</p>
//               <p className="text-xs text-slate-400">Use your device camera</p>
//             </div>
//           </button>

//           <button
//             onClick={() => fileInputRef.current?.click()}
//             className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
//           >
//             <div className="grid place-items-center h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
//               <ImageIcon size={22} />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upload Image / PDF</p>
//               <p className="text-xs text-slate-400">JPG, PNG, WebP or PDF (max 10MB)</p>
//             </div>
//           </button>
//         </div>

//         <input
//           ref={cameraInputRef}
//           type="file"
//           accept="image/*"
//           capture="environment"
//           className="hidden"
//           onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); e.target.value = ''; }}
//         />
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
//           className="hidden"
//           onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); e.target.value = ''; }}
//         />
//       </Modal>

//       {/* View inquiry modal */}
//       <Modal open={!!viewInquiry} onClose={() => setViewInquiry(null)} title="Inquiry Details" size="lg">
//         {viewInquiry && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div><p className="text-xs text-slate-400">Status</p><Badge tone={viewInquiry.status === 'processed' ? 'success' : 'warning'} dot>{viewInquiry.status === 'processed' ? 'Processed' : 'New'}</Badge></div>
//               <div><p className="text-xs text-slate-400">Created</p><p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(viewInquiry.createdAt)}</p></div>
//             </div>
//             <div><p className="text-xs text-slate-400 mb-1">Inquiry Text</p><div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-200">{viewInquiry.text}</div></div>
//           </div>
//         )}
//       </Modal>

//       <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete inquiry?" message="This inquiry will be permanently removed." confirmLabel="Delete" />
//     </div>
//   );
// }

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Plus,
  Sparkles,
  Upload,
  Trash2,
  Eye,
  Camera,
  File as FileIcon,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  Save,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card } from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Textarea } from "../../components/Field";
import Badge from "../../components/Badge";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import EmptyState from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";

import { useStore } from "../../lib/useStore";

import { getInquiries, deleteInquiry } from "../../lib/data";

import { formatINR, formatDate } from "../../lib/validate";
import { useRole } from "../../lib/RoleContext";

import { extractInquiryTextApi } from "../../services/inquiryService";
import { saveQuotationApi } from "../../services/quotationService";
import { getProductApi } from "../../services/productService";

/* =========================================================
   SAMPLE INQUIRIES
========================================================= */

const SAMPLE_INQUIRIES = [
  "Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm for our cooling line.",
  "Looking for 5 AC motors 2.2kW and 10 proximity sensors for conveyor automation.",
  "Require 3 hydraulic cylinders 63mm and 1 gear pump 25cc for press machine.",
  "Want 20 boxes of hex bolts M8x80 and 15 boxes hex nuts M10.",
];

/* =========================================================
   FILE SETTINGS
========================================================= */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* =========================================================
   FILE PREVIEW
========================================================= */

function FilePreview({ file, previewUrl, onRemove, onReplace }) {
  const isImage = file?.type?.startsWith("image/");

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden animate-scale-in">
      <div className="flex items-stretch gap-3 p-3">
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 grid place-items-center">
          {isImage && previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400">
              <FileIcon size={24} />
              <span className="text-[10px] font-semibold uppercase">PDF</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
            {file.name}
          </p>

          <p className="text-xs text-slate-400 mt-0.5">
            {formatBytes(file.size)} · {file.type || "file"}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onReplace}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <RefreshCw size={12} />
              Replace
            </button>

            <span className="text-slate-300 dark:text-slate-600">·</span>

            <button
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 size={12} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function InquiriesPage() {
  useStore(() => {});

  const navigate = useNavigate();

  const toast = useToast();

  const { user, effectiveRole } = useRole();

  /* =======================================================
     STATE
  ======================================================= */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    text: "",
  });

  const [errors, setErrors] = useState({});

  const [aiResult, setAiResult] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [lines, setLines] = useState([]);

  const [deleteId, setDeleteId] = useState(null);

  const [viewInquiry, setViewInquiry] = useState(null);

  /* =======================================================
     FILE UPLOAD STATE
  ======================================================= */

  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);

  const [file, setFile] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const cameraInputRef = useRef(null);

  const fileInputRef = useRef(null);

  /* =======================================================
     EXISTING INQUIRIES
     
     Keeping your existing inquiry table logic.
  ======================================================= */

  const inquiries = getInquiries();

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      const mine =
        effectiveRole === "sales_rep" ? i.salesRepId === user.id : true;

      const matches =
        !search || i.text.toLowerCase().includes(search.toLowerCase());

      const statusOk = statusFilter === "all" || i.status === statusFilter;

      return mine && matches && statusOk;
    });
  }, [inquiries, search, statusFilter, effectiveRole, user.id]);

  /* =======================================================
     FILE VALIDATION
  ======================================================= */

  const validateFile = (f) => {
    if (!f) {
      return "No file selected.";
    }

    if (f.size > MAX_FILE_SIZE) {
      return "File is too large (max 10MB).";
    }

    if (f.type && !ACCEPTED_TYPES.includes(f.type)) {
      return "Only images and PDFs are supported.";
    }

    return null;
  };

  /* =======================================================
     ACCEPT FILE
  ======================================================= */

  const acceptFile = (f) => {
    const err = validateFile(f);

    if (err) {
      toast.error(err);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = f.type.startsWith("image/") ? URL.createObjectURL(f) : null;

    setFile(f);

    setPreviewUrl(url);

    setUploadSheetOpen(false);

    toast.success(`File attached: ${f.name}`);
  };

  /* =======================================================
     REMOVE FILE
  ======================================================= */

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);

    setPreviewUrl(null);
  };

  /* =======================================================
     OPEN UPLOAD SHEET
  ======================================================= */

  const openUploadSheet = () => {
    setUploadSheetOpen(true);
  };

  /* =======================================================
     RUN AI / REAL BACKEND API
     
     POST /inquiries/extract-text
  ======================================================= */

  const runAi = async (inquiryText = form.text) => {
    const text = inquiryText?.trim() || "";

    if (!text) {
      setErrors({
        text: "Enter inquiry text first",
      });

      return;
    }

    setAiLoading(true);

    try {
      /* =================================================
         CALL BACKEND
      ================================================= */

      const result = await extractInquiryTextApi(text);

      console.log("Inquiry API response:", result);

      const matchResult = result?.match_result;

      if (!matchResult) {
        toast.error("No matching result received.");

        setAiResult(null);

        setLines([]);

        return;
      }

      /* =================================================
         SIMILAR PRODUCTS
      ================================================= */

      const similarProducts = matchResult.similar_products || [];

      const confidence =
        similarProducts.length > 0 ? Number(similarProducts[0].score || 0) : 0;

      /* =================================================
         PRODUCTS FROM BACKEND
      ================================================= */

      const backendProducts = matchResult.products || [];

      /* =================================================
         ITEMS FROM BACKEND
      ================================================= */

      const backendItems = matchResult.items || [];

      /* =================================================
         FETCH COMPLETE PRODUCT DATA FROM DB
         
         GET /products/{product_id}
         
         This gives us fields such as:
         - sku
         - cost_price
         - selling_price
         - gst_percentage
         - unit
      ================================================= */

      const quotationLines = await Promise.all(
        backendItems.map(async (item) => {
          let product = {};

          try {
            const response = await getProductApi(item.product_id);

            product = response?.data || {};
          } catch (error) {
            console.warn(`Unable to fetch product ${item.product_id}`, error);
          }

          const quantity = Number(item.quantity || 1);

          const sellingPrice = Number(
            item.unit_price ?? product.selling_price ?? 0,
          );

          const costPrice = Number(product.cost_price ?? 0);

          const gstPercentage = Number(
            item.gst_percentage ?? product.gst_percentage ?? 0,
          );

          const subtotal = sellingPrice * quantity;

          const gstAmount = (subtotal * gstPercentage) / 100;

          const total = subtotal + gstAmount;

          return {
            productId: item.product_id,

            sku: product.sku || `PRODUCT-${item.product_id}`,

            name: item.product_name || product.product_name || "",

            unit: item.unit || product.unit || "Nos",

            qty: quantity,

            sellingPrice: sellingPrice,

            costPrice: costPrice,

            gstPercentage: gstPercentage,

            subtotal: Number(subtotal.toFixed(2)),

            gstAmount: Number(gstAmount.toFixed(2)),

            total: Number(total.toFixed(2)),

            margin: (sellingPrice - costPrice) * quantity,
          };
        }),
      );

      /* =================================================
         SAVE AI RESULT TO STATE
      ================================================= */

      setAiResult({
        confidence: confidence,

        matches: backendProducts,
      });

      /* =================================================
         SAVE LINES TO STATE
      ================================================= */

      setLines(quotationLines);

      if (quotationLines.length === 0) {
        toast.error("No matching products found.");
      } else {
        toast.success(
          `AI matched ${quotationLines.length} product${
            quotationLines.length > 1 ? "s" : ""
          } with ${Math.round(confidence * 100)}% confidence.`,
        );
      }
    } catch (error) {
      console.error("Inquiry extraction error:", error);

      console.error("Backend response:", error.response?.data);

      toast.error(error.response?.data?.detail || "Failed to process inquiry.");

      setAiResult(null);

      setLines([]);
    } finally {
      setAiLoading(false);
    }
  };

  /* =======================================================
     PROCESS INQUIRY
  ======================================================= */

  const processInquiry = async () => {
    if (!form.text.trim() && !file) {
      setErrors({
        text: "Enter inquiry text or upload a file",
      });

      return;
    }

    setProcessing(true);

    try {
      let extracted = form.text.trim();

      /*
        Your current backend endpoint
        /inquiries/extract-text accepts text.

        If a file is uploaded without text,
        we keep your existing placeholder
        behavior for now because no file
        extraction API was provided.
      */

      if (!extracted && file) {
        extracted = `Extracted from ${file.name}: Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm for cooling line.`;

        setForm((current) => ({
          ...current,
          text: extracted,
        }));
      }

      await runAi(extracted);
    } catch (error) {
      console.error("Process inquiry error:", error);

      toast.error("Failed to process inquiry.");
    } finally {
      setProcessing(false);
    }
  };

  /* =======================================================
     UPDATE LINE
     
     Quantity and selling price can still
     be changed before saving.
  ======================================================= */

  const updateLine = (idx, patch) => {
    setLines((ls) =>
      ls.map((l, i) => {
        if (i !== idx) {
          return l;
        }

        const next = {
          ...l,
          ...patch,
        };

        const quantity = Number(next.qty || 0);

        const sellingPrice = Number(next.sellingPrice || 0);

        const costPrice = Number(next.costPrice || 0);

        const gstPercentage = Number(next.gstPercentage || 0);

        const subtotal = sellingPrice * quantity;

        const gstAmount = (subtotal * gstPercentage) / 100;

        const total = subtotal + gstAmount;

        next.subtotal = Number(subtotal.toFixed(2));

        next.gstAmount = Number(gstAmount.toFixed(2));

        next.total = Number(total.toFixed(2));

        next.margin = (sellingPrice - costPrice) * quantity;

        return next;
      }),
    );
  };

  /* =======================================================
     REMOVE LINE
  ======================================================= */

  const removeLine = (idx) => {
    setLines((ls) => ls.filter((_, i) => i !== idx));
  };

  /* =======================================================
     CALCULATE TOTALS
  ======================================================= */

  const calcTotals = (ls) => {
    const subtotal = ls.reduce(
      (sum, line) =>
        sum +
        Number(
          line.subtotal ??
            Number(line.sellingPrice || 0) * Number(line.qty || 0),
        ),
      0,
    );

    const totalGst = ls.reduce(
      (sum, line) => sum + Number(line.gstAmount || 0),
      0,
    );

    const grandTotal = subtotal + totalGst;

    return {
      subtotal: Number(subtotal.toFixed(2)),

      totalGst: Number(totalGst.toFixed(2)),

      grandTotal: Number(grandTotal.toFixed(2)),
    };
  };

  /* =======================================================
     SAVE DRAFT
     
     POST /quotations/
     
     NO LOCAL STORAGE
     NO addQuotation()
     NO SUBMIT FOR APPROVAL
  ======================================================= */

  const createQuotationFromInquiry = async () => {
    if (lines.length === 0) {
      toast.error("Run AI match or add products first.");

      return;
    }

    try {
      /* =================================================
           TOTALS
        ================================================= */

      const { subtotal, totalGst, grandTotal } = calcTotals(lines);

      /* =================================================
           USER ID
        ================================================= */

      const userId = user?.id;

      /* =================================================
           COMPANY ID
           
           Supports both:
           user.company_id
           user.companyId
        ================================================= */

      const companyId = user?.company_id ?? user?.companyId;

      if (!userId) {
        toast.error("User information is missing.");

        return;
      }

      if (!companyId) {
        toast.error("Company information is missing.");

        return;
      }

      /* =================================================
           QUOTATION PAYLOAD
        ================================================= */

      const payload = {
        user_id: Number(userId),

        company_id: Number(companyId),

        inquiry_text: form.text.trim(),

        summary: {
          subtotal: subtotal,

          total_gst: totalGst,

          grand_total: grandTotal,
        },

        items: lines.map((line) => {
          const quantity = Number(line.qty || 0);

          const unitPrice = Number(line.sellingPrice || 0);

          const gstPercentage = Number(line.gstPercentage || 0);

          const itemSubtotal = unitPrice * quantity;

          const gstAmount = (itemSubtotal * gstPercentage) / 100;

          const totalPrice = itemSubtotal + gstAmount;

          return {
            product_id: Number(line.productId),

            product_name: line.name,

            quantity: quantity,

            unit: line.unit,

            unit_price: unitPrice,

            gst_percentage: gstPercentage,

            subtotal: Number(itemSubtotal.toFixed(2)),

            gst_amount: Number(gstAmount.toFixed(2)),

            total_price: Number(totalPrice.toFixed(2)),
          };
        }),
      };

      /* =================================================
           DEBUG
        ================================================= */

      console.log("POST /quotations/ payload:", payload);

      /* =================================================
           API CALL
        ================================================= */

      const response = await saveQuotationApi(payload);

      console.log("Quotation saved successfully:", response);

      /* =================================================
           SUCCESS
        ================================================= */

      toast.success("Draft quotation saved successfully.");

      closeModal();

      navigate("/app/quotations");
    } catch (error) {
      console.error("Save quotation error:", error);

      console.error("Backend response:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        toast.error(
          detail.map((item) => item.msg || "Validation error").join(", "),
        );
      } else {
        toast.error(detail || "Failed to save draft quotation.");
      }
    }
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setModalOpen(false);

    setForm({
      text: "",
    });

    setAiResult(null);

    setLines([]);

    setErrors({});

    removeFile();

    setProcessing(false);

    setAiLoading(false);
  };

  /* =======================================================
     DELETE INQUIRY
     
     Existing logic preserved.
  ======================================================= */

  const remove = () => {
    deleteInquiry(deleteId);

    toast.success("Inquiry deleted.");

    setDeleteId(null);
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      key: "text",

      header: "Inquiry",

      render: (i) => (
        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[400px] block">
          {i.text}
        </span>
      ),
    },

    {
      key: "status",

      header: "Status",

      sortable: true,

      render: (i) => (
        <Badge tone={i.status === "processed" ? "success" : "warning"} dot>
          {i.status === "processed" ? "Processed" : "New"}
        </Badge>
      ),
    },

    {
      key: "createdAt",

      header: "Created",

      sortable: true,

      render: (i) => (
        <span className="text-slate-500 dark:text-slate-400">
          {formatDate(i.createdAt)}
        </span>
      ),
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* =================================================
          BREADCRUMBS
      ================================================= */}

      <Breadcrumbs
        items={[
          {
            label: "Inquiries",
          },
        ]}
      />

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        title="Inquiries"
        subtitle="Capture customer inquiries and run AI product matching."
        actions={
          <Button
            onClick={() => {
              setForm({
                text: "",
              });

              setAiResult(null);

              setLines([]);

              setErrors({});

              removeFile();

              setModalOpen(true);
            }}
          >
            <Plus size={16} />
            New Inquiry
          </Button>
        }
      />

      {/* =================================================
          SEARCH / FILTER
      ================================================= */}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search inquiries…"
        />

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {["all", "new", "processed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                statusFilter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================
          INQUIRY TABLE
      ================================================= */}

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No inquiries yet"
            description="Create your first inquiry to let AI match products automatically."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={16} />
                New Inquiry
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={8}
            actions={(i) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => setViewInquiry(i)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => setDeleteId(i.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        )}
      </Card>

      {/* =================================================
          NEW INQUIRY MODAL
      ================================================= */}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="New Inquiry"
        subtitle="Describe the requirement — AI will match products."
        size="xl"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto sm:justify-end">
            {/* CANCEL */}

            <Button
              variant="secondary"
              onClick={closeModal}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            {/* PROCESS INQUIRY */}

            {!aiResult && (
              <Button
                variant="outline"
                onClick={processInquiry}
                loading={processing || aiLoading}
                className="w-full sm:w-auto"
              >
                {processing || aiLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Process Inquiry
                  </>
                )}
              </Button>
            )}

            {/* RE-RUN MATCH */}

            {aiResult && (
              <Button
                variant="outline"
                onClick={() => runAi()}
                loading={aiLoading}
                className="w-full sm:w-auto"
              >
                <Sparkles size={16} />
                Re-run Match
              </Button>
            )}

            {/* ONLY SAVE DRAFT */}

            {aiResult && (
              <Button
                variant="secondary"
                onClick={createQuotationFromInquiry}
                className="w-full sm:w-auto"
              >
                <Save size={16} />
                Save Draft
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-5">
          {/* =================================================
              INQUIRY TEXT
          ================================================= */}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Inquiry Text
                <span className="text-red-500 ml-0.5">*</span>
              </label>

              <div className="flex items-center gap-2">
                {SAMPLE_INQUIRIES.slice(0, 2).map((s, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setForm({
                        ...form,
                        text: s,
                      })
                    }
                    className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                  >
                    Sample {i + 1}
                  </button>
                ))}
              </div> */}
            </div>

            <Textarea
              value={form.text}
              onChange={(e) => {
                setForm({
                  ...form,
                  text: e.target.value,
                });

                setErrors({
                  ...errors,
                  text: undefined,
                });
              }}
              error={errors.text}
              rows={4}
              placeholder="e.g. Need 2 units of centrifugal pump 1.5HP and 4 gate valves 100mm…"
            />
          </div>

          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Attachment{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>

            {!file ? (
              <button
                type="button"
                onClick={openUploadSheet}
                className="w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 p-5 text-center transition group"
              >
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/50 mx-auto mb-2.5 transition">
                  <Upload size={22} />
                </div>

                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Upload a photo or PDF
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  Take a photo with your camera or choose a file
                </p>
              </button>
            ) : (
              <FilePreview
                file={file}
                previewUrl={previewUrl}
                onRemove={removeFile}
                onReplace={openUploadSheet}
              />
            )}
          </div>

          {/* =================================================
              PROCESSING
          ================================================= */}

          {processing && (
            <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent" />

                <div>
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                    Processing inquiry…
                  </p>

                  <p className="text-xs text-brand-600/70 dark:text-brand-400/70 mt-0.5">
                    Extracting text and preparing for AI matching.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              AI LOADING
          ================================================= */}

          {aiLoading && !processing && (
            <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent" />

                <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  AI is analyzing the inquiry and matching products…
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              AI MATCH RESULTS
          ================================================= */}

          {aiResult && !aiLoading && !processing && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 animate-scale-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />

                  <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                    AI Match Results
                  </span>
                </div>

                <Badge tone="success">
                  {Math.round(aiResult.confidence * 100)}% confidence
                </Badge>
              </div>

              {lines.length === 0 ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  No matching products found. Try rephrasing the inquiry.
                </p>
              ) : (
                <>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">
                    Review and adjust quantities or prices as needed.
                  </p>

                  <div className="overflow-x-auto rounded-lg border border-emerald-100 dark:border-emerald-900">
                    <table className="w-full text-sm">
                      <thead className="bg-white dark:bg-slate-900 text-xs uppercase text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-3 py-2 text-left">Product</th>

                          <th className="px-3 py-2 text-right">Qty</th>

                          <th className="px-3 py-2 text-right">
                            Selling Price
                          </th>

                          <th className="px-3 py-2 text-right">Total</th>

                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>

                      <tbody>
                        {lines.map((l, i) => (
                          <tr
                            key={l.productId ?? i}
                            className="border-t border-emerald-100 dark:border-emerald-900 bg-white dark:bg-slate-900"
                          >
                            {/* PRODUCT */}

                            <td className="px-3 py-2">
                              <p className="font-medium text-slate-700 dark:text-slate-200">
                                {l.name}
                              </p>

                              <p className="text-xs text-slate-400 font-mono">
                                {l.sku}
                              </p>
                            </td>

                            {/* QUANTITY */}

                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min="1"
                                value={l.qty}
                                onChange={(e) => {
                                  const value = Number(e.target.value);

                                  updateLine(i, {
                                    qty: Math.max(1, value || 1),
                                  });
                                }}
                                className="w-16 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                              />
                            </td>

                            {/* SELLING PRICE */}

                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                value={l.sellingPrice}
                                onChange={(e) => {
                                  const value = Number(e.target.value);

                                  updateLine(i, {
                                    sellingPrice: Math.max(0, value || 0),
                                  });
                                }}
                                className="w-24 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                              />
                            </td>

                            {/* TOTAL */}

                            <td className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">
                              {formatINR(l.total)}
                            </td>

                            {/* REMOVE */}

                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => removeLine(i)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* =================================================
                        TOTALS
                    ================================================= */}

                  <div className="mt-3 flex justify-end">
                    <div className="text-right space-y-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Subtotal:{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {formatINR(calcTotals(lines).subtotal)}
                        </span>
                      </p>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Total GST:{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {formatINR(calcTotals(lines).totalGst)}
                        </span>
                      </p>

                      <p className="text-base text-slate-800 dark:text-slate-100 font-bold">
                        Grand Total: {formatINR(calcTotals(lines).grandTotal)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* =================================================
          UPLOAD BOTTOM SHEET
      ================================================= */}

      <Modal
        open={uploadSheetOpen}
        onClose={() => setUploadSheetOpen(false)}
        title="Upload Attachment"
        subtitle="Take a photo or choose an image / PDF"
        size="sm"
        footer={
          <Button
            variant="secondary"
            onClick={() => setUploadSheetOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        }
      >
        <div className="space-y-3">
          {/* CAMERA */}

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
          >
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <Camera size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Take Photo
              </p>

              <p className="text-xs text-slate-400">Use your device camera</p>
            </div>
          </button>

          {/* IMAGE / PDF */}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
          >
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <ImageIcon size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Upload Image / PDF
              </p>

              <p className="text-xs text-slate-400">
                JPG, PNG, WebP or PDF (max 10MB)
              </p>
            </div>
          </button>
        </div>

        {/* CAMERA INPUT */}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];

            if (f) {
              acceptFile(f);
            }

            e.target.value = "";
          }}
        />

        {/* FILE INPUT */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];

            if (f) {
              acceptFile(f);
            }

            e.target.value = "";
          }}
        />
      </Modal>

      {/* =================================================
          VIEW INQUIRY
      ================================================= */}

      <Modal
        open={!!viewInquiry}
        onClose={() => setViewInquiry(null)}
        title="Inquiry Details"
        size="lg"
      >
        {viewInquiry && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Status</p>

                <Badge
                  tone={
                    viewInquiry.status === "processed" ? "success" : "warning"
                  }
                  dot
                >
                  {viewInquiry.status === "processed" ? "Processed" : "New"}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-slate-400">Created</p>

                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {formatDate(viewInquiry.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Inquiry Text</p>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-200">
                {viewInquiry.text}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* =================================================
          DELETE CONFIRMATION
      ================================================= */}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete inquiry?"
        message="This inquiry will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}
