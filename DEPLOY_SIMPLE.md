



# Simple Deployment Guide for AquaMon Monitoring Service

## Option 1: Render (Recommended - Free Tier Available)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### Step 2: Deploy to Render
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the `AquaMon-Monitoring-Service` folder
4. Configure the service:
   - **Name**: `aquamon-monitoring-service`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### Step 3: Set Environment Variables
In Render dashboard, go to your service → Environment tab and add:

```
FIREBASE_PROJECT_ID=aquamon-7a6bf
FIREBASE_PRIVATE_KEY_ID=f9943d7c12c41c433f43fe7bd6d727829f2bfee6
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUo6eGE90OfbBO\ncX3n/ffYiERjW8osYQtlkD31CXavpdt++m2s6RB/sRDZO9PYXXR/uI3eddMJKzhY\nzUDQMJPV3IBemBQm64I6FaEZsPaXrBaTMMmyBKqJ+CtRSUuA2r8OtICYQd9oU2yQ\nZW7GnC2oSkBqeE6ybUSfIDtOGru+jT/967yCDIGpB3jJjvw0u6FAhnq+8Zkimv1P\nuOR+PpsB0c8uFUJlllKVXUVNLdXv1LQdKOs2qMu7GioX0tjkLcGXwtR5OcTg57Df\n1xfuYYmzSDHTWY0Eq9fKGSjCes7rUD79l8gOczyAR/MN4sbMYQfqSJpYWbKaVtjr\nohL+v5rPAgMBAAECggEASBEVMGRgCc7AZ72gOfXBv8HjR7duzF6xkaDy1q736izw\nuNbgP/eXj2dv+egEcvKtjrH6ZxiQxy0+Qh6CZmzoVdWPLkAlqFEuSEhXWtE2qg35\ncrZYzXw2Xl9dMwX/0HKSyUWUxcWhlYacp02xXx/Ee6J6tXsD1QYieTnfz6dQ1RIF\nB5MLEJS04AsrnHLFgmtfrohtzMAEIwEPFjNMvhda31WcBMICLZxuze0LsdG1fNlH\noNPeC/ABJvw4hVWicLf2c6PPF7Tr+/bKgXPrglX7tPKzBIM3rQm3HCfzq6+aMhdQ\nfmXHMnq/NbWjfOVswhxwgxwgPn2sspNyh0rdzI8WsQKBgQDyac+53EbbzUOs1CZ2\nu+DLKCkyMH4DqwblUMcN5W32bKWEhPFvdlBUACvF7sga9gawjiuojqq8p4SJA4gU\ndfRQoGdr7qlGGg2PGncnMAZSUG8YYCsbFtdMsy3o7EAcgjdjHsgrIySbkyQtKs2A\nd/Y3sOeCcliJ0Q0bp2P5XzRoMQKBgQDgjqPDNxbG3WI2uWtJuiYCt6te+65tzTkB\nlNjxl09PKiKlfUpml893cQK1R/bIIyfGddcv6AiajxgHgxXihoby3qG5Hz53Mbsv\nppXIUguBTOMdktnYYe8qaKnMNfgOt24y66Q9vm7aFn1Lpv1l0qv1zvTXWSPa139U\n/H3NAgZy/wKBgEciE4mHgOd42TX63vqScQlMVKJcpm2vHwvlYzPJsjXQddVoKWy6\nvCGaFz4yrldzAE2IunjwvFs1kOefuKvAXRvXpeF/G/7tIDNw4awHJKO85Iyzk5KU\nZkMkhQFHahyzfUtBuh0mZ9SbHc9/MuRSz1ZSO+0EXsS6Km2F9gk0Da3RAoGAZfzC\nqdXqVVWU1q/t52VRACj0/0Wlmh78BhjZUxhan+TOKYU29lN6mY/NIBJYJdu5o+w/\nWHW0+qWEz1yc4u4gekvc/ZwQHciLcH/jRUDmEsqd1/+rSxhnrEYu4B2e1OhAd4YI\naTaFWC2gqGxmaAl/qjtdfjTxEOKQ5UNry2FhFncCgYBuh+U+FgVFjnB0ZXw6P62G\ndWVhwEimpLBU+gegVD/G+KRmBI10yOGTxaAIxRpsfSdgQG2hFBMFye+jADW9QQz/\n0S4r0ScW4BzX7nQ7RPaI1lB6OJ4omsKFKEfoanILYlINBOH1YqlLifq48RoxKShe\ncJb/4Zbv/ulwZ4N7FvfSuA==\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-f3izn@aquamon-7a6bf.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=110926147387481775321
ADMIN_EMAIL=rubi.liani@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rubi.liani@gmail.com
SMTP_PASS=your_app_password_here
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your service will be available at: `https://aquamon-monitoring-service.onrender.com`

## Option 2: Heroku (Alternative)

### Step 1: Install Heroku CLI
```bash
# macOS
brew install heroku/brew/heroku

# Or download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
heroku create aquamon-monitoring-service
```

### Step 4: Set Environment Variables
```bash
heroku config:set FIREBASE_PROJECT_ID=aquamon-7a6bf
heroku config:set FIREBASE_PRIVATE_KEY_ID=f9943d7c12c41c433f43fe7bd6d727829f2bfee6
heroku config:set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-f3izn@aquamon-7a6bf.iam.gserviceaccount.com
heroku config:set FIREBASE_CLIENT_ID=110926147387481775321
heroku config:set ADMIN_EMAIL=rubi.liani@gmail.com
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=rubi.liani@gmail.com
heroku config:set SMTP_PASS=your_app_password_here
```

### Step 5: Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## Option 3: Local Development (For Testing)

### Step 1: Set up Environment
```bash
cd AquaMon-Monitoring-Service
cp env.example .env
# Edit .env with your Firebase credentials
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Service
```bash
npm start
```

## Testing the Deployed Service

Once deployed, you can test the service by visiting:
- `https://your-service-url.com/health` - Health check
- `https://your-service-url.com/stats` - Service statistics
- `https://your-service-url.com/test-connection` - Test Firebase connection

## Important Notes

1. **Email Configuration**: You'll need to set up an App Password for Gmail if using SMTP
2. **Firebase Credentials**: The private key should be properly escaped
3. **Monitoring**: The service will automatically start monitoring your aquariums
4. **Logs**: Check the service logs for any issues

## Troubleshooting

- **Build Failures**: Check that all dependencies are in package.json
- **Environment Variables**: Ensure all required variables are set
- **Firebase Connection**: Test the connection using the test endpoint
- **Email Issues**: Verify SMTP credentials and App Password

## Next Steps

1. Deploy the service using one of the methods above
2. Test the service endpoints
3. Monitor the logs for any issues
4. Set up email notifications
5. The service will automatically monitor your aquariums and send alerts
