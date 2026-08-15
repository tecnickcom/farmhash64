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
CURRENTDIR=$(CURDIR)/

# sed argument for in-place substitutions
SEDINPLACE=-i
ifeq ($(shell uname -s),Darwin)
	SEDINPLACE=-i ''
endif

# --- MAKE TARGETS ---

.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@awk '/^## /{desc=substr($$0,4)} /^\.PHONY:/{if(NF>1) {target=$$2; if(desc) printf "  make %-15s: %s\n",target,desc; desc=""}}' Makefile
	@echo ""

all: clean prepare version format linter coverage build test

## Copy the shared C header inside the package so that the source tarball is self-contained
.PHONY: prepare
prepare:
	cp ../c/src/farmhash64.h farmhash64/src/farmhash64.h

## Set the version from VERSION file
.PHONY: version
version: prepare
	sed $(SEDINPLACE) "s/Version:.*$$/Version: $(VERSION).$(RELEASE)/" farmhash64/DESCRIPTION

## Lint the R source code with lintr and the C glue with cppcheck
.PHONY: linter
linter: prepare
	cppcheck --enable=warning,style,performance,portability --error-exitcode=1 --inline-suppr -I farmhash64/src farmhash64/src/farmhash64.c farmhash64/src/init.c
	R -e 'library(lintr); l <- lint_dir("farmhash64/R"); print(l); quit(status = if (length(l) > 0) 1 else 0)'

## Check that the R and C sources have 100% test coverage (covr)
.PHONY: coverage
coverage: prepare
	R -e 'cov <- covr::package_coverage("farmhash64", quiet = TRUE); df <- covr::tally_coverage(cov); err <- 0; for (f in unique(df$$filename)) { d <- df[df$$filename == f, ]; pct <- 100 * sum(d$$value > 0) / nrow(d); cat(sprintf("%s coverage: %.2f%%\n", f, pct)); if (pct < 100) { cat(sprintf("ERROR: %s coverage is below 100%%; uncovered lines: %s\n", f, paste(d$$line[d$$value == 0], collapse = ", "))); err <- 1 } }; quit(status = err)'

## Build the library
.PHONY: build
build: prepare version
	cd farmhash64 \
	&& cp ../../LICENSE . \
	&& R -e 'renv::settings$$snapshot.type("implicit");renv::init();renv::snapshot();'
	R -e 'setwd("./farmhash64");renv::load();renv::restore(prompt = FALSE);pkgbuild::build();'

## Unit tests
.PHONY: test
test: prepare
	R -e 'setwd("./farmhash64"); renv::load(); renv::restore(prompt = FALSE); if (system2(file.path(R.home("bin"), "R"), c("CMD", "INSTALL", paste0("--library=", .libPaths()[1]), "."), stdout = "", stderr = "") != 0L) stop("package install failed"); library(testthat); testthat::test_dir("tests")'

## Format the source code
.PHONY: format
format:
	astyle --style=allman --recursive --suffix=none 'farmhash64/src/*.c'
	#astyle --style=google --recursive --suffix=none 'farmhash64/R/*.R'
	#astyle --style=google --recursive --suffix=none 'farmhash64/tests/*.R'
	#astyle --style=google --recursive --suffix=none 'example/*.R'

## Remove any build artifact
.PHONY: clean
clean:
	rm -f farmhash64/src/*.o farmhash64/src/*.so farmhash64/src/farmhash64.h farmhash64/renv.lock
	rm -rf farmhash64.Rcheck renv farmhash64/renv farmhash64/.Rbuildignore farmhash64/.Rprofile .Rprofile

## Generate documentation
.PHONY: devdoc
devdoc:
	R -e 'setwd("./farmhash64");renv::load();renv::restore(prompt = FALSE);roxygen2::roxygenise();'
