# Firebase Studio

This is a NextJS starter in Firebase Studio.

## IMPORTANT: How to Fix Google Login Loop

To run and test this application locally, you **MUST** add `localhost` as an authorized domain in your Firebase project settings.

1.  Go to your **Firebase Console**.
2.  Navigate to **Authentication** -> **Settings** -> **Authorized Domains**.
3.  Click **Add Domain**.
4.  Enter `localhost` and click **Add**.

This step is required to allow Google Sign-In from your local development environment.
