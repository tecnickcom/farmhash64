file(MAKE_DIRECTORY ${PROJECT_BINARY_DIR}/lib)

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${PROJECT_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${PROJECT_BINARY_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${PROJECT_BINARY_DIR}/lib)

# Add the binary tree directory to the search path for linking and include files
link_directories( ${CMAKE_CURRENT_BINARY_DIR} )
include_directories (${CMAKE_CURRENT_BINARY_DIR} ${PROJECT_BINARY_DIR}/src )

add_library (farmhash64 farmhash64.h)
target_include_directories (farmhash64 PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
set_target_properties(farmhash64 PROPERTIES LINKER_LANGUAGE "C")

# Required to link the math library
target_link_libraries(farmhash64)
