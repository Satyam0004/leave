package com.kumarSatyam.leave.dto;

import lombok.Data;

@Data
public class CoordinatorRegisterDto {
    private String name;
    private String email;
    private String password;
    private String assignedClass;
}
