# Text-To-Speech asset generation

This script can be used to generate audio assets using Google Cloud Text-To-Speech.<br>
To  use it you need to have activated the Text-To-Speech API and created a service account for a Google Cloud project, all of which is explained [here](https://cloud.google.com/text-to-speech/docs/before-you-begin).

## Setup

### Google Cloud authentication
1. [Download a JSON key for your service account](https://cloud.google.com/text-to-speech/docs/before-you-begin#create_a_json_key_for_your_service_account)
2. Create a `.env` file in the same directory as this README, with the following content:
```bash
GOOGLE_APPLICATION_CREDENTIALS="<path to the downloaded service account key>"
```

### Dependencies
Run `npm i` to install the script's dependencies.

## Running the script
Run `npm start` and follow the instructions to generate assets to the desired location.