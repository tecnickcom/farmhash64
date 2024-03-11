# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

SHELL=/bin/bash
.SHELLFLAGS=-o pipefail -c

# Project name
PROJECT=farmhash64

# Display general help about this command
.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) JavaScript Makefile."
	@echo "Requires: node-js and uglify-js."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make build   : Build and test a minified version of the library"
	@echo "    make clean   : Remove any build artifact"
	@echo "    make format  : Format the source code"
	@echo "    make test    : Run the unit tests against source code"
	@echo ""

all: clean format test build

# Build a minified version of the library
.PHONY: build
build:
	@mkdir -p target/build
	uglifyjs --compress --keep-fnames --comments --output target/build/farmhash64.js src/farmhash64.js 
	cd test && node test_farmhash64.js '../target/build/farmhash64.js'

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf target

# Format the source code
.PHONY: format
format:
	js-beautify --replace src/farmhash64.js
	js-beautify --replace test/test_farmhash64.js

# Run the unit tests
.PHONY: test
test:
	cd test && node test_farmhash64.js '../src/farmhash64.js'
