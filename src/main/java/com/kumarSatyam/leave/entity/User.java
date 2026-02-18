package com.kumarSatyam.leave.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password; // In a real app, this should be hashed

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean isApproved = false;
}
