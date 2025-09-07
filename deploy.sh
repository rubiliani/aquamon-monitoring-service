#!/bin/bash

echo "🚀 AquaMon Monitoring Service Deployment Script"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the AquaMon-Monitoring-Service directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🧪 Running tests..."
npm run test-connection

if [ $? -eq 0 ]; then
    echo "✅ Tests passed! Service is ready for deployment."
    echo ""
    echo "📋 Next steps:"
    echo "1. Choose a deployment platform:"
    echo "   - Render (Recommended): https://render.com"
    echo "   - Heroku: https://heroku.com"
    echo "   - Railway: https://railway.app"
    echo ""
    echo "2. Follow the deployment guide in DEPLOY_SIMPLE.md"
    echo ""
    echo "3. Set the following environment variables:"
    echo "   - FIREBASE_PROJECT_ID=aquamon-7a6bf"
    echo "   - FIREBASE_PRIVATE_KEY_ID=f9943d7c12c41c433f43fe7bd6d727829f2bfee6"
    echo "   - FIREBASE_CLIENT_EMAIL=firebase-adminsdk-f3izn@aquamon-7a6bf.iam.gserviceaccount.com"
    echo "   - FIREBASE_CLIENT_ID=110926147387481775321"
    echo "   - ADMIN_EMAIL=rubi.liani@gmail.com"
    echo "   - SMTP_HOST=smtp.gmail.com"
    echo "   - SMTP_PORT=587"
    echo "   - SMTP_USER=rubi.liani@gmail.com"
    echo "   - SMTP_PASS=your_app_password_here"
    echo ""
    echo "4. Deploy and test the service endpoints"
else
    echo "❌ Tests failed! Please check your configuration."
    exit 1
fi

