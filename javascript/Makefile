# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

SHELL=/bin/bash
.SHELLFLAGS=-o pipefail -c

# Project name
PROJECT=farmhash64

.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@awk '/^## /{desc=substr($$0,4)} /^\.PHONY:/{if(NF>1) {target=$$2; if(desc) printf "  make %-15s: %s\n",target,desc; desc=""}}' Makefile
	@echo ""

all: clean format build

## Build a minified version of the library
.PHONY: build
build: test
	@mkdir -p target/build
	uglifyjs --compress --keep-fnames --comments --output target/build/farmhash64.js src/farmhash64.js 

## Remove any build artifact
.PHONY: clean
clean:
	rm -rf target

## Format the source code
.PHONY: format
format:
	js-beautify --replace src/farmhash64.js
	js-beautify --replace test/test_farmhash64.js

## Run the unit tests
.PHONY: test
test:
	cd test && node test_farmhash64.js '../src/farmhash64.js'
