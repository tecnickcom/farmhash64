# farmhash64 is a header-only library: every function in farmhash64.h is
# "static inline", so there is no object code to build and nothing to export.
#
# NOTE: this used to be "add_library(farmhash64 farmhash64.h)" with an explicit
# LINKER_LANGUAGE. CMake does not compile a .h, and internal-linkage functions
# cannot be exported anyway, so that produced a shared object with zero defined
# symbols: linking -lfarmhash64 gave the caller nothing. An INTERFACE library
# models what this actually is and propagates the include directory to whoever
# links it.
add_library (farmhash64 INTERFACE)
target_include_directories (farmhash64 INTERFACE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<INSTALL_INTERFACE:include>)

# The header is the only installable artifact. Without an install rule the
# generated install_manifest.txt never exists, which makes the uninstall target
# abort and leaves the CPack DEB/RPM/TGZ payloads empty.
include(GNUInstallDirs)
install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/farmhash64.h
        DESTINATION ${CMAKE_INSTALL_INCLUDEDIR})
