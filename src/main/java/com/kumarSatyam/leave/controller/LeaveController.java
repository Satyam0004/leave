package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.UserRepository;
import com.kumarSatyam.leave.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // STUDENT: Apply for leave
    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForLeave(@RequestBody LeaveRequest leaveRequest) {
        try {
            User currentUser = getCurrentUser();
            if (!(currentUser instanceof Student)) {
                return ResponseEntity.status(403).body("Only students can apply for leave");
            }
            
            // Set the student to the current logged in user
            leaveRequest.setStudent((Student) currentUser);
            
            String result = leaveService.applyForLeave(leaveRequest);
            if (result.startsWith("Not Eligible")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // STUDENT: View their leaves
    @GetMapping("/my-leaves")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<LeaveRequest>> getMyLeaves() {
        User currentUser = getCurrentUser();
         if (!(currentUser instanceof Student)) {
            throw new RuntimeException("Current user is not a student");
        }
        return ResponseEntity.ok(leaveService.getStudentLeaves(currentUser.getId()));
    }

    // COORDINATOR/ADMIN: View all leaves
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    // COORDINATOR: Approve/Decline leave
    @PutMapping("/{leaveId}/status")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long leaveId, @RequestBody Map<String, Object> payload) {
        try {
            User currentUser = getCurrentUser();
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
