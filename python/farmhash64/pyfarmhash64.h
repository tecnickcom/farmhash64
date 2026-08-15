// Python farmhash64 Module
//
// Function declarations and docstrings for the Python farmhash64 module.
//
// @category   Libraries
// @author     Nicola Asuni <info@tecnick.com>
// @license    MIT (see LICENSE)
// @link       https://github.com/tecnickcom/farmhash64

// NOTE: PY_SSIZE_T_CLEAN is defined by pyfarmhash64.c before it includes
// <Python.h>; defining it here would be too late to have any effect.
#include <Python.h>

static PyObject *py_farmhash64(PyObject *self, PyObject *args, PyObject *keywds);
static PyObject *py_farmhash32(PyObject *self, PyObject *args, PyObject *keywds);

#define PYFARMHASH64_DOCSTRING "Returns a 64-bit fingerprint hash for a byte array.\n"\
"This function is not suitable for cryptography.\n"\
"\n"\
"Parameters\n"\
"----------\n"\
"s : bytes-like\n"\
"    Byte array to process (bytes, bytearray, memoryview, ...).\n"\
"\n"\
"Returns\n"\
"-------\n"\
"int :\n"\
"    64-bit hash code\n"\
"\n"\
"Examples\n"\
"--------\n"\
">>> print(farmhash64.farmhash64(b'Lorem ipsum dolor sit amet'))\n"\
"16191328082827683567"

#define PYFARMHASH32_DOCSTRING "Returns a 32-bit fingerprint hash for a byte array.\n"\
"This is NOT equivalent to the original Fingerprint32 function: it is derived from farmhash64.\n"\
"This function is not suitable for cryptography.\n"\
"\n"\
"Parameters\n"\
"----------\n"\
"s : bytes-like\n"\
"    Byte array to process (bytes, bytearray, memoryview, ...).\n"\
"\n"\
"Returns\n"\
"-------\n"\
"int :\n"\
"    32-bit hash code\n"\
"\n"\
"Examples\n"\
"--------\n"\
">>> print(farmhash64.farmhash32(b'Lorem ipsum dolor sit amet'))\n"\
"2990660358"

#if defined(__SUNPRO_C) || defined(__hpux) || defined(_AIX)
#define inline
#endif

#ifdef __linux
#define inline __inline
#endif
