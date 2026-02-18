package com.kumarSatyam.leave.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String userEmail;
        final String jwtToken;

        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwtToken = authHeader.substring(7);
                userEmail = jwtUtils.extractUsername(jwtToken);

                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                    if (jwtUtils.validateToken(jwtToken, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail request. 
            // If it's a secured endpoint, the authentication entry point will handle the 403/401 later.
            System.out.println("Cannot set user authentication: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
