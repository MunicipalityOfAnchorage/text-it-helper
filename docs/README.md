# API

All endpoints use [basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Basic_authentication_scheme) to authenticate.

## Export 

```
POST /api/v1/export
```

This endpoint accepts a TextIt flow event, fetches the contact information of the sender, and returns the data as plain text, to use for sending internal emails from TextIt.

<details>
<summary>Example request</summary>

```
curl --location --request POST 'http://localhost:8080/api/v1/export' \
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
    "text": "name: \"Aaron Schachter\"\n\nphone: \"12065551212\"\n\nurl: \"https://textit.in/contact/read/a41aeb32-793c-46ba-b3ac-0bf9ada9f9bd\"\n\ncreated_on: \"2020-07-17T21:00:27.625572Z\"\n\ngroups: \"All Subscribers, Business Owner, Not Helping Employer, AK CARES question, Remove from Stats, Batch 2, Started Survey, Finished Survey\"\n\nflow: Survey: Small Biz Alerts\n\nsmall_biz_alerts_anything_else: {\"category\":\"Has Text\",\"value\":\"No\"}\n\nsmall_biz_survey_how_can_we_make_it_better: {\"category\":\"Has Text\",\"value\":\"Change one thing\"}\n\nsmall_biz_survey_how_helpful: {\"category\":\"Other\",\"value\":\"Haha\"}\n\nsmall_biz_survey_how_much_do_you_trust: {\"category\":\"Other\",\"value\":\"Mostl \"}\n\nsmall_biz_survey_learned_something_new: {\"category\":\"Other\",\"value\":\"Learned \"}\n\nsmall_biz_survey_what_do_you_like_most: {\"category\":\"Has Text\",\"value\":\"Like most\"}\n\nbusiness_name: Schachter daycare\n\nbusiness_owner_response: Yes\n\ndate_subscribed: 2020-08-04\n\ndate_unsubscribed: 2020-08-05\n\nhelping_employer_response: null\n\nnumber_of_employees: None\n\nreceived_stimulus: null\n\nresponse: null\n\ntest_campaign_date: null"
}
```

</details>

## Zapier

```
POST /api/v1/zapier/:id1/:id2
```

This endpoint accepts a TextIt flow event, fetches the contact information of the sender, and forwards the event and contact data to a [Zapier webhook](https://zapier.com/help/doc/how-get-started-webhooks-zapier). The :id1 and :id2 route parameters correspond to the two unique ID's within your Zapier webhook URL:

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

