package com.kumarSatyam.leave.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "user_id")
public class Admin extends User {
    // Admin specific fields if any
}
