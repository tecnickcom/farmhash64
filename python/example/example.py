# copy this file in the same directory of libpyfarmhash64 library for a quick test
import libpyfarmhash64 as fh

print('\nUSAGE EXAMPLES:\n')

fhash = fh.farmhash64("Lorem ipsum dolor sit amet")
print('fh.farmhash64("Lorem ipsum dolor sit amet")')
print("Variant Hash (DEC): %d" % fhash)
print("Variant Hash (HEX): %x\n" % fhash)

fhash = fh.farmhash32("Lorem ipsum dolor sit amet")
print('fh.farmhash32("Lorem ipsum dolor sit amet")')
print("Variant Hash (DEC): %d" % fhash)
print("Variant Hash (HEX): %x\n" % fhash)
