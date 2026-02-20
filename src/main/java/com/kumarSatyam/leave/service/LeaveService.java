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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        
        // 1. Check Eligibility: 75% attendance (skipped for emergency requests)
        if (!request.isEmergency() && student.getAttendancePercentage() != null && student.getAttendancePercentage() < 75.0) {
            return "Not Eligible: Attendance is below 75%. You may apply for Emergency Leave instead.";
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

        // If coordinator approves an emergency leave, escalate to admin instead of final approve
        LeaveRequest.Status finalStatus = status;
        if (status == LeaveRequest.Status.APPROVED && leave.isEmergency()) {
            finalStatus = LeaveRequest.Status.PENDING_ADMIN;
        }

        leave.setStatus(finalStatus);
        leave.setCoordinator(coordinator);
        leave.setCoordinatorComment(comment);
        
        LeaveRequest updatedLeave = leaveRequestRepository.save(leave);

        // Send Notification
        Notification notification = new Notification();
        notification.setRecipient(leave.getStudent());
        String statusMsg = finalStatus == LeaveRequest.Status.PENDING_ADMIN
            ? "approved by coordinator and is now awaiting Admin final approval"
            : finalStatus.toString().toLowerCase() + " by " + coordinator.getName();
        notification.setMessage("Your emergency leave request from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been " + statusMsg + ".");
        if (comment != null && !comment.isEmpty()) {
            notification.setMessage(notification.getMessage() + " Comment: " + comment);
        }
        notificationRepository.save(notification);

        return updatedLeave;
    }

    // Feature 1: Student leave stats
    public Map<String, Object> getLeaveStats(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        List<LeaveRequest> allLeaves = leaveRequestRepository.findByStudent(student);

        long leavesUsedThisMonth = allLeaves.stream()
                .filter(l -> l.getStartDate().getMonth() == LocalDate.now().getMonth()
                        && l.getStartDate().getYear() == LocalDate.now().getYear()
                        && l.getStatus() == LeaveRequest.Status.APPROVED)
                .count();
        long totalApproved = allLeaves.stream()
                .filter(l -> l.getStatus() == LeaveRequest.Status.APPROVED).count();
        long totalPending = allLeaves.stream()
                .filter(l -> l.getStatus() == LeaveRequest.Status.PENDING || l.getStatus() == LeaveRequest.Status.PENDING_ADMIN).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("leavesUsedThisMonth", leavesUsedThisMonth);
        stats.put("leavesRemainingThisMonth", Math.max(0, 4 - leavesUsedThisMonth));
        stats.put("totalApproved", totalApproved);
        stats.put("totalPending", totalPending);
        stats.put("attendancePercentage", student.getAttendancePercentage());
        return stats;
    }

    // Feature 2: Coordinator - get pending leaves for class
    // When date is null -> return ALL pending leaves (so future-dated applications are always shown)
    // When date is set  -> filter by submission date (createdAt), NOT by the leave period
    public List<LeaveRequest> getPendingLeavesByClassAndDate(String assignedClass, LocalDate date) {
        if (date == null) {
            return leaveRequestRepository.findPendingByClass(assignedClass);
        }
        java.time.LocalDateTime dayStart = date.atStartOfDay();
        java.time.LocalDateTime dayEnd   = date.plusDays(1).atStartOfDay();
        return leaveRequestRepository.findPendingByClassAndSubmissionDate(assignedClass, dayStart, dayEnd);
    }

    // Feature 3: Per-student leave summary for coordinator
    public List<Map<String, Object>> getStudentLeaveSummary(String assignedClass) {
        List<LeaveRequest> allLeaves = leaveRequestRepository.findByStudent_StudentClassContainingIgnoreCase(assignedClass);
        Map<Long, Map<String, Object>> summaryMap = new HashMap<>();
        for (LeaveRequest leave : allLeaves) {
            Student s = leave.getStudent();
            summaryMap.computeIfAbsent(s.getId(), id -> {
                Map<String, Object> m = new HashMap<>();
                m.put("studentId", s.getId());
                m.put("studentName", s.getName());
                m.put("rollNumber", s.getRollNumber());
                m.put("approved", 0L);
                m.put("pending", 0L);
                m.put("declined", 0L);
                return m;
            });
            Map<String, Object> m = summaryMap.get(s.getId());
            if (leave.getStatus() == LeaveRequest.Status.APPROVED) {
                m.put("approved", (Long) m.get("approved") + 1);
            } else if (leave.getStatus() == LeaveRequest.Status.PENDING || leave.getStatus() == LeaveRequest.Status.PENDING_ADMIN) {
                m.put("pending", (Long) m.get("pending") + 1);
            } else if (leave.getStatus() == LeaveRequest.Status.DECLINED) {
                m.put("declined", (Long) m.get("declined") + 1);
            }
        }
        return new java.util.ArrayList<>(summaryMap.values());
    }

    // Feature 4: Admin final approval for emergency leave
    public LeaveRequest adminApproveEmergency(Long leaveId) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));
        if (!leave.isEmergency()) {
            throw new RuntimeException("This is not an emergency leave request");
        }
        leave.setStatus(LeaveRequest.Status.APPROVED);
        leave.setAdminApproved(true);
        LeaveRequest saved = leaveRequestRepository.save(leave);

        Notification notification = new Notification();
        notification.setRecipient(leave.getStudent());
        notification.setMessage("Your emergency leave request from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been APPROVED by Admin.");
        notificationRepository.save(notification);
        return saved;
    }
}
