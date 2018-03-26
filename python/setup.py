#!/usr/bin/env python

from codecs import open
from os.path import abspath, dirname, join
from subprocess import call
from setuptools import setup, find_packages, Extension, Command
from farmhash64 import __version__ as VERSION

class RunTests(Command):
    """Run all tests."""
    description = 'run tests'
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        """Run all tests!"""
        errno = call(['py.test'])
        raise SystemExit(errno)


setup(
    name='farmhash64',
    version=VERSION,
    keywords=('farmhash64', 'farmhash'),
    description="Farmhash64 Bindings for Python",
    author='Nicola Asuni',
    author_email='nicola.asuni@tecnick.com',
    url='https://github.com/tecnickcom/farmhash64',
    packages=find_packages(exclude=['docs', 'tests*']),
    ext_modules=[
        Extension('farmhash64', [
            '../src/farmhash64.c',
            'farmhash64/pyfarmhash64.c'
        ],
        include_dirs=[
            '../src',
            'farmhash64',
        ],
        extra_compile_args=[
            "-O3",
            "-pedantic",
            "-std=c99",
            "-Wall",
            "-Wextra",
            "-Wno-strict-prototypes",
            "-Wunused-value",
            "-Wcast-align",
            "-Wundef",
            "-Wformat-security",
            "-Wshadow",
            "-I../src",
        ])
    ],
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'License :: OSI Approved :: MIT License',
        'Intended Audience :: Developers',
        'Programming Language :: C',
        'Programming Language :: Python',
    ],
    extras_require={
        'test': [
            'coverage',
            'pytest',
            'pytest-benchmark',
            'pytest-cov',
            'pytest-pep8',
        ],
    },
    cmdclass={'test': RunTests},
)
