# Testing User-Specific Notifications

## Prerequisites

To run the test script, you need to set up Firebase service account credentials.

## Step 1: Get Firebase Service Account Credentials

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/aquamon-7a6bf
   - Make sure you're in the correct project

2. **Navigate to Service Accounts**
   - Go to Project Settings (gear icon)
   - Click on "Service accounts" tab
   - Scroll down to "Firebase Admin SDK"

3. **Generate New Private Key**
   - Click "Generate new private key"
   - Click "Generate key" to confirm
   - Download the JSON file

4. **Extract Credentials**
   From the downloaded JSON file, extract these values:
   ```json
   {
     "type": "service_account",
     "project_id": "aquamon-7a6bf",
     "private_key_id": "YOUR_PRIVATE_KEY_ID",
     "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@aquamon-7a6bf.iam.gserviceaccount.com",
     "client_id": "YOUR_CLIENT_ID",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40aquamon-7a6bf.iam.gserviceaccount.com"
   }
   ```

## Step 2: Create .env File

Create a `.env` file in the `AquaMon-Monitoring-Service` directory with:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=aquamon-7a6bf
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-from-json\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aquamon-7a6bf.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id-from-json
FIREBASE_DATABASE_URL=https://aquamon-7a6bf-default-rtdb.europe-west1.firebasedatabase.app

# Email Configuration (Optional for testing)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Step 3: Run the Test

```bash
npm run test-notifications
```

## Expected Output

The test should show:
- Number of aquariums found
- User emails for each aquarium
- User email lookup results
- Test notification creation
- Summary of the user notification system

## What the Test Does

1. **Connects to Firebase** using service account credentials
2. **Reads all aquariums** from the database
3. **Checks user emails** in aquariums and settings
4. **Tests email lookup logic** with multiple fallback strategies
5. **Creates a test notification** in the alerts collection
6. **Provides a summary** of the user notification system

## Troubleshooting

### Firebase Connection Error
- Check that the service account JSON is correctly formatted
- Ensure the private key includes `\n` characters for newlines
- Verify the project ID matches your Firebase project

### No Aquariums Found
- Make sure you have created aquariums in the web app
- Check that the database URL is correct
- Verify Firebase Realtime Database rules allow reading

### No User Emails Found
- This is normal for new installations
- User emails are stored when aquariums are created through the web app
- The system will fall back to admin email for notifications

## Next Steps

After running the test successfully:
1. Deploy the monitoring service to your preferred platform
2. Configure email settings for production
3. Monitor the service logs for user-specific notifications
