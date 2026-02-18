package com.kumarSatyam.leave.service;

import com.kumarSatyam.leave.entity.User;
import com.kumarSatyam.leave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user.get();
        }
        return null;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    // For demo purposes, verification of user existence
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
