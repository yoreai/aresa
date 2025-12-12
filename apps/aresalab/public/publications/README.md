# AresaLab Publications (Output Directory)

**⚠️ This directory contains PUBLISHED OUTPUTS only.**

## 📁 Structure

```
publications/
├── pdf/                           # 📄 Published PDFs
│   ├── GeoAI-Agentic-Flow.pdf
│   ├── Coordinate-Embedding-Framework.pdf
│   └── ...
├── */preview.mdx                  # 🌐 Web previews for the app
└── README.md                      # This file
```

## 🔒 Source Files Location

**Publication source files are in a SEPARATE repository:**

```
~/dev/yev/quarto/publications/
├── geoai_agentic_flow/
│   ├── _quarto.yml
│   ├── index.qmd
│   ├── 1_introduction.qmd
│   └── ...
├── coordinate_embedding/
└── ...
```

The `quarto/` repo is **private** and contains:
- Raw `.qmd` Quarto markdown files
- `_quarto.yml` build configurations
- `references.bib` bibliographies
- Source images and diagrams
- Build scripts and methodology

## 🔧 Updating Publications

Publications are **NOT** generated from this directory.

**To update publications:**

```bash
# 1. Go to quarto repo
cd ~/dev/yev/quarto

# 2. Edit source files
vim publications/geoai_agentic_flow/index.qmd

# 3. Generate outputs locally
make pdf                    # PDFs → quarto/output/pdf/
make previews               # MDX → quarto/output/previews/

# 4. Review outputs
make status

# 5. Publish when ready
make publish                # Copies to this directory
```

## ❌ Do Not

- ❌ Manually edit files in this directory
- ❌ Run quarto commands here
- ❌ Expect auto-generation from this location
- ❌ Add new publications here directly

Changes will be **overwritten** on next publish from quarto.

## ✅ Do

- ✅ Edit sources in `quarto/publications/`
- ✅ Use `make publish` from quarto to update here
- ✅ Register new publications in `lib/publications.ts`

---

**Maintained by:** `quarto/` repository
**Source:** `~/dev/yev/quarto/publications/`
**Publish command:** `cd ~/dev/yev/quarto && make publish`
