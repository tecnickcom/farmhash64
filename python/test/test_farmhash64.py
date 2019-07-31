"""Tests for farmhash64 module."""


import farmhash64 as fh
from unittest import TestCase


hashTestData = [
    (0xFE0061E9, 0x9AE16A3B2F90404F, ""),
    (0xD824662A, 0xB3454265B6DF75E3, "a"),
    (0x15EB5ED6, 0xAA8D6E5242ADA51E, "ab"),
    (0xCAF25FE2, 0x24A5B3A074E7F369, "abc"),
    (0xCF297808, 0x1A5502DE4A1F8101, "abcd"),
    (0x5F8D48DB, 0xC22F4663E54E04D4, "abcde"),
    (0x16B8A2FD, 0xC329379E6A03C2CD, "abcdef"),
    (0xCFC5F43D, 0x3C40C92B1CCB7355, "abcdefg"),
    (0x08D1B642, 0xFEE9D22990C82909, "abcdefgh"),
    (0xB382832E, 0x332C8ED4DAE5BA42, "abcdefghi"),
    (0x3F19A3CB, 0xAD052244B781C4EB, "0123456789"),
    (0x0EE83C5C, 0x3EF4C03514208C77, "0123456789 "),
    (0x6FCA023F, 0x496841E83A33CC91, "0123456789-0"),
    (0x6B2C02BD, 0xD81BCB9F3679AC0C, "0123456789~01"),
    (0x0B8E8FBA, 0x5DA5A6A117C606F6, "0123456789#012"),
    (0xE6946835, 0x5361EAE17C1FF6BC, "0123456789@0123"),
    (0xFA44DF74, 0x4283D4EF43627F64, "0123456789'01234"),
    (0x2A1ED264, 0x46A7416ED4861E3B, "0123456789=012345"),
    (0xBCD3277F, 0xA4ABB4E0DA2C594C, "0123456789+0123456"),
    (0x26BF5A67, 0xCF1C7D3AD54F9215, "0123456789*01234567"),
    (0x8EEDB634, 0x07ADF50B2AC764FC, "0123456789&012345678"),
    (0xA329652E, 0xDEBCBA8E6F3EABD1, "0123456789^0123456789"),
    (0xF73C270C, 0xC91FDC3787A41523, "0123456789%0123456789£"),
    (0x1B9EA72F, 0xD78D5F852D522E6A, "0123456789$0123456789!0"),
    (0x819D77A5, 0x80D73B843BA57DB8, "size:  a.out:  bad magic"),
    (0x8B72761E, 0x8EB3808D1CCFC779, "Nepal premier won't resign."),
    (0x5F21FE43, 0xB944F8A16261E414, "C is as portable as Stonehedge!!"),
    (0xA15EAD04, 0xE8F89AB6DF9BDD25, "Discard medicine more than two years old."),
    (0xE3763BAF, 0xA9961670CE2A46D9, "I wouldn't marry him with a ten foot pole."),
    (0x50A48AAA, 0xBDD69B798D6BA37A, "If the enemy is within range, then so are you."),
    (
        0x517E346C,
        0xC2F8DB8624FEFC0E,
        "The major problem is with sendmail.  -Mark Horton",
    ),
    (
        0x8A4B0B6C,
        0x5A0A6EFD52E84E2A,
        "How can you write a big system without C++?  -Paul Glick",
    ),
    (
        0xB360937B,
        0x786D7E1987023CA9,
        "He who has a shady past knows that nice guys finish last.",
    ),
    (
        0x2E5713B3,
        0x5D14F96C18FE3D5E,
        "Free! Free!/A trip/to Mars/for 900/empty jars/Burma Shave",
    ),
    (
        0xEC6D1E0E,
        0xEC8848FD3B266C10,
        "His money is twice tainted: 'taint yours and 'taint mine.",
    ),
    (
        0x7175F31D,
        0x2A578B80BB82147C,
        "The days of the digital watch are numbered.  -Tom Stoppard",
    ),
    (
        0xDF4C5297,
        0x55182F8859ECA4CE,
        "For every action there is an equal and opposite government program.",
    ),
    (
        0x62359ACA,
        0xABCDB319FCF2826C,
        "You remind me of a TV show, but that's all right: I watch it anyway.",
    ),
    (
        0x398C0B7C,
        0x1D85702503AC7EB4,
        "It's well we cannot hear the screams/That we create in others' dreams.",
    ),
    (
        0x00047F9C,
        0xA2B8BF3032021993,
        "Give me a rock, paper and scissors and I will move the world.  CCFestoon",
    ),
    (
        0xE56239A7,
        0x38AA3175B37F305C,
        "It's a tiny change to the code and not completely disgusting. - Bob Manchek",
    ),
    (
        0xB556F325,
        0x7E85D7B050ED2967,
        "There is no reason for any individual to have a computer in their home. -Ken Olsen, 1977",
    ),
    (
        0x75CC5362,
        0x5A05644EB66E435E,
        "Even if I could be Shakespeare, I think I should still choose to be Faraday. - A. Huxley",
    ),
    (
        0xC401A0BF,
        0x098EFF6958C5E91A,
        "The fugacity of a constituent in a mixture of gases at a given temperature is proportional to its mole fraction.  Lewis-Randall Rule",
    ),
    (
        0x4E56B7E9,
        0xC3F02C4FFD5D71E6,
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ),
]


class TestFunctions(TestCase):
    def test_farmhash64_strings(self):
        for expected32, expected64, test_input in hashTestData:
            h = fh.farmhash64(test_input.encode("unicode_escape"))
            self.assertEqual(h, expected64)

    def test_farmhash32_strings(self):
        for expected32, expected64, test_input in hashTestData:
            h = fh.farmhash32(test_input.encode("unicode_escape"))
            self.assertEqual(h, expected32)


class TestBenchmark(object):
    def test_farmhash64_benchmark(self, benchmark):
        benchmark.pedantic(
            fh.farmhash64,
            args=[b"2ZVSmMwBTILcCekZjgZ49Py5RoJUriQ7URkCgZPw"],
            iterations=10000,
            rounds=100,
        )
