// ---------------------------------------------------------------------------
// Track Report — 3. report tracking + 4. status management + 6. privacy
// Customers look up a report by its reference number; the care team can move
// its status, which logs a timeline entry and queues an email notification.
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  Search,
  ShieldCheck,
  History,
  MailCheck,
  ClipboardList,
  Lock,
  ChevronRight
} from "lucide-react";
import {
  STATUS_FLOW,
  findReport,
  listReports,
  setStatus,
  formatDateTime,
  maskEmail,
  maskPhone
} from "../utils/reports";

// Turn a stored report into a view model with pre-formatted dates, so no
// impure date formatting happens during render.
function buildView(report) {
  if (!report) return null;
  return {
    ...report,
    createdLabel: formatDateTime(report.createdAt),
    timelineView: report.timeline.map((entry, index) => ({
      id: `${entry.status}-${index}`,
      status: entry.status,
      atLabel: formatDateTime(entry.at),
      note: entry.note,
      isLatest: index === report.timeline.length - 1
    })),
    emailsView: report.emails.map((mail, index) => ({
      id: `${mail.kind}-${index}`,
      ...mail,
      atLabel: formatDateTime(mail.at)
    }))
  };
}

function buildMine() {
  return listReports().map((r) => ({
    reference: r.reference,
    category: r.category,
    status: r.status,
    createdLabel: formatDateTime(r.createdAt)
  }));
}

export default function TrackReport() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState(null);
  const [searched, setSearched] = useState(false);
  // Lazy initializer: read the report store once on mount, then refresh via handlers.
  const [mine, setMine] = useState(buildMine);
  const [newStatus, setNewStatus] = useState("");
  const [teamNote, setTeamNote] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  function refreshMine() {
    setMine(buildMine());
  }

  function handleQuery(event) {
    setQuery(event.target.value);
    if (searched) setSearched(false);
  }

  function openReport(reference) {
    const report = findReport(reference);
    setView(buildView(report));
    setSearched(!report);
    setQuery(report ? report.reference : query);
    setNewStatus("");
    setTeamNote("");
    setActionMessage("");
  }

  function handleSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    openReport(query.trim());
  }

  // 4. Status management — advancing the status also fires the automatic
  // status-change email notification (2) and a timeline entry (3).
  function handleStatusUpdate(event) {
    event.preventDefault();
    if (!view || !newStatus) return;
    const updated = setStatus(view.reference, newStatus, teamNote);
    setView(buildView(updated));
    refreshMine();
    setNewStatus("");
    setTeamNote("");
    setActionMessage(
      `Status moved to "${updated.status}". A notification email was queued to ${maskEmail(updated.email)}.`
    );
  }

  return (
    <main className="contact-page page-container track-page">
      <section className="page-heading">
        <p className="eyebrow">CARE DESK</p>
        <h1>Track Your Report</h1>
        <p>
          Enter the reference number from your submission to see its live
          status, full timeline and every notification sent to you.
        </p>
      </section>

      <section className="track-layout">
        <div className="track-search card-box">
          <h2>Find a report</h2>
          <form className="track-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={handleQuery}
              placeholder="e.g. LMT-261025-A3F1"
              aria-label="Report reference number"
            />
            <button type="submit" className="btn btn-dark">
              <Search size={16} /> Track
            </button>
          </form>

          {searched && !view && (
            <p className="status-message" role="alert">
              No report found for that reference on this device. Reference
              numbers are case-insensitive, e.g. LMT-261025-a3f1 works too.
            </p>
          )}

          <div className="privacy-note">
            <Lock size={15} />
            <p>
              <strong>Privacy protection:</strong> reports can only be opened
              with their reference number, contact details are always shown
              masked here, and entries are deleted from this device after 180
              days.
            </p>
          </div>

          {mine.length > 0 && (
            <div className="mine-reports">
              <h3>Reports from this device</h3>
              <ul>
                {mine.map((r) => (
                  <li key={r.reference}>
                    <button
                      type="button"
                      className="mine-report-btn"
                      onClick={() => openReport(r.reference)}
                    >
                      <span className="mine-ref">{r.reference}</span>
                      <span className="mine-cat">{r.category}</span>
                      <span className={`status-pill status-${r.status.toLowerCase().replace(" ", "-")}`}>
                        {r.status}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="track-detail card-box">
          {!view ? (
            <div className="track-empty">
              <ClipboardList size={34} />
              <h2>No report selected</h2>
              <p>Search by reference number or pick one of your reports to see its tracking timeline.</p>
            </div>
          ) : (
            <>
              <div className="track-head">
                <div>
                  <p className="eyebrow">REFERENCE NO.</p>
                  <h2 className="track-ref">{view.reference}</h2>
                  <p className="track-submitted">Submitted {view.createdLabel}</p>
                </div>
                <span className={`status-pill status-${view.status.toLowerCase().replace(" ", "-")}`}>
                  {view.status}
                </span>
              </div>

              <div className="track-meta">
                <div><span>Issue</span><strong>{view.category}{view.specify ? ` — ${view.specify}` : ""}</strong></div>
                {view.orderId && <div><span>Order No.</span><strong>{view.orderId}</strong></div>}
                {view.paymentMethod && <div><span>Payment Method</span><strong>{view.paymentMethod}</strong></div>}
                {view.tracking && <div><span>Courier / Tracking</span><strong>{view.tracking}</strong></div>}
                {view.browser && <div><span>Browser / Device</span><strong>{view.browser}</strong></div>}
                <div><span>Contact</span><strong>{maskEmail(view.email)} · {view.phone ? maskPhone(view.phone) : "phone not provided"}</strong></div>
                <div><span>Preferred resolution</span><strong>{view.resolution || "No preference"}</strong></div>
                <div><span>Attachments</span><strong>{view.imageNames?.length ? `${view.imageNames.length} image(s)` : "None"}</strong></div>
              </div>

              <p className="track-description">{view.description}</p>

              <div className="track-columns">
                <section className="track-timeline">
                  <h3><History size={17} /> Report Timeline</h3>
                  <ol>
                    {view.timelineView.map((entry) => (
                      <li key={entry.id} className={entry.isLatest ? "tl-latest" : ""}>
                        <div className="tl-dot" />
                        <div className="tl-body">
                          <strong>{entry.status}</strong>
                          <p>{entry.note}</p>
                          <time>{entry.atLabel}</time>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="track-notifications">
                  <h3><MailCheck size={17} /> Email Notifications</h3>
                  {view.emailsView.map((mail) => (
                    <details key={mail.id} className="email-item">
                      <summary>
                        <span>{mail.subject}</span>
                        <time>{mail.atLabel}</time>
                      </summary>
                      <p className="email-to">To: {mail.to} · {mail.sentAtLabel}</p>
                      <pre className="email-body">{mail.body}</pre>
                    </details>
                  ))}
                </section>
              </div>

              <section className="team-panel">
                <h3><ShieldCheck size={17} /> Care Team — Status Management</h3>
                <p className="team-hint">
                  Demo panel: in production this lives behind staff login. Moving
                  the status logs a timeline entry and queues the customer email.
                </p>
                <form className="team-form" onSubmit={handleStatusUpdate}>
                  <select
                    value={newStatus}
                    onChange={(event) => setNewStatus(event.target.value)}
                    aria-label="New status"
                  >
                    <option value="">Move status to…</option>
                    {STATUS_FLOW.filter((s) => s !== view.status).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={teamNote}
                    onChange={(event) => setTeamNote(event.target.value)}
                    placeholder="Optional note for the customer"
                  />
                  <button type="submit" className="btn btn-gold" disabled={!newStatus}>
                    Update
                  </button>
                </form>
                {actionMessage && (
                  <p className="team-done" role="status">{actionMessage}</p>
                )}
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
