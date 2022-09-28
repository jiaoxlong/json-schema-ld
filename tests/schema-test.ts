import {Schema} from "../src/lib/JSONSchema";
import {StringSchema, ArraySchema, NullSchema, ObjectSchema, BaseSchema, ClassSchema } from "../src/lib/JSONSchema";
import {NumberSchema, IntegerSchema, NumericSchema } from "../src/lib/JSONSchema";
import {ConfigParser} from "../src/lib/ConfigParser";
import {JSC_LD_PREFIX} from "../src/utils/Prefix";
import path from "path";
import {blank_node_literal, blank_node_node} from "../src/utils/n3_utils";
import {DataFactory, NamedNode} from "n3";
import namedNode = DataFactory.namedNode;


describe("JSON Schema", ()=> {


    const config_ins = new ConfigParser(path.resolve('./configs/config.json'), ['./GBFS-LD/station_information.json'], 'test_out', JSC_LD_PREFIX)

    test('check if the Integer_schema is of an instance of IntergerSchema and created properties as expected', () => {
        const mock_int_data = {
            "ld.id": "http://purl.org/dc/terms/modified",
            "ld.existing": true,
            "ld.datatype": "http://www.w3.org/2001/XMLSchema#integer",
            "description":
                "Last time the data in the feed was updated in POSIX time.",
            "type": "integer",
            "minimum": 1450155600,
        };
        const int_schema = new IntegerSchema(mock_int_data, config_ins, 'last_updated', {});
        expect(int_schema).toBeInstanceOf(IntegerSchema);
        expect(int_schema.id).toEqual("http://purl.org/dc/terms/modified");
        expect(int_schema.shacl).toContainEqual(blank_node_literal("sh:minInclusive", 1450155600))
        expect(int_schema.isExisting).toBeTruthy()
        expect(int_schema.rdfs).toEqual(namedNode('xsd:integer'));
    });

    test('check if the string_schema is of an instance of StringSchema and created properties as expected', () => {
        const mock_string_data = {
            "description":
                "GBFS version number to which the feed conforms, according to the versioning framework (added in v1.1).",
            "type": "string",
            "const": "2.3",
            "pattern": "^[0-9]+\\.[0-9]+$",
            "minLength": "0",
            "maxLength": "50",
            "format": "uri"
        }
        const string_schema = new StringSchema(mock_string_data, config_ins, 'version', {isRequired: true});
        const string_shacl = string_schema.shacl;
        expect(string_schema).toBeInstanceOf(StringSchema);
        expect(string_schema.isRequired).toBeTruthy();
        expect(string_shacl).toContainEqual(blank_node_literal('sh:hasValue', '2.3'));
        expect(string_shacl).toContainEqual(blank_node_literal('sh:pattern', '^[0-9]+\\.[0-9]+$'))
        expect(string_shacl).toContainEqual(blank_node_literal('sh:minCount', 1));
        expect(string_shacl).toContainEqual(blank_node_literal('sh:maxCount', 1));
        expect(string_shacl).toContainEqual(blank_node_literal('sh:maxLength', '50'));
        expect(string_shacl).toContainEqual(blank_node_node('sh:datatype', 'xsd:anyURI'));
    });
    test('check if the array_schema is of an instance of ArraySchema and created properties as expected', () => {
        const mock_array_data = {
            "ld.association": {
                "ld.id": "http://schema.mobivoc.org/#BicycleParkingStation",
                "ld.existing": true
            },
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "station_id": {
                        "ld.id": "http://purl.org/dc/terms/identifier",
                        "ld.existing": true,
                        "description": "Identifier of a station.",
                        "type": "string"
                    },
                    "name": {
                        "ld.id": "https://w3id.org/gbfs#station_name",
                        "description": "Public name of the station.",
                        "type": "string"
                    },
                }
            }

        }
        const array_schema = new ArraySchema(mock_array_data, config_ins, 'stations', {minItems: 0, maxItems: 2});
        const array_label = array_schema.label;
        const array_shacl = array_schema.shacl;
        expect(array_schema).toBeInstanceOf(ArraySchema);
        expect(array_label).toEqual('stations');
        expect(array_shacl).toContainEqual(blank_node_literal('sh:maxCount', 2));
    });

    test('check if the object_schema is of an instance of ObjectSchema and created properties as expected', () => {
        const mock_object_data = {
            "ld.association": {
                "ld.id": "https://w3id.org/gbfs#Rental_uris",
                "ld.description": "Rental uris for Android, iOS, and web."
            },
            "description": "Contains rental uris for Android, iOS, and web in the android, ios, and web fields (added in v1.1).",
            "type": "object",
            "properties": {
                "android": {
                    "description":
                        "URI that can be passed to an Android app with an intent (added in v1.1).",
                    "type": "string",
                    "format": "uri"
                },
                "ios": {
                    "description":
                        "URI that can be used on iOS to launch the rental app for this station (added in v1.1).",
                    "type": "string",
                    "format": "uri"
                },
                "web": {
                    "description":
                        "URL that can be used by a web browser to show more information about renting a vehicle at this station (added in v1.1).",
                    "type": "string",
                    "format": "uri"
                }
            }
        };
        const object_schema = new ObjectSchema(mock_object_data, config_ins, 'rental_uris', {});
        expect(object_schema).toBeInstanceOf(ObjectSchema);
        expect(object_schema.range).toEqual('https://w3id.org/gbfs#Rental_uris');
        expect(object_schema.isEnum).toBeFalsy();
        expect(object_schema.isExisting).toBeFalsy();
    });

    test('check if the null_schema is of an instance of NullSchema', () => {
        const mock_null_data = { "type": "null" };
        const null_schema = new NullSchema(mock_null_data, config_ins, 'null_property', {});
        expect(null_schema).toBeInstanceOf(NullSchema);
    });

    test('check if the base_schema is of an instance of BaseSchema',() => {
        const mock_base_data = {"$id": "https://www.example.com/json-ld"}
        const base_schema = new BaseSchema(mock_base_data, config_ins, 'base_property');
        expect(base_schema).toBeInstanceOf(BaseSchema);
    });

    test('check if the class_schema is of an instance of ClassSchema and created expected properties', () => {
        const mock_class_data = {};
        const class_schema = new ClassSchema(mock_class_data, config_ins, 'class_name', {});
        expect(class_schema).toBeInstanceOf(ClassSchema);
    });

});


