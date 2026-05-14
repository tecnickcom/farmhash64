# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

SHELL=/bin/bash
.SHELLFLAGS=-o pipefail -c

# Project name
PROJECT=farmhash64

# Current directory
CURRENTDIR=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# Target directory
TARGETDIR=$(CURRENTDIR)target

# PHP binary
PHP=$(shell which php)

# Composer executable (disable APC to as a work-around of a bug)
COMPOSER=$(PHP) -d "apc.enable_cli=0" $(shell which composer)

# phpDocumentor executable file
PHPDOC=$(shell which phpDocumentor)

# Display general help about this command
.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@awk '/^## /{desc=substr($$0,4)} /^\.PHONY:/{if(NF>1) {target=$$2; if(desc) printf "  make %-15s: %s\n",target,desc; desc=""}}' Makefile
	@echo ""

all: clean build

## Build a minified version of the library
.PHONY: build
build: deps lint test

## Remove any build artifact
.PHONY: clean
clean:
	rm -rf ./vendor $(TARGETDIR)

## Clean all artifacts and download all dependencies
.PHONY: deps
deps: ensuretarget
	rm -rf ./vendor/*
	($(COMPOSER) install -vvv --no-interaction)
	curl --proto '=https' --tlsv1.2 --silent --show-error --fail --location https://carthage.software/mago.sh | bash -s -- --install-dir=./vendor/bin

## Generate source code documentation
.PHONY: doc
doc: ensuretarget
	rm -rf $(TARGETDIR)/doc
	$(PHPDOC) -d ./src -t $(TARGETDIR)/doc/

## Create missing target directories for test and build artifacts
.PHONY: ensuretarget
ensuretarget:
	mkdir -p $(TARGETDIR)/test
	mkdir -p $(TARGETDIR)/report
	mkdir -p $(TARGETDIR)/doc

## Format the source code
.PHONY: format
format:
	./vendor/bin/mago fmt src test

## Analyze and Lint the source code
.PHONY: lint
lint:
	./vendor/bin/mago analyze src test
	./vendor/bin/mago lint src test

## Run unit tests
.PHONY: test
test:
	cp phpunit.xml.dist phpunit.xml
	#./vendor/bin/phpunit --migrate-configuration || true
	XDEBUG_MODE=coverage ./vendor/bin/phpunit --stderr test
