# Subscription sidebar widgets
This is an example app which displays widgets in the sidebar of a subscription.

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
		"editSubscription": {
			"sidebar": [
				{
					"name": "subscriptionWidget",
					"type": "widget"
				},
				{
					"name": "subscriptionIframe",
					"type": "iframe"
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


