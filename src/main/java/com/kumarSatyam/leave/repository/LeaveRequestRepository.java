package com.kumarSatyam.leave.repository;

import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudent(com.kumarSatyam.leave.entity.Student student);
    List<LeaveRequest> findByStatus(LeaveRequest.Status status);
}
