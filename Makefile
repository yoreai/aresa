.PHONY: help clean

# Publication output directory (receives published content from quarto/)
PUB_DIR := apps/aresalab/public/publications

help:
	@echo "🎓 ARESA Monorepo"
	@echo ""
	@echo "Publications:"
	@echo "  Publications are managed in the separate quarto/ repository."
	@echo "  To update publications:"
	@echo ""
	@echo "    cd ../quarto"
	@echo "    make pdf              # Generate PDFs"
	@echo "    make previews         # Generate web previews"
	@echo "    make publish          # Copy to aresalab"
	@echo ""
	@echo "  See ../quarto/README.md for full documentation."
	@echo ""
	@echo "Local Commands:"
	@echo "  make clean              - Remove generated files from aresalab"
	@echo ""
	@echo "Current Publications:"
	@ls -d $(PUB_DIR)/*/ 2>/dev/null | xargs -n 1 basename | grep -v "^pdf$$" || echo "  (none found)"

clean:
	@echo "🧹 Cleaning aresalab publication artifacts..."
	@rm -rf $(PUB_DIR)/*/.quarto/ 2>/dev/null || true
	@rm -rf $(PUB_DIR)/*/pdf/ 2>/dev/null || true
	@rm -rf $(PUB_DIR)/*/*.log 2>/dev/null || true
	@echo "✅ Cleanup complete"
	@echo ""
	@echo "Note: To regenerate publications, use the quarto/ repo:"
	@echo "  cd ../quarto && make all && make publish"
