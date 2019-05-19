/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const functions = require('firebase-functions');
const {google} = require('googleapis');
const {WebhookClient} = require('dialogflow-fulfillment');
const BIGQUERY = require('@google-cloud/bigquery');
const vision = require('@google-cloud/vision');
// Enter bucket name
const bucketName = 'as-testing-bucket';

// Enter your calendar ID below and service account JSON below
const calendarId = "google.com_pm9enjeqm73j481maqbi2nbdm8@group.calendar.google.com";
const serviceAccount = {
 "type": "service_account",
  "project_id": "as-testing-7e213",
  "private_key_id": "0bd2da5c7ec7bf02a548aed3b0178b97999811d8",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCYTD/AqhJPi4tP\nFTJe/yiU36LqIrxP4XC7t5mdKhk7m0n4o/If+D/2HkjnaayKl+gvJKVmRVXysqHs\nDE7zC54Q4aAvqQyIZLTRkE1ZOpFH54MtPLWspQabCOnhhOYkR3NJQ+RWtmXoqCNT\nn69c8v3IBea6uOJb9Cs0y/vgNKJKUJecvKQBodwGS5nkaI1RNM/FCD5wpWC9+99M\n4a6uWDyfoA9UolGh5CYvNiIuIfZ51DOZKzm5DI2eA00egSZ92p1qqjXVy8WZB7e0\nrbggrbkuDfjgGaYuuNchFlMv+4mOyMrfaTdnc0UEUcf1q3UHJ9+14a/jLGJV822Q\nLWklfWFlAgMBAAECggEAAdjfap2RwkJatpsKmCDhXII4O+6/65gbQ0KRRhdVCKfw\nsNCpxRNXX5CCKT2ZVdQsGAi+4QUHFgsZHiBRHdgYe+zAosY4RWl7e6Vb/1F3JbrH\nrFB6phNbJQ01MF6hZ9l/BuzeizEoRsDifTayzu0uOHGC59GuchRmuSMobmVCKM0u\nsj9tY7GaocRAUMgPPXQPOwZiOJwJLOGIzMDbsR4/cN6x2le971uqWgboCeagb01F\nKpQ1XGncfH/g/IV5vr7Ud6cWmFvDKS6rtAhtgthwmgH84xy+CUGOrVTLldnJfblx\nZZhR5Ha+WD2QSD6BarXLDFDrbV117GuNHw17dEgy4QKBgQDGYiELohxmsqG4Hl4M\nC09FneJESlK3dCnX+NEpp+5HM8BQmyu0e/0+0V36gu/atQDesFGEjwBPmeUF9NN4\ntpVVGTkmwuxNDVkNLdg7WquTdcoitKNae39nMHf2+lVZ2YW0YoK+fEdcUXNJEnDc\n4iCNChODM8Btaenv46o+01B7RwKBgQDEh6YVjRmFBYnlke1t/YzkXJH0ZWGckqz8\nlTLcppcZUHaNXtZzOQH31Ue7uTwf7/pj44TViKNwOXrZ7aifI9cLCVfbp9DcOuPc\nMf94N8VQmaLMAUAmObsC5SDOggHU5QGz5i7HpXeB1UkFgaVINiEmQdCznObmkyrz\nnobqmFk78wKBgBknnDUTazKCeAsWnqo8TOLw8B3kprRoYF3oSO1VQ9t3bm1KH7KU\n/jmW5qm7LJq41NFn3g5G660sQGQO9TmbPTg7KIoHsVrb1GzdYUu1ZYgfKXBZI1V3\nz2HQPYXtnCD2egOzcgyhSZMlKM8dLX50ldgMbQj36PB2u5kVbyLkPJJFAoGAI0lT\nybTO6zJmYwDDh6cpv+rbDe2SDCHNy4AiZLnIkXQABTwM9x06PDxgJ9WHdRiKdZrp\nQ8nHxqObajugtgoiV0nzK25DMvej5+pWO0iQNfuP3l8vHG3rJQbs0AdJuubvWlSu\n+4u7HGWmOcXgXknRw+O3TDiUwLuVz64b/U0jYH8CgYBBNIoxiO7ItGKn190cSuA4\nA4AJSPwPFfzOpcJSxkfmsCK9dWPSGUbATueKbmdufwtZ5BDi6olfUPmlhI96Baxl\nW4Y0vn+d9wHcOzpwxuuauPEmCqRuBlax2lMfM+9hkHWyhf9OGUNoNQd9iQTeNMRZ\nIYv6AfY8abgEGObjxNMGAA==\n-----END PRIVATE KEY-----\n",
  "client_email": "dialogflow-lcpxww@as-testing-7e213.iam.gserviceaccount.com",
  "client_id": "107124589565618607486",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/dialogflow-lcpxww%40as-testing-7e213.iam.gserviceaccount.com"
}; // Starts with {"type": "service_account",...

// Set up Google Calendar Service account credentials
const serviceAccountAuth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
process.env.DEBUG = 'dialogflow:*'; // enables lib debugging statements

const timeZone = 'America/Los_Angeles';
const timeZoneOffset = '-07:00';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log("Parameters", agent.parameters);
  const appointment_type = agent.parameters.AppointmentType;
  function makeAppointment (agent) {
    // Calculate appointment start and end datetimes (end = +1hr from start)

    const dateTimeStart = new Date(Date.parse(agent.parameters.date.split('T')[0] + 'T' + agent.parameters.time.split('T')[1].split('-')[0] + timeZoneOffset));
    const dateTimeEnd = new Date(new Date(dateTimeStart).setHours(dateTimeStart.getHours() + 1));
    const appointmentTimeString = dateTimeStart.toLocaleString(
      'en-US',
      { month: 'long', day: 'numeric', hour: 'numeric', timeZone: timeZone }
    );
   
    // Check the availibility of the time, and make an appointment if there is time on the calendar
    return createCalendarEvent(dateTimeStart, dateTimeEnd, appointment_type).then(() => {
      agent.add(`Ok, let me see if we can fit you in. ${appointmentTimeString} is fine!.`);
          // Insert data into a table
      addToBigQuery(agent, appointment_type);
      
    }).catch(() => {
      agent.add(`I'm sorry, there are no slots available for ${appointmentTimeString}.`);
    });
  }
  
  // function called when file_uplod intent is triggered
  function applyML(agent){
    const filename = agent.parameters.filename;
    // call vision API to detect text
    return callVisionApi(agent, bucketName, filename).then(result => {
            agent.add(`file is being processed ${result}`);
        }).catch((error)=> {
            agent.add(`error occured at apply ml function`  + error);
        });
  }

  let intentMap = new Map();
  intentMap.set('Schedule Appointment', makeAppointment);
  intentMap.set('file_upload', applyML);
  agent.handleRequest(intentMap);
});


function addToBigQuery(agent, appointment_type) {
    const date_bq = agent.parameters.date.split('T')[0];
    const time_bq = agent.parameters.time.split('T')[1].split('-')[0];
    const projectId = '<YOUR GCP PROJECT ID>; /* TODO */
    const bigquery = new BIGQUERY({
      projectId: projectId
    });
    
    /**
    * TODO(developer): Uncomment the following lines before running the sample.
    */
   const datasetId = "<YOUR DATASET ID>";
   const tableId = "<YOUR TABLE NAME>"; 
   const rows = [{date: date_bq, time: time_bq, type: appointment_type}];
  
   bigquery
  .dataset(datasetId)
  .table(tableId)
  .insert(rows)
  .then(() => {
    console.log(`Inserted ${rows.length} rows`);
    agent.add(`Added ${date_bq} and ${time_bq} into the table`);
  })
  .catch(err => {
    if (err && err.name === 'PartialFailureError') {
      if (err.errors && err.errors.length > 0) {
        console.log('Insert errors:');
        err.errors.forEach(err => console.error(err));
      }
    } else {
      console.error('ERROR:', err);
    }
  });
  agent.add(`Added ${date_bq} and ${time_bq} into the table`);
}

async function callVisionApi(agent, bucketName, fileName){
  // Creates a client
  const client = new vision.ImageAnnotatorClient();
    try {
        // Performs text detection on the gcs file
        const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`);
        const detections = result.textAnnotations;
        var detected = [];

        detections.forEach(text => {
            console.log(text.description);
            detected.push(text.description);
        });
        
        return detected;
    }
    catch(error) {
        console.log('fetch failed', error);
        return [];
    }
}
  

function createCalendarEvent (dateTimeStart, dateTimeEnd, appointment_type) {
  return new Promise((resolve, reject) => {
    calendar.events.list({
      auth: serviceAccountAuth, // List events for time period
      calendarId: calendarId,
      timeMin: dateTimeStart.toISOString(),
      timeMax: dateTimeEnd.toISOString()
    }, (err, calendarResponse) => {
      // Check if there is a event already on the Calendar
      if (err || calendarResponse.data.items.length > 0) {
        reject(err || new Error('Requested time conflicts with another appointment'));
      } else {
        // Create event for the requested time period
        calendar.events.insert({ auth: serviceAccountAuth,
          calendarId: calendarId,
          resource: {summary: appointment_type +' Appointment', description: appointment_type,
            start: {dateTime: dateTimeStart},
            end: {dateTime: dateTimeEnd}}
        }, (err, event) => {
          err ? reject(err) : resolve(event);
        }
        );
      }
    });
  });
}