live link
https://hospital-management-app-omega.vercel.app/
# MediCare MERN Hospital Management System

A full-stack educational hospital management app using MongoDB, Express, React, Node.js, Mongoose and Axios.

## Modules
Dashboard; Patients; Doctors and availability; Departments; Appointments; Billing/invoices; Medical history; Prescriptions. All resource pages support create, list, search, edit and delete.

## Run in VS Code
Prerequisites: Node.js 20+ and MongoDB Community Server running locally.

Terminal 1:
```powershell
cd server
Copy-Item .env.example .env
npm install
npm run dev
```
Terminal 2:
```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```
Open the Vite URL (usually http://localhost:5173).

Default MongoDB URI: mongodb://127.0.0.1:27017/medicare_hospital

## MERN challenge mapping
1. Module purpose: server/models/index.js and client/src/components/ResourcePage.jsx.
2. Structure: separate client and server folders.
3. React UI: client/src/App.jsx, components and styles.css.
4. Express backend: server/server.js and server/routes/resourceRoutes.js.
5. Mongoose: server/models/index.js and server/.env.
6. Axios: client/src/api.js.
7. API route matching: client calls /api/:resource; Express mounts the same paths.
8. Error handling: validation, duplicate keys, invalid IDs and API errors return messages.
9. CRUD: GET/POST/PUT/DELETE for every resource.
10. Demo: add a department, doctor, patient, appointment, history record, prescription and invoice; then edit/search/delete records and refresh the dashboard.

API: GET/POST /api/:resource, GET/PUT/DELETE /api/:resource/:id; GET /api/dashboard; GET /api/health.
Resources: patients, doctors, departments, appointments, invoices, medical-history, prescriptions.

This is an educational demo, not a certified clinical system. Do not enter real sensitive patient data. Production deployment needs authentication, authorization, HTTPS, backups, audit logs and a security review.
