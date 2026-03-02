package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.UserRepository;
import com.kumarSatyam.leave.service.CoordinatorService;
import com.kumarSatyam.leave.service.LeaveService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coordinator")
@PreAuthorize("hasRole('COORDINATOR')")
@AllArgsConstructor
public class CoordinatorController {

    private final CoordinatorService coordinatorService;

    private final LeaveService leaveService;

    private final UserRepository userRepository;

    private Coordinator getCurrentCoordinator() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (!(user instanceof Coordinator)) throw new RuntimeException("Current user is not a coordinator");
        return (Coordinator) user;
    }

    @GetMapping("/pending-students")
    public ResponseEntity<?> getPendingStudents() {
        Coordinator coordinator = getCurrentCoordinator();
        return ResponseEntity.ok(coordinatorService.getPendingStudentsForClass(coordinator.getAssignedClass()));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        Coordinator coordinator = getCurrentCoordinator();
        return ResponseEntity.ok(coordinatorService.getStudentsByClass(coordinator.getAssignedClass()));
    }

    @GetMapping("/leave-summary")
    public ResponseEntity<?> getStudentLeaveSummary() {
        Coordinator coordinator = getCurrentCoordinator();
        return ResponseEntity.ok(leaveService.getStudentLeaveSummary(coordinator.getAssignedClass()));
    }

    @PostMapping("/approve-student/{id}")
    public ResponseEntity<?> approveStudent(@PathVariable Long id) {
        // In a real app, verify that the student belongs to the coordinator's class
        coordinatorService.approveStudent(id);
        return ResponseEntity.ok("Student approved successfully");
    }
}

