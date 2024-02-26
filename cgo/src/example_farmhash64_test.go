package farmhash64_test

import (
	"fmt"

	fh "github.com/tecnickcom/farmhash64/cgo/src"
)

func ExampleFarmHash64() {
	str := "Hello, World!"
	hash := fh.FarmHash64([]byte(str))
	fmt.Println(hash)

	// Output:
	// 11358326526432651330
}
