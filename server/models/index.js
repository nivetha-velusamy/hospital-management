const mongoose = require("mongoose");
const { Schema } = mongoose;
const opts = { timestamps: true };
const patientSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  age: { type: Number, required: true, min: 0, max: 130 },
  gender: { type: String, required: true, enum: ["Female", "Male", "Other"] },
  phone: { type: String, required: true, match: /^[0-9]{10}$/ },
  email: { type: String, default: "" }, bloodGroup: { type: String, default: "" },
  address: { type: String, default: "" },
  disease: { type: String, required: true, trim: true, maxlength: 200 }
}, opts);
const doctorSchema = new Schema({
  name: { type: String, required: true, trim: true },
  specialization: { type: String, required: true, trim: true },
  department: { type: String, default: "" },
  phone: { type: String, required: true, match: /^[0-9]{10}$/ },
  email: { type: String, default: "" },
  availability: { type: String, enum: ["Available", "Unavailable", "On Leave"], default: "Available" },
  consultationFee: { type: Number, min: 0, default: 0 }
}, opts);
const departmentSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  head: { type: String, default: "" }, location: { type: String, default: "" }, phone: { type: String, default: "" }
}, opts);
const appointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, required: true }, patientName: { type: String, required: true },
  doctorId: { type: Schema.Types.ObjectId, required: true }, doctorName: { type: String, required: true },
  department: { type: String, default: "" }, date: { type: String, required: true }, time: { type: String, required: true },
  reason: { type: String, default: "" }, status: { type: String, enum: ["Scheduled","Completed","Cancelled"], default: "Scheduled" }
}, opts);
const invoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true }, patientId: { type: Schema.Types.ObjectId, required: true },
  patientName: { type: String, required: true }, description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 }, paymentStatus: { type: String, enum: ["Pending","Paid","Overdue"], default: "Pending" },
  invoiceDate: { type: String, required: true }
}, opts);
const historySchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, required: true }, patientName: { type: String, required: true },
  visitDate: { type: String, required: true }, diagnosis: { type: String, required: true },
  treatment: { type: String, default: "" }, notes: { type: String, default: "" }, doctorName: { type: String, default: "" }
}, opts);
const prescriptionSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, required: true }, patientName: { type: String, required: true },
  doctorName: { type: String, required: true }, medicine: { type: String, required: true },
  dosage: { type: String, required: true }, frequency: { type: String, required: true },
  startDate: { type: String, required: true }, instructions: { type: String, default: "" }
}, opts);
module.exports = {
  Patient: mongoose.model("Patient", patientSchema), Doctor: mongoose.model("Doctor", doctorSchema),
  Department: mongoose.model("Department", departmentSchema), Appointment: mongoose.model("Appointment", appointmentSchema),
  Invoice: mongoose.model("Invoice", invoiceSchema), MedicalHistory: mongoose.model("MedicalHistory", historySchema),
  Prescription: mongoose.model("Prescription", prescriptionSchema)
};
