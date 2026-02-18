package com.kumarSatyam.leave.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "coordinators")
@PrimaryKeyJoinColumn(name = "user_id")
public class Coordinator extends User {

    @Column(nullable = false)
    private String assignedClass;
}
