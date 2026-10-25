
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Upload,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  MailCheck
} from "lucide-react";
import { createReport, maskEmail } from "../utils/reports";

const ISSUE_CATEGORIES = [
  "Damaged Product",
  "Incorrect Item Received",
  "Missing Item",
  "Payment Issue",
  "Delivery Issue",
  "Quality Concern",
  "Website Problem",
  "Other"
];

// Categories that relate to an existing order, so we ask for an order number.
const ORDER_RELATED = [
  "Damaged Product",
  "Incorrect Item Received",
  "Missing Item",
  "Payment Issue",
  "Delivery Issue",
  "Quality Concern"
];

const RESOLUTION_OPTIONS = [
  "Replacement with a correct / undamaged item",
  "Refund",
  "Repair / mend",
  "Investigation and an update from your team",
  "No preference — resolve as you see fit"
];

const PAYMENT_METHODS = ["UPI", "Credit / Debit Card", "Net Banking", "Wallet", "Cash on Delivery"];

// 5. Conditional fields — extra details we only ask for on certain categories.
const CONDITIONAL = {
  orderId: ORDER_RELATED,
  specify: ["Other"],
  paymentMethod: ["Payment Issue"],
  tracking: ["Delivery Issue"],
  browser: ["Website Problem"]
};
const shows = (field, category) => CONDITIONAL[field].includes(category);

const POLICY_POINTS = [
  {
    title: "No change-of-mind returns",
    body:
      "We do not accept returns simply because a customer changes their mind, subject to applicable consumer law."
  },
  {
    title: "Size selection",
    body:
      "Customers are encouraged to check our size chart before ordering. Size exchanges are not offered as a standard service."
  },
  {
    title: "Damaged or incorrect products",
    body:
      "If a product arrives damaged, defective, or different from the item ordered, contact our support team for assistance."
  },
  {
    title: "Delivery issues",
    body:
      "Customers can report missing or incorrect items through our website."
  },
  {
    title: "Quality concerns",
    body:
      "Every genuine quality complaint will be reviewed by our team."
  }
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    orderId: "",
    specify: "",
    paymentMethod: "",
    tracking: "",
    browser: "",
    description: "",
    resolution: "",
    consent: false
  });

  const [images, setImages] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [ticket, setTicket] = useState(null);

  function handleChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((previous) => ({ ...previous, [target.name]: value }));
    if (status.type) setStatus({ type: "", message: "" });
  }

  function handleFiles(event) {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter((file) => file.type.startsWith("image/"));
    const added = valid.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      url: URL.createObjectURL(file)
    }));

    setImages((previous) => [...previous, ...added]);
    // Allow re-selecting the same file after removal.
    event.target.value = "";
  }

  function removeImage(id) {
    const target = images.find((img) => img.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setImages((previous) => previous.filter((img) => img.id !== id));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setStatus({
        type: "error",
        message: "Please add your name and email so we can reach you."
      });
      return;
    }

    if (!form.category) {
      setStatus({ type: "error", message: "Please choose an issue category." });
      return;
    }

    if (form.description.trim().length < 10) {
      setStatus({
        type: "error",
        message: "Please describe the problem in a little more detail (at least 10 characters)."
      });
      return;
    }

    // 5. Conditional field validation — only for what is currently visible
    if (shows("specify", form.category) && !form.specify.trim()) {
      setStatus({ type: "error", message: "Please specify the issue in the 'Other' field." });
      return;
    }
    if (shows("paymentMethod", form.category) && !form.paymentMethod) {
      setStatus({ type: "error", message: "Please tell us which payment method was affected." });
      return;
    }

    // 6. Privacy protection — report is only filed with explicit consent
    if (!form.consent) {
      setStatus({
        type: "error",
        message: "Please allow us to use your details to process this report before submitting."
      });
      return;
    }

    // 1 + 2 + 3 — record the report, generate the reference number and the
    // automatic confirmation email, and make it trackable on /track.
    const report = createReport({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      category: form.category,
      orderId: shows("orderId", form.category) ? form.orderId.trim() : "",
      specify: shows("specify", form.category) ? form.specify.trim() : "",
      paymentMethod: shows("paymentMethod", form.category) ? form.paymentMethod : "",
      tracking: shows("tracking", form.category) ? form.tracking.trim() : "",
      browser: shows("browser", form.category) ? form.browser.trim() : "",
      description: form.description.trim(),
      resolution: form.resolution,
      imageNames: images.map((img) => img.file.name),
      consentAt: new Date().toISOString()
    });

    setTicket(report);
    setStatus({ type: "success", message: "" });

    setForm({
      name: "",
      email: "",
      phone: "",
      category: "",
      orderId: "",
      specify: "",
      paymentMethod: "",
      tracking: "",
      browser: "",
      description: "",
      resolution: "",
      consent: false
    });
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
  }

  const needsOrderId = shows("orderId", form.category);

  return (
    <main className="contact-page page-container">
      <section className="page-heading">
        <p className="eyebrow">WE ARE HERE TO HELP</p>
        <h1>Contact &amp; Support</h1>
        <p>Questions about LMAF TARA, or something to report? Send it below.</p>
      </section>

      <section className="contact-layout">
        <div className="contact-details">
          <h2>Get in Touch</h2>
          <p>
            Have a question about our collections, or did something go wrong
            with an order? Use the report form and our care team will review it
            once messaging is connected.
          </p>

          <div className="contact-detail">
            <Mail size={21} />
            <div>
              <h3>Email</h3>
              <p>Replace with your official business email</p>
            </div>
          </div>

          <div className="contact-detail">
            <Phone size={21} />
            <div>
              <h3>Phone</h3>
              <p>Add your business phone number</p>
            </div>
          </div>

          <div className="contact-detail">
            <MapPin size={21} />
            <div>
              <h3>Location</h3>
              <p>Add your business address</p>
            </div>
          </div>

          <div className="contact-note">
            <AlertTriangle size={18} />
            <p>
              Reporting a problem? Include your order number and a photo of the
              item — it helps us resolve things faster.
            </p>
          </div>

          <div className="contact-note contact-note-track">
            <ShieldCheck size={18} />
            <p>
              Already submitted a report?{" "}
              <Link to="/track">Track it with your reference number</Link>.
            </p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Report a Problem</h2>

          {status.type === "success" ? (
            <div className="report-success" role="status">
              <CheckCircle2 size={30} />
              <h3>Thank you — your report is recorded.</h3>
              <p>
                Your automatic reference number is <strong>{ticket?.reference}</strong>.
                Save it — you will need it to track this report.
              </p>
              <p className="report-email-note">
                <MailCheck size={16} />
                A confirmation email has been generated for{" "}
                <strong>{ticket ? maskEmail(ticket.email) : ""}</strong> and is queued
                in your report's notification log.
              </p>
              <div className="report-success-actions">
                <Link to="/track" className="btn btn-dark">Track this report</Link>
                <button
                  type="button"
                  className="btn btn-ghost-dark"
                  onClick={() => setStatus({ type: "", message: "" })}
                >
                  Submit another report
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="contact-name">Your Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="contact-phone">Phone (optional)</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-category">Issue Category *</label>
                  <select
                    id="contact-category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select an issue…</option>
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {needsOrderId && (
                <div className="form-field">
                  <label htmlFor="contact-order">Order Number *</label>
                  <input
                    id="contact-order"
                    type="text"
                    name="orderId"
                    placeholder="e.g. LMT-123456"
                    value={form.orderId}
                    onChange={handleChange}
                    required
                  />
                  <p className="field-hint">Shown because this issue relates to an order.</p>
                </div>
              )}

              {shows("specify", form.category) && (
                <div className="form-field">
                  <label htmlFor="contact-specify">Please specify the issue *</label>
                  <input
                    id="contact-specify"
                    type="text"
                    name="specify"
                    placeholder="Briefly describe the type of issue"
                    value={form.specify}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {shows("paymentMethod", form.category) && (
                <div className="form-field">
                  <label htmlFor="contact-payment">Payment Method Affected *</label>
                  <select
                    id="contact-payment"
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select method…</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {shows("tracking", form.category) && (
                <div className="form-field">
                  <label htmlFor="contact-tracking">Courier / Tracking Number (if available)</label>
                  <input
                    id="contact-tracking"
                    type="text"
                    name="tracking"
                    placeholder="e.g. DTDC-9938221"
                    value={form.tracking}
                    onChange={handleChange}
                  />
                </div>
              )}

              {shows("browser", form.category) && (
                <div className="form-field">
                  <label htmlFor="contact-browser">Browser / Device</label>
                  <input
                    id="contact-browser"
                    type="text"
                    name="browser"
                    placeholder="e.g. Chrome on Android, Safari on iPhone"
                    value={form.browser}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="contact-description">Problem Description *</label>
                <textarea
                  id="contact-description"
                  name="description"
                  rows="5"
                  placeholder="Tell us exactly what happened…"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="contact-resolution">Preferred Resolution</label>
                <select
                  id="contact-resolution"
                  name="resolution"
                  value={form.resolution}
                  onChange={handleChange}
                >
                  <option value="">No preference</option>
                  {RESOLUTION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="contact-images">Supporting Images</label>
                <label className="upload-box" htmlFor="contact-images">
                  <Upload size={18} />
                  <span>Click to add photos (JPG / PNG)</span>
                  <input
                    id="contact-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                  />
                </label>

                {images.length > 0 && (
                  <div className="upload-preview">
                    {images.map((img) => (
                      <div className="thumb" key={img.id}>
                        <img src={img.url} alt={img.file.name} />
                        <button
                          type="button"
                          className="thumb-remove"
                          onClick={() => removeImage(img.id)}
                          aria-label={`Remove ${img.file.name}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-field consent-field">
                <label className="consent-label">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    <Lock size={14} /> I consent to LMAF TARA storing the details above
                    solely to investigate and resolve this report. Contact details are
                    masked in the tracking view and reports are removed from this
                    device after 180 days.
                  </span>
                </label>
              </div>

              <button type="submit" className="btn btn-dark">
                Submit Report <Send size={17} />
              </button>

              {status.type === "error" && (
                <p className="status-message" role="alert">
                  {status.message}
                </p>
              )}
            </>
          )}
        </form>
      </section>

      <section className="policy-section">
        <div className="policy-header">
          <ShieldCheck size={26} />
          <div>
            <p className="eyebrow">OUR POLICY</p>
            <h2>LMAF TARA — Return &amp; Exchange Policy</h2>
          </div>
        </div>

        <div className="policy-promise">
          <h3>Our Promise of Quality</h3>
          <p>
            At LMAF TARA, we are committed to providing thoughtfully designed
            clothing with a focus on fabric quality, comfort, and craftsmanship.
          </p>
          <p>
            As a growing brand, we encourage our customers to review the product
            descriptions and size charts carefully before placing an order.
          </p>
        </div>

        <ul className="policy-list">
          {POLICY_POINTS.map((point) => (
            <li key={point.title}>
              <h4>{point.title}</h4>
              <p>{point.body}</p>
            </li>
          ))}
        </ul>

        <div className="policy-disclaimer">
          <AlertTriangle size={18} />
          <p>
            <strong>Please note:</strong> This is a suggested starting policy,
            not a substitute for checking applicable Indian consumer-protection
            requirements. A blanket exclusion of returns or exchanges cannot
            override customers&apos; statutory rights where a product is
            defective, deficient, spurious, or not as advertised.
          </p>
        </div>
      </section>
    </main>
  );
}
