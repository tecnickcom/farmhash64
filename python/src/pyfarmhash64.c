// Python farmhash64 Module
//
// @category   Libraries
// @author     Nicola Asuni <nicola.asuni@tecnick.com>
// @license    MIT (see LICENSE)
// @link       https://github.com/tecnickcom/farmhash64

#include <Python.h>
#include "farmhash64.h"
#include "pyfarmhash64.h"

#ifndef Py_UNUSED /* This is already defined for Python 3.4 onwards */
#ifdef __GNUC__
#define Py_UNUSED(name) _unused_ ## name __attribute__((unused))
#else
#define Py_UNUSED(name) _unused_ ## name
#endif
#endif

static PyObject* py_farmhash64(PyObject *Py_UNUSED(ignored), PyObject *args)
{
    PyObject *result;
    const char *s;
    Py_ssize_t len;
    if (!PyArg_ParseTuple(args, "s", &s))
        return NULL;
    len = strlen(s);
    uint64_t h = farmhash64(s, len);
# if __WORDSIZE == 64
    const char* int_param = "k"; // (int) [unsigned long]
# else
    const char* int_param = "K"; // (int) [unsigned long long]
#endif
    result = Py_BuildValue(int_param, h);
    return result;
}

static PyObject* py_farmhash32(PyObject *Py_UNUSED(ignored), PyObject *args)
{
    PyObject *result;
    const char *s;
    Py_ssize_t len;
    if (!PyArg_ParseTuple(args, "s", &s))
        return NULL;
    len = strlen(s);
    uint64_t h = farmhash32(s, len);
    result = Py_BuildValue("I", h);
    return result;
}

static PyMethodDef PyFarmhash64Methods[] =
{
    {"farmhash64", py_farmhash64, METH_VARARGS, PYFARMHASH64_DOCSTRING},
    {"farmhash32", py_farmhash32, METH_VARARGS, PYFARMHASH32_DOCSTRING},
    {NULL, NULL, 0, NULL}
};

struct module_state
{
    PyObject *error;
};

#if PY_MAJOR_VERSION >= 3
#define GETSTATE(m) ((struct module_state*)PyModule_GetState(m))
#else
#define GETSTATE(m) (&_state)
static struct module_state _state;
#endif

#if PY_MAJOR_VERSION >= 3

static int myextension_traverse(PyObject *m, visitproc visit, void *arg)
{
    Py_VISIT(GETSTATE(m)->error);
    return 0;
}

static int myextension_clear(PyObject *m)
{
    Py_CLEAR(GETSTATE(m)->error);
    return 0;
}

static struct PyModuleDef moduledef =
{
    PyModuleDef_HEAD_INIT,
    "libpyfarmhash64",
    NULL,
    sizeof(struct module_state),
    PyFarmhash64Methods,
    NULL,
    myextension_traverse,
    myextension_clear,
    NULL
};

#define INITERROR return NULL

PyObject* PyInit_libpyfarmhash64(void)

#else
#define INITERROR return

void
initlibpyfarmhash64(void)
#endif
{
#if PY_MAJOR_VERSION >= 3
    PyObject *module = PyModule_Create(&moduledef);
#else
    PyObject *module = Py_InitModule("libpyfarmhash64", PyFarmhash64Methods);
#endif
    struct module_state *st = NULL;

    if (module == NULL)
        INITERROR;
    st = GETSTATE(module);

    st->error = PyErr_NewException("libpyfarmhash64.Error", NULL, NULL);
    if (st->error == NULL)
    {
        Py_DECREF(module);
        INITERROR;
    }

#if PY_MAJOR_VERSION >= 3
    return module;
#endif
}
