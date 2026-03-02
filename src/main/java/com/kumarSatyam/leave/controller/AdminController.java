package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.repository.LeaveRequestRepository;
import com.kumarSatyam.leave.service.AdminService;
import com.kumarSatyam.leave.service.CoordinatorService;
import com.kumarSatyam.leave.service.LeaveService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class AdminController {

    private final AdminService adminService;

    private final LeaveService leaveService;

    private final LeaveRequestRepository leaveRequestRepository;

    private final  CoordinatorService coordinatorService;

    @GetMapping("/pending-coordinators")
    public ResponseEntity<?> getPendingCoordinators() {
        return ResponseEntity.ok(adminService.getPendingCoordinators());
    }

    @GetMapping("/coordinators")
    public ResponseEntity<?> getAllCoordinators() {
        return ResponseEntity.ok(adminService.getAllCoordinators());
    }


    @GetMapping("/coordinator/{id}/students")
    public ResponseEntity<?> getCoordinatorStudents(@PathVariable Long id) {
        Coordinator coordinator = (Coordinator) adminService.getCoordinatorById(id);
        return ResponseEntity.ok(coordinatorService.getStudentsByClass(coordinator.getAssignedClass()));
    }

    @PostMapping("/approve-coordinator/{id}")
    public ResponseEntity<?> approveCoordinator(@PathVariable Long id) {
        adminService.approveCoordinator(id);
        return ResponseEntity.ok("Coordinator approved successfully");
    }

    @GetMapping("/emergency-pending")
    public ResponseEntity<List<LeaveRequest>> getEmergencyPendingLeaves() {
        return ResponseEntity.ok(leaveRequestRepository.findByStatusAndEmergencyTrue(LeaveRequest.Status.PENDING_ADMIN));
    }

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

