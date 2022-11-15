#!/usr/bin/env node

require('dotenv').config();

const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const util = require('util');
const inquirer = require('inquirer');

class SpeechSynthesizer {
  private client: any;
  private languageConfig = {
    English: {
      languageCode: 'en-US',
      voice: 'en-US-Wavenet-F'
    },
    Arabic: {
      languageCode: 'ar-XA',
      voice: 'ar-XA-Wavenet-D'
    },
    French: {
      languageCode: 'fr-FR',
      voice: 'fr-FR-Wavenet-C'
    }
  };

  constructor() { this.client = new textToSpeech.TextToSpeechClient(); }

  public get languages(): string[] { return Object.keys(this.languageConfig); }

  public async synthesizeSpeech(text: string, language: string, filename: string, dir: string): Promise<any> {
    const request = {
      input: { text },
      voice: {
        languageCode: this.languageConfig[language as keyof typeof this.languageConfig].languageCode,
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: .8,
        pitch: 2
      },
    };
    const [response] = await this.client.synthesizeSpeech(request);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    const writeFile = util.promisify(fs.writeFile);
    const filePath = path.join(dir, filename.includes('.mp3') ? filename : `${filename}.mp3`);
    await writeFile(filePath, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${filePath}`);
  }
}

const main = async () => {
  const synth = new SpeechSynthesizer();
  console.log('Generate mp3 audio assets from text:');
  const outputDir = await inquirer.prompt([
    {
      type: 'string',
      name: 'directory',
      message: 'Path to the output directory: ',
      default: './output',
      required: false
    }
  ]).then((res: {directory: string}) => res.directory);
  while (true) {
    const userInput = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: 'Select a language: ',
        default: 'English',
        choices: synth.languages,
        required: true
      },
      {
        type: 'string',
        name: 'text',
        message: 'Text to synthesize: ',
        required: true
      },
      {
        type: 'string',
        name: 'filename',
        message: 'Filename of the generated asset: ',
        required: true
      },
    ]);
    await synth.synthesizeSpeech(
      userInput.text,
      userInput.language,
      userInput.filename,
      outputDir
    );
    const continuePrompt = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continuePrompt',
        message: 'Continue? ',
        default: false,
        required: true
      }
    ]).then((res: {continuePrompt: boolean}) => res.continuePrompt);
    if (!continuePrompt) { break; }
  }
};

main();
