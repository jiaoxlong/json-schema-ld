# json-to-rdf-shacl

# Introduction

JSON Schema LD is a syntactic sugar for [JSON Schema](https://json-schema.org/) to enable generative interoperability
by means of representing JSON schema in RDF vocabularies ([RDF Scheme](https://www.w3.org/TR/rdf-schema/)) and RDF
shapes in [SHACL](https://www.w3.org/TR/shacl/).

A JSON Schema is a declarative vocabulary specifies a number of rules to describe what objects serialized in JSON based
format should look like. With JSON Schema LD, domain models and application profiles are extracted from existing
implementation model in JSON Schema and represented in [RDF Schema](https://www.w3.org/TR/rdf-schema/) and [Shacl shapes](https://www.w3.org/TR/shacl/).

```
JSC-LD

  JSON Schema LD is a syntactic sugar for JSON Schema to enable generative
  interoperability by means of representing JSON schema in RDF vocabularies
  (RDF Scheme) and RDF shapes in SHACL.

Synopsis
  $ node jscld.js --source json_schema.js --out out --config config.js
  $ node jscld.js --source json_schema.js --config config.js
  node jscld.js -s json_schema.js -c config.js

Options

  -c, --config config_file                     JSC-LD configuration file
  -s, --source path/to/source/file|directory   Path to a JSON schema file or a directory contains JSON schema files
  -o, --out path/to/directory                  Path to output directory defaults to "out"
  -h, --help                                   Display this usage guide


```

# GBFS use case

# features

# Test data


* mobility data bike sharing system json schemas: https://github.com/MobilityData/gbfs-json-schema


 

