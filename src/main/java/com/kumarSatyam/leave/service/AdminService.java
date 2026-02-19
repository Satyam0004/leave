package com.kumarSatyam.leave.service;

import com.kumarSatyam.leave.entity.Coordinator;
import com.kumarSatyam.leave.repository.CoordinatorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private CoordinatorRepository coordinatorRepository;

    public List<Coordinator> getPendingCoordinators() {
        return coordinatorRepository.findByIsApprovedFalse();
    }

    public List<Coordinator> getAllCoordinators() {
        return coordinatorRepository.findByIsApprovedTrue();
    }

    public void approveCoordinator(Long coordinatorId) {
        Coordinator coordinator = coordinatorRepository.findById(coordinatorId)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));
        coordinator.setApproved(true);
        coordinatorRepository.save(coordinator);
    }

    public Coordinator getCoordinatorById(Long id) {
        return coordinatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));
    }
}
