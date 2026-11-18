// Branded, printable invoice for an order. Opens in a new tab; "Download PDF" uses the
// browser's Save-as-PDF, which gives a crisp, selectable A4 PDF without extra libraries.
import type { Order } from './admin-data';

// Business details printed on every invoice. Fill in GSTIN when available (left blank = hidden).
export const INVOICE_BUSINESS = {
  name: 'Prakruthi Aqua Products',
  address: '2nd Cross, Veera Sagar Main Road, Near Amba Bhavani Temple, Attur Layout, Chikkadinne, Yelahanka New Town, Bengaluru, Karnataka, India',
  phone: '+91 89043 73735',
  email: 'info@prakruthiaqua.in',
  website: 'prakruthiaqua.in',
  gstin: '',
};

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const inr = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(n) || 0);
const day = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export function invoiceNumber(o: Order) { return `INV-${o.order_number.replace(/^PA-/, '')}`; }

export function invoiceHtml(o: Order, origin: string) {
  const paid = o.payment_status === 'paid';
  const statusLabel = paid ? 'Paid' : o.payment_status === 'refunded' ? 'Refunded' : o.payment_status === 'failed' ? 'Payment failed' : 'Payment due';
  const rows = o.items.map((i, n) => `
    <tr>
      <td class="num">${n + 1}</td>
      <td><b>${esc(i.name)}</b></td>
      <td class="r">${i.quantity}</td>
      <td class="r">${inr(i.price)}</td>
      <td class="r strong">${inr(i.price * i.quantity)}</td>
    </tr>`).join('');
  const subtotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const b = INVOICE_BUSINESS;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(invoiceNumber(o))} · ${esc(b.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Jost:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { --olive:#263f04; --lime:#94ad12; --sage:#c3cf7b; --cream:#f7f7ec; --line:#e4e6d2; --ink:#24291d; --muted:#6a705c; }
  * { box-sizing:border-box; }
  body { margin:0; background:#ecefe0; font-family:'Jost',system-ui,sans-serif; color:var(--ink); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .bar { position:sticky; top:0; z-index:2; display:flex; justify-content:center; gap:10px; padding:14px; background:var(--olive); }
  .bar button { font:600 13px 'Jost',sans-serif; letter-spacing:.06em; text-transform:uppercase; border:0; border-radius:99px; padding:11px 22px; cursor:pointer; }
  .bar .pdf { background:var(--lime); color:var(--olive); } .bar .close { background:transparent; color:#fff; border:1px solid rgba(255,255,255,.4); }
  .sheet { width:210mm; min-height:297mm; margin:24px auto; background:#fff; position:relative; overflow:hidden; box-shadow:0 30px 60px -30px rgba(38,63,4,.45); }
  .band { height:10px; background:linear-gradient(90deg,var(--olive),var(--lime) 60%,var(--sage)); }
  .wrap { padding:14mm 16mm 18mm; }
  header { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; }
  .logo { height:58px; }
  .biz { margin-top:10px; font-size:11.5px; line-height:1.6; color:var(--muted); max-width:300px; }
  .title { text-align:right; }
  .title h1 { margin:0; font-family:'Cormorant Garamond',serif; font-size:44px; font-weight:600; color:var(--olive); line-height:1; }
  .title .no { margin-top:8px; font-weight:600; font-size:14px; }
  .pill { display:inline-block; margin-top:10px; padding:5px 12px; border-radius:99px; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
  .pill.paid { background:#e7efcf; color:var(--olive); } .pill.due { background:#fbefd5; color:#8a5a00; } .pill.bad { background:#f8e3dc; color:#9b3b21; }
  .meta { display:grid; grid-template-columns:1.3fr 1fr 1fr; gap:14px; margin:26px 0 22px; }
  .box { background:var(--cream); border:1px solid var(--line); border-radius:12px; padding:14px 16px; font-size:12.5px; line-height:1.6; }
  .box h4 { margin:0 0 6px; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--lime); filter:brightness(.8); }
  .box b { font-size:14px; color:var(--olive); }
  table { width:100%; border-collapse:collapse; font-size:12.5px; }
  thead th { background:var(--olive); color:#fff; font-size:10px; letter-spacing:.14em; text-transform:uppercase; text-align:left; padding:10px 12px; }
  thead th:first-child { border-radius:10px 0 0 10px; } thead th:last-child { border-radius:0 10px 10px 0; }
  tbody td { padding:12px; border-bottom:1px solid var(--line); vertical-align:top; }
  tbody td small { display:block; color:var(--muted); font-size:10.5px; margin-top:2px; }
  .r { text-align:right; } .num { color:var(--muted); width:34px; } .strong { font-weight:600; }
  .totals { display:flex; justify-content:space-between; gap:24px; margin-top:20px; align-items:flex-start; }
  .note { flex:1; font-size:11.5px; color:var(--muted); line-height:1.6; }
  .note b { color:var(--ink); }
  .sum { width:280px; font-size:13px; }
  .sum div { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px dashed var(--line); }
  .sum .grand { margin-top:6px; padding:12px 14px; border:0; border-radius:12px; background:var(--olive); color:#fff; font-weight:700; font-size:16px; }
  .sum .grand span:last-child { color:var(--sage); }
  footer { position:absolute; left:16mm; right:16mm; bottom:12mm; display:flex; justify-content:space-between; align-items:flex-end; gap:20px; padding-top:14px; border-top:1px solid var(--line); font-size:10.5px; color:var(--muted); }
  footer .thanks { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:22px; color:var(--olive); }
  .tree { position:absolute; right:-40px; bottom:40px; width:260px; opacity:.05; pointer-events:none; }
  @page { size:A4; margin:0; }
  @media print { body { background:#fff; } .bar { display:none; } .sheet { margin:0; box-shadow:none; width:auto; min-height:100vh; } }
  @media (max-width:820px) { .sheet { width:auto; margin:12px; min-height:0; } .wrap { padding:22px; } footer { position:static; margin-top:28px; } .meta { grid-template-columns:1fr; } header { flex-direction:column; } .title { text-align:left; } .totals { flex-direction:column-reverse; } .sum { width:100%; } }
</style></head><body>
<div class="bar"><button class="pdf" onclick="window.print()">Download PDF / Print</button><button class="close" onclick="window.close()">Close</button></div>
<div class="sheet">
  <div class="band"></div>
  <img class="tree" src="${origin}/images/prakruthi-icon.svg" alt="">
  <div class="wrap">
    <header>
      <div>
        <img class="logo" src="${origin}/images/prakruthi-full-logo.png" alt="${esc(b.name)}">
        <div class="biz">${esc(b.address)}<br>${esc(b.phone)} · ${esc(b.email)}${b.gstin ? `<br><b>GSTIN:</b> ${esc(b.gstin)}` : ''}</div>
      </div>
      <div class="title">
        <h1>Invoice</h1>
        <div class="no">${esc(invoiceNumber(o))}</div>
        <span class="pill ${paid ? 'paid' : o.payment_status === 'failed' || o.payment_status === 'refunded' ? 'bad' : 'due'}">${statusLabel}</span>
      </div>
    </header>

    <section class="meta">
      <div class="box"><h4>Billed to</h4><b>${esc(o.customer_name)}</b><br>${esc(o.address).replace(/\n/g, '<br>')}<br>${esc(o.phone)}<br>${esc(o.email)}</div>
      <div class="box"><h4>Order</h4>Order no. <b>${esc(o.order_number)}</b><br>Invoice date: ${day(new Date().toISOString())}<br>Order date: ${day(o.created_at)}<br>Status: ${esc(o.status)}</div>
      <div class="box"><h4>Payment</h4>${paid
        ? `Paid on ${day(o.paid_at || o.created_at)}<br>${o.payment_method === 'razorpay' ? 'Razorpay' : 'Offline'}${o.payment_mode ? ` · ${esc(o.payment_mode).toUpperCase()}` : ''}${o.razorpay_payment_id ? `<br><small>Ref: ${esc(o.razorpay_payment_id)}</small>` : ''}`
        : `${statusLabel}<br>${o.payment_method === 'razorpay' ? 'Online (Razorpay)' : 'To be confirmed by our team'}`}</div>
    </section>

    <table>
      <thead><tr><th>#</th><th>Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="note">${o.notes ? `<b>Order notes:</b> ${esc(o.notes)}<br><br>` : ''}All amounts in Indian Rupees (INR).<br>For any questions about this invoice, contact ${esc(b.phone)} or ${esc(b.email)}.</div>
      <div class="sum">
        <div><span>Subtotal</span><span>${inr(subtotal)}</span></div>
        ${Math.abs(subtotal - Number(o.total)) > 0.009 ? `<div><span>Adjustments</span><span>${inr(Number(o.total) - subtotal)}</span></div>` : ''}
        <div class="grand"><span>${paid ? 'Total paid' : 'Total due'}</span><span>${inr(o.total)}</span></div>
      </div>
    </div>
  </div>
  <footer>
    <div><div class="thanks">Thank you for caring for your little world.</div>This is a computer-generated invoice and does not require a signature.</div>
    <div style="text-align:right">${esc(b.name)}<br>${esc(b.website)}</div>
  </footer>
</div>
</body></html>`;
}

export function openInvoice(o: Order) {
  const w = window.open('', '_blank');
  if (!w) { alert('Please allow pop-ups for this site to open the invoice.'); return; }
  w.document.open();
  w.document.write(invoiceHtml(o, window.location.origin));
  w.document.close();
}
