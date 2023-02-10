# Account-card-top
This is an example app which displays a couple of different widget examples at the top of an account card.

## Upsales App integration setup?
Use the following settings when setting up the app integration in Upsales
1. App name: <input_name>
2. Add support mail: <your_email>
3. Description: <input_description>
4. Endpoint: <input_url_to_server_running_application>
5. Use API key: <toggle true>
6. User configurable: <toggle false>
7. Config json: Insert the following config:
```json
{
	"fields": {
		"account": [],
		"user": []
	},
	"uiElements": {
		"account": {
			"accountCardTop": [
				{
					"name": "salesLast12Months",
					"type": "widget"
				},
				{
					"name": "agreement",
					"type": "widget"
				},
				{
					"name": "openActivities",
					"type": "iframe"
				},
				{
					"name": "upcomingMeetings6Months",
					"type": "widget"
				},
				{
					"name": "upcomingActivities6Months",
					"type": "widget"
				}
			]
		}
	},
	"requirements": []
}
```
8. Active: <toggle true>


## Activate Upsales app
1. Search for the application name
2. Click on application.
3. Activate

## How to see widgets
1. Click on any account link to navigate to the account dashboard.
2. Now you should see the widgets at the top of the account card.
