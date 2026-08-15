<?php

/** FarmHash64 PHP Library
 *
 * FarmHash64.php
 *
 * This library implements the farmhash64 and farmhash32 hash functions for strings.
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
 * This is Nicola Asuni's (Tecnick.com) PHP rewrite of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).
 *
 * NOTE: PHP has no support for unsigned integers. This class requires 64-bit platform support.
 *       Internally each 64-bit value is carried in a native PHP int holding the two's-complement
 *       bit pattern, so half of the possible hash values appear as negative integers.
 *       The functions farmhash64Hex and farmhash32Hex are provided to obtain the hash values
 *       as fixed-length hexadecimal strings, and farmhash64 returns the value split into two
 *       unsigned 32-bit halves.
 *
 * @category   Libraries
 * @license    see LICENSE file
 * @link       https://github.com/tecnickcom/farmhash64
 */

declare(strict_types=1);

namespace Com\Tecnick\FarmHash64;

/**
 * Provides the farmhash64 and farmhash32 hash functions for strings.
 *
 * @package FarmHash64
 *
 * @phpstan-type Uint64S32 array{'hi': int, 'lo': int}
 */
class FarmHash64
{
    private const MASK16 = 0xffff;
    private const MASK32 = 0xffff_ffff;

    // Some primes between 2^63 and 2^64 for various uses, as signed 64-bit
    // two's-complement values: PHP integer literals above PHP_INT_MAX would
    // silently become floats.
    private const K0 = -4_348_849_565_147_123_417; // 0xc3a5c85c97cb3127
    private const K1 = -5_435_081_209_227_447_693; // 0xb492b66fbe98f273
    private const K2 = -7_286_425_919_675_154_353; // 0x9ae16a3b2f90404f

    // Magic numbers for 32-bit hashing. Copied from Murmur3.
    private const C1 = 0xcc9e_2d51;
    private const C2 = 0x1b87_3593;

    /**
     * Add two 64-bit values, wrapping around on overflow.
     *
     * A plain `$a + $b` would silently produce a float once the result leaves
     * the signed 64-bit range, so the halves are added separately and the high
     * half is truncated by the left shift.
     *
     * @param int $a
     * @param int $b
     * @return int
     */
    private function add64(int $a, int $b): int
    {
        $lo = ($a & self::MASK32) + ($b & self::MASK32);
        return (((($a >> 32) + ($b >> 32) + ($lo >> 32)) << 32) | ($lo & self::MASK32));
    }

    /**
     * Multiply two 64-bit values, truncated to 64 bits.
     *
     * The operands are split into 16-bit limbs so that no partial product ever
     * leaves the signed 64-bit range and degrades to a float.
     *
     * @param int $a
     * @param int $b
     * @return int
     */
    private function mul64(int $a, int $b): int
    {
        $a0 = $a & self::MASK16;
        $a1 = ($a >> 16) & self::MASK16;
        $a2 = ($a >> 32) & self::MASK16;
        $a3 = ($a >> 48) & self::MASK16;
        $b0 = $b & self::MASK16;
        $b1 = ($b >> 16) & self::MASK16;
        $b2 = ($b >> 32) & self::MASK16;
        $b3 = ($b >> 48) & self::MASK16;

        $acc = $a0 * $b0;
        $r0 = $acc & self::MASK16;
        $acc = ($acc >> 16) + ($a0 * $b1) + ($a1 * $b0);
        $r1 = $acc & self::MASK16;
        $acc = ($acc >> 16) + ($a0 * $b2) + ($a1 * $b1) + ($a2 * $b0);
        $r2 = $acc & self::MASK16;
        $acc = ($acc >> 16) + ($a0 * $b3) + ($a1 * $b2) + ($a2 * $b1) + ($a3 * $b0);

        return $r0 | ($r1 << 16) | ($r2 << 32) | (($acc & self::MASK16) << 48);
    }

    /**
     * Shift a 64-bit value right by the given number of bits, filling with zeros.
     *
     * PHP's `>>` is arithmetic, so the sign-extended bits are masked off.
     * The shift count must be in the range 1 to 63.
     *
     * @param int $v
     * @param int $n
     * @return int
     */
    private function shr64(int $v, int $n): int
    {
        return ($v >> $n) & (PHP_INT_MAX >> ($n - 1));
    }

    /**
     * Rotate a 64-bit value right by the given number of bits.
     * Shifts of 0 or of 64 and above return the value unchanged.
     *
     * @param int $v
     * @param int $n
     * @return int
     */
    private function rotr64(int $v, int $n): int
    {
        if ($n <= 0 || $n >= 64) {
            return $v;
        }
        return (($v >> $n) & (PHP_INT_MAX >> ($n - 1))) | ($v << (64 - $n));
    }

    /**
     * Multiply two 32-bit values, truncated to 32 bits.
     *
     * @param int $a
     * @param int $b
     * @return int
     */
    private function mul32(int $a, int $b): int
    {
        $a0 = $a & self::MASK16;
        $a1 = ($a >> 16) & self::MASK16;
        $b0 = $b & self::MASK16;
        $b1 = ($b >> 16) & self::MASK16;

        return (($a0 * $b0) + (((($a0 * $b1) + ($a1 * $b0)) << 16) & self::MASK32)) & self::MASK32;
    }

    /**
     * Rotate a 32-bit value right by the given number of bits.
     * Shifts of 0 or of 32 and above return the value unchanged.
     *
     * @param int $a
     * @param int $s
     * @return int
     */
    private function rotr32(int $a, int $s): int
    {
        if ($s <= 0 || $s >= 32) {
            return $a & self::MASK32;
        }
        return ((($a << (32 - $s)) | ($a >> $s)) & self::MASK32);
    }

    /**
     * Fetch a 32-bit little-endian value from a string.
     *
     * @param string $s
     * @param int $i
     * @return int
     */
    private function fetch32(string $s, int $i): int
    {
        /** @var array{1: int} $v */
        $v = unpack('V', $s, $i);
        return $v[1];
    }

    /**
     * Fetch a 64-bit little-endian value from a string.
     *
     * @param string $s
     * @param int $i
     * @return int
     */
    private function fetch64(string $s, int $i): int
    {
        /** @var array{1: int} $v */
        $v = unpack('P', $s, $i);
        return $v[1];
    }

    /**
     * XOR a 64-bit value with itself shifted right by 47 bits.
     *
     * @param int $v
     * @return int
     */
    private function shiftMix(int $v): int
    {
        return $v ^ (($v >> 47) & 0x1_ffff); // 0x1ffff == PHP_INT_MAX >> 46
    }

    /**
     * Combine a 32-bit value into a running hash using the MurmurHash3 mixing step.
     *
     * @param int $a
     * @param int $h
     * @return int
     */
    private function mur(int $a, int $h): int
    {
        $a = $this->mul32($a, self::C1);
        $a = $this->rotr32($a, 17);
        $a = $this->mul32($a, self::C2);
        $h ^= $a;
        $h = $this->rotr32($h, 19);
        return (($h * 5) + 0xe654_6b64) & self::MASK32;
    }

    /**
     * Reduce a 64-bit value to 32 bits using the MurmurHash3 mixing step.
     *
     * @param int $v
     * @return int
     */
    private function mix64To32(int $v): int
    {
        return $this->mur($this->shr64($v, 32), $v & self::MASK32);
    }

    /**
     * Return a 64-bit hash for 16 bytes given as two 64-bit words, multiplied by a constant.
     *
     * @param int $u
     * @param int $v
     * @param int $mul
     * @return int
     */
    private function hashLen16Mul(int $u, int $v, int $mul): int
    {
        $a = $this->mul64($u ^ $v, $mul);
        $a ^= ($a >> 47) & 0x1_ffff; // 0x1ffff == PHP_INT_MAX >> 46
        $b = $this->mul64($v ^ $a, $mul);
        $b ^= ($b >> 47) & 0x1_ffff;
        return $this->mul64($b, $mul);
    }

    /**
     * Return a 64-bit hash for 0 to 16 bytes.
     *
     * @param string $s
     * @return int
     */
    private function hashLen0to16(string $s): int
    {
        $slen = strlen($s);

        if ($slen >= 8) {
            $mul = $this->add64(self::K2, $slen * 2);
            $a = $this->add64($this->fetch64($s, 0), self::K2);
            $b = $this->fetch64($s, $slen - 8);
            $c = $this->add64($this->mul64($this->rotr64($b, 37), $mul), $a);
            $d = $this->mul64($this->add64($this->rotr64($a, 25), $b), $mul);

            return $this->hashLen16Mul($c, $d, $mul);
        }

        if ($slen >= 4) {
            $mul = $this->add64(self::K2, $slen * 2);
            $a = $this->fetch32($s, 0);
            $u = $this->add64($slen, $a << 3);
            $v = $this->fetch32($s, $slen - 4);
            return $this->hashLen16Mul($u, $v, $mul);
        }

        if ($slen > 0) {
            $a = ord($s[0]);
            $b = ord($s[$slen >> 1]);
            $c = ord($s[$slen - 1]);
            $y = $a + ($b << 8);
            $z = $slen + ($c << 2);

            return $this->mul64(
                $this->shiftMix($this->mul64($y, self::K2) ^ $this->mul64($z, self::K0)),
                self::K2,
            );
        }

        return self::K2;
    }

    /**
     * Return a 64-bit hash for 17 to 32 bytes.
     *
     * @param string $s
     * @return int
     */
    private function hashLen17to32(string $s): int
    {
        $slen = strlen($s);
        $mul = $this->add64(self::K2, $slen * 2);
        $a = $this->mul64($this->fetch64($s, 0), self::K1);
        $b = $this->fetch64($s, 8);
        $c = $this->mul64($this->fetch64($s, $slen - 8), $mul);
        $d = $this->mul64($this->fetch64($s, $slen - 16), self::K2);

        return $this->hashLen16Mul(
            $this->add64(
                $this->add64($this->rotr64($this->add64($a, $b), 43), $this->rotr64($c, 30)),
                $d,
            ),
            $this->add64($this->add64($a, $this->rotr64($this->add64($b, self::K2), 18)), $c),
            $mul,
        );
    }

    /**
     * Return a 64-bit hash for 33 to 64 bytes.
     *
     * @param string $s
     * @return int
     */
    private function hashLen33to64(string $s): int
    {
        $slen = strlen($s);
        $mul = $this->add64(self::K2, $slen * 2);
        $a = $this->mul64($this->fetch64($s, 0), self::K2);
        $b = $this->fetch64($s, 8);
        $c = $this->mul64($this->fetch64($s, $slen - 8), $mul);
        $d = $this->mul64($this->fetch64($s, $slen - 16), self::K2);
        $y = $this->add64(
            $this->add64($this->rotr64($this->add64($a, $b), 43), $this->rotr64($c, 30)),
            $d,
        );
        $z = $this->hashLen16Mul(
            $y,
            $this->add64($this->add64($a, $this->rotr64($this->add64($b, self::K2), 18)), $c),
            $mul,
        );
        $e = $this->mul64($this->fetch64($s, 16), $mul);
        $f = $this->fetch64($s, 24);
        $g = $this->mul64($this->add64($y, $this->fetch64($s, $slen - 32)), $mul);
        $h = $this->mul64($this->add64($z, $this->fetch64($s, $slen - 24)), $mul);

        return $this->hashLen16Mul(
            $this->add64(
                $this->add64($this->rotr64($this->add64($e, $f), 43), $this->rotr64($g, 30)),
                $h,
            ),
            $this->add64($this->add64($e, $this->rotr64($this->add64($f, $a), 18)), $g),
            $mul,
        );
    }

    /**
     * Return a 128-bit weak hash for the 32 bytes of s starting at idx and two seeds.
     * Callers do best to use "random-looking" values for a and b.
     *
     * @param string $s
     * @param int $idx
     * @param int $a
     * @param int $b
     * @return array{0: int, 1: int} The high and low 64-bit halves.
     */
    private function weakHashLen32WithSeeds(string $s, int $idx, int $a, int $b): array
    {
        /** @var array{1: int, 2: int, 3: int, 4: int} $q */
        $q = unpack('P4', $s, $idx);
        [1 => $w, 2 => $x, 3 => $y, 4 => $z] = $q;

        $a = $this->add64($a, $w);
        $b = $this->rotr64($this->add64($this->add64($b, $a), $z), 21);
        $c = $a;
        $a = $this->add64($a, $x);
        $a = $this->add64($a, $y);
        $b = $this->add64($b, $this->rotr64($a, 44));

        return [$this->add64($b, $c), $this->add64($a, $z)];
    }

    /**
     * Returns a 64-bit fingerprint hash for a string as a native signed integer
     * holding the two's-complement bit pattern of the hash.
     *
     * @param string $s The input string to hash.
     *
     * @return int The 64-bit hash value.
     */
    private function hash64(string $s): int
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

        // For strings over 64 bytes we loop.
        // Internal state consists of 56 bytes: v, w, x, y and z.
        $vHi = 0;
        $vLo = 0;
        $wHi = 0;
        $wLo = 0;

        $seed = 81;

        $x = $this->add64($this->mul64($seed, self::K2), $this->fetch64($s, 0));
        $y = $this->add64($this->mul64($seed, self::K1), 113);
        $z = $this->mul64($this->shiftMix($this->add64($this->mul64($y, self::K2), 113)), self::K2);

        // Set the index so that after the loop we have 1 to 64 bytes left to process.
        $endIdx = (($slen - 1) >> 6) << 6;
        $last64Idx = $endIdx + (($slen - 1) & 63) - 63;

        $idx = 0;

        while ($slen > 64) {
            $x = $this->mul64(
                $this->rotr64(
                    $this->add64($this->add64($this->add64($x, $y), $vLo), $this->fetch64($s, $idx + 8)),
                    37,
                ),
                self::K1,
            );
            $y = $this->mul64(
                $this->rotr64($this->add64($this->add64($y, $vHi), $this->fetch64($s, $idx + 48)), 42),
                self::K1,
            );
            $x ^= $wHi;
            $y = $this->add64($y, $this->add64($vLo, $this->fetch64($s, $idx + 40)));
            $z = $this->mul64($this->rotr64($this->add64($z, $wLo), 33), self::K1);
            [$vHi, $vLo] = $this->weakHashLen32WithSeeds(
                $s,
                $idx,
                $this->mul64($vHi, self::K1),
                $this->add64($x, $wLo),
            );
            [$wHi, $wLo] = $this->weakHashLen32WithSeeds(
                $s,
                $idx + 32,
                $this->add64($z, $wHi),
                $this->add64($y, $this->fetch64($s, $idx + 16)),
            );
            $tmp = $x;
            $x = $z;
            $z = $tmp;
            $idx += 64;
            $slen -= 64;
        }

        $mul = $this->add64(self::K1, ($z & 0xff) << 1);

        // Make the index point to the last 64 bytes of input.
        $idx = $last64Idx;
        $wLo = $this->add64($wLo, ($slen - 1) & 63);
        $vLo = $this->add64($vLo, $wLo);
        $wLo = $this->add64($wLo, $vLo);
        $x = $this->mul64(
            $this->rotr64(
                $this->add64($this->add64($this->add64($x, $y), $vLo), $this->fetch64($s, $idx + 8)),
                37,
            ),
            $mul,
        );
        $y = $this->mul64(
            $this->rotr64($this->add64($this->add64($y, $vHi), $this->fetch64($s, $idx + 48)), 42),
            $mul,
        );
        $x ^= $this->mul64($wHi, 9);
        $y = $this->add64($y, $this->add64($this->mul64($vLo, 9), $this->fetch64($s, $idx + 40)));
        $z = $this->mul64($this->rotr64($this->add64($z, $wLo), 33), $mul);
        [$vHi, $vLo] = $this->weakHashLen32WithSeeds(
            $s,
            $idx,
            $this->mul64($vHi, $mul),
            $this->add64($x, $wLo),
        );
        [$wHi, $wLo] = $this->weakHashLen32WithSeeds(
            $s,
            $idx + 32,
            $this->add64($z, $wHi),
            $this->add64($y, $this->fetch64($s, $idx + 16)),
        );
        $tmp = $x;
        $x = $z;
        $z = $tmp;

        return $this->hashLen16Mul(
            $this->add64(
                $this->add64(
                    $this->hashLen16Mul($vLo, $wLo, $mul),
                    $this->mul64($this->shiftMix($y), self::K0),
                ),
                $z,
            ),
            $this->add64($this->hashLen16Mul($vHi, $wHi, $mul), $x),
            $mul,
        );
    }

    /**
     * Returns a 64-bit fingerprint hash for a string.
     *
     * This function is not suitable for cryptography.
     *
     * @param string $s The input string to hash.
     *
     * @return Uint64S32 The 64-bit hash value split into two uint32 parts.
     */
    public function farmhash64(string $s): array
    {
        $h = $this->hash64($s);

        return [
            'hi' => $this->shr64($h, 32),
            'lo' => $h & self::MASK32,
        ];
    }

    /**
     * Returns a 32-bit fingerprint hash for a string.
     *
     * NOTE: This is NOT equivalent to the original Fingerprint32 function.
     * It is derived from farmhash64.
     *
     * This function is not suitable for cryptography.
     *
     * @param string $s The input string to hash.
     *
     * @return int The 32-bit hash value.
     */
    public function farmhash32(string $s): int
    {
        return $this->mix64To32($this->hash64($s));
    }

    /**
     * Returns a 64-bit fingerprint hash for a string as a 16-character hexadecimal string.
     *
     * @param string $s The input string to hash.
     *
     * @return string The hexadecimal representation of the 64-bit hash value.
     */
    public function farmhash64Hex(string $s): string
    {
        $h = $this->hash64($s);
        return sprintf('%08x%08x', $this->shr64($h, 32), $h & self::MASK32);
    }

    /**
     * Returns a 32-bit fingerprint hash for a string as an 8-character hexadecimal string.
     *
     * @param string $s The input string to hash.
     *
     * @return string The hexadecimal representation of the 32-bit hash value.
     */
    public function farmhash32Hex(string $s): string
    {
        return sprintf('%08x', $this->farmhash32($s));
    }
}
