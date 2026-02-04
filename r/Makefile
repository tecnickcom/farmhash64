# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

# Install R in Ubuntu/Debian:
# sudo apt install r-base libfontconfig1-dev libcurl4-openssl-dev libharfbuzz-dev libfribidi-dev libfreetype6-dev libpng-dev libtiff5-dev libjpeg-dev
# sudo Rscript -e "install.packages(c('Rcpp', 'base', 'devtools', 'inline', 'renv', 'ragg', 'roxygen2', 'testthat', 'pkgdown', 'libgfortran-ng'), repos = 'http://cran.us.r-project.org')"

SHELL=/bin/bash
.SHELLFLAGS=-o pipefail -c

# Project name
PROJECT=farmhash64

# Project version
VERSION=$(shell cat ../VERSION)

# Project release number (packaging build number)
RELEASE=$(shell cat ../RELEASE)

# Current directory
CURRENTDIR=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# --- MAKE TARGETS ---

# Display general help about this command
.PHONY: help
help:
	@echo ""
	@echo "farmhash64 R Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make build   : Build the library"
	@echo "    make test    : Test the library"
	@echo "    make format  : Format the source code"
	@echo "    make clean   : Remove any build artifact"
	@echo "    make devdoc  : Generate documentation"
	@echo ""

all: clean version format build test

# Set the version from VERSION file
.PHONY: version
version:
	sed --in-place=.bak "s/Version:.*$$/Version: $(VERSION).$(RELEASE)/" farmhash64/DESCRIPTION

# Build the library
.PHONY: build
build: version
	cd farmhash64 \
	&& cp ../../LICENSE . \
	&& R -e 'renv::settings$$snapshot.type("implicit");renv::init();renv::snapshot();'
	R -e 'setwd("./farmhash64");renv::restore();library(devtools);library(roxygen2);pkgbuild::build();'

.PHONY: test
test:
	R -e 'setwd("./farmhash64");renv::restore();library(devtools);devtools::document();library(stringi);library(testthat);testthat::test_dir("tests")'

# Format the source code
.PHONY: format
format:
	astyle --style=allman --recursive --suffix=none 'farmhash64/src/*.c'
	#astyle --style=google --recursive --suffix=none 'farmhash64/R/*.R'
	#astyle --style=google --recursive --suffix=none 'farmhash64/tests/*.R'
	#astyle --style=google --recursive --suffix=none 'example/*.R'

# Remove any build artifact
.PHONY: clean
clean:
	rm -f farmhash64.Rcheck farmhash64/src/farmhash64.o farmhash64/src/farmhash64.so farmhash64/renv.lock
	rm -rf renv farmhash64/renv farmhash64/.Rbuildignore farmhash64/.Rprofile .Rprofile

.PHONY: devdoc
devdoc:
	R -e 'setwd("./farmhash64");renv::restore();library(devtools);devtools::document();'
