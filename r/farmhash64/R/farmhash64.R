# R farmhash64 Wrapper
#
# farmhash64.R
#
# @category   Libraries
# @author     Nicola Asuni <info@tecnick.com>
# @link       https://github.com/tecnickcom/farmhash64


#' Computes the 64-bit FarmHash hash value of each string in the input vector
#' and returns the hexadecimal representation of the hash values.
#' 
#' @param strv The input character vector containing the strings to be hashed.
#' 
#' @useDynLib farmhash64 R_FarmHash64Hex
#' @export
FarmHash64Hex <- function(strv) {
    n <- length(strv)
    ret <- character(n)
    return(.Call("R_FarmHash64Hex", as.character(strv), ret))
}

#' Computes the 32-bit FarmHash hash value of each string in the input vector
#' and returns the hexadecimal representation of the hash values.
#' 
#' @param strv The input character vector containing the strings to be hashed.
#' 
#' @useDynLib farmhash64 R_FarmHash32Hex
#' @export
FarmHash32Hex <- function(strv) {
    n <- length(strv)
    ret <- character(n)
    return(.Call("R_FarmHash32Hex", as.character(strv), ret))
}