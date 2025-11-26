-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150),
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'patient',
    accepted_tos_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- MEMBERSHIP PLANS TABLE
CREATE TABLE IF NOT EXISTS membership_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    duration_days INTEGER DEFAULT 30
);

-- Insert Siwak-Bridge membership plans
INSERT INTO membership_plans (name, role, price, duration_days)
VALUES 
 ('Dental Clinic Owner Package', 'clinic_owner', 500, 30),
 ('Dentist (DDM) Package', 'dentist', 300, 30),
 ('Dental Assistant Package', 'assistant', 200, 30),
 ('Dental Student Package', 'dental_student', 150, 30),
 ('Patient Consultation Package', 'patient', 100, 30)
 ON CONFLICT DO NOTHING;

-- MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_id INTEGER REFERENCES membership_plans(id),
    role VARCHAR(100),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS LOG TABLE
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tx_ref VARCHAR(200),
    amount INTEGER,
    status VARCHAR(50),
    plan_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
