package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.service.AdminService;
import com.kumarSatyam.leave.service.CoordinatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/pending-coordinators")
    public ResponseEntity<List<Coordinator>> getPendingCoordinators() {
        return ResponseEntity.ok(adminService.getPendingCoordinators());
    }

    @GetMapping("/coordinators")
    public ResponseEntity<List<Coordinator>> getAllCoordinators() {
        return ResponseEntity.ok(adminService.getAllCoordinators());
    }

    @Autowired
    private CoordinatorService coordinatorService;

    @GetMapping("/coordinator/{id}/students")
    public ResponseEntity<List<Student>> getCoordinatorStudents(@PathVariable Long id) {
        Coordinator coordinator = (Coordinator) adminService.getCoordinatorById(id);
        return ResponseEntity.ok(coordinatorService.getStudentsByClass(coordinator.getAssignedClass()));
    }

    @PostMapping("/approve-coordinator/{id}")
    public ResponseEntity<String> approveCoordinator(@PathVariable Long id) {
        adminService.approveCoordinator(id);
        return ResponseEntity.ok("Coordinator approved successfully");
    }
}
