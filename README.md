# EE2120 Distributed Temperature Monitoring System

This is the SCADA / IoT Dashboard for the EE2120 Electrical Measurements and Instrumentation project.

## Architecture
The system visualizes real-time temperature data (DHT22, DS18B20, and Kalman Filter Fused values) and GPS locations from ESP32 sensor nodes via MQTT over WebSockets.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- An active MQTT Broker configured for WebSockets (e.g., Mosquitto with WS listener on port 9001)

## Setup Guide

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy the `.env.example` file to `.env` and configure your MQTT broker details.
   ```bash
   cp .env.example .env
   ```
   *Note: For browser-based MQTT connections, the broker must support WebSockets.*

3. **Development Mode**
   Start the Vite development server:
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173`.

4. **Demo Mode**
   If no MQTT broker is available, the dashboard will automatically switch to "DEMO MODE" and simulate real-time sensor node data for testing the UI, charts, and maps.

## Building for Production
To create a production build:
```bash
npm run build
```
This will generate optimized static assets in the `dist` folder.

## Technologies Used
- React + Vite
- Material UI (MUI v5)
- Zustand (State Management)
- Recharts (Time-series data visualization)
- Leaflet + React-Leaflet (GPS mapping)
- MQTT.js
