package com.kumarSatyam.leave.service;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.repository.CoordinatorRepository;
import com.kumarSatyam.leave.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoordinatorService {

    private final StudentRepository studentRepository;

    private final CoordinatorRepository coordinatorRepository;

    private Coordinator getCurrentCoordinator() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return null;
    }

    public List<Student> getPendingStudentsForClass(String studentClass) {
        return studentRepository.findByStudentClassAndIsApprovedFalse(studentClass);
    }

    public List<Student> getStudentsByClass(String studentClass) {
        return studentRepository.findByStudentClass(studentClass);
    }

    public void approveStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setApproved(true);
        studentRepository.save(student);
    }
}
