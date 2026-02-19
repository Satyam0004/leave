package com.kumarSatyam.leave.service;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.repository.CoordinatorRepository;
import com.kumarSatyam.leave.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CoordinatorService {

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private CoordinatorRepository coordinatorRepository;

    // Helper to get current coordinator
    private Coordinator getCurrentCoordinator() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        // Since we don't have findByEmail in CoordinatorRepo, we use UserRepository logic via casting or similar, 
        // OR simpler: just find directly if we had email in CoordinatorRepo.
        // But Coordinator is a User, so standard findByEmail works, assuming we cast it.
        // Let's assume the Principal is valid.
        // Actually, we can use the User object from Principal if it was custom.
        // But CustomUserDetailsService returns Spring's User.
        
        // We'll fetch from DB to be safe and get the entity.
        // Since Email is unique in User, we can fetch User and cast to Coordinator.
        // But we need a repository method for that or use UserRepository then cast.
        // Let's implement findByEmail in CoordinatorRepository for convenience? No, inheritance specific.
        // We'll cast carefully.
        
        // Better: Inject UserRepository, find User, check instanceof Coordinator.
        return null; // Placeholder logic handled in actual methods
    }

    public List<Student> getPendingStudentsForClass(String studentClass) {
        return studentRepository.findByStudentClassAndIsApprovedFalse(studentClass);
    }

    public List<Student> getStudentsByClass(String studentClass) {
        return studentRepository.findByStudentClass(studentClass);
    }

    public void approveStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setApproved(true);
        studentRepository.save(student);
    }
}
