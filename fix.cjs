const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const tableBodyRegex = /\{products\.map\(\(p, idx\) => \([\s\S]*?<td style=\{\{ textAlign: 'center' \}\}>\{idx \+ 1\}<\/td>\s*<td className="product-col">\{p\.name\}<\/td>\s*<td className="bold-val">\{p\.uom\}<\/td>\s*<td className="bold-val">\{p\.qty\}<\/td>\s*<td className="bold-val">\{p\.price\.toLocaleString\(\)\}<\/td>\s*<td className="bold-val">\{\(p\.qty \* p\.price\)\.toLocaleString\(\)\}<\/td>\s*<\/tr>\s*\)\}\s*\{Array\.from\(\{ length: Math\.max\(0, 10 - products\.length\) \}\)\.map\(\(_, i\) => \(\s*<tr key=\{\`empty-\$\{i\}\`\}>\s*<td style=\{\{ textAlign: 'center' \}\}>\{products\.length \+ i \+ 1\}<\/td>\s*<td>&nbsp;<\/td>[\s\S]*?<td className="bold-val">0<\/td>\s*<\/tr>\s*\)\}\)/g;

code = code.replace(tableBodyRegex, `{products.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td className="product-col">{p.name}</td>
                      <td className="bold-val">{p.uom}</td>
                      <td className="bold-val">{p.qty}</td>
                      <td className="bold-val">{p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

fs.writeFileSync('src/App.jsx', code);
