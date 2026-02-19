package com.kumarSatyam.leave.repository;

import com.kumarSatyam.leave.entity.Coordinator;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoordinatorRepository extends JpaRepository<Coordinator, Long> {
    List<Coordinator> findByAssignedClass(String assignedClass);
    List<Coordinator> findByIsApprovedFalse();
    List<Coordinator> findByIsApprovedTrue();
}
