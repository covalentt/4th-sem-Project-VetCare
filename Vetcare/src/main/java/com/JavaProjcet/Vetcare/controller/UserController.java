package com.JavaProjcet.Vetcare.controller;

import com.JavaProjcet.Vetcare.entity.User;
import com.JavaProjcet.Vetcare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // GET current user profile
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User user = userService.getCurrentUser();
            return ResponseEntity.ok(Map.of("user", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    // PATCH update user profile
    @PatchMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser) {
        try {
            User savedUser = userService.updateProfile(updatedUser);
            return ResponseEntity.ok(Map.of("user", savedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}