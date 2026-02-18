CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    attendance_percentage DOUBLE PRECISION
);

CREATE TABLE leave_requests (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    coordinator_id BIGINT,
    coordinator_comment VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_coordinator FOREIGN KEY (coordinator_id) REFERENCES users(id)
);

-- Initial Data
INSERT INTO users (name, email, password, role, attendance_percentage) VALUES 
('Admin User', 'admin@test.com', 'admin123', 'ADMIN', NULL),
('Class Coordinator', 'coordinator@test.com', 'coord123', 'COORDINATOR', NULL),
('Student Eligible', 'student1@test.com', 'student123', 'STUDENT', 80.0),
('Student Low Attendance', 'student2@test.com', 'student123', 'STUDENT', 60.0);
