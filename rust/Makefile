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

# sed argument for in-place substitutions
SEDINPLACE=-i
ifeq ($(shell uname -s),Darwin)
	SEDINPLACE=-i ''
endif

# --- MAKE TARGETS ---

.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@awk '/^## /{desc=substr($$0,4)} /^\.PHONY:/{if(NF>1) {target=$$2; if(desc) printf "  make %-15s: %s\n",target,desc; desc=""}}' Makefile
	@echo ""

.PHONY: all
all: clean version format test build doc

## Build the library
.PHONY: build
build:
	@mkdir -p target
	cargo build --release

## Remove any build artifact
.PHONY: clean
clean:
	rm -rf target

## Generate source code documentation
.PHONY: doc
doc:
	cargo doc --no-deps

## Format the source code
.PHONY: format
format:
	cargo fmt

## Build and run the unit tests
.PHONY: test
test:
	cargo test

## Set the version from VERSION file
.PHONY: version
version:
	sed $(SEDINPLACE) "s/version.*=.*$$/version = \"$(VERSION)\"/" Cargo.toml
