# On-order-edit
This is an example app which displays how you can listen to order edit changes and control how an order should look like while live-editing it.

## Upsales App integration setup?
Use the following settings when setting up the app integration in Upsales
1. App name: <input_name>
2. Add support mail: <your_email>
3. Description: <input_description>
4. Endpoint: <input_url_to_server_running_application>
5. Use API key: <toggle true>
6. User configurable: <toggle false>
7. Order or Opportunity was edited: <toggle true>
8. Active: <toggle true>


## Activate Upsales app
1. Search for the application name
2. Click on application.
3. Activate

## How to use
1. Open up a new opportunity or existing order/opportunity.
2. To hide, input the following command: `Hide order <field> <subField> <customField>`
    * Examples
        - Hide order date
        - Hide order orderRow price
        - Hide order orderRow@1 custom 38
        - Hide order custom 5
3. To disable, input the following command: `Disable order <field> <subField> <customField>`
    * Examples
        - Disable order date
        - Disable order orderRow price
        - Disable order orderRow@1 custom 38
        - Disable order custom 5

3. To set values on oeder, input the following command: `Set order <field> <valueOrId> <valueOrAttr> <value>`
    * Examples
        - Set order description 'Changed'
        - Set order stage id 9
        - Set order custom 5 options 1,2,3,4,5
        - Set order custom 5 value 2
        - Set order orderRow 1001 quantity 1000
        - Set order orderRow 1001 custom 38 value 'text'