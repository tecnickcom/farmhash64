<?php

/** FarmHash64 PHP Library
 *
 * farmhash64.php
 *
 *
 * The Library farmhash64 implements the FarmHash64 and FarmHash32 hash functions for strings.
 *
 * FarmHash is a family of hash functions.
 *
 * FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
 * It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.
 *
 * The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.
 *
 * All members of the FarmHash family were designed with heavy reliance on previous work by
 * Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
 * This is a PHP port of the Fingerprint64 (farmhashna::Hash64) code
 * from Google's FarmHash (https://github.com/google/farmhash).
 *
 * This code has been ported/translated by Nicola Asuni (Tecnick.com) to PHP code.
 *
 * NOTE: PHP has no support for unsigned integers. This class requires 64-bit platform support.
 *       The function farmhash64Hex is provided to calculate the 64-bit hash value from a string
 *       and return it as a fixed-length hexadecimal string.
 *
 * @category   Libraries
 * @license    see LICENSE file
 * @link       https://github.com/tecnickcom/farmhash64
 */

namespace Com\Tecnick\FarmHash64;

/**
 * The FarmHash64 class provides methods for generating 64-bit hash values using the FarmHash algorithm.
 *
 * @package FarmHash64
 *
 * @phpstan-type Uint64S32 array{'hi': int, 'lo': int}
 * @phpstan-type Uint64S16 array{'hi': array{'hi': int, 'lo': int}, 'lo': array{'hi': int, 'lo': int}}
 */
class FarmHash64
{
    private const MASK8 = 0xff;
    private const MASK16 = 0xffff;
    private const MASK32 = 0xffffffff;

    private const K0 = [
        'hi' => 0xc3a5c85c,
        'lo' => 0x97cb3127,
    ];

    private const K1 = [
        'hi' => 0xb492b66f,
        'lo' => 0xbe98f273,
    ];

    private const K2 = [
        'hi' => 0x9ae16a3b,
        'lo' => 0x2f90404f,
    ];

    private const C1 = 0xcc9e2d51;
    private const C2 = 0x1b873593;

    /**
     * @param Uint64S32 $a
     * @param Uint64S32 $b
     * @return Uint64S32
     */
    private function u64Add(array $a, array $b): array
    {
        $losum = $a['lo'] + $b['lo'];
        $cb = ($losum & self::MASK32) < $a['lo'] || ($losum & self::MASK32) < $b['lo'] ? 1 : 0;
        return [
            'hi' => ($a['hi'] + $b['hi'] + $cb) & self::MASK32,
            'lo' => $losum & self::MASK32,
        ];
    }

    /**
     * @param int $a
     * @return Uint64S32
     */
    private function u32Split16(int $a): array
    {
        return [
            'hi' => ($a >> 16) & self::MASK16,
            'lo' => $a & self::MASK16,
        ];
    }

    /**
     * @param int $a
     * @param int $b
     * @return int
     */
    private function u32Mul(int $a, int $b): int
    {
        $x = $this->u32Split16($a);
        $y = $this->u32Split16($b);
        return ($x['lo'] * $y['lo']
        + (((($x['hi'] * $y['lo']) + ($x['lo'] * $y['hi'])) << 16) & self::MASK32))
        & self::MASK32;
    }

    /**
     * @param int $a
     * @param int $b
     * @return Uint64S32
     */
    private function u32Mul64(int $a, int $b): array
    {
        $x = $this->u32Split16($a);
        $y = $this->u32Split16($b);
        $s = [
            'hi' => $this->u32Mul($x['hi'], $y['hi']),
            'lo' => $this->u32Mul($x['lo'], $y['lo']),
        ];
        $t = $this->u32Mul($x['hi'], $y['lo']);
        $u = $this->u32Mul($x['lo'], $y['hi']);
        $v = [
            'hi' => ($t >> 16) & self::MASK32,
            'lo' => ($t << 16) & self::MASK32,
        ];
        $w = [
            'hi' => ($u >> 16) & self::MASK32,
            'lo' => ($u << 16) & self::MASK32,
        ];
        return $this->u64Add($this->u64Add($s, $v), $w);
    }

    /**
     * @param Uint64S32 $a
     * @param Uint64S32 $b
     * @return Uint64S32
     */
    private function u64Mul(array $a, array $b): array
    {
        return $this->u64Add(
            [
                'hi' => ($this->u32Mul($a['hi'], $b['lo'])
                + $this->u32Mul($a['lo'], $b['hi'])) & self::MASK32,
                'lo' => 0,
            ],
            $this->u32Mul64($a['lo'], $b['lo'])
        );
    }

    /**
     * @param int $a
     * @param int $s
     * @return int
     */
    private function u32RotR(int $a, int $s): int
    {
        if ($s <= 0 || $s >= 32) {
            return $a & self::MASK32;
        }
        return (($a << (32 - $s)) | ($a >> $s)) & self::MASK32;
    }

    /**
     * @param Uint64S32 $a
     * @param int $s
     * @return Uint64S32
     */
    private function u64RotR(array $a, int $s): array
    {
        if ($s <= 0 || $s >= 64) {
            return [
                'hi' => $a['hi'] & self::MASK32,
                'lo' => $a['lo'] & self::MASK32,
            ];
        }
        if ($s < 32) {
            $sl = 32 - $s;
            return [
                'hi' => (($a['lo'] << $sl) | ($a['hi'] >> $s)) & self::MASK32,
                'lo' => (($a['hi'] << $sl) | ($a['lo'] >> $s)) & self::MASK32,
            ];
        }
        if ($s === 32) {
            return [
                'hi' => $a['lo'] & self::MASK32,
                'lo' => $a['hi'] & self::MASK32,
            ];
        }
        $sl = 64 - $s;
        $sr = $s - 32;
        return [
            'hi' => (($a['hi'] << $sl) | ($a['lo'] >> $sr)) & self::MASK32,
            'lo' => (($a['lo'] << $sl) | ($a['hi'] >> $sr)) & self::MASK32,
        ];
    }

    /**
     * @param Uint64S32 $a
     * @param int $s
     * @return Uint64S32
     */
    private function u64ShiftL(array $a, int $s): array
    {
        if ($s <= 0 || $s >= 64) {
            return [
                'hi' => $a['hi'] & self::MASK32,
                'lo' => $a['lo'] & self::MASK32,
            ];
        }
        if ($s < 32) {
            return [
                'hi' => (($a['lo'] >> (32 - $s)) | (($a['hi'] << $s) & self::MASK32)) & self::MASK32,
                'lo' => ($a['lo'] << $s) & self::MASK32,
            ];
        }
        return [
            'hi' => ($a['lo'] << ($s - 32)) & self::MASK32,
            'lo' => 0,
        ];
    }

    /**
     * @param Uint64S32 $a
     * @param int $s
     * @return Uint64S32
     */
    private function u64ShiftR(array $a, int $s): array
    {
        if ($s <= 0 || $s >= 64) {
            return [
                'hi' => $a['hi'] & self::MASK32,
                'lo' => $a['lo'] & self::MASK32,
            ];
        }
        if ($s < 32) {
            return [
                'hi' => ($a['hi'] >> $s) & self::MASK32,
                'lo' => (($a['hi'] << (32 - $s)) | ($a['lo'] >> $s)) & self::MASK32,
            ];
        }
        return [
            'hi' => 0,
            'lo' => ($a['hi'] >> ($s - 32)) & self::MASK32,
        ];
    }

    /**
     * @param Uint64S32 $a
     * @param Uint64S32 $b
     * @return Uint64S32
     */
    private function u64XOR(array $a, array $b): array
    {
        return [
            'hi' => ($a['hi'] ^ $b['hi']) & self::MASK32,
            'lo' => ($a['lo'] ^ $b['lo']) & self::MASK32,
        ];
    }

    /**
     * @param string $s
     * @param int $i
     * @return Uint64S32
     */
    private function fetchU32(string &$s, int $i): array
    {
        $lo =
            (ord($s[$i + 0]) & self::MASK32) |
            ((ord($s[$i + 1]) & self::MASK32) << 8) |
            ((ord($s[$i + 2]) & self::MASK32) << 16) |
            ((ord($s[$i + 3]) & self::MASK32) << 24);
        return [
            'hi' => 0,
            'lo' => $lo & self::MASK32,
        ];
    }

    /**
     * @param string $s
     * @param int $i
     * @return Uint64S32
     */
    private function fetchU64(string &$s, int $i): array
    {
        $lo = (ord($s[$i + 0]) & self::MASK32) |
            ((ord($s[$i + 1]) & self::MASK32) << 8) |
            ((ord($s[$i + 2]) & self::MASK32) << 16) |
            ((ord($s[$i + 3]) & self::MASK32) << 24);
        $hi = ((ord($s[$i + 4]) & self::MASK32)) |
            ((ord($s[$i + 5]) & self::MASK32) << 8) |
            ((ord($s[$i + 6]) & self::MASK32) << 16) |
            ((ord($s[$i + 7]) & self::MASK32) << 24);
        return [
            'hi' => $hi & self::MASK32,
            'lo' => $lo & self::MASK32,
        ];
    }

    /**
     * @param Uint64S32 $v
     * @return Uint64S32
     */
    private function shiftMix(array $v): array
    {
        return $this->u64XOR($v, $this->u64ShiftR($v, 47));
    }

    /**
     * @param int $a
     * @param int $h
     * @return int
     */
    private function mur(int $a, int $h): int
    {
        $a = $this->u32Mul($a, self::C1);
        $a = $this->u32RotR($a, 17);
        $a = $this->u32Mul($a, self::C2);
        $h = $h ^ $a;
        $h = $this->u32RotR($h, 19);
        return ($this->u32Mul($h, 5) + 0xe6546b64) & self::MASK32;
    }

    /**
     * @param Uint64S32 $v
     * @return int
     */
    private function mix64To32(array $v): int
    {
        return $this->mur($v['hi'], $v['lo']);
    }

    /**
     * @param Uint64S32 $u
     * @param Uint64S32 $v
     * @param Uint64S32 $mul
     * @return Uint64S32
     */
    private function hashLen16Mul(array $u, array $v, array $mul): array
    {
        $a = $this->u64Mul($this->u64XOR($u, $v), $mul);
        $a = $this->u64XOR($a, $this->u64ShiftR($a, 47));
        $b = $this->u64Mul($this->u64XOR($v, $a), $mul);
        $b = $this->u64XOR($b, $this->u64ShiftR($b, 47));
        $b = $this->u64Mul($b, $mul);
        return $b;
    }

    /**
     * @param string $s
     * @return Uint64S32
     */
    private function hashLen0to16(string &$s): array
    {
        $slen = strlen($s);
        $slen64 = [
            'hi' => 0,
            'lo' => $slen,
        ];

        if ($slen >= 8) {
            $mul = $this->u64Add(
                self::K2,
                $this->u64Mul($slen64, [
                    'hi' => 0,
                    'lo' => 2,
                ])
            );
            $a = $this->u64Add($this->fetchU64($s, 0), self::K2);
            $b = $this->fetchU64($s, ($slen - 8));
            $br = $this->u64RotR($b, 37);
            $dr = $this->u64RotR($a, 25);
            $c = $this->u64Add($this->u64Mul($br, $mul), $a);
            $d = $this->u64Mul($this->u64Add($dr, $b), $mul);

            return $this->hashLen16Mul($c, $d, $mul);
        }

        if ($slen >= 4) {
            $mul = $this->u64Add(
                self::K2,
                $this->u64Mul($slen64, [
                    'hi' => 0,
                    'lo' => 2,
                ])
            );
            $a = $this->fetchU32($s, 0);
            $u = $this->u64Add($slen64, $this->u64ShiftL($a, 3));
            $v = $this->fetchU32($s, $slen - 4);
            return $this->hashLen16Mul($u, $v, $mul);
        }

        if ($slen > 0) {
            $a = ord($s[0]) & self::MASK32;
            $b = ord($s[($slen >> 1)]) & self::MASK32;
            $c = ord($s[($slen - 1)]) & self::MASK32;
            $y = ($a + ($b << 8)) & self::MASK32;
            $z = ($slen + ($c << 2)) & self::MASK32;

            return $this->u64Mul(
                $this->shiftMix(
                    $this->u64XOR(
                        $this->u64Mul([
                            'hi' => 0,
                            'lo' => $y,
                        ], self::K2),
                        $this->u64Mul([
                            'hi' => 0,
                            'lo' => $z,
                        ], self::K0)
                    )
                ),
                self::K2
            );
        }

        return self::K2;
    }

    /**
     * @param string $s
     * @return Uint64S32
     */
    private function hashLen17to32(string &$s): array
    {
        $slen = strlen($s);
        $slen64 = [
            'hi' => 0,
            'lo' => $slen,
        ];
        $mul = $this->u64Add(
            self::K2,
            $this->u64Mul($slen64, [
                'hi' => 0,
                'lo' => 2,
            ])
        );
        $a = $this->u64Mul($this->fetchU64($s, 0), self::K1);
        $b = $this->fetchU64($s, 8);
        $c = $this->u64Mul($this->fetchU64($s, $slen - 8), $mul);
        $d = $this->u64Mul($this->fetchU64($s, $slen - 16), self::K2);

        return $this->hashLen16Mul(
            $this->u64Add($this->u64Add($this->u64RotR($this->u64Add($a, $b), 43), $this->u64RotR($c, 30)), $d),
            $this->u64Add($this->u64Add($a, $this->u64RotR($this->u64Add($b, self::K2), 18)), $c),
            $mul
        );
    }

    /**
     * @param string $s
     * @return Uint64S32
     */
    private function hashLen33to64(string &$s): array
    {
        $slen = strlen($s);
        $slen64 = [
            'hi' => 0,
            'lo' => $slen,
        ];
        $mul = $this->u64Add(
            self::K2,
            $this->u64Mul($slen64, [
                'hi' => 0,
                'lo' => 2,
            ])
        );
        $a = $this->u64Mul($this->fetchU64($s, 0), self::K2);
        $b = $this->fetchU64($s, 8);
        $c = $this->u64Mul($this->fetchU64($s, $slen - 8), $mul);
        $d = $this->u64Mul($this->fetchU64($s, $slen - 16), self::K2);
        $y = $this->u64Add($this->u64Add($this->u64RotR($this->u64Add($a, $b), 43), $this->u64RotR($c, 30)), $d);
        $z = $this->hashLen16Mul(
            $y,
            $this->u64Add($this->u64Add($a, $this->u64RotR($this->u64Add($b, self::K2), 18)), $c),
            $mul
        );
        $e = $this->u64Mul($this->fetchU64($s, 16), $mul);
        $f = $this->fetchU64($s, 24);
        $g = $this->u64Mul($this->u64Add($y, $this->fetchU64($s, $slen - 32)), $mul);
        $h = $this->u64Mul($this->u64Add($z, $this->fetchU64($s, $slen - 24)), $mul);
        return $this->hashLen16Mul(
            $this->u64Add($this->u64Add($this->u64RotR($this->u64Add($e, $f), 43), $this->u64RotR($g, 30)), $h),
            $this->u64Add($this->u64Add($e, $this->u64RotR($this->u64Add($f, $a), 18)), $g),
            $mul
        );
    }

    /**
     * @param Uint64S32 $w
     * @param Uint64S32 $x
     * @param Uint64S32 $y
     * @param Uint64S32 $z
     * @param Uint64S32 $a
     * @param Uint64S32 $b
     * @return Uint64S16
     */
    private function weakHashLen32WithSeedsWords(
        array $w,
        array $x,
        array $y,
        array $z,
        array $a,
        array $b,
    ): array {
        $a = $this->u64Add($a, $w);
        $b = $this->u64RotR($this->u64Add($this->u64Add($b, $a), $z), 21);
        $c = $a;
        $a = $this->u64Add($a, $x);
        $a = $this->u64Add($a, $y);
        $b = $this->u64Add($b, $this->u64RotR($a, 44));
        return [
            'hi' => $this->u64Add($b, $c),
            'lo' => $this->u64Add($a, $z),
        ];
    }

    /**
     * @param string $s
     * @param int $idx
     * @param Uint64S32 $a
     * @param Uint64S32 $b
     * @return Uint64S16
     */
    private function weakHashLen32WithSeeds(string $s, int $idx, array $a, array $b): array
    {
        return $this->weakHashLen32WithSeedsWords(
            $this->fetchU64($s, $idx + 0),
            $this->fetchU64($s, $idx + 8),
            $this->fetchU64($s, $idx + 16),
            $this->fetchU64($s, $idx + 24),
            $a,
            $b
        );
    }

    /**
     * Calculates the 64-bit FarmHash hash value for the given string.
     *
     * @param string &$s The input string to calculate the hash value for.
     *
     * @return Uint64S32 The 64-bit hash value split into two uint32 parts.
     */
    public function farmhash64(string &$s): array
    {
        $slen = strlen($s);

        if ($slen <= 32) {
            if ($slen <= 16) {
                return $this->hashLen0to16($s);
            }

            return $this->hashLen17to32($s);
        }

        if ($slen <= 64) {
            return $this->hashLen33to64($s);
        }

        $v = [
            'hi' => [
                'hi' => 0,
                'lo' => 0,
            ],
            'lo' => [
                'hi' => 0,
                'lo' => 0,
            ],
        ];

        $w = [
            'hi' => [
                'hi' => 0,
                'lo' => 0,
            ],
            'lo' => [
                'hi' => 0,
                'lo' => 0,
            ],
        ];

        $seed = [
            'hi' => 0,
            'lo' => 81,
        ];

        $a113 = [
            'hi' => 0,
            'lo' => 113,
        ];

        $x = $this->u64Add($this->u64Mul($seed, self::K2), $this->fetchU64($s, 0));
        $y = $this->u64Add($this->u64Mul($seed, self::K1), $a113);
        $z = $this->u64Mul($this->shiftMix($this->u64Add($this->u64Mul($y, self::K2), $a113)), self::K2);

        $endIdx = (($slen - 1) >> 6) << 6;
        $last64Idx = $endIdx + (($slen - 1) & 63) - 63;

        $idx = 0;

        while ($slen > 64) {
            $x = $this->u64Mul(
                $this->u64RotR(
                    $this->u64Add(
                        $this->u64Add(
                            $this->u64Add($x, $y),
                            $v['lo']
                        ),
                        $this->fetchU64($s, $idx + 8)
                    ),
                    37
                ),
                self::K1
            );
            $y = $this->u64Mul(
                $this->u64RotR(
                    $this->u64Add(
                        $this->u64Add($y, $v['hi']),
                        $this->fetchU64($s, $idx + 48)
                    ),
                    42
                ),
                self::K1
            );
            $x = $this->u64XOR($x, $w['hi']);
            $y = $this->u64Add($y, $this->u64Add($v['lo'], $this->fetchU64($s, $idx + 40)));
            $z = $this->u64Mul($this->u64RotR($this->u64Add($z, $w['lo']), 33), self::K1);
            $v = $this->weakHashLen32WithSeeds(
                $s,
                $idx,
                $this->u64Mul($v['hi'], self::K1),
                $this->u64Add($x, $w['lo'])
            );
            $w = $this->weakHashLen32WithSeeds(
                $s,
                $idx + 32,
                $this->u64Add($z, $w['hi']),
                $this->u64Add($y, $this->fetchU64($s, $idx + 16))
            );
            $tmp = $x;
            $x = $z;
            $z = $tmp;
            $idx += 64;
            $slen -= 64;
        }

        $mul = $this->u64Add(self::K1, [
            'hi' => 0,
            'lo' => (($z['lo'] & self::MASK8) << 1) & self::MASK32,
        ]);
        $idx = $last64Idx;
        $w['lo'] = $this->u64Add($w['lo'], [
            'hi' => 0,
            'lo' => (($slen - 1) & 63) & self::MASK32,
        ]);
        $v['lo'] = $this->u64Add($v['lo'], $w['lo']);
        $w['lo'] = $this->u64Add($w['lo'], $v['lo']);
        $x = $this->u64Mul(
            $this->u64RotR(
                $this->u64Add(
                    $this->u64Add(
                        $this->u64Add($x, $y),
                        $v['lo']
                    ),
                    $this->fetchU64($s, $idx + 8)
                ),
                37
            ),
            $mul
        );
        $y = $this->u64Mul(
            $this->u64RotR(
                $this->u64Add(
                    $this->u64Add($y, $v['hi']),
                    $this->fetchU64($s, $idx + 48)
                ),
                42
            ),
            $mul
        );
        $x = $this->u64XOR(
            $x,
            $this->u64Mul($w['hi'], [
                'hi' => 0,
                'lo' => 9,
            ])
        );
        $y = $this->u64Add(
            $y,
            $this->u64Add(
                $this->u64Mul($v['lo'], [
                    'hi' => 0,
                    'lo' => 9,
                ]),
                $this->fetchU64($s, $idx + 40)
            )
        );
        $z = $this->u64Mul($this->u64RotR($this->u64Add($z, $w['lo']), 33), $mul);
        $v = $this->weakHashLen32WithSeeds($s, $idx, $this->u64Mul($v['hi'], $mul), $this->u64Add($x, $w['lo']));
        $w = $this->weakHashLen32WithSeeds(
            $s,
            $idx + 32,
            $this->u64Add($z, $w['hi']),
            $this->u64Add($y, $this->fetchU64($s, $idx + 16))
        );
        $tmp = $x;
        $x = $z;
        $z = $tmp;

        return $this->hashLen16Mul(
            $this->u64Add(
                $this->u64Add(
                    $this->hashLen16Mul($v['lo'], $w['lo'], $mul),
                    $this->u64Mul($this->shiftMix($y), self::K0)
                ),
                $z
            ),
            $this->u64Add($this->hashLen16Mul($v['hi'], $w['hi'], $mul), $x),
            $mul
        );
    }

    /**
     * Calculates the 32-bit FarmHash hash value for the given string.
     *
     * @param string &$s The input string to calculate the hash value for.
     *
     * @return int The 32-bit hash value.
     */
    public function farmhash32(string &$s): int
    {
        return $this->mix64To32($this->farmhash64($s));
    }

    /**
     * Calculates the FarmHash64 hash value of a given string and returns it in hexadecimal format.
     *
     * @param string $s The input string to calculate the hash value for.
     *
     * @return string The hexadecimal representation of the FarmHash64 hash value.
     */
    public function farmhash64Hex(string $s): string
    {
        $h = $this->farmhash64($s);
        return sprintf('%08x%08x', $h['hi'], $h['lo']);
    }
}
