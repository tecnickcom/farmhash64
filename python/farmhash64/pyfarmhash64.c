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
    const char *s;
    Py_ssize_t len;
    if (!PyArg_ParseTuple(args, "y", &s))
        return NULL;
    len = strlen(s);
    uint64_t h = farmhash64(s, len);
    return Py_BuildValue("K", h);
}

static PyObject* py_farmhash32(PyObject *Py_UNUSED(ignored), PyObject *args)
{
    const char *s;
    Py_ssize_t len;
    if (!PyArg_ParseTuple(args, "y", &s))
        return NULL;
    len = strlen(s);
    uint32_t h = farmhash32(s, len);
    return Py_BuildValue("I", h);
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
    "farmhash64",
    NULL,
    sizeof(struct module_state),
    PyFarmhash64Methods,
    NULL,
    myextension_traverse,
    myextension_clear,
    NULL
};

#define INITERROR return NULL

PyObject* PyInit_farmhash64(void)

#else
#define INITERROR return

void
initfarmhash64(void)
#endif
{
#if PY_MAJOR_VERSION >= 3
    PyObject *module = PyModule_Create(&moduledef);
#else
    PyObject *module = Py_InitModule("farmhash64", PyFarmhash64Methods);
#endif
    struct module_state *st = NULL;

    if (module == NULL)
        INITERROR;
    st = GETSTATE(module);

    st->error = PyErr_NewException("farmhash64.Error", NULL, NULL);
    if (st->error == NULL)
    {
        Py_DECREF(module);
        INITERROR;
    }

#if PY_MAJOR_VERSION >= 3
    return module;
#endif
}
