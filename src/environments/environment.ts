// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_URL: 'http://localhost:8002',
  TTS_API_URL: 'https://texttospeech.googleapis.com/v1/text:synthesize',
  TTS_API_KEY: 'AIzaSyBlSZIqWoQAqNZ6BL7-eJ7ot-rt9x4MRT0'
  // TTS_API_KEY: 'AIzaSyAmR4bv7FuWavYEqS2DqTUifnlFp_Ay1GU'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
