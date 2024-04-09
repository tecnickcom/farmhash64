// R farmhash64 Module
//
// farmhash64.c
//
// @category   Libraries
// @author     Nicola Asuni <info@tecnick.com>
// @link       https://github.com/tecnickcom/farmhash64

#include <inttypes.h>
#include <R.h>
#include <Rdefines.h>
#include <stdlib.h>
#include "../../../c/src/farmhash64.h"

/**
 * Computes the 64-bit FarmHash hash value of each string in the input vector
 * and returns the hexadecimal representation of the hash values.
 *
 * @param strv The input character vector containing the strings to be hashed.
 * @param ret The output character vector to store the hexadecimal hash values.
 *
 * @return The output character vector with the hexadecimal hash values.
 */
SEXP R_FarmHash64Hex(SEXP strv, SEXP ret)
{
    uint64_t i = 0;
    uint64_t n = LENGTH(strv);
    uint64_t hash = 0;
    char hex[17] = "0000000000000000\0";

    for(i = 0; i < n; i++)
    {
        const char *s = CHAR(STRING_ELT(strv, i));
        hash = farmhash64(s, strlen(s));
        sprintf(hex, "%016" PRIx64, hash);
        SET_STRING_ELT(ret, i, mkChar(hex));
    }

    return ret;
}

/**
 * Computes the 32-bit FarmHash hash value of each string in the input vector
 * and returns the hexadecimal representation of the hash values.
 *
 * @param strv The input character vector containing the strings to be hashed.
 * @param ret The output character vector to store the hexadecimal hash values.
 *
 * @return The output character vector with the hexadecimal hash values.
 */
SEXP R_FarmHash32Hex(SEXP strv, SEXP ret)
{
    uint64_t i = 0;
    uint64_t n = LENGTH(strv);
    uint32_t hash = 0;
    char hex[17] = "00000000\0";

    for(i = 0; i < n; i++)
    {
        const char *s = CHAR(STRING_ELT(strv, i));
        hash = farmhash32(s, strlen(s));
        sprintf(hex, "%08" PRIx32, hash);
        SET_STRING_ELT(ret, i, mkChar(hex));
    }

    return ret;
}