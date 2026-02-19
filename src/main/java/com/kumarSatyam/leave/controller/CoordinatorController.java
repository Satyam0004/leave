package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.UserRepository;
import com.kumarSatyam.leave.service.CoordinatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coordinator")
@PreAuthorize("hasRole('COORDINATOR')")
public class CoordinatorController {

    @Autowired
    private CoordinatorService coordinatorService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/pending-students")
    public ResponseEntity<List<Student>> getPendingStudents() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if (!(user instanceof Coordinator)) {
            throw new RuntimeException("Current user is not a coordinator");
        }
        
        Coordinator coordinator = (Coordinator) user;
        return ResponseEntity.ok(coordinatorService.getPendingStudentsForClass(coordinator.getAssignedClass()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if (!(user instanceof Coordinator)) {
            throw new RuntimeException("Current user is not a coordinator");
        }
        
        Coordinator coordinator = (Coordinator) user;
        return ResponseEntity.ok(coordinatorService.getStudentsByClass(coordinator.getAssignedClass()));
    }

    @PostMapping("/approve-student/{id}")
    public ResponseEntity<String> approveStudent(@PathVariable Long id) {
        // In a real app, verify that the student belongs to the coordinator's class
        coordinatorService.approveStudent(id);
        return ResponseEntity.ok("Student approved successfully");
    }
}
