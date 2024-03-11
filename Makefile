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
VERSION=$(shell cat VERSION)

# Project release number (packaging build number)
RELEASE=$(shell cat RELEASE)

# Current directory
CURRENTDIR=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# Target directory
TARGETDIR=$(CURRENTDIR)target

# --- MAKE TARGETS ---

# Display general help about this command
.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make c          : Build and test the C version"
	@echo "    make cgo        : Build and test the GO C-wrapper version"
	@echo "    make clean      : Remove any build artifact"
	@echo "    make go         : Build and test the GO version"
	@echo "    make java       : Build and test the Java version"
	@echo "    make javascript : Build and test the Javascript version"
	@echo "    make python     : Build and test the Python version"
	@echo "    make rust       : Build and test the Rust version"
	@echo "    make tag        : Tag the Git repository"
	@echo ""

all: clean c cgo go java javascript python rust

# Build and test the C version
.PHONY: c
c:
	cd c && make all

# Build and test the CGO version
.PHONY: cgo
cgo:
	cd cgo && make all

# Build and test the GO version
.PHONY: go
go:
	cd go && make all

# Build and test the Java version
.PHONY: java
java:
	cd java && make all

# Build and test the Javascript version
.PHONY: javascript
javascript:
	cd javascript && make all

# Build and test the Python version
.PHONY: python
python:
	cd python && make all

# Build and test the Rust version
.PHONY: rust
rust:
	cd rust && make all

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf target
	cd c && make clean
	cd cgo && make clean
	cd go && make clean
	cd java && make clean
	cd javascript && make clean
	cd python && make clean
	cd rust && make clean
	@mkdir -p $(TARGETDIR)

# Tag the Git repository
.PHONY: tag
tag:
	git tag -a "v$(VERSION)" -m "Version $(VERSION)" && \
	git push origin --tags
