package com.kumarSatyam.leave.config;

import com.kumarSatyam.leave.entity.Admin;
import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.Role;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
            if (userRepository.count() == 0) {
            // Admin
            Admin admin = new Admin();
            admin.setName("Admin User");
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setApproved(true);
            userRepository.save(admin);

            // Coordinator
            Coordinator coordinator = new Coordinator();
            coordinator.setName("Class Coordinator");
            coordinator.setEmail("coordinator@test.com");
            coordinator.setPassword(passwordEncoder.encode("coord123"));
            coordinator.setRole(Role.COORDINATOR);
            coordinator.setAssignedClass("Class A");
            coordinator.setApproved(true);
            userRepository.save(coordinator);

            // Student 1 (Eligible)
            Student student1 = new Student();
            student1.setName("Student Eligible");
            student1.setEmail("student1@test.com");
            student1.setPassword(passwordEncoder.encode("student123"));
            student1.setRole(Role.STUDENT);
            student1.setRollNumber("S101");
            student1.setStudentClass("Class A");
            student1.setAttendancePercentage(80.0);
            student1.setApproved(true);
            userRepository.save(student1);

            // Student 2 (Not Eligible - Low Attendance)
            Student student2 = new Student();
            student2.setName("Student Low Attendance");
            student2.setEmail("student2@test.com");
            student2.setPassword(passwordEncoder.encode("student123"));
            student2.setRole(Role.STUDENT);
            student2.setRollNumber("S102");
            student2.setStudentClass("Class A");
            student2.setAttendancePercentage(60.0);
            student2.setApproved(true);
            userRepository.save(student2);
            
            System.out.println("Demo data initialized!");
        }
    }
}
