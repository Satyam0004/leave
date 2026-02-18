package com.kumarSatyam.leave.config;

import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

//@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Admin
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@test.com");
            admin.setPassword("admin123");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);

            // Coordinator
            User coordinator = new User();
            coordinator.setName("Class Coordinator");
            coordinator.setEmail("coordinator@test.com");
            coordinator.setPassword("coord123");
            coordinator.setRole(User.Role.COORDINATOR);
            userRepository.save(coordinator);

            // Student 1 (Eligible)
            User student1 = new User();
            student1.setName("Student Eligible");
            student1.setEmail("student1@test.com");
            student1.setPassword("student123");
            student1.setRole(User.Role.STUDENT);
            student1.setAttendancePercentage(80.0);
            userRepository.save(student1);

            // Student 2 (Not Eligible - Low Attendance)
            User student2 = new User();
            student2.setName("Student Low Attendance");
            student2.setEmail("student2@test.com");
            student2.setPassword("student123");
            student2.setRole(User.Role.STUDENT);
            student2.setAttendancePercentage(60.0);
            userRepository.save(student2);
            
            System.out.println("Demo data initialized!");
        }
    }
}
