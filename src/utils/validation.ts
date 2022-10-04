import fs from "fs";
import path from "path";

export function validate_path(path_to_file:string){
    try {
        return fs.statSync(path_to_file).isDirectory() || fs.statSync(path_to_file).isFile();
    }
    catch(err) {
        throw new Error(path_to_file + ' does not exist in the system');
    }
}

/**
 * collects JSC-LD file path or paths to multiple JSC-LD files from a given source directory defined by command line argument --source/-s
 *
 * @param args command line arguments
 */
export function jsc_source_files(args:any){
    const source_list = [];
    try {
        if (fs.statSync(args['source']).isDirectory()) {
            fs.readdirSync(args['source']).forEach(file => {
                if (fs.statSync(path.join(args['source'], file)).isDirectory())
                    throw new Error('When path of a directory is passed as --source/-s argument, only .json files in the directory are expected.')
                else if (fs.statSync(path.join(args['source'], file)).isFile()){
                    if (file.endsWith('.json')) {
                        if (!file.endsWith('config.json')) {
                            source_list.push(path.join(args['source'], file));
                        }
                    }
                    else
                        console.log(fs.statSync(path.join(args['source'], file)+" is not of type json file."));
                }
            });
        }
        if (fs.statSync(args['source']).isFile()) {
            source_list.push(args['source']);
        }
        return source_list;
    }
    catch (err) {
        throw Error("The given 'source' property neither points to a directory " +
            "nor to a file");
    }
}

/**
 * verifies if an object contain certain keys.
 * @param object an json object
 * @param keys a list of string values
 */
export function hasKeys(object, keys){
    return keys.every(function (key) {
        // eslint-disable-next-line no-prototype-builtins
        return object.hasOwnProperty(key);
    });
}
