import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the opening of the product card inner content
content = content.replace(
    "                    <div className=\"field\" style={{ marginBottom: '12px' }}>",
    "                    <div className=\"product-body\">\n                      <div className=\"field\">",
    1
)

# Fix the textarea minHeight
content = content.replace(
    "style={{ resize: 'vertical', minHeight: '60px' }}",
    "style={{ resize: 'vertical', minHeight: '48px' }}",
    1
)

# Remove style from product-meta-grid (first occurrence)
content = content.replace(
    'className="product-meta-grid" style={{ gridTemplateColumns: \'repeat(auto-fit, minmax(100px, 1fr))\' }}',
    'className="product-meta-grid"',
    1
)

# Close the product-body div before </div> that closes product-card (first instance)
# Find the first closing pattern after product-body
idx = content.find('<div className="product-body">')
if idx != -1:
    # Find the closing: </div>\n                  </div> after this position
    close_old = '                    </div>\n                  </div>'
    close_new = '                    </div>\n                  </div>'  # same, just add one more closing
    # We need to add a </div> before the last </div> of product-card
    # Find </div> closing product-meta-grid
    meta_close = content.find('                    </div>', idx + 100)
    if meta_close != -1:
        content = content[:meta_close] + '                    </div>\n' + content[meta_close:]

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
