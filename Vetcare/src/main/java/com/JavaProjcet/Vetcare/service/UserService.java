package com.JavaProjcet.Vetcare.service;

import com.JavaProjcet.Vetcare.entity.User;
import com.JavaProjcet.Vetcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Register user
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByPhone(user.getPhone())) {
            throw new RuntimeException("Phone already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Login
    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }

    // Get current authenticated user
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    // Update user profile
    public User updateProfile(User updatedUser) {
        User currentUser = getCurrentUser();

        if (updatedUser.getName() != null) {
            currentUser.setName(updatedUser.getName());
        }
        if (updatedUser.getEmail() != null) {
            if (userRepository.existsByEmail(updatedUser.getEmail()) &&
                    !updatedUser.getEmail().equals(currentUser.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            currentUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPhone() != null) {
            if (userRepository.existsByPhone(updatedUser.getPhone()) &&
                    !updatedUser.getPhone().equals(currentUser.getPhone())) {
                throw new RuntimeException("Phone already in use");
            }
            currentUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getAddress() != null) {
            currentUser.setAddress(updatedUser.getAddress());
        }
        if (updatedUser.getAvatarUrl() != null) {
            currentUser.setAvatarUrl(updatedUser.getAvatarUrl());
        }

        return userRepository.save(currentUser);
    }

    // Change password
    public void changePassword(String currentPassword, String newPassword) {
        User currentUser = getCurrentUser();

        if (!passwordEncoder.matches(currentPassword, currentUser.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        currentUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(currentUser);
    }
}
