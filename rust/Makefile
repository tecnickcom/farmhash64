# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------


SHELL=/bin/bash
.SHELLFLAGS=-o pipefail -c

# Project name
PROJECT=farmhash64

# Project version
VERSION=$(shell cat ../VERSION)

# Project release number (packaging build number)
# RELEASE=$(shell cat ../RELEASE)

# --- MAKE TARGETS ---

# Display general help about this command
.PHONY: 
help:
	@echo ""
	@echo "$(PROJECT) Rust Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make build   : Build the library"
	@echo "    make clean   : Remove any build artifact"
	@echo "    make doc     : Generate source code documentation"
	@echo "    make format  : Format the source code"
	@echo "    make test    : Run the unit tests"
	@echo "    make version : Set version from VERSION file"
	@echo ""

.PHONY: all
all: clean version format test build doc

# Build the library
.PHONY: build
build:
	@mkdir -p target
	cargo build --release

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf target

# Generate source code documentation
.PHONY: doc
doc:
	cargo doc --no-deps

# Format the source code
.PHONY: format
format:
	cargo fmt

# Build and run the unit tests
.PHONY: test
test:
	cargo test

# Set the version from VERSION file
.PHONY: version
version:
	sed -i "s/version.*=.*$$/version = \"$(VERSION)\"/" Cargo.toml
