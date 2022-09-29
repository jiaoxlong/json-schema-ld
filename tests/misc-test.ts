import {hasKeys, jsc_source_files, validate_path} from "../src/utils/validation";
import path from "path";
import {match,merge} from "../src/utils/match";


describe('JSON-LD misc functions', ()=>{

    test('Validate a given path exists in the system', () => {
        expect(validate_path(path.resolve('./configs/config.json'))).toBeTruthy();
        try{
            validate_path('config.json')
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err).toHaveProperty('message', 'config.json does not exist in the system')
        }
    });

    test('test jsc_source_files()', () => {
        const mock_data_dir = {
            "source": './examples/JSC-LD/GBFS-LD/'
        }
        const mock_data_file = {
            "source": './examples/JSC-LD/GBFS-LD/station_information.json'
        }
        const mock_data_err = {
            "source": './file/not/exist/'
        }
        /** windows */
        expect(jsc_source_files(mock_data_dir)).toContainEqual("examples\\JSC-LD\\GBFS-LD\\gbfs.json");
        expect(jsc_source_files(mock_data_file)).toEqual(["./examples/JSC-LD/GBFS-LD/station_information.json"]);
        try{
            jsc_source_files(mock_data_err);
        }
        catch (err)
        {
            expect(err).toBeInstanceOf(Error);
        }
    });

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
});
