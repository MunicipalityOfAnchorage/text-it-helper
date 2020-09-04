# TextIt Helper

This project helps automate tasks for [TextIt](https://textit.in/) administration. 

It is built in Node.js with [Express](https://expressjs.com/) for the [Anchorage Innovation Team](https://medium.com/anchorage-i-team/about-us-574f8ac4d839) by the [U.S. Digital Response](https://www.usdigitalresponse.org/).

## Scheduled Tasks

Run `node worker.js` to add new subscribers into a batch group.

## API

All endpoints use [basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Basic_authentication_scheme) to authenticate.

### Run Results 

```
POST /api/v1/run-results
```

This endpoint accepts a request from a TextIt "Call Webhook" action in TextIt. It parses the flow run results, returns them as plain text, and can forward the data to Zapier or Airtable if query parameters are passed.

#### Configuration

In each "Call Webhook" action, append this payload to the default POST body to include the TextIt Run ID. This Run ID used to upsert results that are saved during a flow run:

```
  "run", object(
    "uuid", run.uuid, 
    "flow", run.flow.uuid
  ),
```

The complete POST body should look like:

```
@(json(object(
  "contact", object(
    "uuid", contact.uuid, 
    "name", contact.name, 
    "urn", contact.urn
  ),
  "flow", object(
    "uuid", run.flow.uuid, 
    "name", run.flow.name
  ),
  "run", object(
    "uuid", run.uuid
  ),
  "results", foreach_value(results, extract_object, "value", "category")
)))
```

In a future iteration, we'll add the contact info to this payload to avoid making a call to the TextIt API - since we'll need to copy/paste this POST body into each "Call Webhook" action.

<details>
<summary>Example request</summary>

```
curl --location --request POST 'http://localhost:8080/api/v1/run-results?zapier=abc-def' \
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
   },
   "run": {
      "uuid": "a977ec65-9efa-4f15-8c3d-c3e65edc029d"
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
        "Run": "a977ec65-9efa-4f15-8c3d-c3e65edc029d",
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

#### Airtable

```
POST /api/v1/run-results?airtable=SurveyResults
```

If an `airtable` query parameter is passed, the run results will be used to upsert a record in the table passed as the query parameter (in this example, a table called `Survey Results`).

It requires that there are `Contacts` and `Flows` tables set up:

* `Contacts`
   * `Uuid` (Single-line text)
   * `Name` (Single-line text)
   * `Phone` (Single-line text)
   * `Profile` (Phone number)
   * `Created On` (Date)
   * `Groups` (Long text)
   * Additional contact fields, in Title Case -- e.g. `Business Name`.
       * If you do not wish to store all fields on a TextIt contact in the corresponding Airtable, set a `TEXT_IT_CONTACT_FIELDS` config variable to specify which contact fields should be maintained in Airtable -- e.g.`TEXT_IT_CONTACT_FIELDS=business_name,helping_employer_response,number_of_employees`

* `Flows`
   * `Uuid` (Single-line text)
   * `Name` (Single-line text)

The table to upsert a record into requires `Contact` and `Flow` link fields, as well as a `Run` text field to use for upserting results of a flow run.

To save run results into the table passed via `airtable` query parameter:

* First, create the table in Airtable with fields:
    * `Contact` (Link to Contacts)
    * `Flow` (Link to Flows)
    * `Run` (Single-line text)
    * The run result fields, in Title Case -- e.g. `How Helpful Rating`

* Create a TextIt flow with various "Wait for response" actions, saving each result to the corresponding Airtable field name, -- e.g. `How Helpful Rating`.

* Each time you want to upsert the user's responses within the flow, add a "Call Webhook" action to post to the `run-results?airtable=TableName` endpoint with the name of the table to upsert to, using PascalCase for the table name.

Always add a new field to Airtable first before saving it as a new result in TextIt -- Airtable will return a 422 if you attempt to write to a field that doesn't exist on a table.

#### Zapier

```
POST /api/v1/run-results?zapier=abc-def
```

If a `zapier` query parameter is passed, the run results will be posted to a [Zapier webhook](https://zapier.com/help/doc/how-get-started-webhooks-zapier). The `zapier` query parameter expects two id's, separated by a hyphen, which correspond to the route parameters correspond to the two unique ID's within your Zapier webhook URL:

```
https://hooks.zapier.com/hooks/catch/abc/def
```
