# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

SHELL=/bin/bash
.SHELLFLAGS=-o pipefail -c

# Display general help about this command
.PHONY: help
help:
	@echo ""
	@echo "FarmHash64 Java Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make build        : Build the library"
	@echo "    make clean        : Remove any build artifact"
	@echo "    make test         : Run the unit tests against source code"
	@echo "    make updategradle : Update gradle wrapper to the latest version"
	@echo ""

all: clean build test

# Build the library
.PHONY: build
build:
	./gradlew jar

# Remove any build artifact
.PHONY: clean
clean:
	./gradlew clean

# Run the unit tests
.PHONY: test
test:
	./gradlew test

# Update gradle wrapper to the latest version
.PHONY: updategradle
updategradle:
	./gradlew wrapper --gradle-version latest
