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
    const mock_int_data = {
        "ld.id": "http://purl.org/dc/terms/modified",
        "ld.existing": true,
        "ld.datatype": "http://www.w3.org/2001/XMLSchema#integer",
        "description":
            "Last time the data in the feed was updated in POSIX time.",
        "type": "integer",
        "minimum": 1450155600,


    };
    const mock_string_data = {
        "description":
            "GBFS version number to which the feed conforms, according to the versioning framework (added in v1.1).",
        "type": "string",
        "const": "2.3",
        "pattern": "^[0-9]+\\.[0-9]+$"
    }
    const mock_array_data = {
        "ld.association": {
            "ld.id": "http://schema.mobivoc.org/#BicycleParkingStation",
            "ld.existing":true
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


    const config_ins = new ConfigParser(path.resolve('./configs/config.json'), ['./GBFS-LD/station_information.json'], 'test_out', JSC_LD_PREFIX)

    test('check if the Integer_schema called the IntergerSchema constructor and created properties as expected', () => {
        const int_schema = new IntegerSchema(mock_int_data, config_ins, 'last_updated', {});
        expect(int_schema).toBeInstanceOf(IntegerSchema);
        expect(int_schema.id).toEqual("http://purl.org/dc/terms/modified");
        expect(int_schema.shacl).toContainEqual(blank_node_literal("sh:minInclusive", 1450155600))
        expect(int_schema.isExisting).toBeTruthy()
        expect(int_schema.rdfs).toEqual(namedNode( 'xsd:integer'));
    });

    test('check if the string_schema called the StringSchema constructor and created properties as expected', () => {
        const string_schema = new StringSchema(mock_string_data, config_ins, 'version', {isRequired:true});
        const string_shacl = string_schema.shacl;
        expect(string_schema).toBeInstanceOf(StringSchema);
        expect(string_shacl).toContainEqual(blank_node_literal('sh:hasValue', '2.3'));
        expect(string_shacl).toContainEqual(blank_node_literal('sh:pattern', '^[0-9]+\\.[0-9]+$'))
        expect(string_shacl).toContainEqual(blank_node_literal('sh:minCount', 1));
        expect(string_shacl).toContainEqual(blank_node_literal('sh:maxCount', 1));
    });
    test('check if the string_schema called the StringSchema constructor and created properties as expected', () => {
        const array_schema = new ArraySchema(mock_array_data, config_ins, 'stations', {minItems:0, maxItems:2});
        const array_label= array_schema.label;
        const array_shacl = array_schema.shacl;
        expect(array_schema).toBeInstanceOf(ArraySchema);
        expect(array_label).toEqual('stations');
        expect(array_shacl).toContainEqual(blank_node_literal('sh:maxCount', 2));
    });
});


