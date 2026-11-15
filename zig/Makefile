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
all: clean version format linter test coverage build

## Build the library
.PHONY: build
build:
	zig build

## Remove any build artifact
.PHONY: clean
clean:
	rm -rf zig-* .zig-cache

## Format the source code
.PHONY: format
format:
	zig fmt src/*.zig

## Lint the source code (check formatting)
.PHONY: linter
linter:
	zig fmt --check src/*.zig

# The test binary is built with -fllvm because kcov cannot read the debug info
# emitted by the self-hosted backend.
## Run the unit tests under kcov and check for 100% code coverage (kcov is optional)
.PHONY: coverage
coverage:
	@if ! command -v kcov >/dev/null 2>&1; then \
		if [ -n "$$CI" ]; then echo "ERROR: kcov is required to enforce the coverage gate in CI"; exit 1; fi; \
		echo "kcov not found: skipping Zig coverage check (install kcov to enable it)"; \
		exit 0; \
	fi; \
	rm -rf zig-out/coverage; \
	mkdir -p zig-out; \
	zig test --test-no-exec -fllvm -femit-bin=zig-out/test_farmhash64 src/test_farmhash64.zig; \
	kcov --include-pattern=src/farmhash64.zig --exclude-pattern=test_farmhash64.zig --clean zig-out/coverage ./zig-out/test_farmhash64; \
	covered=$$(grep -oE '"percent_covered" *: *"[0-9.]+"' zig-out/coverage/test_farmhash64/coverage.json | grep -oE '[0-9.]+' | head -1); \
	echo "Coverage: $$covered%"; \
	awk -v c="$$covered" 'BEGIN { exit (c + 0 < 100) ? 1 : 0 }' || { echo "ERROR: coverage $$covered% is below 100%"; exit 1; }

## Build and run the unit tests
.PHONY: test
test:
	zig test src/test_farmhash64.zig

## Set the version from VERSION file
.PHONY: version
version:
	sed $(SEDINPLACE) "s/^\( *\.version *= *\).*$$/\1\"$(VERSION)\",/" build.zig.zon
