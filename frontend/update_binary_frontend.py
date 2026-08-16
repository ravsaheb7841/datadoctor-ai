from pathlib import Path

path = Path("src/pages/CleaningCenter.js")
content = path.read_text(encoding="utf-8")

# Add binary to type colors
old = "  ordinal: 'bg-pink-100 text-pink-800',"
new = """  ordinal: 'bg-pink-100 text-pink-800',
  binary: 'bg-indigo-100 text-indigo-800',"""

if old in content:
    content = content.replace(old, new)
    print("✅ Binary color added")
else:
    print("⚠️ Binary color target not found")


# Add binary to methods map
old = "      ordinal: ['median', 'mode', 'forward_fill', 'backward_fill', 'drop_rows', 'custom'],"
new = """      ordinal: ['median', 'mode', 'forward_fill', 'backward_fill', 'drop_rows', 'custom'],
      binary: ['mode', 'forward_fill', 'backward_fill', 'drop_rows', 'custom'],"""

if old in content:
    content = content.replace(old, new)
    print("✅ Binary methods added")
else:
    print("⚠️ Binary methods target not found")


# Add binary to defaults
old = "      ordinal: 'median',"
new = """      ordinal: 'median',
      binary: 'mode',"""

if old in content:
    content = content.replace(old, new)
    print("✅ Binary default added")
else:
    print("⚠️ Binary default target not found")


# Add Binary to type override dropdown
old = '                          <option value="ordinal">Ordinal</option>'
new = """                          <option value="ordinal">Ordinal</option>
                          <option value="binary">Binary</option>"""

if old in content:
    content = content.replace(old, new)
    print("✅ Binary dropdown option added")
else:
    print("⚠️ Binary dropdown target not found")


path.write_text(content, encoding="utf-8")

print("✅ Frontend binary type update completed")
