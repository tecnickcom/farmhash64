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
	@echo "$(PROJECT) PHP Makefile."
	@echo "Requires: node-js and uglify-js."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make build   : Build and test"
	@echo "    make clean   : Remove any build artifact"
	@echo ""

all: clean build

# Build a minified version of the library
.PHONY: build
build: deps lint test

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf ./vendor $(TARGETDIR)

# Fix code style violations
.PHONY: codefix
codefix:
	./vendor/bin/phpcbf --ignore="./vendor/" --standard=psr12 src test

# Clean all artifacts and download all dependencies
.PHONY: deps
deps: ensuretarget
	rm -rf ./vendor/*
	($(COMPOSER) install -vvv --no-interaction)
	curl --silent --show-error --fail --location --output ./vendor/phpstan.phar https://github.com/phpstan/phpstan/releases/download/1.10.41/phpstan.phar \
	&& chmod +x ./vendor/phpstan.phar

# Generate source code documentation
.PHONY: doc
doc: ensuretarget
	rm -rf $(TARGETDIR)/doc
	$(PHPDOC) -d ./src -t $(TARGETDIR)/doc/

# Create missing target directories for test and build artifacts
.PHONY: ensuretarget
ensuretarget:
	mkdir -p $(TARGETDIR)/test
	mkdir -p $(TARGETDIR)/report
	mkdir -p $(TARGETDIR)/doc

# Test source code for coding standard violations
.PHONY: lint
lint:
	./vendor/bin/phpcs --ignore="./vendor/" --standard=phpcs.xml src test
	./vendor/bin/phpmd src text unusedcode,design --exclude vendor
	./vendor/bin/phpmd test text unusedcode,design
	php -r 'exit((int)version_compare(PHP_MAJOR_VERSION, "7", ">"));' || ./vendor/phpstan.phar analyse

# Run unit tests
.PHONY: test
test:
	cp phpunit.xml.dist phpunit.xml
	#./vendor/bin/phpunit --migrate-configuration || true
	XDEBUG_MODE=coverage ./vendor/bin/phpunit --stderr test
