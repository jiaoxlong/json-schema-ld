import {hasKeys} from "../src/utils/validation";
import {find, match, merge} from "../src/utils/match";
import { inflect} from "../src/utils/misc";


describe('JSON-LD misc functions', ()=>{

    test ('tests an object has certain properties with hasKeys()', ()=>{
        const opts = ['source', 'config']
        const options = {
            "source": "PATH/TO/FOLDER",
            "out": "PATH/TO/OUTPUT",
            "config": "PATH/TO/CONFIG"
        }
        expect(hasKeys(options,opts)).toBeTruthy()
    });
    test ('tests match()', ()=>{
        const a ={
            "title": "dcterms:title",
            "description": "dcterms:description",
            "examples": "skos:example",
            "deprecated": "owl:deprecated",
            "readonly": "jsonsc:readOnly",
            "writeonly": "jsonsc:writeOnly",
            "comment": "rdfs:comment"
        }

        const b ={
            "description": "Last time the data in the feed was updated in POSIX time.",
            "type": "integer",
            "minimum": 0,
            "maximum": 1924988399

        }
        const c = ["title", "description", "examples", "deprecated"]
        const matched_1 = new Map([["dcterms:description","Last time the data in the feed was updated in POSIX time."]])
        const matched_2 = new Map([["description","Last time the data in the feed was updated in POSIX time."]])
        expect(match(a,b)).toEqual(matched_1);
        expect(match(c,b)).toEqual(matched_2);
    });
    test ('test merge()', ()=>{
        const map_1 = new Map([
            ["a_prop", "a_value"],
            ["b_prop", "b_value"],
            ["c_prop", "c_value"],
            ["d_prop", "d_value"]
        ]);
        const map_2 = new Map([
            ["a_prop", "a_value"],
            ["b_prop", "b_value"],
            ["c_prop", "c_value"],
            ["x_prop", "x_value"],
        ]);
        const merged_map = new Map([
            ["a_prop", "a_value"],
            ["b_prop", "b_value"],
            ["c_prop", "c_value"],
            ["d_prop", "d_value"],
            ["x_prop", "x_value"],
        ]);
        expect(merge(map_1, map_2)).toEqual(merged_map)
    });
    test ('test find()', ()=>{
        const mock_array = ["allOf", "not", "oneOf", "anyOf"]
        const obj1 = {
            "allOf": [
                {"$ref": "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/GSMA-Commons"},
                {
                    "properties":{}
                }
            ]
        }
        const obj2 = {
            "allOf": [
                {"$ref": "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/GSMA-Commons"},
                {
                    "properties":{}
                }
            ],
            "not": [
                {"$ref": "https://smart-data-models.github.io/data-models/common-schema.json#/definitions/GSMA-Commons"},
                {
                    "properties":{}
                }
            ]
        }
        try{
            const matched = find(mock_array, obj2);
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
    });
    test ('test inflect()', ()=>{
        const str1 = 'bikes'
        const str2 = 'properties'
        const str3 = 'some_type'
        const str4 = "refDevice"
        expect(inflect(str1)).toBe('Bike');
        expect(inflect(str2)).toBe('Property');
        expect(inflect(str3)).toBe('SomeType');
        expect(inflect(str4)).toBe('RefDevice');
    });
});
