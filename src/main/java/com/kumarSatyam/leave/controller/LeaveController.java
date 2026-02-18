package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    // STUDENT: Apply for leave
    @PostMapping("/apply")
    public ResponseEntity<?> applyForLeave(@RequestBody LeaveRequest leaveRequest) {
        try {
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
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<LeaveRequest>> getStudentLeaves(@PathVariable Long studentId) {
        return ResponseEntity.ok(leaveService.getStudentLeaves(studentId));
    }

    // COORDINATOR/ADMIN: View all leaves
    @GetMapping("/all")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    // COORDINATOR: Approve/Decline leave
    @PutMapping("/{leaveId}/status")
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long leaveId, @RequestBody Map<String, Object> payload) {
        try {
            String statusStr = (String) payload.get("status");
            LeaveRequest.Status status = LeaveRequest.Status.valueOf(statusStr);
            Long coordinatorId = Long.valueOf(payload.get("coordinatorId").toString());
            String comment = (String) payload.get("comment");

            LeaveRequest updatedLeave = leaveService.updateLeaveStatus(leaveId, status, coordinatorId, comment);
            return ResponseEntity.ok(updatedLeave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
