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
all: clean version format linter test

# Build the library
.PHONY: build
build:
	zig build

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf zig-*

# Format the source code
.PHONY: format
format:
	zig fmt src/*.zig

## Lint the source code (check formatting)
.PHONY: linter
linter:
	zig fmt --check src/*.zig

## Run the unit tests under kcov and check for 100% code coverage
.PHONY: coverage
coverage:
	rm -rf zig-out/coverage
	mkdir -p zig-out
	zig test --test-no-exec -femit-bin=zig-out/test_farmhash64 src/test_farmhash64.zig
	kcov --include-pattern=src/farmhash64.zig --exclude-pattern=test_farmhash64.zig --clean zig-out/coverage ./zig-out/test_farmhash64
	@covered=$$(grep -oE '"percent_covered" *: *"[0-9.]+"' zig-out/coverage/test_farmhash64/coverage.json | grep -oE '[0-9.]+' | head -1); \
	echo "Coverage: $$covered%"; \
	if [ "$$covered" != "100.0" ] && [ "$$covered" != "100" ]; then echo "ERROR: coverage $$covered% is below 100%"; exit 1; fi

# Build and run the unit tests
.PHONY: test
test:
	zig test src/test_farmhash64.zig
	
# Set the version from VERSION file
.PHONY: version
version:
	sed $(SEDINPLACE) "s/version.*=.*$$/version = \"$(VERSION)\",/" build.zig.zon
