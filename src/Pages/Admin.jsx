import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  RefreshCw,
  Link2,
  Trash2,
  AlertTriangle,
  ClipboardCopy,
  Table2,
} from "lucide-react";
import {
  getSheetUrl,
  setSheetUrl,
  validateSheetUrl,
} from "../utils/sheets";
import { fetchProducts, getCatalogSource } from "../utils/data";

const CSV_TEMPLATE =
  "id,name,brand,season,gender,price,mrp,sizes,stock,image,tags,description,rating\n" +
  'nw1,Women Chikankari Kurti,Muses,Spring,Women,1499,2599,XS/S/M/L,30,https://drive.google.com/file/d/XXXX/view,"New Arrivals",Chikankari cotton kurti,4.4';

const SEASONS_HELP = "winter | summer | rainy | spring";
const GENDER_HELP = "men | women | unisex";
const TAGS_HELP = "New Arrivals, Bestseller, Deal of the Day (comma separated)";

export default function Admin() {
  const navigate = useNavigate();
  const [url, setUrl] = useState(getSheetUrl());
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState([]);
  const [source, setSource] = useState("");

  // Auto-load the current catalog on open (lint-safe: setState in .then)
  useEffect(() => {
    let active = true;
    fetchProducts().then((list) => {
      if (!active) return;
      setItems(list);
      setSource(getCatalogSource() === "sheets" ? "Google Sheets" : "Built-in demo catalog");
    });
    return () => {
      active = false;
    };
  }, []);

  async function loadCatalog() {
    const list = await fetchProducts(true);
    setBusy(false);
    setItems(list);
    setSource(getCatalogSource() === "sheets" ? "Google Sheets" : "Built-in demo catalog");
  }

  async function handleSave() {
    setStatus({ type: "", message: "" });
    setBusy(true);
    const result = await validateSheetUrl(url);

    if (!result.ok) {
      setBusy(false);
      setStatus({
        type: "error",
        message:
          "Could not read products from that link. Check that you published the sheet as CSV (File → Share → Publish to web → CSV) and pasted the published URL.",
      });
      return;
    }
    setStatus({
      type: "success",
      message: `Linked. ${result.count} products loaded from your sheet.`,
    });
    await loadCatalog();
  }

  function handleClear() {
    setSheetUrl("");
    setUrl("");
    setStatus({
      type: "success",
      message: "Sheet unlinked — the site is using the built-in catalog again.",
    });
    loadCatalog();
  }

  function handleRefresh() {
    loadCatalog();
    setStatus({ type: "success", message: "Re-fetched the latest rows from the sheet." });
  }

  return (
    <main className="page-container admin-page">
      <section className="page-heading">
        <p className="eyebrow">OWNER TOOL</p>
        <h1>Manage Products</h1>
        <p>Add clothes from a Google Sheet — no code, no rebuild, no deploy.</p>
      </section>

      <div className="admin-grid">
        <section className="admin-card">
          <h2>
            <Link2 size={18} /> 1. Connect your Google Sheet
          </h2>
          <p className="admin-help">
            Publish your sheet as CSV (File → Share → Publish to web → pick the
            tab → format <strong>Comma separated values (.csv)</strong> →
            Publish), then paste the link here. Saved on this device only.
          </p>

          <label className="admin-label" htmlFor="sheet-url">
            Published CSV link
          </label>
          <input
            id="sheet-url"
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <div className="admin-actions">
            <button type="button" className="pm-btn pm-btn-gold" onClick={handleSave} disabled={busy}>
              Save &amp; Test
            </button>
            <button type="button" className="pm-btn pm-btn-dark" onClick={handleRefresh} disabled={busy}>
              <RefreshCw size={16} /> Refresh from sheet
            </button>
            <button type="button" className="admin-danger" onClick={handleClear} disabled={busy}>
              <Trash2 size={16} /> Unlink
            </button>
          </div>

          {status.message && (
            <p className={`admin-status admin-status-${status.type}`} role="status">
              {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {status.message}
            </p>
          )}
        </section>

        <section className="admin-card">
          <h2>
            <ClipboardCopy size={18} /> 2. Sheet columns (copy this header)
          </h2>
          <pre className="admin-code">{CSV_TEMPLATE}</pre>
          <ul className="admin-tips">
            <li><strong>season</strong>: {SEASONS_HELP}</li>
            <li><strong>gender</strong>: {GENDER_HELP}</li>
            <li><strong>tags</strong>: {TAGS_HELP}</li>
            <li><strong>sizes</strong>: use / between sizes, e.g. S/M/L/XL</li>
            <li><strong>image</strong>: any direct photo URL — Google Drive file links are converted automatically</li>
            <li><strong>id</strong>: must be unique for every product</li>
            <li>Rows without a name or price are skipped safely</li>
          </ul>
        </section>

        <section className="admin-card admin-preview">
          <div className="admin-preview-head">
            <h2>
              <Table2 size={18} /> 3. Live catalog ({items.length} products)
            </h2>
            <span className="admin-source">
              Source: {busy ? "loading…" : source || "—"}
            </span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Season</th>
                  <th>Gender</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id}>
                    <td>{p._id}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-link"
                        onClick={() => navigate(`/product/${p._id}`)}
                      >
                        {p.name}
                      </button>
                    </td>
                    <td>{p.department}</td>
                    <td>{p.category}</td>
                    <td>₹{p.price}</td>
                    <td>{p.stock}</td>
                    <td>{p.tags?.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
