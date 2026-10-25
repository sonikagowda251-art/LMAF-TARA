// ---------------------------------------------------------------------------
// LMAF TARA — Report a Problem ticket engine
// Stores reports locally (like the cart/orders demos). When a backend with
// SMTP is connected, createReport()/setStatus() are the two places where the
// generated email objects in `report.emails` should be handed to the server.
// ---------------------------------------------------------------------------

const STORE_KEY = "lmt_reports";
const RETENTION_DAYS = 180; // privacy: reports auto-purge from the device

export const STATUS_FLOW = [
  "Submitted",
  "Under Review",
  "In Progress",
  "Resolved",
  "Closed"
];

// 1. Automatic reference number — LMT-<YYMMDD>-<4 random base36 chars>
export function generateReference() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LMT-${ymd}-${rand}`;
}

// 6. Privacy protection — contact details are only ever shown masked
export function maskEmail(email = "") {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "•••";
  const head = user.slice(0, 2);
  return `${head}${"•".repeat(Math.max(user.length - 2, 2))}@${domain}`;
}

export function maskPhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 4) return "•••";
  return `•••••${digits.slice(-4)}`;
}

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeAll(reports) {
  // 6. Privacy protection — enforce a retention window on stored reports
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const kept = reports.filter((r) => new Date(r.createdAt).getTime() >= cutoff);
  localStorage.setItem(STORE_KEY, JSON.stringify(kept));
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// 2. Email notifications — build the message the system "sends" automatically
function buildEmail(report, kind, statusNote) {
  const ref = report.reference;
  if (kind === "confirmation") {
    return {
      kind,
      to: maskEmail(report.email),
      subject: `LMAF TARA — We received your report (${ref})`,
      body:
        `Dear ${report.name},\n\n` +
        `Thank you for contacting LMAF TARA Care. Your report has been recorded.\n\n` +
        `Reference No.: ${ref}\n` +
        `Issue Category: ${report.category}\n` +
        (report.orderId ? `Order Number: ${report.orderId}\n` : "") +
        `Preferred Resolution: ${report.resolution || "No preference"}\n\n` +
        `Our team will review your report and keep it updated. You can follow its\n` +
        `progress any time on the Track Report page using your reference number.\n\n` +
        `With regards,\nTeam LMAF TARA`,
      sentAtLabel: "Sent immediately after submission"
    };
  }
  return {
    kind: "status",
    to: maskEmail(report.email),
    subject: `LMAF TARA — Update on report ${ref}: ${report.status}`,
    body:
      `Dear ${report.name},\n\n` +
      `The status of your report (${ref}) has changed to "${report.status}".\n` +
      (statusNote ? `Note from our team: ${statusNote}\n` : "") +
      `\nYou can view the full timeline on the Track Report page.\n\n` +
      `With regards,\nTeam LMAF TARA`,
    sentAtLabel: "Sent automatically on status change"
  };
}

export function createReport(payload) {
  const reference = generateReference();
  const now = new Date().toISOString();

  const report = {
    ...payload,
    reference,
    createdAt: now,
    status: "Submitted", // 4. Status management — every report starts here
    timeline: [{ status: "Submitted", at: now, note: "Report received via website" }],
    emails: []
  };
  report.emails.push({ ...buildEmail(report, "confirmation"), at: now });

  const all = readAll();
  all.unshift(report);
  writeAll(all);
  return report;
}

export function findReport(reference) {
  const needle = String(reference || "").trim().toUpperCase();
  return readAll().find((r) => r.reference.toUpperCase() === needle) || null;
}

export function listReports() {
  return readAll();
}

// 4. Status management — moving a report forward logs the timeline entry
// and automatically queues the customer's status-change email.
export function setStatus(reference, status, note = "") {
  const all = readAll();
  const report = all.find((r) => r.reference.toUpperCase() === String(reference).toUpperCase());
  if (!report || !STATUS_FLOW.includes(status) || report.status === status) return report || null;

  const now = new Date().toISOString();
  report.status = status;
  report.timeline.push({ status, at: now, note: note.trim() || `Status updated to ${status}` });
  report.emails.push({ ...buildEmail(report, "status", note), at: now });

  writeAll(all);
  return report;
}
