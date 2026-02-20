package com.kumarSatyam.leave.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "leave_requests")
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @ManyToOne
    @JoinColumn(name = "coordinator_id")
    private Coordinator coordinator; // The coordinator who approved/declined

    private String coordinatorComment;

    // Emergency leave fields
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean emergency = false;

    private Boolean adminApproved;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        PENDING,
        APPROVED,
        DECLINED,
        PENDING_ADMIN  // Coordinator approved emergency leave; waiting for Admin final approval
    }
}
