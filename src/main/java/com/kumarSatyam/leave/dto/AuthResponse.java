package com.kumarSatyam.leave.dto;

import com.kumarSatyam.leave.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private Role role;
    private String message;
}
