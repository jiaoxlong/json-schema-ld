# How to install JSC-LD

This jsc-ld package can be either installed from npm or setup from cloning the repository.

```bash
git clone https://github.com/jiaoxlong/jsc-ld
npm i jsc-ld
```

## Usage

```none
JSC-LD

JSON Schema LD is a syntactic sugar for JSON Schema to enable generative
interoperability by means of representing JSON schema in RDF vocabularies
(RDF Scheme) and RDF shapes in SHACL.

Synopsis
  $ jsc-ld --source json_schema.js --out out --config config.json
  $ jsc-ld --source json_schema.js --config config.json
  $ jsc-ld -s json_schema.js -c config.js

Options

  -c, --config config_file                     JSC-LD configuration file
  -s, --source path/to/source/file|directory   Path to a JSON schema file or a directory contains JSON schema files
  -o, --out path/to/directory                  Path to output directory defaults to "out"
  -h, --help                                   Display this usage guide
```
