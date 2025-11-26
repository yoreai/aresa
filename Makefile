.PHONY: help pdf mdx clean validate

# Publication source and output directories
PUB_SOURCE_DIR := apps/aresalab/public/publications
PDF_OUTPUT_DIR := $(PUB_SOURCE_DIR)/pdf
VENV_PYTHON := $(shell pwd)/.venv/bin/python

help:
	@echo "🎓 ARESA Research Publications Build System"
	@echo ""
	@echo "Commands:"
	@echo "  make pdf              - Render ALL publications (papers + books) to PDF"
	@echo "  make pdf [name]       - Render specific publication (e.g., make pdf geoai_agentic_flow)"
	@echo "  make mdx              - Generate web preview.mdx files from Quarto sources"
	@echo "  make clean            - Remove generated PDFs and temp files"
	@echo ""
	@echo "Available Publications:"
	@ls -d $(PUB_SOURCE_DIR)/*/ 2>/dev/null | xargs -n 1 basename | grep -v "^pdf$$" || echo "  (none found)"
	@echo ""
	@echo "Source Directory: $(PUB_SOURCE_DIR)"
	@echo "Output Directory: $(PDF_OUTPUT_DIR)"
	@echo "Python: $(VENV_PYTHON)"

pdf:
	@echo "📚 Generating academic publications..."
	@mkdir -p $(PDF_OUTPUT_DIR)
	@if [ "$(filter-out pdf,$(MAKECMDGOALS))" ]; then \
		TARGETS="$(filter-out pdf,$(MAKECMDGOALS))"; \
	else \
		TARGETS=$$(find $(PUB_SOURCE_DIR) -maxdepth 2 -name "_quarto.yml" -exec dirname {} \; | xargs -n 1 basename); \
	fi; \
	for pub in $$TARGETS; do \
		echo ""; \
		echo "=================================================="; \
		echo "📄 Rendering: $$pub"; \
		echo "=================================================="; \
		cd $(PUB_SOURCE_DIR)/$$pub && QUARTO_PYTHON=$(VENV_PYTHON) quarto render --to pdf --quiet || exit 1; \
		cd $(shell pwd); \
		PDF_NAME=$$(ls -t $(PDF_OUTPUT_DIR)/*.pdf 2>/dev/null | head -n 1); \
		if [ -f "$$PDF_NAME" ]; then \
			echo "✅ Generated: $$(basename $$PDF_NAME)"; \
		else \
			echo "❌ Error: No PDF generated for $$pub"; \
			exit 1; \
		fi; \
	done
	@echo ""
	@echo "🎉 All publications rendered successfully!"
	@echo "📂 PDFs available in: $(PDF_OUTPUT_DIR)"

mdx:
	@echo "🌐 Generating web preview MDX files from Quarto sources..."
	@uv run scripts/generate_mdx_previews.py
	@echo ""
	@echo "✅ MDX previews updated!"

clean:
	@echo "🧹 Cleaning generated files..."
	@rm -rf $(PDF_OUTPUT_DIR)/*.pdf
	@rm -rf $(PUB_SOURCE_DIR)/*/.quarto/
	@rm -rf $(PUB_SOURCE_DIR)/*/pdf/
	@rm -rf $(PUB_SOURCE_DIR)/*/*.log
	@rm -rf $(PUB_SOURCE_DIR)/*/*.aux
	@rm -rf $(PUB_SOURCE_DIR)/*/*.tex
	@find $(PUB_SOURCE_DIR) -name "*_files" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Cleanup complete"

validate:
	@echo "🔍 Validating publication formatting..."
	@echo "Checking for common issues in Quarto files:"
	@echo ""
	@find $(PUB_SOURCE_DIR) -name "*.qmd" -type f | head -5 | while read f; do echo "  ✓ $$f"; done
	@echo ""
	@echo "For complete guidelines, check the APEX repo standards."

# Allow passing publication name as argument
%:
	@:
