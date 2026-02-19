package com.kumarSatyam.leave.repository;

import com.kumarSatyam.leave.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long recipientId);

    @Transactional
    @Modifying
    void deleteByRecipient_Id(Long recipientId);
}
