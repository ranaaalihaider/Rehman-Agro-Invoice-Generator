const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  /const \[date, setDate\] = useState\(today\);\s*const \[taxPercent, setTaxPercent\] = useState\(18\);/,
  `const [date, setDate] = useState(today);
  const [applySameTax, setApplySameTax] = useState(false);
  const [sameTaxPercent, setSameTaxPercent] = useState(0);
  const [otherTaxPercent, setOtherTaxPercent] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);`
);

code = code.replace(
  /const \[products, setProducts\] = useState\(\[[\s\S]*?\]\);/,
  `const [products, setProducts] = useState([
    { id: 1, name: 'SARSABZ NP, PACKING: 50 KG BAG', uom: 'Bag', qty: 20, price: 10975, tax: 0 },
    { id: 2, name: 'UREA, PACKING: 50KG/BAG, MAKE: ENGRO/FFC', uom: 'Bag', qty: 20, price: 4800, tax: 0 },
    { id: 3, name: 'PAKARAB CAN, PACKING: 50KG/BAG', uom: 'Bag', qty: 20, price: 4375, tax: 0 },
    { id: 4, name: 'ENGRO ZARKHEZ PLUS (8:23:18), PACKING 50KG/BAG', uom: 'Bag', qty: 30, price: 12310, tax: 0 },
    { id: 5, name: 'SOP, PACKING: 25KG/BAG', uom: 'Bag', qty: 20, price: 8670, tax: 0 },
    { id: 6, name: 'ZINC 33%', uom: 'Kgs', qty: 150, price: 570, tax: 0 },
    { id: 7, name: 'FERTERA FMC MAKE: FMC', uom: 'Kgs', qty: 160, price: 380, tax: 0 },
  ]);`
);

code = code.replace(
  /setProducts\(\[\.\.\.products, \{ id: Date\.now\(\), name: '', uom: 'Nos', qty: 1, price: 0 \}\]\);/,
  `setProducts([...products, { id: Date.now(), name: '', uom: 'Nos', qty: 1, price: 0, tax: applySameTax ? sameTaxPercent : 0 }]);`
);

code = code.replace(
  /const updateProduct = \(id, field, value\) => \{\s*setProducts\(products\.map\(p => p\.id === id \? \{ \.\.\.p, \[field\]: value \} : p\)\);\s*\};/,
  `const updateProduct = (id, field, value) => {
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
  };`
);

code = code.replace(
  /const subTotal = products\.reduce\(\(sum, p\) => sum \+ \(p\.qty \* p\.price\), 0\);\s*const taxAmount = subTotal \* \(taxPercent \/ 100\);\s*const grandTotal = subTotal \+ taxAmount;/,
  `const subTotal = products.reduce((sum, p) => sum + (p.qty * p.price), 0);
  const totalProductTax = products.reduce((sum, p) => sum + (p.qty * p.price * (p.tax / 100)), 0);
  const otherTaxAmount = subTotal * (otherTaxPercent / 100);
  const grandTotal = subTotal + totalProductTax + otherTaxAmount + otherCharges;`
);

code = code.replace(
  /<div className="field">\s*<label className="field-label">Tax %<\/label>\s*<input className="field-input" type="number" value=\{taxPercent\} onChange=\{e => setTaxPercent\(Number\(e\.target\.value\)\)\} \/>\s*<\/div>/,
  `<div className="field">
                  <label className="field-label">Other Tax %</label>
                  <input className="field-input" type="number" value={otherTaxPercent} onChange={e => setOtherTaxPercent(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label className="field-label">Other Charges (Rs)</label>
                  <input className="field-input" type="number" value={otherCharges} onChange={e => setOtherCharges(Number(e.target.value))} />
                </div>`
);

code = code.replace(
  /<div className="form-card-header">\s*<span className="form-card-icon">📦<\/span>\s*<h2 className="form-card-title">Products <span className="product-count">\{products\.length\} item\{products\.length !== 1 \? 's' : ''\}<\/span><\/h2>\s*<\/div>/,
  `<div className="form-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              </div>`
);

code = code.replace(
  /<div className="product-meta-grid">\s*<div className="field">\s*<label className="field-label">UOM<\/label>\s*<input className="field-input" type="text" value=\{p\.uom\} onChange=\{e => updateProduct\(p\.id, 'uom', e\.target\.value\)\} \/>\s*<\/div>\s*<div className="field">\s*<label className="field-label">Quantity<\/label>\s*<input className="field-input" type="number" value=\{p\.qty\} onChange=\{e => updateProduct\(p\.id, 'qty', Number\(e\.target\.value\)\)\} \/>\s*<\/div>\s*<div className="field">\s*<label className="field-label">Unit Price<\/label>\s*<input className="field-input" type="number" value=\{p\.price\} onChange=\{e => updateProduct\(p\.id, 'price', Number\(e\.target\.value\)\)\} \/>\s*<\/div>\s*<div className="field">\s*<label className="field-label">Line Total<\/label>\s*<div className="line-total">PKR \{\(p\.qty \* p\.price\)\.toLocaleString\(\)\}<\/div>\s*<\/div>\s*<\/div>/g,
  `<div className="product-meta-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
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
                    </div>`
);

code = code.replace(
  /<section className="summary-card">\s*<div className="summary-row">\s*<span>Sub Total<\/span>\s*<span>PKR \{fmt\(subTotal\)\}<\/span>\s*<\/div>\s*<div className="summary-row">\s*<span>Tax \(\{taxPercent\}%\)<\/span>\s*<span>PKR \{fmt\(taxAmount\)\}<\/span>\s*<\/div>\s*<div className="summary-row grand-total-row">\s*<span>Grand Total<\/span>\s*<span>PKR \{fmt\(grandTotal\)\}<\/span>\s*<\/div>/,
  `<section className="summary-card">
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
              </div>`
);

const tableHeaderRegex = /<tr>\s*<th style=\{\{ width: '40px' \}\}>No\.<\/th>\s*<th>Product<\/th>\s*<th>UOM<\/th>\s*<th>Qty<\/th>\s*<th>Price<\/th>\s*<th>Total<\/th>\s*<\/tr>/g;
code = code.replace(tableHeaderRegex, `<tr>
                    <th style={{ width: '40px' }}>No.</th>
                    <th>Product</th>
                    <th>UOM</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Tax %</th>
                    <th>Tax Amt</th>
                    <th>Total</th>
                  </tr>`);

const tableBodyRegex = /\{products\.map\(\(p, idx\) => \([\s\S]*?<td style=\{\{ textAlign: 'center' \}\}>\{idx \+ 1\}<\/td>\s*<td className="product-col">\{p\.name\}<\/td>\s*<td className="bold-val">\{p\.uom\}<\/td>\s*<td className="bold-val">\{p\.qty\}<\/td>\s*<td className="bold-val">\{p\.price\.toLocaleString\(\)\}<\/td>\s*<td className="bold-val">\{\(p\.qty \* p\.price\)\.toLocaleString\(\)\}<\/td>\s*<\/tr>\s*\)\}\s*\{Array\.from\(\{ length: Math\.max\(0, 10 - products\.length\) \}\)\.map\(\(_, i\) => \(\s*<tr key=\{\`empty-\$\{i\}\`\}>\s*<td style=\{\{ textAlign: 'center' \}\}>\{products\.length \+ i \+ 1\}<\/td>\s*<td>&nbsp;<\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td className="bold-val">0<\/td>\s*<\/tr>\s*\)\}\)/g;

code = code.replace(tableBodyRegex, `{products.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td className="product-col">{p.name}</td>
                      <td className="bold-val">{p.uom}</td>
                      <td className="bold-val">{p.qty}</td>
                      <td className="bold-val">{p.price.toLocaleString()}</td>
                      <td className="bold-val">{p.tax}%</td>
                      <td className="bold-val">{(p.qty * p.price * (p.tax / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="bold-val">{(p.qty * p.price + (p.qty * p.price * (p.tax / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 10 - products.length) }).map((_, i) => (
                    <tr key={\`empty-\${i}\`}>
                      <td style={{ textAlign: 'center' }}>{products.length + i + 1}</td>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="bold-val">0</td>
                    </tr>
                  ))}`);

const tableFooterRegex = /<tfoot>\s*<tr>\s*<td colSpan="4"[\s\S]*?<\/td>\s*<td style=\{\{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' \}\}>Sub Total<\/td>\s*<td style=\{\{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' \}\}>\{fmt\(subTotal\)\}<\/td>\s*<\/tr>\s*<tr>\s*<td colSpan="4" style=\{\{ border: 'none', borderRight: '1px solid #ccc' \}\}><\/td>\s*<td style=\{\{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' \}\}>Tax \(\{taxPercent\}%\)<\/td>\s*<td style=\{\{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px' \}\}>\{fmt\(taxAmount\)\}<\/td>\s*<\/tr>\s*<tr>\s*<td colSpan="4" style=\{\{ border: 'none' \}\}><\/td>\s*<td style=\{\{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px', fontSize: '16px', color: '#000', borderTop: '2px solid #000', borderBottom: '2px double #000' \}\}>GRAND TOTAL<\/td>\s*<td style=\{\{ fontWeight: 'bold', textAlign: 'right', paddingRight: '15px', fontSize: '16px', color: '#000', borderTop: '2px solid #000', borderBottom: '2px double #000' \}\}>\{fmt\(grandTotal\)\}<\/td>\s*<\/tr>\s*<\/tfoot>/g;

code = code.replace(tableFooterRegex, (match, p1) => {
  return `<tfoot>
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
                </tfoot>`;
});

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx updated');
