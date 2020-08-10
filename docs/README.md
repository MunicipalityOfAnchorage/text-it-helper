# API

All endpoints use [basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Basic_authentication_scheme) to authenticate.

* [POST /api/v1/subscriber-groups](#subscriber-groups)
* [POST /api/v1/inbox](#inbox)

## Subscriber Groups

```
POST /api/v1/subscriber-groups
```

This endpoint paginates through all contacts in an "All Subscribers" TextIt group, and adds them into new groups it creates, each with maximum size 100 contacts.

<details>
<summary>Example request</summary>

```
curl --location --request POST 'http://localhost:8080/api/v1/subscriber-groups' \
--header 'Accept: application/json' \
--header 'Authorization: Basic [Your base64 encoded username and password]' \
--header 'Content-Type: application/json' \
```

</details>

<details>
<summary>Example response</summary>

```
{
    "subscribers_count": 736,
    "groups_count": 8,
    "groups": [
        {
            "uuid": "f940b2dd-a7db-4cc3-9a6d-1d15919d8dc1",
            "name": "Batch 1",
            "count": 92
        },
        {
            "uuid": "d4562019-7529-4aa4-a59c-f886b44b9810",
            "name": "Batch 2",
            "count": 92
        },
        {
            "uuid": "d5a7290c-d3d2-40ca-994d-e6fa3831b2c6",
            "name": "Batch 3",
            "count": 92
        },
        {
            "uuid": "2bd12781-67e5-417d-9732-5b8c03c4abcb",
            "name": "Batch 4",
            "count": 92
        },
        {
            "uuid": "ee453467-b8ce-4065-817e-ecead4bb89b7",
            "name": "Batch 5",
            "count": 92
        },
        {
            "uuid": "99cf6f5c-2a02-40c8-a820-c20806c2f768",
            "name": "Batch 6",
            "count": 92
        },
        {
            "uuid": "6711e7a2-3831-4fea-9dd9-b06d49839fd8",
            "name": "Batch 7",
            "count": 92
        },
        {
            "uuid": "7c0be991-014b-4bf1-9705-d3ef21bdd1af",
            "name": "Batch 8",
            "count": 92
        }
    ]
}
```

</details>

## Inbox

```
POST /api/v1/inbox
```

This endpoint accepts a TextIt flow event, and fetches the contact information of the sender to forward the message and profile data to these external services:

* [Zapier webhook](https://zapier.com/help/doc/how-get-started-webhooks-zapier)

<details>
<summary>Example request</summary>

```
curl --location --request POST 'http://localhost:8080/api/v1/inbox' \
--header 'Accept: application/json' \
--header 'Authorization: Basic [Your base64 encoded username and password]' \
--header 'Content-Type: application/json' \
--data-raw '{
    "contact": {
        "name": "",
        "urn": "tel:+12065551212",
        "uuid": "f438c4c6-dc86-4eda-a0d0-48db703065d5"
    },
    "flow": {
        "name": "Admin: Aaron Test",
        "uuid": "b2155c34-c7dc-46bd-bb76-fa53480f50ed"
    },
    "results": {
        "result": {
            "category": "Has Text",
            "value": "Hello there"
        }
```

</details>

<details>
<summary>Example response</summary>

```
{
    "uuid": "a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd",
    "name": "Aaron Schachter",
    "phone": "12065551212",
    "blocked": false,
    "stopped": false,
    "created_on": "2020-07-17T21:00:27.625572Z",
    "modified_on": "2020-08-08T02:22:36.198947Z",
    "url": "https://textit.in/contact/read/a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd",
    "message": {
        "flow_name": "Admin: Aaron Test",
        "text": "Hello there"
    },
    "fields": {
        "date_unsubscribed": "2020-08-05",
        "date_subscribed": "2020-08-04",
        "business_owner_response": "Yes",
        "received_stimulus": null,
        "business_name": "Parkside Daycare",
        "helping_employer_response": null,
        "response": null,
        "number_of_employees": "None",
        "test_campaign_date": null
    },
    "groups": [
        {
            "uuid": "4e9443fe-51cb-4aee-aaac-360599158a63",
            "name": "All Subscribers"
        },
        {
            "uuid": "5f0c44c8-1af0-4c0b-b924-ff0f7c14ccc5",
            "name": "Business Owner"
        },
        {
            "uuid": "4a0f619f-08e7-40fa-8e2c-5cda0f66357e",
            "name": "Not Helping Employer"
        },
        {
            "uuid": "a202b216-c8cd-41be-b341-0656d4a1c061",
            "name": "AK CARES question"
        },
        {
            "uuid": "14fb5848-0734-45e9-bc1f-630062b7b263",
            "name": "Remove from Stats"
        },
        {
            "uuid": "d4562019-7529-4aa4-a59c-f886b44b9810",
            "name": "Batch 2"
        }
    ]
}
```

</details>

