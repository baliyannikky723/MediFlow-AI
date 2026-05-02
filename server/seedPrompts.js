const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mediflow")
    .then(async () => {
        await Doctor.deleteMany({});
        await Doctor.insertMany([
            {
                name: "Dr. Priya Sharma",
                specialization: "general",
                email: "priya.sharma@mediflow.com",
                phone: "9876543210",
                qualification: "MBBS, MD",
                experience: 8,
                department: "General Medicine",
                isAvailable: true,
                consultationFee: 500,
                rating: 4.8,
                bio: "Expert in general medicine and preventive care."
            },
            {
                name: "Dr. Rahul Gupta",
                specialization: "general",
                email: "rahul.gupta@mediflow.com",
                phone: "9876543211",
                qualification: "MBBS",
                experience: 5,
                department: "General Medicine",
                isAvailable: true,
                consultationFee: 400,
                rating: 4.6,
                bio: "Experienced general physician."
            },
            {
                name: "Dr. Sneha Verma",
                specialization: "cardiologist",
                email: "sneha.verma@mediflow.com",
                phone: "9876543212",
                qualification: "MBBS, DM Cardiology",
                experience: 12,
                department: "Cardiology",
                isAvailable: true,
                consultationFee: 800,
                rating: 4.9,
                bio: "Senior cardiologist with 12 years experience."
            },
            {
                name: "Dr. Amit Singh",
                specialization: "neurologist",
                email: "amit.singh@mediflow.com",
                phone: "9876543213",
                qualification: "MBBS, DM Neurology",
                experience: 10,
                department: "Neurology",
                isAvailable: true,
                consultationFee: 700,
                rating: 4.7,
                bio: "Specialist in neurological disorders."
            },
            {
                name: "Dr. Kavya Patel",
                specialization: "pulmonologist",
                email: "kavya.patel@mediflow.com",
                phone: "9876543214",
                qualification: "MBBS, MD Pulmonology",
                experience: 7,
                department: "Pulmonology",
                isAvailable: true,
                consultationFee: 600,
                rating: 4.5,
                bio: "Expert in respiratory and lung diseases."
            },
            {
                name: "Dr. Rohan Mehta",
                specialization: "dermatologist",
                email: "rohan.mehta@mediflow.com",
                phone: "9876543215",
                qualification: "MBBS, MD Dermatology",
                experience: 6,
                department: "Dermatology",
                isAvailable: true,
                consultationFee: 550,
                rating: 4.6,
                bio: "Specialist in skin conditions."
            },
            {
                name: "Dr. Anita Joshi",
                specialization: "orthopedic",
                email: "anita.joshi@mediflow.com",
                phone: "9876543216",
                qualification: "MBBS, MS Orthopedics",
                experience: 9,
                department: "Orthopedics",
                isAvailable: true,
                consultationFee: 650,
                rating: 4.7,
                bio: "Expert in bone and joint disorders."
            }
        ]);
        console.log("✅ Doctors seeded!");
        process.exit(0);
    })
    .catch(err => { console.error("❌", err); process.exit(1); });