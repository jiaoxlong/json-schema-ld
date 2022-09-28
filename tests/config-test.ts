import {validate_path} from "../src/utils/validation";
import {ConfigParser} from "../src/lib/ConfigParser";
import path from "path";
import {StringSchema} from "../src/lib/JSONSchema";

describe('JSON-LD configuration', ()=>{


    test('Validate if JSON-LD configuration is correctly parsed', () => {
        const config = new ConfigParser(path.resolve('./configs/config.json'), [path.resolve('./GBFS-LD/station_information.json')], 'out')
        expect(config).toBeInstanceOf(ConfigParser);
        expect(config.id).toEqual('https://github.com/NABSA/gbfs/blob/v2.3/gbfs-ld.json')
        expect(config.annot).toContainEqual(['dcterms:title','The GBFS LD configuration'])
        expect(config.format).toEqual('Turtle');

    });
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

});

