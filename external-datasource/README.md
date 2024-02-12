# datasource-integration
Example app integration providing an external datasource that can be used within Upsales to fetch data from external resources.

## How to setup
The support article for this kind of integration: https://support.upsales.com/hc/en-us/articles/360016081373-Standard-Integration-Data-source

Here is an example config that can be used to test this:
```json
{
	"fields": {
		"account": [
			{
				"type": "multiselect",
				"name": "countries",
				"label": "Countries",
				"required": true,
				"externalValues": true
			},
			{
				"type": "checkbox",
				"name": "createContacts",
				"label": "Create contacts"
			}
		],
		"user": [],
		"test": true
	},
	"uiElements": {
		"account": {
			"sidebar": [
				{
					"name": "monitoring",
					"type": "iframe"
				}
			]
		}
	},
	"requirements": [],
	"capabilities": {
		"imageLink": "https://img.upsales.com/app/102/logo.png",
		"match": {
			"upsales": "dunsNo",
			"integration": "dunsNo"
		},
		"typeahead": {}
	},
	"iframe": true
}
```

Also make sure to set the `Data source` toggle to true in the `Frameworks` settings.