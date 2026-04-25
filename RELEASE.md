# LabWatch Mobile App
Auxcon Technologies

A universal infrastructure monitoring client for Android and iOS.
Point it at any LabWatch-compatible backend and get a live dashboard
of your services in seconds.

## What it does

- Connects to any self-hosted LabWatch backend
- Displays real-time service status, response times, and uptime
- Configurable backend URL with connection validation
- Works with the Auxcon demo backend out of the box — no setup required

## Quick start

1. Install the app from Google Play or the Apple App Store
2. Open it — you will see a live dashboard powered by api.auxcon.dev
3. To connect your own backend, go to Settings and enter your backend URL

## Run your own backend

Pull the official Docker image:

    docker pull auxcon/labwatch-api:latest
    docker run -d -p 8080:8080 auxcon/labwatch-api:latest

Then open Settings in the app and point it at your server.

Full backend documentation: github.com/natekelly-tech/homelab-monitoring-project

## Development

    git clone https://github.com/natekelly-tech/homelab-app.git
    cd homelab-app
    npm install
    npx expo start

Requires Node.js and the Expo CLI.
Uses EAS for production builds — see RELEASE.md for the full release process.

## Tech stack

- Expo SDK 54 / React Native 0.81
- TypeScript strict mode
- AsyncStorage for on-device persistence
- EAS Build and Submit for store distribution

## Architecture

All user data stays on device. The app never sends your infrastructure
metadata to Auxcon servers. The backend you point the app at is your
own — we only host api.auxcon.dev as a reference implementation and demo.

## Links

- Backend repo: github.com/natekelly-tech/homelab-monitoring-project
- Docker image: hub.docker.com/r/auxcon/labwatch-api
- Demo backend: https://api.auxcon.dev