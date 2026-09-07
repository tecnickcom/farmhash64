// Build tools for the farmhash64 repository, declared in a separate module so that
// they stay out of the module graph of anything importing farmhash64.
// Installed into target/binutil by "make gotools".
module github.com/tecnickcom/farmhash64/go/resources/tools

go 1.24

toolchain go1.27.1

tool github.com/jstemmer/go-junit-report/v2

require github.com/jstemmer/go-junit-report/v2 v2.1.0 // indirect
