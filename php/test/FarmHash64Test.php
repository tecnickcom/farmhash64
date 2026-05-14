<?php

declare(strict_types=1);


// @phpcs:disable Generic.Files.LineLength

namespace Test;

use Com\Tecnick\FarmHash64\FarmHash64;
use PHPUnit\Framework\TestCase;

class FarmHash64Test extends TestCase
{
    // @codingStandardsIgnoreStart
    private const TEST_DATA = [
        [
            0xfe00_61e9,
            [
                'hi' => 0x9ae1_6a3b,
                'lo' => 0x2f90_404f,
            ],
            '9ae16a3b2f90404f',
            '',
        ],
        [
            0xd824_662a,
            [
                'hi' => 0xb345_4265,
                'lo' => 0xb6df_75e3,
            ],
            'b3454265b6df75e3',
            'a',
        ],
        [
            0x15eb_5ed6,
            [
                'hi' => 0xaa8d_6e52,
                'lo' => 0x42ad_a51e,
            ],
            'aa8d6e5242ada51e',
            'ab',
        ],
        [
            0xcaf2_5fe2,
            [
                'hi' => 0x24a5_b3a0,
                'lo' => 0x74e7_f369,
            ],
            '24a5b3a074e7f369',
            'abc',
        ],
        [
            0xcf29_7808,
            [
                'hi' => 0x1a55_02de,
                'lo' => 0x4a1f_8101,
            ],
            '1a5502de4a1f8101',
            'abcd',
        ],
        [
            0x5f8d_48db,
            [
                'hi' => 0xc22f_4663,
                'lo' => 0xe54e_04d4,
            ],
            'c22f4663e54e04d4',
            'abcde',
        ],
        [
            0x16b8_a2fd,
            [
                'hi' => 0xc329_379e,
                'lo' => 0x6a03_c2cd,
            ],
            'c329379e6a03c2cd',
            'abcdef',
        ],
        [
            0xcfc5_f43d,
            [
                'hi' => 0x3c40_c92b,
                'lo' => 0x1ccb_7355,
            ],
            '3c40c92b1ccb7355',
            'abcdefg',
        ],
        [
            0x08d1_b642,
            [
                'hi' => 0xfee9_d229,
                'lo' => 0x90c8_2909,
            ],
            'fee9d22990c82909',
            'abcdefgh',
        ],
        [
            0xb382_832e,
            [
                'hi' => 0x332c_8ed4,
                'lo' => 0xdae5_ba42,
            ],
            '332c8ed4dae5ba42',
            'abcdefghi',
        ],
        [
            0x3f19_a3cb,
            [
                'hi' => 0xad05_2244,
                'lo' => 0xb781_c4eb,
            ],
            'ad052244b781c4eb',
            '0123456789',
        ],
        [
            0x0ee8_3c5c,
            [
                'hi' => 0x3ef4_c035,
                'lo' => 0x1420_8c77,
            ],
            '3ef4c03514208c77',
            '0123456789 ',
        ],
        [
            0x6fca_023f,
            [
                'hi' => 0x4968_41e8,
                'lo' => 0x3a33_cc91,
            ],
            '496841e83a33cc91',
            '0123456789-0',
        ],
        [
            0x6b2c_02bd,
            [
                'hi' => 0xd81b_cb9f,
                'lo' => 0x3679_ac0c,
            ],
            'd81bcb9f3679ac0c',
            '0123456789~01',
        ],
        [
            0x0b8e_8fba,
            [
                'hi' => 0x5da5_a6a1,
                'lo' => 0x17c6_06f6,
            ],
            '5da5a6a117c606f6',
            '0123456789#012',
        ],
        [
            0xe694_6835,
            [
                'hi' => 0x5361_eae1,
                'lo' => 0x7c1f_f6bc,
            ],
            '5361eae17c1ff6bc',
            '0123456789@0123',
        ],
        [
            0xfa44_df74,
            [
                'hi' => 0x4283_d4ef,
                'lo' => 0x4362_7f64,
            ],
            '4283d4ef43627f64',
            '0123456789\'01234',
        ],
        [
            0x2a1e_d264,
            [
                'hi' => 0x46a7_416e,
                'lo' => 0xd486_1e3b,
            ],
            '46a7416ed4861e3b',
            '0123456789=012345',
        ],
        [
            0xbcd3_277f,
            [
                'hi' => 0xa4ab_b4e0,
                'lo' => 0xda2c_594c,
            ],
            'a4abb4e0da2c594c',
            '0123456789+0123456',
        ],
        [
            0x26bf_5a67,
            [
                'hi' => 0xcf1c_7d3a,
                'lo' => 0xd54f_9215,
            ],
            'cf1c7d3ad54f9215',
            '0123456789*01234567',
        ],
        [
            0x8eed_b634,
            [
                'hi' => 0x07ad_f50b,
                'lo' => 0x2ac7_64fc,
            ],
            '07adf50b2ac764fc',
            '0123456789&012345678',
        ],
        [
            0xa329_652e,
            [
                'hi' => 0xdebc_ba8e,
                'lo' => 0x6f3e_abd1,
            ],
            'debcba8e6f3eabd1',
            '0123456789^0123456789',
        ],
        [
            0x4ba9_b4ed,
            [
                'hi' => 0x4dbd_128a,
                'lo' => 0xf51d_77e8,
            ],
            '4dbd128af51d77e8',
            '0123456789%0123456789£',
        ],
        [
            0x1b9e_a72f,
            [
                'hi' => 0xd78d_5f85,
                'lo' => 0x2d52_2e6a,
            ],
            'd78d5f852d522e6a',
            '0123456789$0123456789!0',
        ],
        [
            0x819d_77a5,
            [
                'hi' => 0x80d7_3b84,
                'lo' => 0x3ba5_7db8,
            ],
            '80d73b843ba57db8',
            'size:  a.out:  bad magic',
        ],
        [
            0x8b72_761e,
            [
                'hi' => 0x8eb3_808d,
                'lo' => 0x1ccf_c779,
            ],
            '8eb3808d1ccfc779',
            'Nepal premier won\'t resign.',
        ],
        [
            0x5f21_fe43,
            [
                'hi' => 0xb944_f8a1,
                'lo' => 0x6261_e414,
            ],
            'b944f8a16261e414',
            'C is as portable as Stonehedge!!',
        ],
        [
            0xa15e_ad04,
            [
                'hi' => 0xe8f8_9ab6,
                'lo' => 0xdf9b_dd25,
            ],
            'e8f89ab6df9bdd25',
            'Discard medicine more than two years old.',
        ],
        [
            0xe376_3baf,
            [
                'hi' => 0xa996_1670,
                'lo' => 0xce2a_46d9,
            ],
            'a9961670ce2a46d9',
            'I wouldn\'t marry him with a ten foot pole.',
        ],
        [
            0x50a4_8aaa,
            [
                'hi' => 0xbdd6_9b79,
                'lo' => 0x8d6b_a37a,
            ],
            'bdd69b798d6ba37a',
            'If the enemy is within range, then so are you.',
        ],
        [
            0x517e_346c,
            [
                'hi' => 0xc2f8_db86,
                'lo' => 0x24fe_fc0e,
            ],
            'c2f8db8624fefc0e',
            'The major problem is with sendmail.  -Mark Horton',
        ],
        [
            0x8a4b_0b6c,
            [
                'hi' => 0x5a0a_6efd,
                'lo' => 0x52e8_4e2a,
            ],
            '5a0a6efd52e84e2a',
            'How can you write a big system without C++?  -Paul Glick',
        ],
        [
            0xb360_937b,
            [
                'hi' => 0x786d_7e19,
                'lo' => 0x8702_3ca9,
            ],
            '786d7e1987023ca9',
            'He who has a shady past knows that nice guys finish last.',
        ],
        [
            0x2e57_13b3,
            [
                'hi' => 0x5d14_f96c,
                'lo' => 0x18fe_3d5e,
            ],
            '5d14f96c18fe3d5e',
            'Free! Free!/A trip/to Mars/for 900/empty jars/Burma Shave',
        ],
        [
            0xec6d_1e0e,
            [
                'hi' => 0xec88_48fd,
                'lo' => 0x3b26_6c10,
            ],
            'ec8848fd3b266c10',
            'His money is twice tainted: \'taint yours and \'taint mine.',
        ],
        [
            0x7175_f31d,
            [
                'hi' => 0x2a57_8b80,
                'lo' => 0xbb82_147c,
            ],
            '2a578b80bb82147c',
            'The days of the digital watch are numbered.  -Tom Stoppard',
        ],
        [
            0xdf4c_5297,
            [
                'hi' => 0x5518_2f88,
                'lo' => 0x59ec_a4ce,
            ],
            '55182f8859eca4ce',
            'For every action there is an equal and opposite government program.',
        ],
        [
            0x6235_9aca,
            [
                'hi' => 0xabcd_b319,
                'lo' => 0xfcf2_826c,
            ],
            'abcdb319fcf2826c',
            'You remind me of a TV show, but that\'s all right: I watch it anyway.',
        ],
        [
            0x398c_0b7c,
            [
                'hi' => 0x1d85_7025,
                'lo' => 0x03ac_7eb4,
            ],
            '1d85702503ac7eb4',
            'It\'s well we cannot hear the screams/That we create in others\' dreams.',
        ],
        [
            0x0004_7f9c,
            [
                'hi' => 0xa2b8_bf30,
                'lo' => 0x3202_1993,
            ],
            'a2b8bf3032021993',
            'Give me a rock, paper and scissors and I will move the world.  CCFestoon',
        ],
        [
            0xe562_39a7,
            [
                'hi' => 0x38aa_3175,
                'lo' => 0xb37f_305c,
            ],
            '38aa3175b37f305c',
            'It\'s a tiny change to the code and not completely disgusting. - Bob Manchek',
        ],
        [
            0xb556_f325,
            [
                'hi' => 0x7e85_d7b0,
                'lo' => 0x50ed_2967,
            ],
            '7e85d7b050ed2967',
            'There is no reason for any individual to have a computer in their home. -Ken Olsen, 1977',
        ],
        [
            0x75cc_5362,
            [
                'hi' => 0x5a05_644e,
                'lo' => 0xb66e_435e,
            ],
            '5a05644eb66e435e',
            'Even if I could be Shakespeare, I think I should still choose to be Faraday. - A. Huxley',
        ],
        [
            0xc401_a0bf,
            [
                'hi' => 0x098e_ff69,
                'lo' => 0x58c5_e91a,
            ],
            '098eff6958c5e91a',
            'The fugacity of a constituent in a mixture of gases at a given temperature is proportional to its mole fraction.  Lewis-Randall Rule',
        ],
        [
            0x4e56_b7e9,
            [
                'hi' => 0xc3f0_2c4f,
                'lo' => 0xfd5d_71e6,
            ],
            'c3f02c4ffd5d71e6',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        ],
    ];

    // @codingStandardsIgnoreEnd

    protected function getTestObject(): FarmHash64
    {
        return new FarmHash64();
    }

    public function testFarmhash32(): void
    {
        foreach (self::TEST_DATA as $data) {
            $h = $this->getTestObject()->farmhash32($data[3]);
            static::assertEquals($data[0], $h);
        }
    }

    public function testFarmhash64(): void
    {
        foreach (self::TEST_DATA as $data) {
            $h = $this->getTestObject()->farmhash64($data[3]);
            static::assertEquals($data[1]['hi'], $h['hi']);
            static::assertEquals($data[1]['lo'], $h['lo']);
        }
    }

    public function testFarmhash64Hex(): void
    {
        foreach (self::TEST_DATA as $data) {
            $h = $this->getTestObject()->farmhash64Hex($data[3]);
            static::assertEquals($data[2], $h);
        }
    }
}
