import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Plus, Trash2, Download, Printer, FileText, Edit3, Eye, Share2, ChevronRight, X, Check, LayoutList } from 'lucide-react';
import headerImg from './assets/Header.png';
import sigRehman from './assets/signatures-rehman.png';
import sigYasir from './assets/signatures-yasir.png';
import logo from './assets/logo.png';
import './index.css';

function App() {
  const [tab, setTab] = useState('details'); // 'details' | 'products' | 'preview'
  const [editingProduct, setEditingProduct] = useState(null); // product id being edited in modal
  const [refNum, setRefNum] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [applySameTax, setApplySameTax] = useState(false);
  const [sameTaxPercent, setSameTaxPercent] = useState(0);
  const [otherTaxPercent, setOtherTaxPercent] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [ntnNumber, setNtnNumber] = useState('7310235');
  const [strnNumber, setStrnNumber] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [signature, setSignature] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerNtn, setBuyerNtn] = useState('');
  const [buyerStrn, setBuyerStrn] = useState('');
  const [products, setProducts] = useState([
    { id: 1, name: 'SARSABZ NP, PACKING: 50 KG BAG', uom: 'Bag', qty: 20, price: 10975, tax: 0 },
    { id: 2, name: 'UREA, PACKING: 50KG/BAG, MAKE: ENGRO/FFC', uom: 'Bag', qty: 20, price: 4800, tax: 0 },
    { id: 3, name: 'PAKARAB CAN, PACKING: 50KG/BAG', uom: 'Bag', qty: 20, price: 4375, tax: 0 },
    { id: 4, name: 'ENGRO ZARKHEZ PLUS (8:23:18), PACKING 50KG/BAG', uom: 'Bag', qty: 30, price: 12310, tax: 0 },
    { id: 5, name: 'SOP, PACKING: 25KG/BAG', uom: 'Bag', qty: 20, price: 8670, tax: 0 },
    { id: 6, name: 'ZINC 33%', uom: 'Kgs', qty: 150, price: 570, tax: 0 },
    { id: 7, name: 'FERTERA FMC MAKE: FMC', uom: 'Kgs', qty: 160, price: 380, tax: 0 },
  ]);
  const invoiceRef = useRef(null);

  const addProduct = () => {
    const newId = Date.now();
    const newP = { id: newId, name: '', uom: 'Bag', qty: 1, price: 0, tax: applySameTax ? sameTaxPercent : 0 };
    setProducts([...products, newP]);
    setEditingProduct(newId);
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    if (editingProduct === id) setEditingProduct(null);
  };

  const handleApplySameTaxToggle = (e) => {
    const isChecked = e.target.checked;
    setApplySameTax(isChecked);
    if (isChecked) setProducts(products.map(p => ({ ...p, tax: sameTaxPercent })));
  };

  const handleSameTaxChange = (e) => {
    const val = Number(e.target.value);
    setSameTaxPercent(val);
    if (applySameTax) setProducts(products.map(p => ({ ...p, tax: val })));
  };

  const subTotal = products.reduce((sum, p) => sum + (p.qty * p.price), 0);
  const totalProductTax = products.reduce((sum, p) => sum + (p.qty * p.price * (p.tax / 100)), 0);
  const otherTaxAmount = subTotal * (otherTaxPercent / 100);
  const grandTotal = subTotal + totalProductTax + otherTaxAmount + Number(otherCharges);

  const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDisplayDate = (d) => {
    if (!d) return '';
    const dateObj = new Date(d + 'T00:00:00');
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  };

  const getOpts = () => ({
    margin: 0,
    filename: `Invoice_${refNum || 'Draft'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, width: 780, windowWidth: 780 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  });

  const handleDownloadPDF = () => {
    const el = invoiceRef.current;
    if (!el) return;
    html2pdf().set(getOpts()).from(el).save();
  };

  const handlePrint = () => window.print();

  const handleShareWhatsApp = async () => {
    const el = invoiceRef.current;
    if (!el) return;
    try {
      const pdfBlob = await html2pdf().set(getOpts()).from(el).outputPdf('blob');
      const file = new File([pdfBlob], getOpts().filename, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Invoice', text: 'Please find the invoice attached.' });
      } else {
        alert('Direct file sharing is not supported. Please download the PDF and share manually.');
      }
    } catch (err) { console.error(err); }
  };

  const editingP = editingProduct ? products.find(p => p.id === editingProduct) : null;

  // Invoice table (shared for both hidden render + preview)
  const InvoiceTable = () => (
    <div className="invoice-container" ref={invoiceRef}>
      <div style={{ margin: '-15px -24px 20px -24px' }}>
        <img src={headerImg} alt="Header" style={{ width: '100%', display: 'block' }} />
        <div style={{ marginTop: '15px', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="invoice-meta"><div>Ref# <span>{refNum}</span></div></div>
              {ntnNumber && <div className="invoice-meta"><div>NTN# <span>{ntnNumber}</span></div></div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="invoice-meta"><div style={{ paddingRight: '0' }}>Date <span>{formatDisplayDate(date)}</span></div></div>
              {strnNumber && <div className="invoice-meta" style={{ width: 'auto' }}><div>STRN# <span>{strnNumber}</span></div></div>}
            </div>
          </div>
        </div>
      </div>
      {(buyerName || buyerAddress || buyerNtn || buyerStrn) && (
        <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc', fontFamily: '"Times New Roman", Times, serif' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#000', borderBottom: '1px solid #ccc', display: 'inline-block' }}>Billed To:</div>
          {buyerName && <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{buyerName}</div>}
          {buyerAddress && <div style={{ fontSize: '14px' }}>{buyerAddress}</div>}
          {(buyerNtn || buyerStrn) && (
            <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <div>{buyerNtn && <><span style={{ fontWeight: 'bold' }}>NTN:</span> {buyerNtn}</>}</div>
              <div>{buyerStrn && <><span style={{ fontWeight: 'bold' }}>STRN:</span> {buyerStrn}</>}</div>
            </div>
          )}
        </div>
      )}
      <table className="invoice-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>No.</th>
            <th>Product</th>
            <th>UOM</th>
            <th>Qty</th>
            <th>Price</th>
            <th>GST TAX %</th>
            <th>GST TAX Amt</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr key={p.id}>
              <td style={{ textAlign: 'center' }}>{idx + 1}</td>
              <td className="product-col">{p.name}</td>
              <td className="bold-val">{p.uom}</td>
              <td className="bold-val">{p.qty}</td>
              <td className="bold-val">{p.price.toLocaleString()}</td>
              <td className="bold-val">{p.tax}%</td>
              <td className="bold-val">{(p.qty * p.price * (p.tax / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="bold-val">{(p.qty * p.price + p.qty * p.price * (p.tax / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 10 - products.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={{ textAlign: 'center' }}>{products.length + i + 1}</td>
              <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td>
              <td className="bold-val">0</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc', verticalAlign: 'bottom', paddingBottom: '4px' }}>
              {signature && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', fontFamily: '"Times New Roman", Times, serif' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', paddingBottom: '2px' }}>Seller Signatures :</span>
                  <div style={{ position: 'relative', flex: '0 0 180px', borderBottom: '1.5px solid #000', height: '50px' }}>
                    <img src={signature === 'rehman' ? sigRehman : sigYasir} alt="Signature"
                      style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', maxHeight: '95px', maxWidth: '220px' }} />
                  </div>
                </div>
              )}
            </td>
            <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Sub Total</td>
            <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(subTotal)}</td>
          </tr>
          <tr>
            <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
            <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Total GST Tax</td>
            <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(totalProductTax)}</td>
          </tr>
          {otherTaxPercent > 0 && (
            <tr>
              <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
              <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Other Tax ({otherTaxPercent}%)</td>
              <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(otherTaxAmount)}</td>
            </tr>
          )}
          {Number(otherCharges) > 0 && (
            <tr>
              <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
              <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Other Charges</td>
              <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(Number(otherCharges))}</td>
            </tr>
          )}
          <tr>
            <td colSpan="6" style={{ border: 'none' }}></td>
            <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px', fontSize: '16px', color: '#000', borderTop: '2px solid #000', borderBottom: '2px double #000' }}>GRAND TOTAL</td>
            <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px', fontSize: '16px', color: '#000', borderTop: '2px solid #000', borderBottom: '2px double #000' }}>{fmt(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className="app-shell">

      {/* ── APP HEADER ── */}
      <header className="app-bar">
        <div className="app-bar-inner">
          <div className="app-bar-logo">
            <img src={logo} alt="Logo" />
          </div>
          <div className="app-bar-titles">
            <span className="app-bar-title">Rehman Agro</span>
            <span className="app-bar-sub">Invoice Generator</span>
          </div>
          <div className="app-bar-actions">
            <button className="icon-btn icon-btn--dl" onClick={handleDownloadPDF} title="Download PDF"><Download size={18} /></button>
            <button className="icon-btn icon-btn--print" onClick={handlePrint} title="Print"><Printer size={18} /></button>
            <button className="icon-btn icon-btn--wa" onClick={handleShareWhatsApp} title="Share"><Share2 size={18} /></button>
          </div>
        </div>
      </header>

      {/* ── GRAND TOTAL STRIP ── */}
      <div className="total-strip">
        <span className="total-strip__label">Grand Total</span>
        <span className="total-strip__amount">PKR {fmt(grandTotal)}</span>
      </div>

      {/* ── SCREEN BODY ── */}
      <main className="app-body">

        {/* ════ DETAILS TAB ════ */}
        <div className={`screen screen--details ${tab === 'details' ? 'screen--active' : ''}`}>

            {/* Invoice Info */}
            <div className="section-label">INVOICE INFO</div>
            <div className="card">
              <div className="field-row">
                <label className="field-row__label">Reference #</label>
                <input className="field-row__input" type="text" value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="e.g. 101" />
              </div>
              <div className="field-row field-row--border">
                <label className="field-row__label">Date</label>
                <input className="field-row__input field-row__input--right" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="field-row field-row--border">
                <label className="field-row__label">Other Tax %</label>
                <input className="field-row__input field-row__input--right" type="number" value={otherTaxPercent} onChange={e => setOtherTaxPercent(Number(e.target.value))} />
              </div>
              <div className="field-row field-row--border">
                <label className="field-row__label">Other Charges (Rs)</label>
                <input className="field-row__input field-row__input--right" type="number" value={otherCharges} onChange={e => setOtherCharges(e.target.value)} />
              </div>
              <div className="field-row field-row--border">
                <label className="field-row__label">Our NTN #</label>
                <input className="field-row__input field-row__input--right" type="text" value={ntnNumber} onChange={e => setNtnNumber(e.target.value)} />
              </div>
              <div className="field-row field-row--border">
                <label className="field-row__label">Our STRN #</label>
                <input className="field-row__input field-row__input--right" type="text" value={strnNumber} onChange={e => setStrnNumber(e.target.value)} placeholder="Optional" />
              </div>
            </div>

            {/* Buyer Info */}
            <div className="section-label">BUYER INFO</div>
            <div className="card">
              <div className="field-row">
                <label className="field-row__label">Buyer Name</label>
                <input className="field-row__input" type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Enter name" />
              </div>
              <div className="field-row field-row--border">
                <label className="field-row__label">Address</label>
                <input className="field-row__input" type="text" value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="Enter address" />
              </div>
              <div className="field-row field-row--border">
                <label className="field-row__label">Buyer NTN #</label>
                <input className="field-row__input field-row__input--right" type="text" value={buyerNtn} onChange={e => setBuyerNtn(e.target.value)} placeholder="Optional" />
              </div>
              <div className="field-row field-row--border">
                <label className="field-row__label">Buyer STRN #</label>
                <input className="field-row__input field-row__input--right" type="text" value={buyerStrn} onChange={e => setBuyerStrn(e.target.value)} placeholder="Optional" />
              </div>
            </div>

            {/* Signature */}
            <div className="section-label">SIGNATURE</div>
            <div className="card">
              {[{ value: 'rehman', label: 'Rehman' }, { value: 'yasir', label: 'Yasir' }, { value: '', label: 'None' }].map(s => (
                <label key={s.value} className={`sig-row ${signature === s.value ? 'sig-row--active' : ''}`}>
                  <span className="sig-row__label">{s.label}</span>
                  <span className="sig-row__check">{signature === s.value && <Check size={16} strokeWidth={3} />}</span>
                  <input type="radio" name="sig" value={s.value} checked={signature === s.value} onChange={e => setSignature(e.target.value)} style={{ display: 'none' }} />
                </label>
              ))}
            </div>

            {/* Summary */}
            <div className="section-label">SUMMARY</div>
            <div className="summary-block">
              <div className="summary-line"><span>Sub Total</span><span>PKR {fmt(subTotal)}</span></div>
              <div className="summary-line"><span>Total GST Tax</span><span>PKR {fmt(totalProductTax)}</span></div>
              {otherTaxPercent > 0 && <div className="summary-line"><span>Other Tax ({otherTaxPercent}%)</span><span>PKR {fmt(otherTaxAmount)}</span></div>}
              {Number(otherCharges) > 0 && <div className="summary-line"><span>Other Charges</span><span>PKR {fmt(Number(otherCharges))}</span></div>}
              <div className="summary-line summary-line--total"><span>Grand Total</span><span>PKR {fmt(grandTotal)}</span></div>
            </div>

        </div>

        {/* ════ PRODUCTS TAB ════ */}
        <div className={`screen screen--products ${tab === 'products' ? 'screen--active' : ''}`}>

            {/* GST toggle */}
            <div className="gst-bar">
              <label className="gst-bar__toggle">
                <span>Apply Same GST to All</span>
                <div className="toggle-switch">
                  <input type="checkbox" checked={applySameTax} onChange={handleApplySameTaxToggle} />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              {applySameTax && (
                <div className="gst-bar__pct">
                  <input type="number" className="gst-input" value={sameTaxPercent} onChange={handleSameTaxChange} placeholder="%" />
                  <span className="gst-bar__unit">%</span>
                </div>
              )}
            </div>

            {/* Product count */}
            <div className="section-label">{products.length} PRODUCT{products.length !== 1 ? 'S' : ''}</div>

            {/* Product list */}
            <div className="product-list">
              {products.map((p, idx) => (
                <div key={p.id} className="product-item" onClick={() => setEditingProduct(p.id)}>
                  <div className="product-item__index">{idx + 1}</div>
                  <div className="product-item__body">
                    <div className="product-item__name">{p.name || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Unnamed product</span>}</div>
                    <div className="product-item__meta">
                      <span>{p.qty} {p.uom}</span>
                      <span className="dot">·</span>
                      <span>PKR {p.price.toLocaleString()}</span>
                      {p.tax > 0 && <><span className="dot">·</span><span>{p.tax}% GST</span></>}
                    </div>
                  </div>
                  <div className="product-item__total">PKR {(p.qty * p.price + p.qty * p.price * p.tax / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  <div className="product-item__actions">
                    <button className="product-item__delete" onClick={(e) => { e.stopPropagation(); removeProduct(p.id); }} title="Delete Product">
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={16} className="product-item__chevron" />
                  </div>
                </div>
              ))}
            </div>

            {/* FAB */}
            <button className="fab" onClick={addProduct}>
              <Plus size={24} strokeWidth={2.5} />
            </button>
        </div>

        {/* ════ PREVIEW TAB ════ */}
        <div className={`screen screen--preview ${tab === 'preview' ? 'screen--active' : ''}`}>
            <div className="preview-scroller">
              <InvoiceTable />
          </div>
        </div>

      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className={`nav-item ${tab === 'details' ? 'nav-item--active' : ''}`} onClick={() => setTab('details')}>
          <FileText size={20} />
          <span>Details</span>
        </button>
        <button className={`nav-item ${tab === 'products' ? 'nav-item--active' : ''}`} onClick={() => setTab('products')}>
          <LayoutList size={20} />
          <span>Products</span>
        </button>
        <button className={`nav-item ${tab === 'preview' ? 'nav-item--active' : ''}`} onClick={() => setTab('preview')}>
          <Eye size={20} />
          <span>Preview</span>
        </button>
      </nav>

      {/* ── PRODUCT EDIT MODAL ── */}
      {editingP && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit Product</span>
              <button className="modal-close" onClick={() => setEditingProduct(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Product Name</label>
                <textarea value={editingP.name} onChange={e => updateProduct(editingP.id, 'name', e.target.value)} rows={2} placeholder="Enter product description" />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>UOM</label>
                  <input type="text" value={editingP.uom} onChange={e => updateProduct(editingP.id, 'uom', e.target.value)} />
                </div>
                <div className="modal-field">
                  <label>Qty</label>
                  <input type="number" value={editingP.qty} onChange={e => updateProduct(editingP.id, 'qty', Number(e.target.value))} />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Price (PKR)</label>
                  <input type="number" value={editingP.price} onChange={e => updateProduct(editingP.id, 'price', Number(e.target.value))} />
                </div>
                <div className="modal-field">
                  <label>GST TAX %</label>
                  <input type="number" value={editingP.tax} onChange={e => updateProduct(editingP.id, 'tax', Number(e.target.value))} disabled={applySameTax} />
                </div>
              </div>
              <div className="modal-totals">
                <div className="modal-total-row"><span>GST Amount</span><span>PKR {fmt(editingP.qty * editingP.price * editingP.tax / 100)}</span></div>
                <div className="modal-total-row modal-total-row--main"><span>Line Total</span><span>PKR {fmt(editingP.qty * editingP.price + editingP.qty * editingP.price * editingP.tax / 100)}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn--delete" onClick={() => removeProduct(editingP.id)}><Trash2 size={16} /> Delete</button>
              <button className="modal-btn modal-btn--done" onClick={() => setEditingProduct(null)}><Check size={16} /> Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden invoice for print/download */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '780px', zIndex: -1, pointerEvents: 'none' }}>
        <InvoiceTable />
      </div>

    </div>
  );
}

export default App;
