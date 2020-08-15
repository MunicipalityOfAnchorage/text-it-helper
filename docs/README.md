# API

All endpoints use [basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Basic_authentication_scheme) to authenticate.

* [POST /api/v1/subscriber-groups](#subscriber-groups)
* [POST /api/v1/zapier](#zapier)

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

## Zapier

```
POST /api/v1/zapier/:id1/:id2
```

This endpoint accepts a TextIt flow event, and fetches the contact information of the sender, and forwards the event and contact data to a [Zapier webhook](https://zapier.com/help/doc/how-get-started-webhooks-zapier). The :id1 and :id2 route parameters correspond to the two unique ID's within your Zapier webhook URL:

```
https://hooks.zapier.com/hooks/catch/:id1/:id2
```

To skip sending the payload to Zapier (which can be useful for testing), pass a `test` query parameter:

```
POST http://localhost:8080/api/v1/zapier/abc/def?test=true
```

<details>
<summary>Example request</summary>

```
curl --location --request POST 'http://localhost:8080/api/v1/zapier/abc/def' \
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
      "small_biz_alerts_anything_else": {
         "category": "Has Text",
         "value": "No"
      },
      "small_biz_survey_how_can_we_make_it_better": {
         "category": "Has Text",
         "value": "Change one thing"
      },
      "small_biz_survey_how_helpful": {
         "category": "Other",
         "value": "Haha"
      },
      "small_biz_survey_how_much_do_you_trust": {
         "category": "Other",
         "value": "Mostl "
      },
      "small_biz_survey_learned_something_new": {
         "category": "Other",
         "value": "Learned "
      },
      "small_biz_survey_what_do_you_like_most": {
         "category": "Has Text",
         "value": "Like most"
      }
   }
}
```

</details>

<details>
<summary>Example response</summary>

```
{
    "uuid": "a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd",
    "timestamp": 1597505782895,
    "phone": "12065551212",
    "name": "Aaron Schachter",
    "url": "https://textit.in/contact/read/a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd",
    "blocked": false,
    "stopped": false,
    "created_on": "2020-07-17T21:00:27.625572Z",
    "modified_on": "2020-08-15T15:22:04.215819Z",
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
    "groups": "All Subscribers, Business Owner, Not Helping Employer, AK CARES question, Remove from Stats, Batch 2, Started Survey, Finished Survey",
    "flow": {
        "name": "Survey: Small Biz Alerts",
        "uuid": "13a3aab9-063c-4388-8bb2-761c1ed6901a"
    },
    "results": {
        "small_biz_alerts_anything_else": {
            "category": "Has Text",
            "value": "No"
        },
        "small_biz_survey_how_can_we_make_it_better": {
            "category": "Has Text",
            "value": "Change one thing"
        },
        "small_biz_survey_how_helpful": {
            "category": "Other",
            "value": "Haha"
        },
        "small_biz_survey_how_much_do_you_trust": {
            "category": "Other",
            "value": "Mostl "
        },
        "small_biz_survey_learned_something_new": {
            "category": "Other",
            "value": "Learned "
        },
        "small_biz_survey_what_do_you_like_most": {
            "category": "Has Text",
            "value": "Like most"
        }
    }
}
```

</details>

