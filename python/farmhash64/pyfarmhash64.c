// Python farmhash64 Module
//
// Python extension module that exposes the farmhash64 and farmhash32 functions
// of the header-only C library.
//
// @category   Libraries
// @author     Nicola Asuni <info@tecnick.com>
// @license    MIT (see LICENSE)
// @link       https://github.com/tecnickcom/farmhash64

// PY_SSIZE_T_CLEAN must be defined before including <Python.h> so that the
// length-carrying argument formats yield a Py_ssize_t instead of an int.
#define PY_SSIZE_T_CLEAN

#include <Python.h>

#define MODULE_NAME "farmhash64"

#include "farmhash64.h"
#include "pyfarmhash64.h"

#ifndef Py_UNUSED /* This is already defined for Python 3.4 onwards */
#ifdef __GNUC__
#define Py_UNUSED(name) _unused_ ## name __attribute__((unused))
#else
#define Py_UNUSED(name) _unused_ ## name
#endif
#endif

static PyObject* py_farmhash64(PyObject *Py_UNUSED(ignored), PyObject *args, PyObject *keywds)
{
    Py_buffer buf;
    static char *kwlist[] = {"s", NULL};
    if (!PyArg_ParseTupleAndKeywords(args, keywds, "y*", kwlist, &buf))
        return NULL;
    uint64_t h = farmhash64((const char *)buf.buf, (size_t)buf.len);
    PyBuffer_Release(&buf);
    return Py_BuildValue("K", h);
}

static PyObject* py_farmhash32(PyObject *Py_UNUSED(ignored), PyObject *args, PyObject *keywds)
{
    Py_buffer buf;
    static char *kwlist[] = {"s", NULL};
    if (!PyArg_ParseTupleAndKeywords(args, keywds, "y*", kwlist, &buf))
        return NULL;
    uint32_t h = farmhash32((const char *)buf.buf, (size_t)buf.len);
    PyBuffer_Release(&buf);
    return Py_BuildValue("I", h);
}

static PyMethodDef PyFarmhash64Methods[] =
{
    {"farmhash64", (PyCFunction)(void(*)(void))py_farmhash64, METH_VARARGS|METH_KEYWORDS, PYFARMHASH64_DOCSTRING},
    {"farmhash32", (PyCFunction)(void(*)(void))py_farmhash32, METH_VARARGS|METH_KEYWORDS, PYFARMHASH32_DOCSTRING},
    {NULL, NULL, 0, NULL}
};

static const char modulename[] = MODULE_NAME;

// The module holds no mutable state, so m_size is 0 and no traverse/clear
// slots are needed.
static struct PyModuleDef moduledef =
{
    PyModuleDef_HEAD_INIT,
    modulename,
    NULL,
    0,
    PyFarmhash64Methods,
    NULL,
    NULL,
    NULL,
    NULL
};

PyMODINIT_FUNC PyInit_farmhash64(void)
{
    return PyModule_Create(&moduledef);
}
