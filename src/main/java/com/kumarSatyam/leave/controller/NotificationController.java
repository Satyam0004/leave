package com.kumarSatyam.leave.controller;

import com.kumarSatyam.leave.entity.Notification;
import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.NotificationRepository;
import com.kumarSatyam.leave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(currentUser.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        User currentUser = getCurrentUser();
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<?> clearAll() {
        User currentUser = getCurrentUser();
        notificationRepository.deleteByRecipient_Id(currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
