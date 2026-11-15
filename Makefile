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
CURRENTDIR=$(CURDIR)/

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

all: clean c cgo go java javascript php python r rust zig

## Build and test the C version
.PHONY: c
c:
	cd c && make all

## Build and test the CGO version
.PHONY: cgo
cgo:
	cd cgo && make all

## Build and test the GO version
.PHONY: go
go:
	cd go && make all

## Build and test the Java version
.PHONY: java
java:
	cd java && make all

## Build and test the Javascript version
.PHONY: javascript
javascript:
	cd javascript && make all

## Build and test the PHP version
.PHONY: php
php:
	cd php && make all

## Build and test the Python version
.PHONY: python
python:
	cd python && make all

## Build and test the R version
.PHONY: r
r:
	cd r && make all

## Build and test the Rust version
.PHONY: rust
rust:
	cd rust && make all

## Build and test the Zig version
.PHONY: zig
zig:
	cd zig && make all

## Run the unit tests for every language
.PHONY: test
test:
	cd c && make test
	cd cgo && make test
	cd go && make test
	cd java && make test
	cd javascript && make test
	cd php && make test
	cd python && make test
	cd r && make test
	cd rust && make test
	cd zig && make test

## Run the linters for every language
.PHONY: linter
linter:
	cd c && make linter
	cd cgo && make linter
	cd go && make linter
	cd java && make linter
	cd javascript && make linter
	cd php && make linter
	cd python && make linter
	cd r && make linter
	cd rust && make linter
	cd zig && make linter

## Remove any build artifact
.PHONY: clean
clean:
	rm -rf vendor composer.lock
	cd c && make clean
	cd cgo && make clean
	cd go && make clean
	cd java && make clean
	cd javascript && make clean
	cd php && make clean
	cd python && make clean
	cd r && make clean
	cd rust && make clean
	cd zig && make clean

## Tag the Git repository
.PHONY: tag
tag:
	git tag -a "v$(VERSION)" -m "Version $(VERSION)" && \
	git push origin --tags

## Increase the patch number in the VERSION file
.PHONY: versionup
versionup:
	echo ${VERSION} | gawk -F. '{printf("%d.%d.%d\n",$$1,$$2,(($$3+1)));}' > VERSION
