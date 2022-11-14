import {isValidHttpURI, isValidPrefix, validate_path} from "../src/lib/ConfigParser";
import {Config} from "../src/lib/ConfigParser";
import path from "path";
import {CLIArguments} from "../src/utils/types";


describe('JSON-LD configuration', ()=>{


    test('Validate if JSON-LD configuration is correctly parsed', () => {
        const cli_args:CLIArguments = {
            "source": path.resolve('examples\\JSC-LD\\GBFS-LD\\gbfs.json'),
            "prefix": "example",
            "uri": "http://example.com",
            "out": "out_dir",
            "format": "Turtle"
        };
        const config = new Config(cli_args)
        expect(config).toBeInstanceOf(Config);
        expect(Array.isArray(config.source)).toBe(true);
        expect(config.prefix).toBe("example");
        expect(config.uri).toBe("http://example.com")
        expect(config.out).toBe("out_dir")
        expect(config.format).toEqual('Turtle');

        const mock_data_dir = './examples/JSC-LD/GBFS-LD/'
        const mock_data_file = './examples/JSC-LD/GBFS-LD/station_information.json'
        const mock_data_err = './file/not/exist/'
        /** windows */
        expect(config.jsc_source_files(mock_data_dir)).toContainEqual(path.resolve("./examples/JSC-LD/GBFS-LD/gbfs.json"));
        expect(config.jsc_source_files(mock_data_file)).toEqual([path.resolve("./examples/JSC-LD/GBFS-LD/station_information.json")]);
        try{
            config.jsc_source_files(mock_data_err);
        }
        catch (err)
        {
            expect(err).toBeInstanceOf(Error);
        }
    });

    test('Validate a given path exists in the system', () => {
        expect(validate_path(path.resolve('./examples/JSC-LD/GBFS-LD/gbfs.json'))).toBeTruthy();
        try{
            validate_path('config.json')
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err).toHaveProperty('message', 'config.json does not exist in the system')
        }
    });
    test('validate a given namespace prefix', ()=> {
        expect(isValidPrefix('example')).toBeTruthy();
        expect(isValidPrefix('example:')).toBeFalsy();
    });
    test('validate a given namespace uri', ()=> {
        expect(isValidHttpURI('http://example.com')).toBeTruthy();
        expect(isValidHttpURI('example')).toBeFalsy();
    });
});

