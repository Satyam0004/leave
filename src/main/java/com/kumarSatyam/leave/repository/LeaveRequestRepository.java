package com.kumarSatyam.leave.repository;

import com.kumarSatyam.leave.entity.LeaveRequest;
import com.kumarSatyam.leave.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudent(Student student);

    // Filter by section (Student class)
    List<LeaveRequest> findByStudent_StudentClassContainingIgnoreCase(String studentClass);

    // Filter by specific date (where fetch date is between start and end date)
    @Query("SELECT l FROM LeaveRequest l WHERE :date >= l.startDate AND :date <= l.endDate")
    List<LeaveRequest> findByDate(@Param("date") LocalDate date);
    
    // Filter by section and date
    @Query("SELECT l FROM LeaveRequest l WHERE LOWER(l.student.studentClass) LIKE LOWER(CONCAT('%', :studentClass, '%')) AND :date >= l.startDate AND :date <= l.endDate")
    List<LeaveRequest> findBySectionAndDate(@Param("studentClass") String studentClass, @Param("date") LocalDate date);

    List<LeaveRequest> findByStatus(LeaveRequest.Status status);

    // Feature 2: All pending leaves for a class (no date filter)
    @Query("SELECT l FROM LeaveRequest l WHERE LOWER(l.student.studentClass) LIKE LOWER(CONCAT('%', :cls, '%')) AND l.status = 'PENDING'")
    List<LeaveRequest> findPendingByClass(@Param("cls") String cls);

    // Feature 2: Pending leaves for a class submitted on a specific date (filter by createdAt date)
    @Query("SELECT l FROM LeaveRequest l WHERE LOWER(l.student.studentClass) LIKE LOWER(CONCAT('%', :cls, '%')) AND l.status = 'PENDING' AND l.createdAt >= :dayStart AND l.createdAt < :dayEnd")
    List<LeaveRequest> findPendingByClassAndSubmissionDate(@Param("cls") String cls, @Param("dayStart") java.time.LocalDateTime dayStart, @Param("dayEnd") java.time.LocalDateTime dayEnd);

    // Feature 4: Get all PENDING_ADMIN leaves for admin emergency approval tab
    List<LeaveRequest> findByStatusAndEmergencyTrue(LeaveRequest.Status status);
}

