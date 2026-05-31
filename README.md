# 🎓 Unimate
### WiFi-Based Attendance System

A smart attendance system for colleges that uses WiFi validation + QR scanning to mark student attendance in real time.

---

## 🏗️ Project Structure

| Folder | Tech | Description |
|--------|------|-------------|
| `/backend` | Node.js + Express + Firebase | REST API, authentication, QR sessions |
| `/app` | React Native (Expo) | Mobile app for students & teachers |
| `/admin` | React.js | Web dashboard for admins |

---

## ✨ Features

- 🔐 Role-based login (Student, Teacher, Admin)
- 📶 WiFi SSID + IP range validation
- 📱 QR code generation (expires in 10 seconds)
- 📷 QR scanning via mobile camera
- 🔒 Device ID binding (prevents proxy attendance)
- 🏫 Room ID validation per session
- 📊 Admin dashboard with attendance records

---

## 🚀 How It Works

1. Teacher logs in → enters subject, class, room → generates QR
2. QR is displayed on the smartboard (expires in 10s)
3. Student opens app → must be on college WiFi → scans QR
4. Backend validates: WiFi + IP + Device ID + QR expiry
5. Attendance marked ✅

---

## 🛠️ Setup

### Backend
```bash
cd backend
npm install
node index.js
```

### App
```bash
cd app
npm install
npx expo start
```

### Admin
```bash
cd admin
npm install
npm start
```

---

## 🔒 Security Layers

1. College WiFi SSID check
2. IP range validation
3. 10-second QR expiry
4. Device ID binding
5. One mark per device per session
6. Room ID in QR payload