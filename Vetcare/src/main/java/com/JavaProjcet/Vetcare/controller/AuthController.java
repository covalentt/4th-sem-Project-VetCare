    package com.JavaProjcet.Vetcare.controller;

    import com.JavaProjcet.Vetcare.Config.JwtTokenProvider;
    import com.JavaProjcet.Vetcare.entity.User;
    import com.JavaProjcet.Vetcare.service.UserService;
    import com.JavaProjcet.Vetcare.repository.UserRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.HashMap;
    import java.util.Map;
    import java.util.Optional;

    @RestController
    @RequestMapping("/api/auth")
    @CrossOrigin(origins = "*")
    public class AuthController {

        @Autowired
        private UserService userService;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
            String email = credentials.get("email");
            String password = credentials.get("password");

            Map<String, Object> response = new HashMap<>();

            Optional<User> userOpt = userService.login(email, password);

            if (userOpt.isEmpty()) {
                if (userRepository.findByEmail(email).isEmpty()) {
                    response.put("success", false);
                    response.put("message", "Email not registered");
                } else {
                    response.put("success", false);
                    response.put("message", "Incorrect password");
                }
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            User user = userOpt.get();
            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", user.getId());
            safeUser.put("name", user.getName());
            safeUser.put("email", user.getEmail());
            safeUser.put("phone", user.getPhone());
            safeUser.put("avatarUrl", user.getAvatarUrl());
            safeUser.put("address", user.getAddress());
            safeUser.put("role", user.getRole());
            safeUser.put("createdAt", user.getCreatedAt());

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", safeUser);
            response.put("token", jwtTokenProvider.generateToken(user)); // Use JWT

            return ResponseEntity.ok(response);
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody User user) {
            Map<String, Object> response = new HashMap<>();

            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                response.put("success", false);
                response.put("message", "Email already in use");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (userRepository.findByPhone(user.getPhone()).isPresent()) {
                response.put("success", false);
                response.put("message", "Phone already in use");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            User savedUser = userService.registerUser(user);
            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", savedUser.getId());
            safeUser.put("name", savedUser.getName());
            safeUser.put("email", savedUser.getEmail());
            safeUser.put("phone", savedUser.getPhone());
            safeUser.put("avatarUrl", savedUser.getAvatarUrl());
            safeUser.put("address", savedUser.getAddress());
            safeUser.put("role", savedUser.getRole());
            safeUser.put("createdAt", savedUser.getCreatedAt());

            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", safeUser);
            response.put("token", jwtTokenProvider.generateToken(savedUser)); // Use JWT

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        @PostMapping("/change-password")
        public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
            try {
                String currentPassword = request.get("currentPassword");
                String newPassword = request.get("newPassword");

                userService.changePassword(currentPassword, newPassword);

                // Generate new JWT so frontend gets fresh token
                User user = userService.getCurrentUser();
                String newToken = jwtTokenProvider.generateToken(user);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Password changed successfully",
                        "token", newToken
                ));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        Map.of("success", false, "message", e.getMessage())
                );
            }
        }
    }
