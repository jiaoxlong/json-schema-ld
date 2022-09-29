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

export function jsc_source_files(args:any){
    const source_list = [];
    try {
        if (fs.statSync(args['source']).isDirectory()) {
            fs.readdirSync(args['source']).forEach(file => {
                source_list.push(path.join(args['source'], file));
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

export function hasKeys(object, keys){
    return keys.every(function (key) {
        // eslint-disable-next-line no-prototype-builtins
        return object.hasOwnProperty(key);
    });
}
