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
	@echo "$(PROJECT) Zig Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make build   : Build the library"
	@echo "    make clean   : Remove any build artifact"
	@echo "    make format  : Format the source code"
	@echo "    make test    : Run the unit tests"
	@echo "    make version : Set version from VERSION file"
	@echo ""

.PHONY: all
all: clean version format test

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

# Build and run the unit tests
.PHONY: test
test:
	zig test src/test_farmhash64.zig
	
# Set the version from VERSION file
.PHONY: version
version:
	sed --in-place=.bak "s/version.*=.*$$/version = \"$(VERSION)\",/" build.zig.zon
