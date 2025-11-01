/**
 * This is a placeholder for your Firebase Cloud Functions.
 *
 * You can define HTTP functions, background functions triggered by Firebase services, and more.
 *
 * See the official documentation for more details:
 * https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import {https} from "firebase-functions";

// Example HTTP function
export const helloWorld = https.onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
