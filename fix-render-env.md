# Fix Render Environment Variables

## Missing Environment Variable

The service is failing because the `FIREBASE_DATABASE_URL` environment variable is missing.

## Solution

Add this environment variable to your Render service:

### Step 1: Go to Render Dashboard
1. Visit [render.com](https://render.com)
2. Go to your `aquamon-monitoring-service` project
3. Click on the service name

### Step 2: Add Environment Variable
1. Go to the "Environment" tab
2. Click "Add Environment Variable"
3. Add the following:

**Variable Name**: `FIREBASE_DATABASE_URL`
**Value**: `https://aquamon-7a6bf-default-rtdb.europe-west1.firebasedatabase.app`

### Step 3: Save and Redeploy
1. Click "Save Changes"
2. The service will automatically redeploy
3. Wait for deployment to complete

## Complete Environment Variables List

Make sure you have all these environment variables set:

```
FIREBASE_PROJECT_ID=aquamon-7a6bf
FIREBASE_PRIVATE_KEY_ID=f9943d7c12c41c433f43fe7bd6d727829f2bfee6
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUo6eGE90OfbBO\ncX3n/ffYiERjW8osYQtlkD31CXavpdt++m2s6RB/sRDZO9PYXXR/uI3eddMJKzhY\nzUDQMJPV3IBemBQm64I6FaEZsPaXrBaTMMmyBKqJ+CtRSUuA2r8OtICYQd9oU2yQ\nZW7GnC2oSkBqeE6ybUSfIDtOGru+jT/967yCDIGpB3jJjvw0u6FAhnq+8Zkimv1P\nuOR+PpsB0c8uFUJlllKVXUVNLdXv1LQdKOs2qMu7GioX0tjkLcGXwtR5OcTg57Df\n1xfuYYmzSDHTWY0Eq9fKGSjCes7rUD79l8gOczyAR/MN4sbMYQfqSJpYWbKaVtjr\nohL+v5rPAgMBAAECggEASBEVMGRgCc7AZ72gOfXBv8HjR7duzF6xkaDy1q736izw\nuNbgP/eXj2dv+egEcvKtjrH6ZxiQxy0+Qh6CZmzoVdWPLkAlqFEuSEhXWtE2qg35\ncrZYzXw2Xl9dMwX/0HKSyUWUxcWhlYacp02xXx/Ee6J6tXsD1QYieTnfz6dQ1RIF\nB5MLEJS04AsrnHLFgmtfrohtzMAEIwEPFjNMvhda31WcBMICLZxuze0LsdG1fNlH\noNPeC/ABJvw4hVWicLf2c6PPF7Tr+/bKgXPrglX7tPKzBIM3rQm3HCfzq6+aMhdQ\nfmXHMnq/NbWjfOVswhxwgxwgPn2sspNyh0rdzI8WsQKBgQDyac+53EbbzUOs1CZ2\nu+DLKCkyMH4DqwblUMcN5W32bKWEhPFvdlBUACvF7sga9gawjiuojqq8p4SJA4gU\ndfRQoGdr7qlGGg2PGncnMAZSUG8YYCsbFtdMsy3o7EAcgjdjHsgrIySbkyQtKs2A\nd/Y3sOeCcliJ0Q0bp2P5XzRoMQKBgQDgjqPDNxbG3WI2uWtJuiYCt6te+65tzTkB\nlNjxl09PKiKlfUpml893cQK1R/bIIyfGddcv6AiajxgHgxXihoby3qG5Hz53Mbsv\nppXIUguBTOMdktnYYe8qaKnMNfgOt24y66Q9vm7aFn1Lpv1l0qv1zvTXWSPa139U\n/H3NAgZy/wKBgEciE4mHgOd42TX63vqScQlMVKJcpm2vHwvlYzPJsjXQddVoKWy6\nvCGaFz4yrldzAE2IunjwvFs1kOefuKvAXRvXpeF/G/7tIDNw4awHJKO85Iyzk5KU\nZkMkhQFHahyzfUtBuh0mZ9SbHc9/MuRSz1ZSO+0EXsS6Km2F9gk0Da3RAoGAZfzC\nqdXqVVWU1q/t52VRACj0/0Wlmh78BhjZUxhan+TOKYU29lN6mY/NIBJYJdu5o+w/\nWHW0+qWEz1yc4u4gekvc/ZwQHciLcH/jRUDmEsqd1/+rSxhnrEYu4B2e1OhAd4YI\naTaFWC2gqGxmaAl/qjtdfjTxEOKQ5UNry2FhFncCgYBuh+U+FgVFjnB0ZXw6P62G\ndWVhwEimpLBU+gegVD/G+KRmBI10yOGTxaAIxRpsfSdgQG2hFBMFye+jADW9QQz/\n0S4r0ScW4BzX7nQ7RPaI1lB6OJ4omsKFKEfoanILYlINBOH1YqlLifq48RoxKShe\ncJb/4Zbv/ulwZ4N7FvfSuA==\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-f3izn@aquamon-7a6bf.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=110926147387481775321
FIREBASE_DATABASE_URL=https://aquamon-7a6bf-default-rtdb.europe-west1.firebasedatabase.app
ADMIN_EMAIL=rubi.liani@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rubi.liani@gmail.com
SMTP_PASS=your_app_password_here
```

## Quick Fix

The main missing variable is:
- **FIREBASE_DATABASE_URL** = `https://aquamon-7a6bf-default-rtdb.europe-west1.firebasedatabase.app`

Add this to your Render environment variables and the service should start working!
