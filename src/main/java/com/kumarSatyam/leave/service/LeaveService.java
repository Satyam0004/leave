package com.kumarSatyam.leave.service;

import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.LeaveRequestRepository;
import com.kumarSatyam.leave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    public String applyForLeave(LeaveRequest request) {
        User student = userRepository.findById(request.getStudent().getId()).orElseThrow(() -> new RuntimeException("Student not found"));
        
        // 1. Check Eligibility: 75% attendance
        if (student.getAttendancePercentage() < 75.0) {
            return "Not Eligible: Attendance is below 75%.";
        }

        // 2. Check Eligibility: Max 4 leaves per month
        List<LeaveRequest> studentLeaves = leaveRequestRepository.findByStudent(student);
        long leavesThisMonth = studentLeaves.stream()
                .filter(l -> l.getStartDate().getMonth() == LocalDate.now().getMonth() 
                          && l.getStartDate().getYear() == LocalDate.now().getYear()
                          && l.getStatus() == LeaveRequest.Status.APPROVED)
                .count();

        if (leavesThisMonth >= 4) {
            return "Not Eligible: You have already taken 4 leaves this month.";
        }

        // Save
        request.setStudent(student);
        leaveRequestRepository.save(request);
        return "Leave application submitted successfully.";
    }

    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAll();
    }
    
    public List<LeaveRequest> getStudentLeaves(Long studentId) {
        User student = new User();
        student.setId(studentId);
        return leaveRequestRepository.findByStudent(student);
    }

    public LeaveRequest updateLeaveStatus(Long leaveId, LeaveRequest.Status status, Long coordinatorId, String comment) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId).orElseThrow(() -> new RuntimeException("Leave not found"));
        User coordinator = userRepository.findById(coordinatorId).orElseThrow(() -> new RuntimeException("Coordinator not found"));
        
        leave.setStatus(status);
        leave.setCoordinator(coordinator);
        leave.setCoordinatorComment(comment);
        
        return leaveRequestRepository.save(leave);
    }
}
