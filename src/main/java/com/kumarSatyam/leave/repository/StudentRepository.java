package com.kumarSatyam.leave.repository;

import com.kumarSatyam.leave.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    List<Student> findByStudentClass(String studentClass);
    List<Student> findByStudentClassAndIsApprovedFalse(String studentClass);
}
