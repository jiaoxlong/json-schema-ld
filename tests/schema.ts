import {ObjectSchema, StringSchema} from "../src/lib/JSONSchema";
import {ConfigParser} from "../src/lib/ConfigParser";
import path from "path";
import {JSC_LD_PREFIX} from "../src/utils/Prefix";

const mock_string_data = {
    "description":
        "GBFS version number to which the feed conforms, according to the versioning framework (added in v1.1).",
    "type": "string",
    "const": "2.3"

}

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
}
const config_ins = new ConfigParser(path.resolve('./configs/config.json'), ['./GBFS-LD/station_information.json'], 'test_out', JSC_LD_PREFIX)

const string_schema = new StringSchema(mock_string_data, config_ins, 'version',{});
const object_schema = new ObjectSchema(mock_object_data, config_ins, 'rental_uris', {})
console.log(object_schema)
