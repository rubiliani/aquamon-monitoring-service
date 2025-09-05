# GitHub Setup Guide for AquaMon Monitoring Service

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Recommended)

1. **Go to GitHub**: Visit [github.com](https://github.com) and sign in
2. **Create New Repository**:
   - Click the "+" icon in the top right
   - Select "New repository"
   - **Repository name**: `aquamon-monitoring-service`
   - **Description**: `AquaMon Monitoring Service - Standalone service for monitoring ESP32 devices and sending notifications`
   - **Visibility**: Public (for free Render deployment)
   - **Initialize**: Don't check "Add a README file" (we already have one)
   - Click "Create repository"

### Option B: Using GitHub CLI (if available)

```bash
# Install GitHub CLI first
# macOS: brew install gh
# Or download from: https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository
gh repo create aquamon-monitoring-service --public --description "AquaMon Monitoring Service - Standalone service for monitoring ESP32 devices and sending notifications"
```

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands like this:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/aquamon-monitoring-service.git

# Push the code
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Render

1. **Go to Render**: Visit [render.com](https://render.com)
2. **Sign in with GitHub**: Use your GitHub account
3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select the `aquamon-monitoring-service` repository
4. **Configure the Service**:
   - **Name**: `aquamon-monitoring-service`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. **Set Environment Variables** (see below)
6. **Deploy**: Click "Create Web Service"

## Environment Variables for Render

In the Render dashboard, go to your service → Environment tab and add:

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

## Step 4: Test the Deployed Service

Once deployed, test these endpoints:

- **Health Check**: `https://aquamon-monitoring-service.onrender.com/health`
- **Statistics**: `https://aquamon-monitoring-service.onrender.com/stats`
- **Test Connection**: `https://aquamon-monitoring-service.onrender.com/test-connection`

## Troubleshooting

### If Render can't find the repository:
1. Make sure the repository is **public**
2. Make sure you're signed in to Render with the same GitHub account
3. Try refreshing the repository list in Render
4. Check that the repository name is exactly `aquamon-monitoring-service`

### If deployment fails:
1. Check the build logs in Render dashboard
2. Verify all environment variables are set correctly
3. Make sure the private key is properly escaped with `\n` characters

### If the service doesn't start:
1. Check the service logs in Render dashboard
2. Verify Firebase credentials are correct
3. Test the connection endpoint first

## Next Steps After Deployment

1. **Set up Gmail App Password** for email notifications
2. **Test the service** using the provided endpoints
3. **Monitor the logs** to ensure everything is working
4. **The service will automatically start monitoring** your aquariums!

## Quick Commands Summary

```bash
# After creating GitHub repository, run these commands:
git remote add origin https://github.com/YOUR_USERNAME/aquamon-monitoring-service.git
git branch -M main
git push -u origin main
```

Then deploy to Render using the web interface!
