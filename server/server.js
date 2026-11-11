require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const models = require("./models");
const resourceRouter = require("./routes/resourceRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// In-memory fallback dataset
const memoryStore = {
  departments: [
    { _id: "dep_1", name: "Cardiology", head: "Dr. Sarah Johnson", location: "Building A, Floor 3", phone: "9876543211", createdAt: new Date() },
    { _id: "dep_2", name: "Neurology", head: "Dr. Rajesh Kumar", location: "Building B, Floor 2", phone: "9876543212", createdAt: new Date() },
    { _id: "dep_3", name: "Pediatrics", head: "Dr. Emily Davis", location: "Building A, Floor 1", phone: "9876543213", createdAt: new Date() },
    { _id: "dep_4", name: "Orthopedics", head: "Dr. Michael Chen", location: "Building C, Floor 4", phone: "9876543214", createdAt: new Date() }
  ],
  doctors: [
    { _id: "doc_1", name: "Sarah Johnson", specialization: "Cardiologist", department: "Cardiology", phone: "9876543211", email: "sarah.j@medicare.com", availability: "Available", consultationFee: 800, createdAt: new Date() },
    { _id: "doc_2", name: "Rajesh Kumar", specialization: "Neurologist", department: "Neurology", phone: "9876543212", email: "rajesh.k@medicare.com", availability: "Available", consultationFee: 1000, createdAt: new Date() },
    { _id: "doc_3", name: "Emily Davis", specialization: "Pediatrician", department: "Pediatrics", phone: "9876543213", email: "emily.d@medicare.com", availability: "Available", consultationFee: 600, createdAt: new Date() },
    { _id: "doc_4", name: "Michael Chen", specialization: "Orthopedic Surgeon", department: "Orthopedics", phone: "9876543214", email: "michael.c@medicare.com", availability: "On Leave", consultationFee: 900, createdAt: new Date() }
  ],
  patients: [
    { _id: "pat_1", name: "John Doe", age: 35, gender: "Male", phone: "9876543210", email: "john@example.com", bloodGroup: "O+", address: "123 Main St", disease: "Chest Pain & Hypertension", createdAt: new Date() },
    { _id: "pat_2", name: "Priya Sharma", age: 28, gender: "Female", phone: "9123456780", email: "priya@example.com", bloodGroup: "B+", address: "456 Park Rd", disease: "Migraine", createdAt: new Date() },
    { _id: "pat_3", name: "Robert Wilson", age: 52, gender: "Male", phone: "9988776655", email: "robert@example.com", bloodGroup: "A+", address: "789 Lake Ave", disease: "Knee Joint Pain", createdAt: new Date() }
  ],
  appointments: [
    { _id: "app_1", patientId: "pat_1", patientName: "John Doe", doctorId: "doc_1", doctorName: "Sarah Johnson", department: "Cardiology", date: "2026-11-15", time: "10:00", reason: "Cardiac checkup", status: "Scheduled", createdAt: new Date() },
    { _id: "app_2", patientId: "pat_2", patientName: "Priya Sharma", doctorId: "doc_2", doctorName: "Rajesh Kumar", department: "Neurology", date: "2026-11-16", time: "11:30", reason: "Headache consultation", status: "Scheduled", createdAt: new Date() },
    { _id: "app_3", patientId: "pat_3", patientName: "Robert Wilson", doctorId: "doc_4", doctorName: "Michael Chen", department: "Orthopedics", date: "2026-11-10", time: "09:00", reason: "Knee X-ray review", status: "Completed", createdAt: new Date() }
  ],
  invoices: [
    { _id: "inv_1", invoiceNumber: "INV-2026-001", patientId: "pat_1", patientName: "John Doe", description: "Cardiology ECG & Consultation", amount: 1500, paymentStatus: "Paid", invoiceDate: "2026-11-10", createdAt: new Date() },
    { _id: "inv_2", invoiceNumber: "INV-2026-002", patientId: "pat_2", patientName: "Priya Sharma", description: "Neurology Consultation", amount: 1000, paymentStatus: "Pending", invoiceDate: "2026-11-11", createdAt: new Date() },
    { _id: "inv_3", invoiceNumber: "INV-2026-003", patientId: "pat_3", patientName: "Robert Wilson", description: "Orthopedic Surgery Consultation", amount: 900, paymentStatus: "Paid", invoiceDate: "2026-11-09", createdAt: new Date() }
  ],
  "medical-history": [
    { _id: "mh_1", patientId: "pat_1", patientName: "John Doe", visitDate: "2026-11-01", diagnosis: "Mild Hypertension", treatment: "Lifestyle changes & low sodium diet", doctorName: "Sarah Johnson", notes: "Follow up in 2 weeks", createdAt: new Date() }
  ],
  prescriptions: [
    { _id: "pr_1", patientId: "pat_1", patientName: "John Doe", doctorName: "Sarah Johnson", medicine: "Amlodipine", dosage: "5mg", frequency: "Once daily", startDate: "2026-11-01", instructions: "Take after breakfast", createdAt: new Date() }
  ]
};

app.get("/api/health", (req, res) => {
  res.json({
    api: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "in-memory-fallback"
  });
});

[
  ["patients", models.Patient, "Patient", "patients"],
  ["doctors", models.Doctor, "Doctor", "doctors"],
  ["departments", models.Department, "Department", "departments"],
  ["appointments", models.Appointment, "Appointment", "appointments"],
  ["invoices", models.Invoice, "Invoice", "invoices"],
  ["medical-history", models.MedicalHistory, "Medical history", "medical-history"],
  ["prescriptions", models.Prescription, "Prescription", "prescriptions"]
].forEach(([subPath, Model, label, key]) => {
  app.use(`/api/${subPath}`, resourceRouter(Model, label, key, memoryStore));
});

app.get("/api/dashboard", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [totalPatients, totalDoctors, availableDoctors, totalDepartments, totalAppointments, pendingInvoices,
        upcomingAppointments, recentInvoices, appointmentStatuses, paid] = await Promise.all([
        models.Patient.countDocuments(),
        models.Doctor.countDocuments(),
        models.Doctor.countDocuments({ availability: "Available" }),
        models.Department.countDocuments(),
        models.Appointment.countDocuments(),
        models.Invoice.countDocuments({ paymentStatus: "Pending" }),
        models.Appointment.find({ status: "Scheduled" }).sort({ date: 1, time: 1 }).limit(5),
        models.Invoice.find().sort({ createdAt: -1 }).limit(5),
        models.Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        models.Invoice.aggregate([{ $match: { paymentStatus: "Paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
      ]);
      return res.json({
        counts: { totalPatients, totalDoctors, availableDoctors, totalDepartments, totalAppointments, pendingInvoices },
        upcomingAppointments,
        recentInvoices,
        appointmentStatuses,
        paidRevenue: paid[0]?.total || 0
      });
    }

    const patients = memoryStore.patients || [];
    const doctors = memoryStore.doctors || [];
    const departments = memoryStore.departments || [];
    const appointments = memoryStore.appointments || [];
    const invoices = memoryStore.invoices || [];

    const totalPatients = patients.length;
    const totalDoctors = doctors.length;
    const availableDoctors = doctors.filter((d) => d.availability === "Available").length;
    const totalDepartments = departments.length;
    const totalAppointments = appointments.length;
    const pendingInvoices = invoices.filter((i) => i.paymentStatus === "Pending").length;
    const upcomingAppointments = appointments.filter((a) => a.status === "Scheduled").slice(0, 5);
    const recentInvoices = invoices.slice(0, 5);
    const statusMap = {};
    appointments.forEach((a) => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });
    const appointmentStatuses = Object.keys(statusMap).map((status) => ({ _id: status, count: statusMap[status] }));
    const paidRevenue = invoices.filter((i) => i.paymentStatus === "Paid").reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    return res.json({
      counts: { totalPatients, totalDoctors, availableDoctors, totalDepartments, totalAppointments, pendingInvoices },
      upcomingAppointments,
      recentInvoices,
      appointmentStatuses,
      paidRevenue
    });
  } catch (e) {
    next(e);
  }
});

// Serve frontend static build
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));

// SPA fallback for all non-API paths
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
  }
  const indexPath = path.join(clientDist, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.json({ name: "MediCare Hospital API", status: "running" });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl}:`, error);
  if (error.name === "ValidationError") return res.status(400).json({ message: Object.values(error.errors).map((x) => x.message).join(" ") });
  if (error.code === 11000) return res.status(409).json({ message: "A record with that unique value already exists." });
  if (error.name === "CastError") return res.status(400).json({ message: "Invalid value for a record field." });
  res.status(500).json({ message: error.message || "Internal server error." });
});

const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((e) => console.log("MongoDB connection skipped or failed:", e.message));
}

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => console.log(`MediCare API running at http://localhost:${PORT}`));
}

module.exports = app;
