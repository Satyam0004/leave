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

    List<LeaveRequest> findByStudent_StudentClassContainingIgnoreCase(String studentClass);

    @Query("SELECT l FROM LeaveRequest l WHERE :date >= l.startDate AND :date <= l.endDate")
    List<LeaveRequest> findByDate(@Param("date") LocalDate date);

    @Query("SELECT l FROM LeaveRequest l WHERE LOWER(l.student.studentClass) LIKE LOWER(CONCAT('%', :studentClass, '%')) AND :date >= l.startDate AND :date <= l.endDate")
    List<LeaveRequest> findBySectionAndDate(@Param("studentClass") String studentClass, @Param("date") LocalDate date);

    List<LeaveRequest> findByStatus(LeaveRequest.Status status);

    @Query("SELECT l FROM LeaveRequest l WHERE LOWER(l.student.studentClass) LIKE LOWER(CONCAT('%', :cls, '%')) AND l.status = 'PENDING'")
    List<LeaveRequest> findPendingByClass(@Param("cls") String cls);

    @Query("SELECT l FROM LeaveRequest l WHERE LOWER(l.student.studentClass) LIKE LOWER(CONCAT('%', :cls, '%')) AND l.status = 'PENDING' AND l.createdAt >= :dayStart AND l.createdAt < :dayEnd")
    List<LeaveRequest> findPendingByClassAndSubmissionDate(@Param("cls") String cls, @Param("dayStart") java.time.LocalDateTime dayStart, @Param("dayEnd") java.time.LocalDateTime dayEnd);

    List<LeaveRequest> findByStatusAndEmergencyTrue(LeaveRequest.Status status);
}

