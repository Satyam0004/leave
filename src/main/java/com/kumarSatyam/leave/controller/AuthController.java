package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.dto.AuthResponse;
import com.kumarSatyam.leave.dto.CoordinatorRegisterDto;
import com.kumarSatyam.leave.dto.LoginDto;
import com.kumarSatyam.leave.dto.StudentRegisterDto;
import com.kumarSatyam.leave.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register/student")
    public ResponseEntity<AuthResponse> registerStudent(@RequestBody StudentRegisterDto request) {
        return ResponseEntity.ok(authService.registerStudent(request));
    }

    @PostMapping("/register/coordinator")
    public ResponseEntity<AuthResponse> registerCoordinator(@RequestBody CoordinatorRegisterDto request) {
        return ResponseEntity.ok(authService.registerCoordinator(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginDto request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
