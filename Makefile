.PHONY: build-core build-frontend setup test check-correctness clean
# ONSOUR Unified Foundation Level 1.2 Makefile

# Default target
all: setup build-core build-frontend

# Initial setup
setup:
	@echo "Setting up ONSOUR Foundation..."
	pnpm install
	rustup target add wasm32-unknown-unknown
	cargo install wasm-pack || true

# Build the Tanh-Brain Rust Core into WASM
build-core:
	@echo "Building Tanh-Brain Core (Rust -> WASM)..."
	cd backend/core/rts_core && wasm-pack build --target web --out-dir ../../../frontend/packages/rts-core-wasm

# Build the Frontend apps
build-frontend:
	@echo "Building Frontend Applications..."
	pnpm build

# Run all tests (Rust & TS)
test: check-correctness
	@echo "Running Integrated Tests..."
	cargo test --manifest-path backend/Cargo.toml
	pnpm test

# Explicitly check for Correctness Invariants (Layout & Determinism)
check-correctness:
	@echo "Verifying Correctness Invariants (v1.2)..."
	cd theory/python_reference && python3 generate_test_vectors.py
	cargo test --manifest-path backend/Cargo.toml --test memory_layout --test numeric_equivalence -- --nocapture

# Clean build artifacts
clean:
	@echo "Cleaning artifacts..."
	rm -rf backend/target
	rm -rf frontend/packages/rts-core-wasm
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
