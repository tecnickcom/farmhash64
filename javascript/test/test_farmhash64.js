/** FarmHash64 Javascript Library Test
 *
 * test_farmhash64.js
 *
 * @category   Libraries
 * @license    see LICENSE file
 * @link       https://github.com/tecnickcom/farmhash64
 */

const {
    farmhash64,
    farmhash32,
    parseHex,
    toString,
} = require(process.argv[2]);

var test_data = [
    [0xfe0061e9, {
        hi: 0x9ae16a3b,
        lo: 0x2f90404f
    }, "9ae16a3b2f90404f", ""],
    [0xd824662a, {
        hi: 0xb3454265,
        lo: 0xb6df75e3
    }, "b3454265b6df75e3", "a"],
    [0x15eb5ed6, {
        hi: 0xaa8d6e52,
        lo: 0x42ada51e
    }, "aa8d6e5242ada51e", "ab"],
    [0xcaf25fe2, {
        hi: 0x24a5b3a0,
        lo: 0x74e7f369
    }, "24a5b3a074e7f369", "abc"],
    [0xcf297808, {
        hi: 0x1a5502de,
        lo: 0x4a1f8101
    }, "1a5502de4a1f8101", "abcd"],
    [0x5f8d48db, {
        hi: 0xc22f4663,
        lo: 0xe54e04d4
    }, "c22f4663e54e04d4", "abcde"],
    [0x16b8a2fd, {
        hi: 0xc329379e,
        lo: 0x6a03c2cd
    }, "c329379e6a03c2cd", "abcdef"],
    [0xcfc5f43d, {
        hi: 0x3c40c92b,
        lo: 0x1ccb7355
    }, "3c40c92b1ccb7355", "abcdefg"],
    [0x08d1b642, {
        hi: 0xfee9d229,
        lo: 0x90c82909
    }, "fee9d22990c82909", "abcdefgh"],
    [0xb382832e, {
        hi: 0x332c8ed4,
        lo: 0xdae5ba42
    }, "332c8ed4dae5ba42", "abcdefghi"],
    [0x3f19a3cb, {
        hi: 0xad052244,
        lo: 0xb781c4eb
    }, "ad052244b781c4eb", "0123456789"],
    [0x0ee83c5c, {
        hi: 0x3ef4c035,
        lo: 0x14208c77
    }, "3ef4c03514208c77", "0123456789 "],
    [0x6fca023f, {
        hi: 0x496841e8,
        lo: 0x3a33cc91
    }, "496841e83a33cc91", "0123456789-0"],
    [0x6b2c02bd, {
        hi: 0xd81bcb9f,
        lo: 0x3679ac0c
    }, "d81bcb9f3679ac0c", "0123456789~01"],
    [0x0b8e8fba, {
        hi: 0x5da5a6a1,
        lo: 0x17c606f6
    }, "5da5a6a117c606f6", "0123456789#012"],
    [0xe6946835, {
        hi: 0x5361eae1,
        lo: 0x7c1ff6bc
    }, "5361eae17c1ff6bc", "0123456789@0123"],
    [0xfa44df74, {
        hi: 0x4283d4ef,
        lo: 0x43627f64
    }, "4283d4ef43627f64", "0123456789'01234"],
    [0x2a1ed264, {
        hi: 0x46a7416e,
        lo: 0xd4861e3b
    }, "46a7416ed4861e3b", "0123456789=012345"],
    [0xbcd3277f, {
        hi: 0xa4abb4e0,
        lo: 0xda2c594c
    }, "a4abb4e0da2c594c", "0123456789+0123456"],
    [0x26bf5a67, {
        hi: 0xcf1c7d3a,
        lo: 0xd54f9215
    }, "cf1c7d3ad54f9215", "0123456789*01234567"],
    [0x8eedb634, {
        hi: 0x07adf50b,
        lo: 0x2ac764fc
    }, "07adf50b2ac764fc", "0123456789&012345678"],
    [0xa329652e, {
        hi: 0xdebcba8e,
        lo: 0x6f3eabd1
    }, "debcba8e6f3eabd1", "0123456789^0123456789"],
    [0x4ba9b4ed, {
        hi: 0x4dbd128a,
        lo: 0xf51d77e8
    }, "4dbd128af51d77e8", "0123456789%0123456789£"],
    [0x1b9ea72f, {
        hi: 0xd78d5f85,
        lo: 0x2d522e6a
    }, "d78d5f852d522e6a", "0123456789$0123456789!0"],
    [0x819d77a5, {
        hi: 0x80d73b84,
        lo: 0x3ba57db8
    }, "80d73b843ba57db8", "size:  a.out:  bad magic"],
    [0x8b72761e, {
        hi: 0x8eb3808d,
        lo: 0x1ccfc779
    }, "8eb3808d1ccfc779", "Nepal premier won't resign."],
    [0x5f21fe43, {
        hi: 0xb944f8a1,
        lo: 0x6261e414
    }, "b944f8a16261e414", "C is as portable as Stonehedge!!"],
    [0xa15ead04, {
        hi: 0xe8f89ab6,
        lo: 0xdf9bdd25
    }, "e8f89ab6df9bdd25", "Discard medicine more than two years old."],
    [0xe3763baf, {
        hi: 0xa9961670,
        lo: 0xce2a46d9
    }, "a9961670ce2a46d9", "I wouldn't marry him with a ten foot pole."],
    [0x50a48aaa, {
        hi: 0xbdd69b79,
        lo: 0x8d6ba37a
    }, "bdd69b798d6ba37a", "If the enemy is within range, then so are you."],
    [0x517e346c, {
        hi: 0xc2f8db86,
        lo: 0x24fefc0e
    }, "c2f8db8624fefc0e", "The major problem is with sendmail.  -Mark Horton"],
    [0x8a4b0b6c, {
        hi: 0x5a0a6efd,
        lo: 0x52e84e2a
    }, "5a0a6efd52e84e2a", "How can you write a big system without C++?  -Paul Glick"],
    [0xb360937b, {
        hi: 0x786d7e19,
        lo: 0x87023ca9
    }, "786d7e1987023ca9", "He who has a shady past knows that nice guys finish last."],
    [0x2e5713b3, {
        hi: 0x5d14f96c,
        lo: 0x18fe3d5e
    }, "5d14f96c18fe3d5e", "Free! Free!/A trip/to Mars/for 900/empty jars/Burma Shave"],
    [0xec6d1e0e, {
        hi: 0xec8848fd,
        lo: 0x3b266c10
    }, "ec8848fd3b266c10", "His money is twice tainted: 'taint yours and 'taint mine."],
    [0x7175f31d, {
        hi: 0x2a578b80,
        lo: 0xbb82147c
    }, "2a578b80bb82147c", "The days of the digital watch are numbered.  -Tom Stoppard"],
    [0xdf4c5297, {
        hi: 0x55182f88,
        lo: 0x59eca4ce
    }, "55182f8859eca4ce", "For every action there is an equal and opposite government program."],
    [0x62359aca, {
        hi: 0xabcdb319,
        lo: 0xfcf2826c
    }, "abcdb319fcf2826c", "You remind me of a TV show, but that's all right: I watch it anyway."],
    [0x398c0b7c, {
        hi: 0x1d857025,
        lo: 0x03ac7eb4
    }, "1d85702503ac7eb4", "It's well we cannot hear the screams/That we create in others' dreams."],
    [0x00047f9c, {
        hi: 0xa2b8bf30,
        lo: 0x32021993
    }, "a2b8bf3032021993", "Give me a rock, paper and scissors and I will move the world.  CCFestoon"],
    [0xe56239a7, {
        hi: 0x38aa3175,
        lo: 0xb37f305c
    }, "38aa3175b37f305c", "It's a tiny change to the code and not completely disgusting. - Bob Manchek"],
    [0xb556f325, {
        hi: 0x7e85d7b0,
        lo: 0x50ed2967
    }, "7e85d7b050ed2967", "There is no reason for any individual to have a computer in their home. -Ken Olsen, 1977"],
    [0x75cc5362, {
        hi: 0x5a05644e,
        lo: 0xb66e435e
    }, "5a05644eb66e435e", "Even if I could be Shakespeare, I think I should still choose to be Faraday. - A. Huxley"],
    [0xc401a0bf, {
        hi: 0x098eff69,
        lo: 0x58c5e91a
    }, "098eff6958c5e91a", "The fugacity of a constituent in a mixture of gases at a given temperature is proportional to its mole fraction.  Lewis-Randall Rule"],
    [0x4e56b7e9, {
        hi: 0xc3f02c4f,
        lo: 0xfd5d71e6
    }, "c3f02c4ffd5d71e6", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."],
];



// @TODO ...



function test_parseHex() {
    var errors = 0;
    var i;
    var hn;
    var exp = {
        "hi": 0x12345678,
        "lo": 0x90abcdef
    };
    hn = parseHex("1234567890AbCdEf");
    if ((hn.hi != exp.hi) || (hn.lo != exp.lo)) {
        console.error("parseHex: expected ", exp, ", got ", hn);
        ++errors;
    }
    for (i = 0; i < test_data.length; i++) {
        hn = parseHex(test_data[i][2]);
        if ((hn.hi != test_data[i][1].hi) || (hn.lo != test_data[i][1].lo)) {
            console.error("parseHex: (" + i + ") expected ", toString(test_data[i][1]), ", got ", toString(hn));
            ++errors;
        }
    }
    return errors;
}

function test_toString() {
    var errors = 0;
    var hs = "";
    var i;
    for (i = 0; i < test_data.length; i++) {
        hs = toString(test_data[i][1]);
        if (hs !== test_data[i][2]) {
            console.error("toString: (" + i + ") expected ", test_data[i][2], ", got ", hs);
            ++errors;
        }
    }
    return errors;
}

function test_farmhash64() {
    var errors = 0;
    var h = 0;
    var i = 0;
    for (i = 0; i < test_data.length; i++) {
        h = farmhash64(test_data[i][3]);
        if ((h.hi != test_data[i][1].hi) || (h.lo != test_data[i][1].lo)) {
            console.error("farmhash64: (" + i + ") expected " + toString(test_data[i][1]) + " but got " + toString(h));
            ++errors;
        }
    }
    return errors;
}

function test_farmhash32() {
    var errors = 0;
    var h = 0;
    var i = 0;
    for (i = 0; i < test_data.length; i++) {
        h = farmhash32(test_data[i][3]);
        if (h != test_data[i][0]) {
            console.error("farmhash32: (" + i + ") expected " + test_data[i][0] + " but got " + h);
            ++errors;
        }
    }
    return errors;
}

var errors = 0;

errors += test_parseHex();
errors += test_toString();
errors += test_farmhash64();
errors += test_farmhash32();

if (errors > 0) {
    console.log("FAILED: " + errors);
    process.exit(1);
} else {
    console.log("OK");
}