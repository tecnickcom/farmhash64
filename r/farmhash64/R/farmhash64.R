# R farmhash64 Wrapper
#
# farmhash64.R
#
# R interface to the farmhash64 and farmhash32 functions of the C library.
#
# @category   Libraries
# @author     Nicola Asuni <info@tecnick.com>
# @link       https://github.com/tecnickcom/farmhash64


#' Compute 64-bit FarmHash hash values in hexadecimal format
#'
#' Computes the 64-bit FarmHash hash value of each string in the input vector
#' and returns the hexadecimal representation of the hash values.
#'
#' The strings are hashed as UTF-8 bytes, so the result does not depend on the
#' native encoding of the input. NA elements are propagated as NA.
#'
#' @param strv The input character vector containing the strings to be hashed.
#'
#' @return A character vector with the 16-character hexadecimal hash values.
#'
#' @useDynLib farmhash64, .registration = TRUE
#' @export
FarmHash64Hex <- function(strv) {
    .Call("R_FarmHash64Hex", strv, PACKAGE = "farmhash64")
}

#' Compute 32-bit FarmHash hash values in hexadecimal format
#'
#' Computes the 32-bit FarmHash hash value of each string in the input vector
#' and returns the hexadecimal representation of the hash values.
#'
#' The strings are hashed as UTF-8 bytes, so the result does not depend on the
#' native encoding of the input. NA elements are propagated as NA.
#'
#' @param strv The input character vector containing the strings to be hashed.
#'
#' @return A character vector with the 8-character hexadecimal hash values.
#'
#' @export
FarmHash32Hex <- function(strv) {
    .Call("R_FarmHash32Hex", strv, PACKAGE = "farmhash64")
}
