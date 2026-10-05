import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Plus, Trash2, Download, Printer, FileText, Edit3, Eye, Package, Share2 } from 'lucide-react';
import headerImg from './assets/Header.png';
import sigRehman from './assets/signatures-rehman.png';
import sigYasir from './assets/signatures-yasir.png';
import logo from './assets/logo.png';
import './index.css';

function App() {
  const [view, setView] = useState('form');
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
    setProducts([...products, { id: Date.now(), name: '', uom: 'Nos', qty: 1, price: 0, tax: applySameTax ? sameTaxPercent : 0 }]);
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleApplySameTaxToggle = (e) => {
    const isChecked = e.target.checked;
    setApplySameTax(isChecked);
    if (isChecked) {
      setProducts(products.map(p => ({ ...p, tax: sameTaxPercent })));
    }
  };

  const handleSameTaxChange = (e) => {
    const val = Number(e.target.value);
    setSameTaxPercent(val);
    if (applySameTax) {
      setProducts(products.map(p => ({ ...p, tax: val })));
    }
  };

  const removeProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const subTotal = products.reduce((sum, p) => sum + (p.qty * p.price), 0);
  const totalProductTax = products.reduce((sum, p) => sum + (p.qty * p.price * (p.tax / 100)), 0);
  const otherTaxAmount = subTotal * (otherTaxPercent / 100);
  const grandTotal = subTotal + totalProductTax + otherTaxAmount + otherCharges;

  const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Format date as "25-Oct-2023" for the invoice
  const formatDisplayDate = (d) => {
    if (!d) return '';
    const dateObj = new Date(d + 'T00:00:00');
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `Invoice_${refNum || 'Draft'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: 780,
        windowWidth: 780,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => window.print();

  const handleShareWhatsApp = async () => {
    const element = invoiceRef.current;
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `Invoice_${refNum || 'Draft'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, width: 780, windowWidth: 780 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice',
          text: 'Here is the invoice.',
        });
      } else {
        alert("Direct file sharing is not supported on this browser. Please download the PDF and share it manually.");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-icon" style={{ background: 'transparent', padding: 0 }}>
            <img src={logo} alt="Rehman Agro Logo" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '12px' }} />
          </div>
          <div>
            <h1 className="app-title">Rehman Agro Invoice Generator</h1>
            <p className="app-subtitle">Create &amp; download professional quotations instantly</p>
          </div>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="toolbar-tabs">
          <button className={`tab-btn ${view === 'form' ? 'tab-active' : ''}`} onClick={() => setView('form')}>
            <Edit3 size={16} /> Edit Details
          </button>
          <button className={`tab-btn ${view === 'preview' ? 'tab-active' : ''}`} onClick={() => setView('preview')}>
            <Eye size={16} /> Preview
          </button>
        </div>
        <div className="toolbar-actions">
          <button className="action-btn download-btn" onClick={handleDownloadPDF}>
            <Download size={18} /> <span>Download PDF</span>
          </button>
          <button className="action-btn print-btn" onClick={handlePrint}>
            <Printer size={18} /> <span>Print</span>
          </button>
          <button className="action-btn whatsapp-btn" onClick={handleShareWhatsApp}>
            <Share2 size={18} /> <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="main-content">

        {/* ════ FORM VIEW ════ */}
        {view === 'form' && (
          <div className="form-wrapper">

            {/* Invoice Details Card */}
            <section className="form-card">
              <div className="form-card-header">
                <span className="form-card-icon">📋</span>
                <h2 className="form-card-title">Invoice Details</h2>
              </div>
              <div className="form-grid-2">
                <div className="field">
                  <label className="field-label">Reference #</label>
                  <input className="field-input" type="text" value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="e.g. 101" />
                </div>
                <div className="field">
                  <label className="field-label">Date</label>
                  <input className="field-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Other Tax %</label>
                  <input className="field-input" type="number" value={otherTaxPercent} onChange={e => setOtherTaxPercent(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label className="field-label">Other Charges (Rs)</label>
                  <input className="field-input" type="number" value={otherCharges} onChange={e => setOtherCharges(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label className="field-label">Our NTN #</label>
                  <input className="field-input" type="text" value={ntnNumber} onChange={e => setNtnNumber(e.target.value)} placeholder="NTN Number" />
                </div>
                <div className="field">
                  <label className="field-label">Our STRN #</label>
                  <input className="field-input" type="text" value={strnNumber} onChange={e => setStrnNumber(e.target.value)} placeholder="STRN Number" />
                </div>
              </div>
            </section>

            {/* Buyer Details Card */}
            <section className="form-card">
              <div className="form-card-header">
                <span className="form-card-icon">🏢</span>
                <h2 className="form-card-title">Buyer Details</h2>
              </div>
              <div className="form-grid-2">
                <div className="field">
                  <label className="field-label">Buyer Name</label>
                  <input className="field-input" type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Enter buyer name" />
                </div>
                <div className="field">
                  <label className="field-label">Buyer Address</label>
                  <input className="field-input" type="text" value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="Enter buyer address" />
                </div>
                <div className="field">
                  <label className="field-label">Buyer NTN #</label>
                  <input className="field-input" type="text" value={buyerNtn} onChange={e => setBuyerNtn(e.target.value)} placeholder="Enter buyer NTN" />
                </div>
                <div className="field">
                  <label className="field-label">Buyer STRN #</label>
                  <input className="field-input" type="text" value={buyerStrn} onChange={e => setBuyerStrn(e.target.value)} placeholder="Enter buyer STRN" />
                </div>
              </div>
            </section>

            {/* Products Card */}
            <section className="form-card">
              <div className="form-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="form-card-icon">📦</span>
                  <h2 className="form-card-title">Products <span className="product-count">{products.length} item{products.length !== 1 ? 's' : ''}</span></h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input type="checkbox" checked={applySameTax} onChange={handleApplySameTaxToggle} />
                    Apply Same Tax
                  </label>
                  {applySameTax && (
                    <input 
                      type="number" 
                      className="field-input" 
                      style={{ width: '80px', padding: '4px 8px' }} 
                      value={sameTaxPercent} 
                      onChange={handleSameTaxChange} 
                      placeholder="Tax %"
                    />
                  )}
                </div>
              </div>

              <div className="products-list">
                {products.map((p, index) => (
                  <div key={p.id} className="product-card">
                    <div className="product-card-header">
                      <span className="product-number">#{index + 1}</span>
                      <button className="remove-btn" onClick={() => removeProduct(p.id)} title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="field" style={{ marginBottom: '12px' }}>
                      <label className="field-label">Product Name</label>
                      <textarea
                        className="field-input"
                        value={p.name}
                        onChange={e => updateProduct(p.id, 'name', e.target.value)}
                        rows={2}
                        placeholder="Enter product description"
                        style={{ resize: 'vertical', minHeight: '60px' }}
                      />
                    </div>
                    <div className="product-meta-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
                      <div className="field">
                        <label className="field-label">UOM</label>
                        <input className="field-input" type="text" value={p.uom} onChange={e => updateProduct(p.id, 'uom', e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="field-label">Qty</label>
                        <input className="field-input" type="number" value={p.qty} onChange={e => updateProduct(p.id, 'qty', Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <label className="field-label">Price</label>
                        <input className="field-input" type="number" value={p.price} onChange={e => updateProduct(p.id, 'price', Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <label className="field-label">Tax %</label>
                        <input className="field-input" type="number" value={p.tax} onChange={e => updateProduct(p.id, 'tax', Number(e.target.value))} disabled={applySameTax} />
                      </div>
                      <div className="field">
                        <label className="field-label">Tax Amt</label>
                        <div className="line-total">{(p.qty * p.price * (p.tax / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div className="field">
                        <label className="field-label">Total</label>
                        <div className="line-total">{(p.qty * p.price + (p.qty * p.price * (p.tax / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="add-product-btn" onClick={addProduct}>
                <Plus size={20} /> Add Product
              </button>
            </section>

            {/* Signatures Card */}
            <section className="form-card">
              <div className="form-card-header">
                <span className="form-card-icon">✍️</span>
                <h2 className="form-card-title">Signatures</h2>
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '10px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="signature"
                    value="rehman"
                    checked={signature === 'rehman'}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                  Signature Rehman
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="signature"
                    value="yasir"
                    checked={signature === 'yasir'}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                  Signature Yasir
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="signature"
                    value=""
                    checked={signature === ''}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                  None
                </label>
              </div>
            </section>

            {/* Summary Card */}
            <section className="summary-card">
              <div className="summary-row">
                <span>Sub Total</span>
                <span>PKR {fmt(subTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Total Tax Amount</span>
                <span>PKR {fmt(totalProductTax)}</span>
              </div>
              {otherTaxPercent > 0 && (
                <div className="summary-row">
                  <span>Other Tax ({otherTaxPercent}%)</span>
                  <span>PKR {fmt(otherTaxAmount)}</span>
                </div>
              )}
              {otherCharges > 0 && (
                <div className="summary-row">
                  <span>Other Charges</span>
                  <span>PKR {fmt(otherCharges)}</span>
                </div>
              )}
              <div className="summary-row grand-total-row">
                <span>Grand Total</span>
                <span>PKR {fmt(grandTotal)}</span>
              </div>
              <div className="summary-actions">
                <button className="action-btn download-btn" style={{ flex: 1 }} onClick={handleDownloadPDF}>
                  <Download size={18} /> Download PDF
                </button>
                <button className="action-btn print-btn" style={{ flex: 1 }} onClick={handlePrint}>
                  <Printer size={18} /> Print
                </button>
                <button className="action-btn whatsapp-btn" style={{ flex: 1 }} onClick={handleShareWhatsApp}>
                  <Share2 size={18} /> WhatsApp
                </button>
              </div>
            </section>

          </div>
        )}

        {/* ════ PREVIEW VIEW ════ */}
        <div className="preview-wrapper" style={{ display: view === 'preview' ? 'block' : 'none' }}>
          <div className="invoice-container" ref={invoiceRef}>
              {/* Header Image */}
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

              {/* Buyer Details */}
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

              {/* Table */}
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>No.</th>
                    <th>Product</th>
                    <th>UOM</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Tax %</th>
                    <th>Tax Amt</th>
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
                      <td className="bold-val">{(p.qty * p.price).toLocaleString()}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 10 - products.length) }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td style={{ textAlign: 'center' }}>{products.length + i + 1}</td>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
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
                            <img
                              src={signature === 'rehman' ? sigRehman : sigYasir}
                              alt="Signature"
                              style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', maxHeight: '95px', maxWidth: '220px' }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Sub Total</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(subTotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Total Tax Amount</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(totalProductTax)}</td>
                  </tr>
                  {otherTaxPercent > 0 && (
                  <tr>
                    <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Other Tax ({otherTaxPercent}%)</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(otherTaxAmount)}</td>
                  </tr>
                  )}
                  {otherCharges > 0 && (
                  <tr>
                    <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Other Charges</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(otherCharges)}</td>
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
        </div>

        {/* Always-rendered hidden invoice for print/download when on form tab */}
        {view === 'form' && (
          <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '780px', zIndex: -1 }}>
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
                <thead><tr>
                    <th style={{ width: '40px' }}>No.</th>
                    <th>Product</th>
                    <th>UOM</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Tax %</th>
                    <th>Tax Amt</th>
                    <th>Total</th>
                  </tr></thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td className="product-col">{p.name}</td>
                      <td className="bold-val">{p.uom}</td>
                      <td className="bold-val">{p.qty}</td>
                      <td className="bold-val">{p.price.toLocaleString()}</td>
                      <td className="bold-val">{(p.qty * p.price).toLocaleString()}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 10 - products.length) }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td style={{ textAlign: 'center' }}>{products.length + i + 1}</td>
                      <td>&nbsp;</td><td></td><td></td><td></td>
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
                            <img
                              src={signature === 'rehman' ? sigRehman : sigYasir}
                              alt="Signature"
                              style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', maxHeight: '95px', maxWidth: '220px' }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Sub Total</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(subTotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Total Tax Amount</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(totalProductTax)}</td>
                  </tr>
                  {otherTaxPercent > 0 && (
                  <tr>
                    <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Other Tax ({otherTaxPercent}%)</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(otherTaxAmount)}</td>
                  </tr>
                  )}
                  {otherCharges > 0 && (
                  <tr>
                    <td colSpan="6" style={{ border: 'none', borderRight: '1px solid #ccc' }}></td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>Other Charges</td>
                    <td style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' }}>{fmt(otherCharges)}</td>
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
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
