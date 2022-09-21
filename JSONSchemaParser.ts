import {ConfigParser} from "./lib/ConfigParser";
import {JSCLDSchema} from "./lib/JSCLD";
const fs = require('fs');
import * as path from "path";

let config = new ConfigParser('../configs/config.json');

for (let jsc of config.source){
    let ld = new JSCLDSchema(path.join('..', jsc), config);
    ld.serialize();
    ld.materialize();

}



