# TextIt Helper

This project helps automate tasks for [TextIt](https://textit.in/) administration. 

It is built in Node.js with [Express](https://expressjs.com/) for the [Anchorage Innovation Team](https://medium.com/anchorage-i-team/about-us-574f8ac4d839) by [Aaron Schachter](https://www.github.com/aaronschachter), as a volunteer for the [U.S. Digital Response](https://www.usdigitalresponse.org/).


## API

All endpoints use [basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Basic_authentication_scheme) to authenticate.

### Flow Events 

```
POST /api/v1/flow-events
```

This endpoint accepts a TextIt flow event, fetches the contact information of the sender, and returns the data as plain text, to use for sending internal emails from TextIt.


<details>
<summary>Example request</summary>

```
curl --location --request POST 'http://localhost:8080/api/v1/flow-events?zapier=abc-def' \
--header 'Accept: application/json' \
--header 'Authorization: Basic [Your base64 encoded username and password]' \
--header 'Content-Type: application/json' \
--data-raw '{
   "contact": {
      "name": "Aaron Schachter",
      "urn": "tel:+12065551212",
      "uuid": "a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd"
   },
   "flow": {
      "name": "Survey: Small Biz Alerts",
      "uuid": "13a3aab9-063c-4388-8bb2-761c1ed6901a"
   },
   "results": {
      "Ready": {
        "category": "Has Text",
        "value": "Hello there"
      }
   }
}
```

</details>

<details>
<summary>Example response</summary>

```
{
    "data": {
        "Uuid": "a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd",
        "Name": "Aaron Schachter",
        "Phone": "tel:+12065551212",
        "Profile": "https://textit.in/contact/read/a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd",
        "Created On": "2020-07-17T21:00:27.625572Z",
        "Groups": "All Subscribers, Business Owner, Not Helping Employer, Healthcare provider, Public Facing / Food Business, AK CARES question, Remove from Stats, Batch 2, Started Survey, Finished Survey",
        "Business Name": "Schachter daycare",
        "Helping Employer Response": null,
        "Number Of Employees": "None",
        "Flow": "Admin: Aaron Test",
        "Submitted": "2020-08-26T03:51:57.849Z",
        "Ready": "Hello there"
    },
    "text": "Name:\nAaron Schachter\n\nPhone:\ntel:+12065551212\n\nProfile:\nhttps://textit.in/contact/read/a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd\n\nCreated On:\n2020-07-17T21:00:27.625572Z\n\nGroups:\nAll Subscribers, Business Owner, Not Helping Employer, Healthcare provider, Public Facing / Food Business, AK CARES question, Remove from Stats, Batch 2, Started Survey, Finished Survey\n\nBusiness Name:\nSchachter daycare\n\nHelping Employer Response:\nnull\n\nNumber Of Employees:\nNone\n\nFlow:\nAdmin: Aaron Test\n\nSubmitted:\n2020-08-26T03:51:57.849Z\n\nReady:\nHello there\n",
    "responses": {
        "zapier": {
            "id": "414a1bc4-722d-4f3a-8787-47229e213d21",
            "request_id": "5f44910d-79b3-4742-af86-25b101087e70",
            "attempt": "5f44910d-79b3-4742-af86-25b101087e70",
            "status": "success"
        }
    }
}
```
</details>

It also forwards the flow event data if certain query parameters are passed.

### Airtable

```
POST /api/v1/flow-events?airtable=SurveyResults
```

If an `airtable` query parameter is passed, the flow event data will be used to create a record in the table passed as the query parameter.

It assumes there are `Contacts` and `Flows` tables set up, and the table to create the flow event record contains corresponding `Contact` and `Flow` link fields.

### Zapier

```
POST /api/v1/flow-events?zapier=abc-def
```

If a `zapier` query parameter is passed, the flow event data will be posted to a [Zapier webhook](https://zapier.com/help/doc/how-get-started-webhooks-zapier). The `zapier` query parameter expects two id's, separated by a hyphen, which correspond to the route parameters correspond to the two unique ID's within your Zapier webhook URL:

```
https://hooks.zapier.com/hooks/catch/abc/def
```
