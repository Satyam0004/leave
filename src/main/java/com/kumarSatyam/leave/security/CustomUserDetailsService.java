package com.kumarSatyam.leave.security;

import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Wait... user.getRole() returns the Enum Role.
        // We need to convert it to a GrantedAuthority.
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        // Check if user is approved?
        // Let's enforce approval here or in the login service? 
        // Spring Security User object has 'enabled', 'accountNonLocked' etc.
        // We can map 'isApproved' to 'enabled'.

        // NOTE: We always return enabled=true here.
        // Approval enforcement is done in AuthService.login() so we can return a friendly message.
        // If we set enabled=user.isApproved() Spring Security throws DisabledException before login() runs.
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                true,  // always enabled — isApproved checked in AuthService.login()
                true,  // accountNonExpired
                true,  // credentialsNonExpired
                true,  // accountNonLocked
                authorities
        );
    }
}
