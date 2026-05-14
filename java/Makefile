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

all: clean build test

## Build the library
.PHONY: build
build:
	./gradlew jar

## Remove any build artifact
.PHONY: clean
clean:
	./gradlew clean

## Run the unit tests
.PHONY: test
test:
	./gradlew test

## Update gradle wrapper to the latest version
.PHONY: updategradle
updategradle:
	./gradlew wrapper --gradle-version latest
