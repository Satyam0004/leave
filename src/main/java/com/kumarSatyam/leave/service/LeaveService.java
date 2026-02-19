package com.kumarSatyam.leave.service;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.repository.CoordinatorRepository;
import com.kumarSatyam.leave.repository.LeaveRequestRepository;
import com.kumarSatyam.leave.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kumarSatyam.leave.entity.Notification;
import com.kumarSatyam.leave.repository.NotificationRepository;
import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CoordinatorRepository coordinatorRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public String applyForLeave(LeaveRequest request) {
        if (request.getStartDate() == null || request.getEndDate() == null || request.getReason() == null || request.getReason().trim().isEmpty()) {
            return "Application Rejected: All fields (Start Date, End Date, Reason) are required.";
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            return "Application Rejected: End Date cannot be before Start Date.";
        }
        
        Long studentId = request.getStudent().getId();
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // 1. Check Eligibility: 75% attendance
        if (student.getAttendancePercentage() != null && student.getAttendancePercentage() < 75.0) {
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
        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        // Notify Coordinator
        List<Coordinator> coordinators = coordinatorRepository.findByAssignedClass(student.getStudentClass());
        for (Coordinator coordinator : coordinators) {
            Notification notification = new Notification();
            notification.setRecipient(coordinator);
            notification.setMessage("New leave request from " + student.getName() + " (" + student.getRollNumber() + ") for " + request.getStartDate() + " to " + request.getEndDate());
            notificationRepository.save(notification);
        }

        return "Leave application submitted successfully.";
    }

    public List<LeaveRequest> getAllLeaves(String section, LocalDate date) {
        if (section != null && date != null) {
            return leaveRequestRepository.findBySectionAndDate(section, date);
        } else if (section != null) {
            return leaveRequestRepository.findByStudent_StudentClassContainingIgnoreCase(section);
        } else if (date != null) {
            return leaveRequestRepository.findByDate(date);
        }
        return leaveRequestRepository.findAll();
    }
    
    public List<LeaveRequest> getStudentLeaves(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return leaveRequestRepository.findByStudent(student);
    }

    public LeaveRequest updateLeaveStatus(Long leaveId, LeaveRequest.Status status, Long coordinatorId, String comment) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId).orElseThrow(() -> new RuntimeException("Leave not found"));
        Coordinator coordinator = coordinatorRepository.findById(coordinatorId).orElseThrow(() -> new RuntimeException("Coordinator not found"));
        
        leave.setStatus(status);
        leave.setCoordinator(coordinator);
        leave.setCoordinatorComment(comment);
        
        LeaveRequest updatedLeave = leaveRequestRepository.save(leave);

        // Send Notification
        Notification notification = new Notification();
        notification.setRecipient(leave.getStudent());
        notification.setMessage("Your leave request from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been " + status + " by " + coordinator.getName() + ".");
        if (comment != null && !comment.isEmpty()) {
            notification.setMessage(notification.getMessage() + " Comment: " + comment);
        }
        notificationRepository.save(notification);

        return updatedLeave;
    }
}
