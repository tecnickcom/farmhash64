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

# sed argument for in-place substitutions
SEDINPLACE=-i
ifeq ($(shell uname -s),Darwin)
	SEDINPLACE=-i ''
endif

# Directory containing the locally-installed Node.js tools
NODEBIN=./node_modules/.bin

.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@awk '/^## /{desc=substr($$0,4)} /^\.PHONY:/{if(NF>1) {target=$$2; if(desc) printf "  make %-15s: %s\n",target,desc; desc=""}}' Makefile
	@echo ""

all: clean version deps format linter coverage build

## Set the version from the VERSION file
.PHONY: version
version:
	sed $(SEDINPLACE) 's/^\(    "version": \).*$$/\1"$(VERSION)",/' package.json

## Download the Node.js dependencies
.PHONY: deps
deps:
	npm install --no-audit --no-fund

## Build a minified version of the library
.PHONY: build
build: test
	@mkdir -p target/build
	$(NODEBIN)/uglifyjs --compress --keep-fnames --comments --output target/build/farmhash64.js src/farmhash64.js

## Remove any build artifact
.PHONY: clean
clean:
	rm -rf target coverage .nyc_output

## Format the source code
.PHONY: format
format:
	$(NODEBIN)/js-beautify --replace src/farmhash64.js
	$(NODEBIN)/js-beautify --replace test/test_farmhash64.js

## Lint the source code with ESLint
.PHONY: lint
lint:
	$(NODEBIN)/eslint src test

## Alias for the lint target
.PHONY: linter
linter: lint

## Run the unit tests
.PHONY: test
test:
	cd test && node test_farmhash64.js '../src/farmhash64.js'

## Run the unit tests and check for 100% code coverage
.PHONY: coverage
coverage:
	$(NODEBIN)/c8 --include=src/farmhash64.js --all --check-coverage --lines=100 --branches=100 --functions=100 --statements=100 node test/test_farmhash64.js ../src/farmhash64.js
