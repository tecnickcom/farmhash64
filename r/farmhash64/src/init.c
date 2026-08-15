// R farmhash64 Module
//
// init.c
//
// Native routine registration for the farmhash64 R package.
//
// @category   Libraries
// @author     Nicola Asuni <info@tecnick.com>
// @link       https://github.com/tecnickcom/farmhash64

#include <stdlib.h>
#include <R.h>
#include <Rinternals.h>
#include <R_ext/Rdynload.h>
#include <R_ext/Visibility.h>

extern SEXP R_FarmHash64Hex(SEXP strv);
extern SEXP R_FarmHash32Hex(SEXP strv);

static const R_CallMethodDef CallEntries[] =
{
    {"R_FarmHash64Hex", (DL_FUNC) &R_FarmHash64Hex, 1},
    {"R_FarmHash32Hex", (DL_FUNC) &R_FarmHash32Hex, 1},
    {NULL, NULL, 0}
};

void attribute_visible R_init_farmhash64(DllInfo *dll)
{
    R_registerRoutines(dll, NULL, CallEntries, NULL, NULL);
    R_useDynamicSymbols(dll, FALSE);
}
