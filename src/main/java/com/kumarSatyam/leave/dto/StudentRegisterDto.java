package com.kumarSatyam.leave.dto;

import lombok.Data;

@Data
public class StudentRegisterDto {
    private String name;
    private String email;
    private String password;
    private String rollNumber;
    private String studentClass;
}
