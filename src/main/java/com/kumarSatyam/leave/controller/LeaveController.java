package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.UserRepository;
import com.kumarSatyam.leave.service.LeaveService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@AllArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForLeave(@RequestBody LeaveRequest leaveRequest) {
        try {
            var currentUser = getCurrentUser();
            if (!(currentUser instanceof Student)) {
                return ResponseEntity.status(403).body("Only students can apply for leave");
            }

            leaveRequest.setStudent((Student) currentUser);
            
            String result = leaveService.applyForLeave(leaveRequest);
            if (result.startsWith("Not Eligible") || result.startsWith("Application Rejected")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-leaves")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyLeaves() {
        User currentUser = getCurrentUser();
         if (!(currentUser instanceof Student)) {
            throw new RuntimeException("Current user is not a student");
        }
        return ResponseEntity.ok(leaveService.getStudentLeaves(currentUser.getId()));
    }

    @GetMapping("/my-stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyStats() {
        User currentUser = getCurrentUser();
        if (!(currentUser instanceof Student)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(leaveService.getLeaveStats(currentUser.getId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<?> getAllLeaves(
            @RequestParam(required = false) String section,
            @RequestParam(required = false) LocalDate date) {
        
        var currentUser = getCurrentUser();

        if (currentUser instanceof Coordinator coordinator) {
            return ResponseEntity.ok(leaveService.getAllLeaves(coordinator.getAssignedClass(), date));
        }

        return ResponseEntity.ok(leaveService.getAllLeaves(section, date));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<?> getPendingLeaves(
            @RequestParam(required = false) LocalDate date) {
        var currentUser = getCurrentUser();
        if (!(currentUser instanceof Coordinator coordinator)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(leaveService.getPendingLeavesByClassAndDate(coordinator.getAssignedClass(), date));
    }

    @PutMapping("/{leaveId}/status")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long leaveId, @RequestBody Map<String, Object> payload) {
        try {
            var currentUser = getCurrentUser();
            if (!(currentUser instanceof Coordinator)) {
                 return ResponseEntity.status(403).body("Only coordinators can update status");
            }
            
            String statusStr = (String) payload.get("status");
            LeaveRequest.Status status = LeaveRequest.Status.valueOf(statusStr);
            String comment = (String) payload.get("comment");

            LeaveRequest updatedLeave = leaveService.updateLeaveStatus(leaveId, status, currentUser.getId(), comment);
            return ResponseEntity.ok(updatedLeave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

