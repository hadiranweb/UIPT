.PHONY: build-core build-frontend setup test

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
test:
	@echo "Running Integrated Tests..."
	cargo test --manifest-path backend/Cargo.toml
	pnpm test

# Clean build artifacts
clean:
	@echo "Cleaning artifacts..."
	rm -rf backend/target
	rm -rf frontend/packages/rts-core-wasm
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
