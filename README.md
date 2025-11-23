# TESSERA

**Transformative Engineering for Scholarly Synthesis & Research Architecture**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Quarto](https://img.shields.io/badge/Made%20with-Quarto-blue)](https://quarto.org)
[![Python](https://img.shields.io/badge/Python-3.9+-blue)](https://python.org)
[![uv](https://img.shields.io/badge/Managed%20by-uv-purple)](https://github.com/astral-sh/uv)

---

## 🎯 Vision

TESSERA is an **autonomous research synthesis machine** that transforms raw analytical work into publication-quality research across domains. Like mosaic tiles forming a greater picture, TESSERA assembles scattered experiments, notebooks, and analyses into cohesive, professional publications.

**Current State:** Foundational demonstrations from academic research (AI, data analytics, manufacturing, public policy)  
**Future Vision:** Self-improving synthesis system applicable across engineering domains—AI, biomedical research, pharmaceutical development, materials science, and beyond.

The system doesn't just organize research—it actively synthesizes, visualizes, and presents findings with publication-grade quality, transforming months of exploratory work into comprehensive papers in hours.

---

## 🧬 Core Philosophy

**From Fragments to Knowledge:**

Traditional research workflows scatter insights across notebooks, scripts, and visualizations. Researchers spend months organizing, refining, and documenting findings. TESSERA inverts this: feed it raw analytical work, and it produces publication-ready research with professional visualizations, statistical rigor, and narrative coherence.

**Self-Improving Architecture:**

Each publication cycle improves the system. Visualization patterns discovered in manufacturing analytics inform biological research papers. Statistical frameworks from ML classification generalize to pharmaceutical trials. Network analysis methods apply equally to protein interactions and supply chains.

**Domain Agnostic:**

TESSERA doesn't care if you're analyzing:
- 🧬 **Biomedical**: Protein folding patterns, clinical trial data, genomic sequences
- 🏭 **Manufacturing**: Process optimization, quality control, supply chain analytics
- 💊 **Pharmaceutical**: Drug efficacy studies, adverse event patterns, molecular synthesis
- 🤖 **AI/ML**: Model architectures, training dynamics, deployment analytics
- 📊 **Any quantitative field**: If you generate data and insights, TESSERA synthesizes them into publications

---

## 📚 Foundational Demonstrations

### Current Publications (Proof of Concept)

These four publications demonstrate TESSERA's synthesis capabilities across diverse domains:

#### 1. **Predicting Song Popularity on Spotify** (659 KB, 7 visualizations)
**Domain**: Machine Learning & Statistical Modeling

- Binary classification with genre×audio interaction modeling
- ROC AUC 0.675 with 5-fold cross-validation
- **Demonstrates**: Conditional distributions, progressive model development, interaction effects

#### 2. **Manufacturing Process Analytics** (682 KB, 8 visualizations)
**Domain**: Industrial Engineering & Data Integration

- Multi-source integration (45K observations from 5 data sources)
- Discovered cyclical quality failure pattern (every 8 batches)
- **Demonstrates**: PCA, clustering methodology, supplier analysis, quality heatmaps

#### 3. **Data-Driven Fire Safety Analytics** (183 KB, 5 visualizations)
**Domain**: Public Policy & Applied Analytics

- 930,808 emergency dispatch records analyzed
- $225M false alarm cost quantified with policy recommendations
- **Demonstrates**: Geospatial analysis, temporal decomposition, impact quantification

#### 4. **Network Centrality in College Football** (124 KB, 3 visualizations)
**Domain**: Network Science & Graph Theory

- 115-team competition network analysis
- Degree vs. betweenness centrality comparison
- **Demonstrates**: Graph algorithms generalizable to biological networks, supply chains, collaborations

**Total**: 1.6 MB, 23 professional visualizations, 4 complete research narratives

---

## 🛠️ Technical Architecture

### Synthesis Pipeline

```
Raw Work → TESSERA → Publication
(notebooks)         (research paper)
```

**What TESSERA Does:**

1. **Extracts**: Pulls findings from Jupyter notebooks, Python scripts, data analyses
2. **Synthesizes**: Generates narrative structure (Abstract → Introduction → Methods → Results → Discussion → Conclusion)
3. **Visualizes**: Creates publication-quality charts following professional standards
4. **Formats**: LaTeX tables, citations, academic typography
5. **Outputs**: PDF publications ready for arxiv, journals, portfolios, GitHub Pages

### Technology Stack

**Publication Generation:**
- **Quarto** - Markdown → LaTeX → PDF pipeline
- **Python** - matplotlib, seaborn, NetworkX, plotly for visualizations
- **uv** - Reproducible dependency management
- **LaTeX** - Professional typography and tables

**Web Deployment:**
- **GitHub Pages** - Portfolio showcase ([view live](https://yevheniyc.github.io/tessera/))
- **Gradio** - Interactive dashboards for Hugging Face Spaces
- **HTML/CSS** - Custom landing pages with detail views

### Shared Infrastructure

TESSERA uses workspace-level infrastructure (`../quarto/`) reusable across all research projects:

- `_diagram_style.py` - Professional Plotly visualization helpers
- `RESEARCH_GUIDELINES.md` - Publication standards and formatting rules
- `scripts/generate_pdfs.sh` - Automated PDF generation
- `template_quarto.yml` - Reusable publication configuration

This architecture enables: **Write analysis once → Generate publications anywhere**

---

## 📖 Building Publications

### Generate PDFs

```bash
# Generate all publications
make pdf

# Generate specific publication
make pdf spotify_popularity
make pdf manufacturing_analytics
make pdf fire_safety_dashboard
make pdf network_analysis

# View available commands
make help
```

Output PDFs appear in `publications/pdf/`

### Prerequisites

```bash
# Install Quarto
brew install --cask quarto

# Install Python dependencies
uv sync
```

---

## 📂 Repository Structure

```
tessera/
├── publications/              # 📄 Research papers (Quarto .qmd → PDF)
│   ├── spotify_popularity/
│   ├── manufacturing_analytics/
│   ├── fire_safety_dashboard/
│   ├── network_analysis/
│   └── pdf/                  # Generated PDFs
│
├── notebooks/                 # 📓 Source analytical work
│   ├── project_1_eda/
│   ├── project_2_machines/
│   ├── project_3_spotify/
│   └── ...
│
├── docs/                      # 🌐 GitHub Pages site
│   ├── index.html            # Portfolio landing
│   ├── [publication].html    # Detail pages
│   └── publications/         # PDFs for web viewing
│
├── huggingface_spaces/        # 🤗 Deployable apps
│   └── fire-safety-dashboard/
│
├── Makefile                   # Build commands
├── pyproject.toml            # uv dependencies
└── README.md                 # This file
```

---

## 🚀 Future Directions

### Expansion Domains

**Biomedical Research:**
- Clinical trial analysis pipelines
- Protein structure pattern recognition
- Genomic sequence clustering
- Drug interaction network analysis

**Manufacturing & Industrial:**
- Real-time quality control synthesis
- Supply chain optimization publications
- Process parameter relationship discovery
- Predictive maintenance analysis

**Pharmaceutical Development:**
- Adverse event pattern detection
- Molecular synthesis pathway analysis
- Drug efficacy meta-analyses
- Regulatory submission documentation

**AI/ML Research:**
- Model architecture comparisons
- Training dynamics visualization
- Deployment performance analysis
- Benchmark result synthesis

### System Evolution

**Self-Improvement Mechanisms:**

1. **Pattern Library**: Successful visualization patterns (e.g., conditional distributions for classification) automatically become templates
2. **Narrative Templates**: Effective discussion structures get extracted and reused
3. **Statistical Frameworks**: Analysis workflows (e.g., elbow method → clustering → validation) become reusable pipelines
4. **Domain Transfer**: Methods proven in one field (network centrality in sports) auto-suggest for new domains (protein interactions)

**Autonomous Features (Roadmap):**

- Automatic finding extraction from notebook outputs
- Intelligent chart selection based on data types and research questions
- Citation recommendation from related work
- Multi-publication meta-analysis (synthesizing across your own papers)
- Collaborative synthesis (combining work from multiple researchers)

---

## 🎓 Academic Context

**Current Foundation:**  
University of Pittsburgh | Master of Data Science (MDS)  
Specialization: Applied Data Science & Machine Learning

**Courses Informing System:**
- Introduction to Data Science & Computing
- Data Visualization
- Predictive Modeling
- Network Analysis
- Geospatial Analytics

These foundational publications demonstrate TESSERA's capabilities across:
- Supervised learning (classification, regression)
- Unsupervised learning (clustering, dimensionality reduction)
- Network science (graph theory, centrality metrics)
- Geospatial analysis (temporal/spatial patterns)
- Applied analytics (policy impact quantification)

---

## 🌐 Live Deployments

**GitHub Pages**: [yevheniyc.github.io/tessera](https://yevheniyc.github.io/tessera/)  
Portfolio showcase with publication previews and PDFs

**Hugging Face Spaces**: [Coming Soon]  
Interactive Fire Safety Analytics Dashboard

---

## 📧 Contact

**Yevheniy Chuba**  
Founder & CEO, YoreAI  
AI Research & ML Data Scientist, Abridge AI

**LinkedIn**: [yev-chuba](https://www.linkedin.com/in/yev-chuba-57518434/)  
**GitHub**: [yevheniyc](https://github.com/yevheniyc)  
**Institution**: University of Pittsburgh | Master of Data Science

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**TESSERA**: Assembling the mosaic of research, one tile at a time. 🧩

**Version**: 1.0.0  
**Last Updated**: November 2025

_Transforming raw analytical work into publication-quality research across all engineering domains._
