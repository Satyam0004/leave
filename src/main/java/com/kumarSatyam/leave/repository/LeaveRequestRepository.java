package com.kumarSatyam.leave.repository;

import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudent(Student student);

    // Filter by section (Student class)
    // Filter by section (Student class)
    List<LeaveRequest> findByStudent_StudentClassContainingIgnoreCase(String studentClass);

    // Filter by specific date (where fetch date is between start and end date)
    @Query("SELECT l FROM LeaveRequest l WHERE :date >= l.startDate AND :date <= l.endDate")
    List<LeaveRequest> findByDate(@Param("date") LocalDate date);
    
    // Filter by section and date
    @Query("SELECT l FROM LeaveRequest l WHERE LOWER(l.student.studentClass) LIKE LOWER(CONCAT('%', :studentClass, '%')) AND :date >= l.startDate AND :date <= l.endDate")
    List<LeaveRequest> findBySectionAndDate(@Param("studentClass") String studentClass, @Param("date") LocalDate date);
    List<LeaveRequest> findByStatus(LeaveRequest.Status status);
}
