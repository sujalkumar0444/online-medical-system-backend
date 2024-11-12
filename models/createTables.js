const { postgreSQLConnect } = require('../pgConfig');
const client = postgreSQLConnect();

async function createTables() {
    try {
        console.log("Creating tables if they don't exist...");

        // Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Doctor Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS doctor (
                doctor_id VARCHAR(10) PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone_number VARCHAR(15) UNIQUE,
                password VARCHAR(255) NOT NULL,
                profile_picture_url VARCHAR(255),
                qualifications TEXT,
                registration_number VARCHAR(50),
                verified BOOLEAN DEFAULT FALSE,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'Inactive',
                medical_certificate JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Patient Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS patient (
                patient_id VARCHAR(10) PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone_number VARCHAR(15) UNIQUE,
                password VARCHAR(255) NOT NULL,
                profile_picture_url VARCHAR(255),
                blood_type VARCHAR(5),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Appointments Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                appointment_id SERIAL PRIMARY KEY,
                patient_id VARCHAR(10) REFERENCES patient(patient_id),
                doctor_id VARCHAR(10) REFERENCES doctor(doctor_id),
                appointment_date TIMESTAMP,
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                appointment_type VARCHAR(20),
                appointment_status VARCHAR(20) DEFAULT 'Pending',
                mutual_agreement BOOLEAN DEFAULT FALSE,
                billing_status VARCHAR(20) DEFAULT 'Unpaid',
                amount DECIMAL(10, 2) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // ePrescriptions Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS e_prescriptions (
                prescription_id SERIAL PRIMARY KEY,
                appointment_id INT REFERENCES appointments(appointment_id) ON DELETE CASCADE,
                doctor_id VARCHAR(10) REFERENCES doctor(doctor_id),
                patient_id VARCHAR(10) REFERENCES patient(patient_id),
                prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                medications TEXT[],
                dosages TEXT[],
                instructions TEXT,
                follow_up_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Medical History Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS medical_history (
                history_id SERIAL PRIMARY KEY,
                patient_id VARCHAR(10) REFERENCES patient(patient_id),
                doctor_id VARCHAR(10) REFERENCES doctor(doctor_id),
                record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Medical History Images Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS medical_history_images (
                image_id SERIAL PRIMARY KEY,
                history_id INT REFERENCES medical_history(history_id) ON DELETE CASCADE,
                image_url VARCHAR(255),
                image_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Billing Information Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS billing_info (
                billing_id SERIAL PRIMARY KEY,
                appointment_id INT REFERENCES appointments(appointment_id) ON DELETE CASCADE,
                amount DECIMAL(10, 2) DEFAULT 0.0,
                payment_status VARCHAR(20) DEFAULT 'Pending',
                payment_method VARCHAR(50),
                transaction_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Donors Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS donors (
                donor_id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone_number VARCHAR(15) UNIQUE,
                blood_type VARCHAR(5),
                address TEXT,
                donation_status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Blood Donation Records Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS blood_donations (
                donation_id SERIAL PRIMARY KEY,
                donor_id INT REFERENCES donors(donor_id) ON DELETE CASCADE,
                donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                donation_amount DECIMAL(5, 2) DEFAULT 0.0, -- In liters or milliliters
                location VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Tables created or already exist.");
    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        client.release();
    }
}

module.exports = { createTables };
