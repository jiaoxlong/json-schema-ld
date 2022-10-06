# JSC-LD Annotation Syntax

A JSON Schema can be structured in relatively complex forms including nested objects, arrays or combinations e.g.
a geojson feature. In addition to that, nested objects/arrays natively imply properties in JSON Schema are linked directly
without associations. In order to solve the complexity, we introduce JSON Schema LD Annotation Syntax ease the translation of JSON Schem into RDF.

## ld.id

> `ld.id` keyword is primarily used in combination with `ld.existing`, `ld.class` or `ld.association`. When a property is annotated with `ld.id` alone,
> the property will be renamed to the value assigned to `ld.id`.

**WARNING**: For the sake of interoperability between JSON Schema and RDF, One may not want to use `ld.id` to rename a property name in RDF.

```json
  {
        "id": {
            "ld.id": "https://example.com/identifier",
            "type": "string"
        }
  }

```

RDF vocabulary

```none
@prefix ex: <https://www.example.com/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

ex:identifier rdf:type rdf:Property;
    rdfs:label "identifier";
    rdfs:range xsd:string.
```

RDF Shacl shape

```none
@prefix ex: <https://www.example.com/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix exampleshape: <https://www.example.com//example/shapes/example#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

exampleshape:ExampleShape rdf:type sh:NodeShape;
    sh:targetClass ex:ExampleClass;
    sh:property [
        sh:path ex:identifier;
        sh:datatype xsd:string
    ].
```

**NOTE**: In this example, the hypothetical `id` property is mapped to `identifier` in a URI, of which name prefix is predefined in a ref:[JSC-LD configuration](jsc_ld_configuration.md#jsc-ld-configuration) file with `base_url`.
Instead of giving a full path, one may also use `"ld.id": "identifier"` or `"ld.id": ${base_prefix}:identifier"` as a shortcut.

`ld.id` can be used in combination with `ld.existing` when a property already exists in a vocabulary,
with `ld.class` when a property needs to be casted into a Class in RDF, or with `ld.association` when an association class needs to be introduced.

## ld.title ld.description and ld.comment

> `ld.title`, `ld.description`, `ld.comment` act as counterpart of “title”, “description”, and “comment” in JSON Schema, respectively.
> See [JSON Schema Annotations](https://json-schema.org/understanding-json-schema/reference/generic.html#id2) for more details.
> These JSON-LD keywords are used to introduce or overwrite original annotations in JSON Schema or add annotations if needed.

```json
    {
        "id": {
            "type": "string",
            "description":"bike id",
            "ld.title": "bike_id",
            "ld.description": "A unique identifier representing a bike stored, managed and accessed in the database.",
            "ld.comment": "The id must be unique among all identifiers used in the system."
        }
    }
```

RDF vocabulary

```none
@prefix ex: <https://www.example.com/>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

ex:bike_id rdf:type rdf:Property;
    dcterms:description "A unique identifier representing a bike stored, managed and accessed in the database.";
    dcterms:title "bike_id";
    rdfs:comment "he id must be unique among all identifiers used in the system.";
    rdfs:range xsd:string;
    rdfs:label "bike_id".
```

RDF Shacl shape

```none
@prefix ex: <https://www.example.com/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix exampleshape: <https://www.example.com//example/shapes/example#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

exampleshape:ExampleShape rdf:type sh:NodeShape;
    sh:targetClass ex:ExampleClass;
    sh:property [
        sh:path ex:bike_id;
        sh:name "bike_id";
        sh:description "A unique identifier representing a bike stored, managed and accessed in the database.";
        sh:datatype xsd:string
    ].
```

## ld.existing

> Following [the best practise of ontology development](https://protege.stanford.edu/publications/ontology_development/ontology101.pdf),
> before creating an ontology term, one should consider to reuse existing vocabularies for your domain to avoid “re-inventing the wheel”.
> In the above `ld.id` example, the property “id” is renamed to “identifier”. However, ‘id’ is defined in many other domain vocabularies.
> In fact, One can simply reuse an equivalent term e.g. [“identifier” from DublinCore](http://purl.org/dc/terms/identifier) instead of creating one.

```json
    {
        "id": {
            "ld.id": "http://purl.org/dc/terms/identifier",
            "ld.existing": "true",
            "type": "string",
            "description": "A unique identifier representing a bike stored, managed and accessed in the database."
        }
    }
```

RDF vocabulary

```none
@prefix ex: <https://www.example.com/>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

dcterms:identifier rdf:type rdf:Property.
```

RDF Shacl shape

```none
@prefix ex: <https://www.example.com/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix exampleshape: <https://www.example.com//example/shapes/example#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

exampleshape:ExampleShape rdf:type sh:NodeShape;
    sh:targetClass ex:ExampleClass;
    sh:property [
        sh:path dcterms:identifier;
        sh:description "A unique identifier representing a bike stored, managed and accessed in the database.";
        sh:datatype xsd:string
    ].
```

**NOTE**: When a property tagged with `ld.existing` in a JSON Schema, all the annotations associated with the property in the JSON Schema will not be present in RDF to avoid modification on existing vocabularies.

## id.domain id.range

> JSC-LD parses a JSON Schema along its hierarchical structure.
> It is possible to annotate a property with `ld.domain` and/or `ld.range` to state any resource that has this property
> or any value of this property is an instance of a class, respectively. When the classes is not declared in a prior step, they will be created during conversion.

```json
    {
        "bikes": {
            "type": "object",
            "properties": {
                "bike_id": {
                    "type": "number"
                },
                "bike_location":{
                    "type": "string",
                    "description": "The geo location of the bike.",
                    "ld.domain": "https://example.com/Bike",
                    "ld.range": "https://example.com/Location"
                }
            }
        }
    }
```

RDF vocabulary

```none
@prefix ex: <https://www.example.com/>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

ex:bikes rdf:type rdf:Property;
    rdfs:label "bikes".
ex:bike_id rdf:type rdf:Property;
    rdfs:label "bike_id";
    rdfs:range xsd:integer.
ex:bike_location rdf:type rdf:Property;
    dcterms:description "The geo location of the bike.";
    rdfs:label "bike_location";
    rdfs:domain ex:Bike;
    rdfs:range ex:Location.
ex:Bike rdf:type rdfs:Class;
    rdfs:label "Bike".
ex:Location rdf:type rdfs:Class;
    rdfs:label "Location".
```

RDF Shacl shape

```none
@prefix ex: <https://www.example.com/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix exampleshape: <https://www.example.com//example/shapes/example#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

exampleshape:ExampleShape rdf:type sh:NodeShape;
    sh:targetClass ex:ExampleClass;
    sh:property [
        sh:path ex:bikes;
        sh:name "bikes"
    ],
    [
        sh:path ex:bike_id;
        sh:name "bike_id";
        sh:datatype xsd:integer
    ].
exampleshape:BikeShape rdf:type sh:NodeShape;
    sh:targetClass ex:Bike;
    sh:property [
        sh:path ex:bike_location;
        sh:name "bike_location";
        sh:description "The geo location of the bike.";
        sh:datatype xsd:string
    ].
```

**NOTE**: This is a dummy example about the usage of `ld.domain` and `ld.range`.
Introducing classes can be better handled by using the combination of `ld.association` and `ld.id`.

## ld.ignore

> `ld.ignore` is used to exclude certain properties and their sub-properties from a JSON Schema and **not** express them in RDF.

```json
    {
        "id": {
            "ld.ignore": "true",
            "type": "string",
            "description": "A unique identifier representing a bike stored, managed and accessed in the database."
        }
    }
```

## ld.included

> `ld.included` is used to exclude certain properties only at one level but continue parsing their sub-properties.

```json
    {
        "bikes": {
            "ld.included": "true",
            "type": "object",
            "properties": {
                "bike_id": {
                    "type": "number",
                    "description": "an unique identifier of the bike."
                },
                "bike_location":{
                    "type": "string",
                    "description": "The geo location of the bike."
                }
            }
        }
    }

```

RDF vocabulary

```none
@prefix ex: <https://www.example.com/>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

ex:bike_id rdf:type rdf:Property;
    dcterms:description "an unique identifier of the bike.";
    rdfs:label "bike_id";
    rdfs:range xsd:integer.
ex:bike_location rdf:type rdf:Property;
    dcterms:description "The geo location of the bike.";
    rdfs:label "bike_location";
    rdfs:range xsd:string.
```

RDF Shacl shape

```none
@prefix ex: <https://www.example.com/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix exampleshape: <https://www.example.com//example/shapes/example#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

exampleshape:ExampleShape rdf:type sh:NodeShape;
    sh:targetClass ex:ExampleClass;
    sh:property [
        sh:path ex:bike_id;
        sh:description "an unique identifier of the bike.";
        sh:name "bike_id";
        sh:datatype xsd:integer
    ],
    [
        sh:path ex:bike_location;
        sh:description "The geo location of the bike.";
        sh:name "bike_location";
        sh:datatype xsd:string
    ].
```

## ld.enum

> `ld.enum` is defined in JSC-LD build-in syntax but still under use case evaluation.

> The enum keyword can be applied to  is used to restrict a value of a property to a fixed set of values.
> JSC-LD processes properties with enum keyword with skos:Concept and skos:ConceptSchema.

## ld.association

> `ld.association` is used in combination with `ld.id` and especially designed for complex and nested JSON Schemas.
> Consider the bike example given before, without `ld.included` annotation, “bikes” and its sub-properties “bike_id” and “bike_location”
> will be considered as instances of rdf:Property without indicating connections in between by default.
> By adding `ld.association` and `ld.id`, JSC-LD will create an association class to connect them.

```json
    {
        "bikes": {
            "ld.association": {
                "ld.id": "https://www.example.com/Bike",
                "ld.description": "A bike instance"
            },
            "type": "object",
            "properties": {
                "bike_id": {
                    "type": "number"
                },
                "bike_location":{
                    "type": "string"
                }
            }
        }
    }
```

RDF vocabulary

```none
@prefix ex: <https://www.example.com/>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

ex:bikes rdf:type rdf:Property;
    rdfs:range ex:Bike;
    rdfs:label "bikes".

ex:Bike rdf:type rdf:Class;
    dcterms:description "A bike instance";
    rdfs:label "Bike".

ex:bike_id rdf:type rdf:Property;
    rdfs:domain ex:Bike;
    rdfs:range xsd:integer;
    rdfs:label "bike_id".

ex:bike_location rdf:type rdf:Property;
    rdfs:domain ex:Bike;
    rdfs:range xsd:string;
    rdfs:label "bike_location".
```

RDF Shacl shape

```none
@prefix ex: <https://www.example.com/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix exampleshape: <https://www.example.com//example/shapes/example#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

    exampleshape:ExampleShape rdf:type sh:NodeShape;
    sh:targetClass ex:ExampleClass;
    sh:property [
        sh:path ex:bikes;
        sh:name "bikes"
    ].

exampleshape:BikeShape rdf:type sh:NodeShape;
    sh:targetClass ex:Bike;
    sh:property [
        sh:path ex:bike_id;
        sh:name "bike_id";
        sh:datatype xsd:integer
    ],
    [
        sh:path ex:bike_location;
        sh:name "bike_location";
        sh:datatype xsd:string
    ].
```

## ld.class

> In addition to `ld.association`, `ld.class` is also used to create a class, but it behaves differently.
> Fundamentally, it combines the features of `ld.association` and `ld.included`.

```json
    {
        "bikes": {
            "ld.class": {
                "ld.id": "https://www.example.com/Bike",
                "ld.description": "A bike instance"
            },
            "type": "object",
            "properties": {
                "bike_id": {
                    "type": "number"
                },
                "bike_location":{
                    "type": "string"
                }
            }
        }
    }

```

RDF vocabulary

```none
@prefix ex: <https://www.example.com/>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

ex:Bike rdf:type rdf:Class;
    dcterms:description "A bike instance";
    rdfs:label "Bike".

ex:bike_id rdf:type rdf:Property;
    rdfs:domain ex:Bike;
    rdfs:range xsd:integer;
    rdfs:label "bike_id".

ex:bike_location rdf:type rdf:Property;
    rdfs:domain ex:Bike;
    rdfs:range xsd:string;
    rdfs:label "bike_location".
```

RDF Shacl shape

```none
@prefix ex: <https://www.example.com/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix exampleshape: <https://www.example.com//example/shapes/example#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

exampleshape:BikeShape rdf:type sh:NodeShape;
    sh:targetClass ex:Bike;
    sh:property [
        sh:path ex:bike_id;
        sh:name "bike_id";
        sh:datatype xsd:integer
    ],
    [
        sh:path ex:bike_location;
        sh:name "bike_location";
        sh:datatype xsd:string
    ].
```

## ld.geoJsonFeature

> Handling geometry type properties can be quite tricky. Below is a snapshot of station_area from the JSON Schema for General Bikeshare Feed Specification(GBFS) feeds.
> For the sake of simplicity, adding `ld.geoJsonFeature` will make “station_area” property have a value that is a instance of geosparql:Geometry by default.
> When the geosparql:Geometry is not suitable, one may change it to another Geometry class with `ld.range`.

```json
    {
        "station_area": {
            "ld.geoJsonFeature": true,
            "ld.range" : "http://www.opengis.net/ont/geosparql#Geometry",
            "description": "A multipolygon that describes the area of a virtual station.",
            "type": "object",
            "required": ["type", "coordinates"],
            "properties": {
                "type": {
                    "type": "string",
                    "enum": ["MultiPolygon"]
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "array",
                            "minItems": 4,
                            "items": {
                                "type": "array",
                                "minItems": 2,
                                "items": {
                                    "type": "number"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
```

RDF vocabulary

```none
@prefix gbfs: <https://w3id.org/gbfs#>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix geosparql: <http://www.opengis.net/ont/geosparql#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

gbfs:stationArea dcterms:description "A multipolygon that describes the area of a virtual station.";
    rdf:type rdf:Property;
    rdfs:label "stationArea";
    rdfs:range geosparql:Geometry.
```

RDF Shacl shape

```none
@prefix ex: <https://www.example.com/>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix exampleshape: <https://www.example.com//example/shapes/example#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

exampleshape:ExampleShape rdf:type sh:NodeShape;
    sh:targetClass ex:ExampleClass;
    sh:property [
        sh:path ex:station_area;
        sh:description "A multipolygon that describes the area of a virtual station.";
        sh:name "station_area"
    ].
```
