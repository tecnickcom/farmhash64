// R farmhash64 Module
//
// farmhash64.c
//
// C entry points that expose the farmhash64 and farmhash32 functions to R.
//
// @category   Libraries
// @author     Nicola Asuni <info@tecnick.com>
// @link       https://github.com/tecnickcom/farmhash64

#include <inttypes.h>
#include <string.h>
#include <R.h>
#include <Rinternals.h>
#include "farmhash64.h"

/**
 * Computes the 64-bit FarmHash hash value of each string in the input vector
 * and returns the hexadecimal representation of the hash values.
 *
 * The strings are hashed as UTF-8 bytes, so that the result does not depend on
 * the native encoding of the input elements. NA elements are propagated as NA.
 *
 * @param strv The input character vector containing the strings to be hashed.
 *
 * @return A character vector with the 16-character hexadecimal hash values.
 */
SEXP R_FarmHash64Hex(SEXP strv)
{
    if (TYPEOF(strv) != STRSXP)
    {
        Rf_error("strv must be a character vector");
    }

    R_xlen_t n = XLENGTH(strv);
    SEXP ret = PROTECT(Rf_allocVector(STRSXP, n));

    for (R_xlen_t i = 0; i < n; i++)
    {
        SEXP elt = STRING_ELT(strv, i);

        if (elt == NA_STRING)
        {
            SET_STRING_ELT(ret, i, NA_STRING);
            continue;
        }

        const char *s = Rf_translateCharUTF8(elt);
        char hex[17];
        snprintf(hex, sizeof(hex), "%016" PRIx64, farmhash64(s, strlen(s)));
        SET_STRING_ELT(ret, i, Rf_mkChar(hex));
    }

    UNPROTECT(1);
    return ret;
}

/**
 * Computes the 32-bit FarmHash hash value of each string in the input vector
 * and returns the hexadecimal representation of the hash values.
 *
 * The strings are hashed as UTF-8 bytes, so that the result does not depend on
 * the native encoding of the input elements. NA elements are propagated as NA.
 *
 * @param strv The input character vector containing the strings to be hashed.
 *
 * @return A character vector with the 8-character hexadecimal hash values.
 */
SEXP R_FarmHash32Hex(SEXP strv)
{
    if (TYPEOF(strv) != STRSXP)
    {
        Rf_error("strv must be a character vector");
    }

    R_xlen_t n = XLENGTH(strv);
    SEXP ret = PROTECT(Rf_allocVector(STRSXP, n));

    for (R_xlen_t i = 0; i < n; i++)
    {
        SEXP elt = STRING_ELT(strv, i);

        if (elt == NA_STRING)
        {
            SET_STRING_ELT(ret, i, NA_STRING);
            continue;
        }

        const char *s = Rf_translateCharUTF8(elt);
        char hex[9];
        snprintf(hex, sizeof(hex), "%08" PRIx32, farmhash32(s, strlen(s)));
        SET_STRING_ELT(ret, i, Rf_mkChar(hex));
    }

    UNPROTECT(1);
    return ret;
}
