package com.kumarSatyam.leave.service;

import com.kumarSatyam.leave.dto.AuthResponse;
import com.kumarSatyam.leave.dto.CoordinatorRegisterDto;
import com.kumarSatyam.leave.dto.LoginDto;
import com.kumarSatyam.leave.dto.StudentRegisterDto;
import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.entity.Role;
import com.kumarSatyam.leave.entity.Student;
import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.CoordinatorRepository;
import com.kumarSatyam.leave.repository.StudentRepository;
import com.kumarSatyam.leave.repository.UserRepository;
import com.kumarSatyam.leave.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private CoordinatorRepository coordinatorRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private com.kumarSatyam.leave.security.CustomUserDetailsService userDetailsService;

    public AuthResponse registerStudent(StudentRegisterDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole(Role.STUDENT);
        student.setRollNumber(request.getRollNumber());
        student.setStudentClass(request.getStudentClass());
        student.setApproved(false); // Needs coordinator approval

        studentRepository.save(student);

        return AuthResponse.builder()
                .message("Registration successful. Waiting for Coordinator approval.")
                .build();
    }

    public AuthResponse registerCoordinator(CoordinatorRegisterDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        Coordinator coordinator = new Coordinator();
        coordinator.setName(request.getName());
        coordinator.setEmail(request.getEmail());
        coordinator.setPassword(passwordEncoder.encode(request.getPassword()));
        coordinator.setRole(Role.COORDINATOR);
        coordinator.setAssignedClass(request.getAssignedClass());
        coordinator.setApproved(false); // Needs admin approval

        coordinatorRepository.save(coordinator);

        return AuthResponse.builder()
                .message("Registration successful. Waiting for Admin approval.")
                .build();
    }

    public AuthResponse login(LoginDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        // Approval check: Admins are always approved. Students/Coordinators need explicit approval.
        if (!user.isApproved() && user.getRole() != Role.ADMIN) {
            String pending = user.getRole() == Role.COORDINATOR
                    ? "Your coordinator account is pending Admin approval."
                    : "Your student account is pending Coordinator approval.";
            throw new RuntimeException(pending);
        }

        String jwtToken = jwtUtils.generateToken(userDetailsService.loadUserByUsername(request.getEmail()));

        return AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }
}
