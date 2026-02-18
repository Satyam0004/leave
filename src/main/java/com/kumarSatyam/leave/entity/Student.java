package com.kumarSatyam.leave.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "students")
@PrimaryKeyJoinColumn(name = "user_id")
public class Student extends User {

    @Column(nullable = false, unique = true)
    private String rollNumber;

    @Column(nullable = false)
    private String studentClass;

    private Double attendancePercentage;
}
