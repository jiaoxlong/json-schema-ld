export const config =
{
    "$id" : "https://github.com/NABSA/gbfs/blob/v2.3/gbfs-ld.json", //dcterms:identifier
    "title": "The GBFS LD configuration",//dcterms:title
    "description": "A file containing extra configuration to map the GBFS json schemas to an RDFS vocabulary",
    //dcterms:description
    "creators": [
        //dcterms:creator
    "https://pietercolpaert.be/#me",
    "https://data.knows.idlab.ugent.be/person/jilong/#me",
    "https://data.knows.idlab.ugent.be/person/andreipopescu/#me",
    "https://data.knows.idlab.ugent.be/person/jilong/#me"],
    "license": "MIT", //dcterms:license
    "rights": "Copyright statement", //dcterms:rights
    "modified": "...", //dcterms:modified
    "generated": { // prov:generated
        "ld.id": "https://w3id.org/gbfs/terms#Vocabulary",
        "ld.base": "https://w3id.org/gbfs/terms#",
        "title": "The GBFS vocabulary",
        "description": "The Linked Data version of the GBFS vocabulary",
        "schemas": [
        {"$ref": "station_information.json"}
        ]

    }
}

