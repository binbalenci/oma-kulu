#!/bin/bash

set -e  # Exit on error

# iOS Deployment
echo "Exporting iOS bundle and sourcemaps..."
npx expo export --source-maps --platform ios --output-dir dist-ios

echo "Deploying update to iOS channel..."
CI=1 eas update --branch main --message "$(git log -1 --pretty=%B)"

echo "Uploading iOS sourcemaps to Sentry..."
npx sentry-expo-upload-sourcemaps dist-ios

# Web Deployment
echo "Exporting web bundle and sourcemaps..."
npx expo export --source-maps --platform web --output-dir dist-web

echo "Deploying web project..."
eas deploy --prod

echo "Uploading web sourcemaps to Sentry..."
npx sentry-expo-upload-sourcemaps dist-web

echo "Deployment complete!"
