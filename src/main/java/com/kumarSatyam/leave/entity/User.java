package com.kumarSatyam.leave.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // In a real app, this should be hashed

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    // For students specifically
    private Double attendancePercentage;

    public enum Role {
        STUDENT,
        COORDINATOR,
        ADMIN
    }
}
