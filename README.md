# JSON Schema LD specification

JSON Schema for Linked Data, hereafter JSON-Schema-LD/jsc-ld, is a syntactic sugar for [JSON Schema](https://json-schema.org/) to enable generative interoperability
by means of representing JSON schema in RDF vocabularies ([RDF Schema](https://www.w3.org/TR/rdf-schema/)) and RDF
shapes ([SHACL](https://www.w3.org/TR/shacl/)).

A JSON Schema is a declarative vocabulary specifies a number of rules to describe what objects serialized in JSON based
format should look like. With JSC-LD, domain models and application profiles are extracted from existing
implementation model in JSON Schema and represented in [RDF Schema](https://www.w3.org/TR/rdf-schema/) and [Shacl shapes](https://www.w3.org/TR/shacl/).

**Built With**

## Getting Started

### Prerequisites


* [How to install JSON-Schema-LD](jsc_ld_installation.md#jsc-ld-installation)

* [JSC-LD Annotation Syntax](jsc_ld_syntax.md#jsc-ld-syntax)

### Usage
```
Synopsis

  $ jsc-ld --source json_schema.js --out out --prefix example --url "http://example.com/"
  $ jsc-ld -s PATH/TO/FOLDER/ -p example -u "http://example.com" 

Options

  -s, --source path/to/source/file|directory   Path to a JSON schema file or a directory contains JSON schema files
  -p, --prefix prefix                          JSC-LD predefined namespace prefix
  -f, --format format                          RDF serialization format: Turtle, application/trig, N-Triples, or N-Quads. It
                                               defaults to Turtle.
  -u, --uri uri                                JSC-LD predefined namespace URI
  -o, --out path/to/directory                  Path to output directory defaults to "out"
  -h, --help                              
```

### Limitations

JSON-Schema-LD is developed upon the latest draft `2020-12` to describe data formats. Some custom keywords defined in [a prior draft](https://json-schema.org/specification-links.html) may not be supported.
Keywords that are supported by JSC-LD can be found [Supported JSON Schema keywords](supported_jsc_kws.md#supported-jsc-kws).

### contribute

Do not hesitate to [report a bug](https://github.com/jiaoxlong/jsc-ld/issues).

### Lisense

This code is copyrighted by IDLab, Ghent University – imec and released under the MIT license.

### Contact

[Jiao Long](mailto:Jiao.Long@UGent.be), [Brecht Van de Vyvere](mailto:brecht.vandevyvere@ugent.be) and [Pieter Colpaert](mailto:pieter.colpaert@ugent.be)

IDLab, Ghent University – imec
