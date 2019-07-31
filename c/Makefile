# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

# Use bash as shell (Note: Ubuntu now uses dash which doesn't support PIPESTATUS).
SHELL=/bin/bash

# CVS path (path to the parent dir containing the project)
CVSPATH=github.com/tecnickcom

# Project owner
OWNER=Tecnick.com

# Project vendor
VENDOR=tecnickcom

# Project name
PROJECT=farmhash64

# Project version
VERSION=$(shell cat ../VERSION)

# Project release number (packaging build number)
RELEASE=$(shell cat ../RELEASE)

# --- MAKE TARGETS ---

# Display general help about this command
.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make test       : Run the unit tests"
	@echo "    make tidy       : Check the code using clang-tidy"
	@echo "    make build      : Build the library"
	@echo "    make version    : Set version from VERSION file"
	@echo "    make doc        : Generate source code documentation"
	@echo "    make format     : Format the source code"
	@echo "    make clean      : Remove any build artifact"
	@echo ""

all: clean format test tidy build doc

# Test C code compatibility with C++
.PHONY: testcpp
testcpp:
	find ./src -type f -name '*.c' -exec gcc -c -pedantic -Werror -Wall -Wextra -Wcast-align -Wundef -Wformat-security -std=c++14 -x c++ -o /dev/null {} \;

# Build and run the unit tests
.PHONY: test
test: testcpp
	@mkdir -p target/test/test
	@echo -e "\n\n*** BUILD TEST - see config.mk ***\n"
	rm -rf target/test/*
	mkdir -p target/test/coverage
	cd target/test && \
	cmake -DCMAKE_C_FLAGS=$(CMAKE_C_FLAGS) \
	-DCMAKE_TOOLCHAIN_FILE=$(CMAKE_TOOLCHAIN_FILE) \
	-DCMAKE_BUILD_TYPE=Coverage \
	-DCMAKE_INSTALL_PREFIX=$(CMAKE_INSTALL_PATH) \
	-DBUILD_SHARED_LIB=$(VH_BUILD_SHARED_LIB) \
	-DBUILD_DOXYGEN=$(VH_BUILD_DOXYGEN) \
	../.. | tee cmake.log ; test $${PIPESTATUS[0]} -eq 0 && \
	export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:./ && \
	make | tee make.log ; test $${PIPESTATUS[0]} -eq 0 && \
	lcov --zerocounters --directory . && \
	lcov --capture --initial --directory . --output-file coverage/farmhash64 && \
	env CTEST_OUTPUT_ON_FAILURE=1 make test | tee test.log ; test $${PIPESTATUS[0]} -eq 0 && \
	lcov --no-checksum --directory . --capture --output-file coverage/farmhash64.info && \
	lcov --remove coverage/farmhash64.info "/test_*" --output-file coverage/farmhash64.info && \
	genhtml -o coverage -t "${PROJECT} Test Coverage" coverage/farmhash64.info
ifeq ($(VH_BUILD_DOXYGEN),ON)
	cd target && \
	make doc | tee doc.log ; test $${PIPESTATUS[0]} -eq 0
endif

# use clang-tidy
.PHONY: tidy
tidy:
	clang-tidy -checks='*,-llvm-header-guard,-llvm-include-order,-android-cloexec-open' -header-filter=.* -p . src/*.c

# Build the library
.PHONY: build
build:
	@mkdir -p target/build
	@echo -e "\n\n*** BUILD RELEASE - see config.mk ***\n"
	rm -rf target/build/*
	cd target/build && \
	cmake -DCMAKE_C_FLAGS=$(CMAKE_C_FLAGS) \
	-DCMAKE_TOOLCHAIN_FILE=$(CMAKE_TOOLCHAIN_FILE) \
	-DCMAKE_BUILD_TYPE=Release \
	-DCMAKE_INSTALL_PREFIX=$(CMAKE_INSTALL_PATH) \
	-DBUILD_SHARED_LIB=$(VH_BUILD_SHARED_LIB) \
	-DBUILD_DOXYGEN=$(VH_BUILD_DOXYGEN) \
	../.. | tee cmake.log ; test $${PIPESTATUS[0]} -eq 0 && \
	export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:./ && \
	make | tee make.log ; test $${PIPESTATUS[0]} -eq 0
	cd target/build && \
	export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:./ && \
	env CTEST_OUTPUT_ON_FAILURE=1 make test | tee build.log ; test $${PIPESTATUS[0]} -eq 0

# Generate source code documentation
.PHONY: doc
doc:
	cd target/build && \
	make doc | tee doc.log ; test $${PIPESTATUS[0]} -eq 0

# Format the source code
.PHONY: format
format:
	astyle --style=allman --recursive --suffix=none 'src/*.h'
	astyle --style=allman --recursive --suffix=none 'src/*.c'
	astyle --style=allman --recursive --suffix=none 'test/*.c'

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf target
