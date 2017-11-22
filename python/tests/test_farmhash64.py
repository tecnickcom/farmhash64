"""Tests for libpyfarmhash64 module."""


import libpyfarmhash64 as vh
from unittest import TestCase


class TestFunctions(TestCase):

    def test_farmhash64(self):
        h = vh.farmhash64("Lorem ipsum dolor sit amet")
        self.assertEqual(h, 0xe0b3271b22c026ef)

    def test_farmhash32(self):
        h = vh.farmhash32("Lorem ipsum dolor sit amet")
        self.assertEqual(h, 0xb241db06)
