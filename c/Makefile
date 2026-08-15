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

# Project release number (packaging build number)
# RELEASE=$(shell cat ../RELEASE)

# Optional cmake settings.
# Each option is only passed when the corresponding variable is set: passing an
# empty value (e.g. -DCMAKE_INSTALL_PREFIX=) clobbers the CMake default instead
# of leaving it alone. Values are quoted to survive paths containing spaces.
CMAKEOPTS=\
$(if $(CMAKE_C_FLAGS),-DCMAKE_C_FLAGS="$(CMAKE_C_FLAGS)") \
$(if $(CMAKE_TOOLCHAIN_FILE),-DCMAKE_TOOLCHAIN_FILE="$(CMAKE_TOOLCHAIN_FILE)") \
$(if $(CMAKE_INSTALL_PATH),-DCMAKE_INSTALL_PREFIX="$(CMAKE_INSTALL_PATH)") \
$(if $(VH_BUILD_DOXYGEN),-DBUILD_DOXYGEN="$(VH_BUILD_DOXYGEN)")

# Enable branch coverage in lcov/genhtml, so that the coverage target can gate
# on it as well as on line and function coverage.
LCOVOPTS=--rc branch_coverage=1

# clang-tidy checks (mirrors the tidy target) used by the linter target
TIDYCHECKS=*,-clang-analyzer-security.insecureAPI.DeprecatedOrUnsafeBufferHandling,-altera-unroll-loops,-altera-id-dependent-backward-branch,-altera-struct-pack-align,-bugprone-easily-swappable-parameters,-cppcoreguidelines-avoid-magic-numbers,-readability-magic-numbers,-readability-identifier-length,-llvmlibc-restrict-system-libc-headers,-llvm-header-guard,-llvm-include-order,-android-cloexec-open,-hicpp-no-assembler,-hicpp-signed-bitwise,-misc-include-cleaner,-clang-analyzer-alpha.*

# --- MAKE TARGETS ---

.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@awk '/^## /{desc=substr($$0,4)} /^\.PHONY:/{if(NF>1) {target=$$2; if(desc) printf "  make %-15s: %s\n",target,desc; desc=""}}' Makefile
	@echo ""

.PHONY: all
all: clean version format test coverage sanitize tidy build doc

## Build the library
.PHONY: build
build:
	@mkdir -p target/build
	@echo -e "\n\n*** BUILD RELEASE ***\n"
	rm -rf target/build/*
	cd target/build && \
	cmake $(CMAKEOPTS) \
	-DCMAKE_BUILD_TYPE=Release \
	../.. | tee cmake.log ; test $${PIPESTATUS[0]} -eq 0 && \
	export LD_LIBRARY_PATH=$$LD_LIBRARY_PATH:./ && \
	make | tee make.log ; test $${PIPESTATUS[0]} -eq 0
	cd target/build && \
	export LD_LIBRARY_PATH=$$LD_LIBRARY_PATH:./ && \
	env CTEST_OUTPUT_ON_FAILURE=1 make test | tee build.log ; test $${PIPESTATUS[0]} -eq 0

## Remove any build artifact
.PHONY: clean
clean:
	rm -rf target

## Generate source code documentation
.PHONY: doc
doc:
	cd target/build && \
	make doc | tee doc.log ; test $${PIPESTATUS[0]} -eq 0

## Format the source code
.PHONY: format
format:
	astyle --style=allman --recursive --suffix=none 'src/*.h'
	astyle --style=allman --recursive --suffix=none 'test/*.c'

## Lint the source code with cppcheck and clang-tidy
.PHONY: linter
linter:
	cppcheck --enable=warning,style,performance,portability --error-exitcode=1 --inline-suppr --std=c11 src/farmhash64.h
	clang-tidy src/farmhash64.h --warnings-as-errors='$(TIDYCHECKS)' -checks='$(TIDYCHECKS)' -- -x c -std=c2x -I src

## Check that the lcov line, function and branch coverage from the test target is 100%
.PHONY: coverage
coverage: test
	@summary=$$(lcov $(LCOVOPTS) --summary target/test/coverage/farmhash64.info 2>&1); \
	for metric in lines functions branches; do \
		value=$$(echo "$$summary" | grep -oE "$$metric[.]*: [0-9]+\.[0-9]+%" | grep -oE '[0-9]+\.[0-9]+' | head -1); \
		echo "$$metric coverage: $$value%"; \
		if [ "$$value" != "100.0" ]; then echo "ERROR: $$metric coverage '$$value%' is below 100%"; exit 1; fi; \
	done

## Build and run the unit tests
.PHONY: test
test: testcpp
	@echo -e "\n\n*** BUILD TEST ***\n"
	rm -rf target/test
	mkdir -p target/test/coverage
	cd target/test && \
	cmake $(CMAKEOPTS) \
	-DCMAKE_BUILD_TYPE=Coverage \
	../.. | tee cmake.log ; test $${PIPESTATUS[0]} -eq 0 && \
	export LD_LIBRARY_PATH=$$LD_LIBRARY_PATH:./ && \
	make | tee make.log ; test $${PIPESTATUS[0]} -eq 0 && \
	lcov --zerocounters --directory . && \
	lcov $(LCOVOPTS) --capture --initial --directory . --output-file coverage/farmhash64.cov && \
	env CTEST_OUTPUT_ON_FAILURE=1 make test | tee test.log ; test $${PIPESTATUS[0]} -eq 0 && \
	lcov $(LCOVOPTS) --no-checksum --directory . --capture --output-file coverage/farmhash64.info && \
	lcov $(LCOVOPTS) --ignore-errors unused --remove coverage/farmhash64.info '*/test/*' --output-file coverage/farmhash64.info && \
	genhtml $(LCOVOPTS) -o coverage -t "farmhash64 Test Coverage" coverage/farmhash64.info
ifeq ($(VH_BUILD_DOXYGEN),ON)
	cd target && \
	make doc | tee doc.log ; test $${PIPESTATUS[0]} -eq 0
endif

## Test C code compatibility with C++
.PHONY: testcpp
testcpp:
	# NOTE: xargs is required to propagate the compiler exit status: with
	# "find -exec ... \;" find always exits 0 and a compilation failure would be
	# silently ignored.
	find ./src -type f -name '*.h' -print0 | xargs -0 -n 1 gcc -c -pedantic -Werror -Wall -Wextra -Wcast-align -Wundef -Wformat -Wformat-security -std=c++23 -x c++ -o /dev/null

## Tidy the code via clang-tidy
# NOTE: the compile flags must be passed after "--". Previously this target used
# "-p ." to point at a compilation database that does not exist, so clang-tidy
# fell back to "running without flags" and analysed the header with neither the
# right language nor the right standard. It also had no --warnings-as-errors, so
# it always exited 0 and could never fail the "all" pipeline.
.PHONY: tidy
tidy:
	clang-tidy src/farmhash64.h --header-filter='.*farmhash64\.h' --warnings-as-errors='$(TIDYCHECKS)' -checks='$(TIDYCHECKS)' -- -x c -std=c2x -I src

## Build and run the unit tests under the Address and Undefined Behaviour sanitizers
.PHONY: sanitize
sanitize:
	@mkdir -p target/sanitize
	$(CC) -std=c2x -pedantic -Wall -Wextra -Wcast-align -Wundef -Wformat -Wformat-security -Wshadow \
	-O1 -g -fsanitize=address,undefined -fno-sanitize-recover=all -fno-omit-frame-pointer \
	-o target/sanitize/test_farmhash test/test_farmhash64.c
	target/sanitize/test_farmhash

## Install the library (header-only) via cmake
.PHONY: install
install:
	cd target/build && \
	cmake --install . | tee install.log ; test $${PIPESTATUS[0]} -eq 0

## Remove all installed files (excluding configuration files)
# NOTE: this used to "rm -rf $(PATHINSTLIB)" / "$(PATHINSTDOC)", neither of
# which is defined anywhere, so it silently did nothing. CMake's own uninstall
# target replays the install manifest instead.
.PHONY: uninstall
uninstall:
	cd target/build && \
	make uninstall | tee uninstall.log ; test $${PIPESTATUS[0]} -eq 0

## Set the version from VERSION file
.PHONY: version
version:
	sed $(SEDINPLACE) "s/PROJECT_NUMBER.*=.*$$/PROJECT_NUMBER = $(VERSION)/" doc/Doxyfile
