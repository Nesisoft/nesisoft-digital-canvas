import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Calculator, CheckCircle2, Download, FileText, Mail, Phone, Send, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  INQUIRY_STATUS_LABELS,
  deleteInquiry,
  getInquiry,
  inquiryAttachmentUrl,
  replyToInquiry,
  setInquiryStatus,
  type InquiryEstimate,
  type InquiryStatus,
} from "@/lib/adminApi";
import { formatRange, formatWeeks } from "@shared/estimator.js";

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: "bg-violet-500/20 text-violet-200",
  read: "bg-slate-500/20 text-slate-300",
  open: "bg-amber-500/15 text-amber-200",
  responded: "bg-emerald-500/15 text-emerald-200",
  closed: "bg-white/[0.06] text-slate-400",
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span className={cn("px-2 py-0.5 text-[10px] font-medium", STATUS_STYLES[status])}>
      {INQUIRY_STATUS_LABELS[status]}
    </span>
  );
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const selectClass =
  "rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white [&>option]:bg-slate-900";

const DEFAULT_SUBJECT = "Re: Your enquiry to Nesisoft";

/** The reference the sender was given ("3F2A1B9C"), as server/src/visitorEmail.js makes it. */
const inquiryRef = (id: string) => id.replace(/-/g, "").slice(0, 8).toUpperCase();

/** A quote request's answers and estimate, as the cost calculator sent them. */
function EstimatePanel({ estimate }: { estimate: InquiryEstimate }) {
  const rows = (
    [
      ["Project", estimate.type.label],
      ["Size", estimate.size.label],
      ["Design", estimate.design.label],
      ["Approach", estimate.approach?.label],
      ["Pace", estimate.pace.label],
    ] as [string, string | undefined][]
  ).filter(([, value]) => value);
  return (
    <section aria-label="Cost estimate" className="border border-gold-300/25 bg-gold-300/[0.04] p-4">
      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-200">
        <Calculator className="h-4 w-4" /> From the cost calculator
      </h4>
      <p className="mt-3 text-2xl font-bold text-white">{formatRange(estimate, "GHS")}</p>
      <p className="mt-1 text-sm text-slate-300">
        {formatRange(estimate, "USD")} · {formatWeeks(estimate)}
        {estimate.currency === "USD" && <span className="text-slate-400"> · they viewed it in US dollars</span>}
      </p>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-slate-200">{value}</dd>
          </div>
        ))}
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-500">Features</dt>
          <dd className="mt-1.5 flex flex-wrap gap-1.5">
            {estimate.features.length === 0 ? (
              <span className="text-slate-400">None added</span>
            ) : (
              estimate.features.map((f) => (
                <span key={f.id} className="border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-slate-200">
                  {f.label}
                </span>
              ))
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-slate-500">
        Worked out from the Pricing tab's prices when it was sent (US$1 = GH₵{estimate.usdRate}).
      </p>
    </section>
  );
}

/** One inquiry: details, attachment, status, replies and the reply box. */
export function InquiryDetail({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "inquiry", id],
    queryFn: () => getInquiry(id),
  });
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [message, setMessage] = useState("");

  // A reply continues the thread that the email sent to them started.
  const copySubject = data?.inquiry.copy?.sentAt ? data.inquiry.copy.subject : null;
  useEffect(() => {
    if (copySubject) setSubject((current) => (current === DEFAULT_SUBJECT ? `Re: ${copySubject}` : current));
  }, [copySubject]);

  // Opening it may have marked it read: refresh the list's badges.
  const loadedStatus = data?.inquiry.status;
  useEffect(() => {
    if (loadedStatus) qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
  }, [loadedStatus, qc]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
    qc.invalidateQueries({ queryKey: ["admin", "inquiry", id] });
  };
  const onError = (err: unknown) =>
    toast.error(err instanceof Error ? err.message : "Something went wrong");

  const status = useMutation({
    mutationFn: (next: InquiryStatus) => setInquiryStatus(id, next),
    onSuccess: (inquiry) => {
      refresh();
      toast.success(`Marked ${INQUIRY_STATUS_LABELS[inquiry.status].toLowerCase()}`);
    },
    onError,
  });

  const reply = useMutation({
    mutationFn: () => replyToInquiry(id, subject.trim(), message.trim()),
    onSuccess: () => {
      refresh();
      setMessage("");
      toast.success(`Reply sent to ${data?.inquiry.email}`);
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: () => deleteInquiry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      toast.success("Inquiry deleted");
      onDeleted();
    },
    onError,
  });

  if (isLoading) return <p className="text-sm text-slate-400">Loading…</p>;
  if (isError || !data) return <p className="text-sm text-red-300">Couldn't load this inquiry.</p>;

  const { inquiry, replies, mailConfigured } = data;
  const name = `${inquiry.firstName} ${inquiry.lastName}`;
  const details: [string, string][] = (
    [
      ["Company", inquiry.company],
      // A quote request shows these in its estimate instead.
      ...(inquiry.estimate
        ? []
        : [
            ["Service", inquiry.service],
            ["Budget", inquiry.budget],
            ["Timeline", inquiry.timeline],
          ]),
      ["Heard about us via", inquiry.source],
      ["Sent from", inquiry.page],
    ] as [string, string][]
  ).filter(([, value]) => value);
  const whatsapp = inquiry.phone.replace(/[^\d]/g, "");

  return (
    <div className="space-y-6">
      {/* Who, and how to reach them */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            Received {formatDateTime(inquiry.createdAt)} · Ref. {inquiryRef(inquiry._id)}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200">
              <Mail className="h-4 w-4" /> {inquiry.email}
            </a>
            {inquiry.phone && (
              <a href={`tel:${inquiry.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200">
                <Phone className="h-4 w-4" /> {inquiry.phone}
              </a>
            )}
            {whatsapp.length >= 8 && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="text-violet-300 hover:text-violet-200">
                WhatsApp
              </a>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Status
          <select
            value={inquiry.status}
            disabled={status.isPending}
            onChange={(e) => status.mutate(e.target.value as InquiryStatus)}
            className={selectClass}
            aria-label="Status"
          >
            {(Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[]).map((s) => (
              <option key={s} value={s}>
                {INQUIRY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {inquiry.notifyError && (
        <div className="flex gap-3 border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            The company inbox wasn't emailed about this one, so it's only here.
            <span className="mt-1 block text-xs text-amber-200/80">{inquiry.notifyError}</span>
          </div>
        </div>
      )}

      {details.length > 0 && (
        <dl className="grid gap-x-6 gap-y-3 border border-white/10 p-4 text-sm sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-0.5 text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {inquiry.estimate && <EstimatePanel estimate={inquiry.estimate} />}

      {inquiry.copy?.sentAt && (
        <p className="flex items-start gap-2 text-sm text-slate-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
          <span>
            {inquiry.estimate ? "A copy of this estimate" : "A confirmation"} was emailed to {inquiry.email} on{" "}
            {formatDateTime(inquiry.copy.sentAt)}. Your reply joins the same email thread.
          </span>
        </p>
      )}
      {inquiry.copy?.error && (
        <div className="flex gap-3 border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            {inquiry.estimate ? "Their copy of the estimate" : "Their confirmation email"} couldn't be sent, so they
            haven't heard from us yet.
            <span className="mt-1 block text-xs text-amber-200/80">{inquiry.copy.error}</span>
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Message</h4>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{inquiry.message}</p>
      </div>

      {inquiry.attachment && (
        <div className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3">
          <FileText className="h-5 w-5 flex-shrink-0 text-violet-300" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{inquiry.attachment.name}</p>
            <p className="text-xs text-slate-400">
              {formatSize(inquiry.attachment.size)}
              {!inquiry.attachment.stored &&
                (inquiry.notifyError
                  ? ` · couldn't be stored or emailed: ask ${inquiry.firstName} to send it again`
                  : " · not stored here: it's attached to the email sent to the inbox")}
            </p>
          </div>
          {inquiry.attachment.stored && (
            <Button asChild variant="outline" className="h-9 border-white/15 bg-transparent text-slate-200 hover:bg-white/[0.06] hover:text-white">
              <a href={inquiryAttachmentUrl(inquiry._id)} download>
                <Download className="mr-2 h-4 w-4" /> Download
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Replies sent so far */}
      {replies.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Replies ({replies.length})
          </h4>
          {replies.map((r) => (
            <div key={r._id} className="border-l-2 border-emerald-400/50 bg-white/[0.02] p-3">
              <p className="text-xs text-slate-400">
                {r.sentByName} · {formatDateTime(r.createdAt)} · {r.subject}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply */}
      <div className="space-y-3 border-t border-white/10 pt-5">
        <h4 className="text-sm font-semibold text-white">Reply to {inquiry.firstName}</h4>
        {mailConfigured ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!message.trim()) return toast.error("Write a reply first");
              reply.mutate();
            }}
          >
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-label="Subject"
              className="border-white/10 bg-black/20 text-white"
            />
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-label="Reply"
              placeholder={`Hi ${inquiry.firstName},`}
              className="min-h-[9rem] border-white/10 bg-black/20 text-white"
            />
            <p className="text-xs text-slate-500">
              Sent from the company address to {inquiry.email}, signed with your name, with their message
              quoted underneath. Their answer comes back to the company inbox.
            </p>
            <Button type="submit" disabled={reply.isPending} className="bg-violet-600 text-white hover:bg-violet-500">
              <Send className="mr-2 h-4 w-4" />
              {reply.isPending ? "Sending…" : "Send reply"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-slate-400">
            Replying from here needs the server's email settings (SMTP_USER and SMTP_PASSWORD). Until
            then,{" "}
            <a href={`mailto:${inquiry.email}`} className="text-violet-300 hover:text-violet-200">
              reply from your mailbox
            </a>
            .
          </p>
        )}
      </div>

      <div className="border-t border-white/10 pt-5">
        <Button
          variant="outline"
          disabled={remove.isPending}
          onClick={() => {
            if (confirm(`Delete ${name}'s inquiry${inquiry.attachment ? " and its file" : ""}? This cannot be undone.`)) {
              remove.mutate();
            }
          }}
          className="border-red-500/40 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete inquiry
        </Button>
      </div>
    </div>
  );
}
