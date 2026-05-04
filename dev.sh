#!/bin/bash

# Navigate to the directory where the script is located
cd "$(dirname "$0")"

echo "Building kn-editor..."
rm -rf node_modules
npm install
npm run build

echo "Starting playground..."
cd playground
rm -rf node_modules
npm install
npm run dev