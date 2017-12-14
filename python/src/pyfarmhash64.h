// Python farmhash64 Module
//
// @category   Libraries
// @author     Nicola Asuni <nicola.asuni@tecnick.com>
// @license    MIT (see LICENSE)
// @link       https://github.com/tecnickcom/farmhash64

#define PY_SSIZE_T_CLEAN
#include "Python.h"

static PyObject *py_farmhash64(PyObject *self, PyObject *args);
static PyObject *py_farmhash32(PyObject *self, PyObject *args);

PyMODINIT_FUNC initlibpyfarmhash64(void);

#define PYFARMHASH64_DOCSTRING "Returns a 64-bit fingerprint hash for a byte array.\nexample: print libpyfarmhash64.farmhash64('Lorem ipsum dolor sit amet')\n16191328082827683567"
#define PYFARMHASH32_DOCSTRING "Returns a 32-bit fingerprint hash for a byte array.\nexample: print libpyfarmhash64.farmhash32('Lorem ipsum dolor sit amet')\n2990660358"

#if defined(__SUNPRO_C) || defined(__hpux) || defined(_AIX)
#define inline
#endif

#ifdef __linux
#define inline __inline
#endif
