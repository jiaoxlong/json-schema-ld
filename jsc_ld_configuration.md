# JSC-LD configuration

| Keyword           | Description                        |
|-------------------|------------------------------------|
| ``"$id"``         | The base URI for the JSC-LD schema |
| ``"base_prefix"`` | RDF namespace prefix               |
| ``"base_url"``    | The URI for the RDF namespace      |
| ``"title"``       | (Optional) JSC-LD title            |
| ``"format"``      | (Optional) defaults to "Turtle"    |
| ``"description"`` | (Optional) JSC-LD description      |
| ``"creators"``    | (Optional) WebID or URI            |
| ``"license"``     | (Optional) Open software license   |
| ``"rights"``      | (Optional) Copyright               |
| ``"modified"``    | (Optional) xsd:datetime            |

Below is a template of jsc-ld configuration which can be also found at [config.json](https://github.com/jiaoxlong/jsc-ld/blob/main/configs/config_template.json).

```json
    {
      "$id": "https://www.example.com/example-ld.json",
      "base_prefix": "example",
      "base_url": "https://w3id.org/example#",
      "title": "The example LD configuration",
      "format": "Turtle",
      "description": "JSC-LD configuration to map example json schema to RDF vocabulary and shapes",
      "creators": [
        "https://pietercolpaert.be/#me",
        "https://w3id.org/people/brechtvdv/#me",
        "https://data.knows.idlab.ugent.be/person/jilong/#me"
      ],
      "license": "MIT",
      "rights": "Copyright statement",
      "modified": "2022-06-02T11:32:52.12679"
    }
```
