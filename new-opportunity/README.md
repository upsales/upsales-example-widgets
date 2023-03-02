# Create-opportunity
This is an example app which displays a button in the sidebar of an order.
When clicking the button, it will open up a new opportunity with prefilled fields.

## Upsales App integration setup?
Use the following settings when setting up the app integration in Upsales
1. App name: <input_name>
2. Add support mail: <your_email>
3. Description: <input_description>
4. Endpoint: <input_url_to_server_running_application>
5. Use API key: <toggle true>
6. User configurable: <toggle false>
7. Input the following configuration:
```json
{
	"fields": {
		"account": [],
		"user": []
	},
	"uiElements": {
	    "editOrder": {
	        "sidebar": [
	            {
                    "name": "newOpportunity",
                    "type": "widget"
	            }
            ]
	    }
	},
	"requirements": []
}
```
8. Save


## Activate Upsales app
1. Search for the application name
2. Click on the application
3. Activate the application
