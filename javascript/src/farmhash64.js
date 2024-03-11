/** FarmHash64 Javascript Library
 * 
 * farmhash64.js
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
 * All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
 * This is a Java port of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).
 * 
 * This code has been ported/translated by Nicola Asuni (Tecnick.com) to JavaScript code.
 * 
 * @category   Libraries
 * @license    see LICENSE file
 * @link       https://github.com/tecnickcom/farmhash64
 */

// NOTE: Javascript numbers are 64 bit floats with a 53 bit precision.

if (typeof(module) !== 'undefined') {
    module.exports = {
        farmhash64: farmhash64,
        farmhash32: farmhash32,
    }
}

// @TODO ...
