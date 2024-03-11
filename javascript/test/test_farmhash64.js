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
} = require(process.argv[2]);

// @TODO ...

var errors = 0;

//gentestmap();

errors += test_farmhash64();
errors += test_farmhash32();

if (errors > 0) {
    console.log("FAILED: " + errors);
    process.exit(1);
} else {
    console.log("OK");
}
