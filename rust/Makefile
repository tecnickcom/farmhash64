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
	@if [ -t 1 ] && [ -z "$${NO_COLOR:-}" ]; then \
		B=$$(printf '\033[1m'); C=$$(printf '\033[36m'); Y=$$(printf '\033[33m'); D=$$(printf '\033[2m'); R=$$(printf '\033[0m'); \
	else \
		B=''; C=''; Y=''; D=''; R=''; \
	fi; \
	printf "\n%s%s%s %s(v%s)%s\n" "$$B" "$(PROJECT)" "$$R" "$$D" "$(VERSION)" "$$R"; \
	printf "\n%sUsage:%s make %s<target>%s\n\n" "$$Y" "$$R" "$$C" "$$R"; \
	printf "%sTargets:%s\n" "$$Y" "$$R"; \
	awk -v c="$$C" -v r="$$R" '/^## /{desc=substr($$0,4)} /^\.PHONY:/{if(NF>1){if(desc){n++; t[n]=$$2; d[n]=desc; if(length($$2)>w) w=length($$2)} desc=""}} END{fmt="  %s%-" w "s%s  %s\n"; for(i=1;i<=n;i++) printf fmt,c,t[i],r,d[i]}' Makefile; \
	echo ""

.PHONY: all
all: clean version format linter test coverage build doc

## Build the library
.PHONY: build
build:
	@mkdir -p target
	cargo build --release

## Remove any build artifact
.PHONY: clean
clean:
	rm -rf target

## Install the coverage tooling
.PHONY: deps
deps:
	rustup component add llvm-tools-preview
	cargo install cargo-llvm-cov --locked

## Generate source code documentation
.PHONY: doc
doc:
	cargo doc --no-deps

## Format the source code
.PHONY: format
format:
	cargo fmt

## Lint the source code with clippy
.PHONY: linter
linter:
	cargo clippy --all-targets --all-features -- -D warnings

## Build and run the unit tests
.PHONY: test
test:
	cargo test

## Run the unit tests and check for 100% code coverage
.PHONY: coverage
coverage:
	cargo llvm-cov --all-features --fail-under-lines 100 --fail-under-functions 100 --fail-under-regions 100

## Set the version from VERSION file
.PHONY: version
version:
	sed $(SEDINPLACE) "0,/^version = /s/^version = .*$$/version = \"$(VERSION)\"/" Cargo.toml
