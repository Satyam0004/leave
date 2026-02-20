package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.repository.LeaveRequestRepository;
import com.kumarSatyam.leave.service.AdminService;
import com.kumarSatyam.leave.service.CoordinatorService;
import com.kumarSatyam.leave.service.LeaveService;
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

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

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

    // Feature 4: List all emergency leaves pending admin approval
    @GetMapping("/emergency-pending")
    public ResponseEntity<List<LeaveRequest>> getEmergencyPendingLeaves() {
        return ResponseEntity.ok(leaveRequestRepository.findByStatusAndEmergencyTrue(LeaveRequest.Status.PENDING_ADMIN));
    }

    // Feature 4: Admin final approval for emergency leave
    @PutMapping("/leaves/{id}/emergency-approve")
    public ResponseEntity<?> emergencyApprove(@PathVariable Long id) {
        try {
            LeaveRequest approved = leaveService.adminApproveEmergency(id);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

