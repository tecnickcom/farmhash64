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
	@if [ -t 1 ] && [ -z "$${NO_COLOR:-}" ]; then \
		B=$$(printf '\033[1m'); C=$$(printf '\033[36m'); Y=$$(printf '\033[33m'); D=$$(printf '\033[2m'); R=$$(printf '\033[0m'); \
	else \
		B=''; C=''; Y=''; D=''; R=''; \
	fi; \
	printf "\n%s%s%s\n" "$$B" "$(PROJECT)" "$$R"; \
	printf "\n%sUsage:%s make %s<target>%s\n\n" "$$Y" "$$R" "$$C" "$$R"; \
	printf "%sTargets:%s\n" "$$Y" "$$R"; \
	awk -v c="$$C" -v r="$$R" '/^## /{desc=substr($$0,4)} /^\.PHONY:/{if(NF>1){if(desc){n++; t[n]=$$2; d[n]=desc; if(length($$2)>w) w=length($$2)} desc=""}} END{fmt="  %s%-" w "s%s  %s\n"; for(i=1;i<=n;i++) printf fmt,c,t[i],r,d[i]}' Makefile; \
	echo ""

all: clean build linter test coverage

## Build the library
.PHONY: build
build:
	./gradlew jar

## Remove any build artifact
.PHONY: clean
clean:
	./gradlew clean

## Run the static analysis (SpotBugs)
.PHONY: linter
linter:
	./gradlew spotbugsMain spotbugsTest

## Run the unit tests
.PHONY: test
test:
	./gradlew test

## Run the unit tests and check for 100% code coverage (JaCoCo)
.PHONY: coverage
coverage:
	./gradlew jacocoTestReport jacocoTestCoverageVerification

## Update gradle wrapper to the latest version
.PHONY: updategradle
updategradle:
	./gradlew wrapper --gradle-version latest
