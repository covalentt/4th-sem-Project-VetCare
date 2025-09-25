package com.JavaProjcet.Vetcare.controller;


import com.JavaProjcet.Vetcare.entity.Cart;
import com.JavaProjcet.Vetcare.entity.User;
import com.JavaProjcet.Vetcare.entity.Product;
import com.JavaProjcet.Vetcare.repository.CartRepository;
import com.JavaProjcet.Vetcare.repository.UserRepository;
import com.JavaProjcet.Vetcare.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // Get user's cart items
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            List<Cart> cartItems = cartRepository.findByUserOrderByCreatedAtDesc(currentUser);
            Long totalItems = cartRepository.countCartItemsByUser(currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cart", cartItems);
            response.put("totalItems", totalItems);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse("Failed to fetch cart"));
        }
    }

    // Add item to cart
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = request.get("quantity") != null ?
                    Integer.valueOf(request.get("quantity").toString()) : 1;

            Optional<Product> productOpt = productRepository.findById(productId);
            if (!productOpt.isPresent()) {
                return ResponseEntity.status(404).body(createErrorResponse("Product not found"));
            }

            Product product = productOpt.get();
            Optional<Cart> existingCartItem = cartRepository.findByUserAndProduct(currentUser, product);

            if (existingCartItem.isPresent()) {
                // Update quantity
                Cart cart = existingCartItem.get();
                cart.setQuantity(cart.getQuantity() + quantity);
                cartRepository.save(cart);
            } else {
                // Create new cart item
                Cart cart = new Cart(currentUser, product, quantity);
                cartRepository.save(cart);
            }

            return ResponseEntity.ok(createSuccessResponse("Item added to cart"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse("Failed to add to cart"));
        }
    }

    // Update cart item quantity
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateCart(@RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());

            if (quantity <= 0) {
                return ResponseEntity.status(400).body(createErrorResponse("Quantity must be greater than 0"));
            }

            Optional<Product> productOpt = productRepository.findById(productId);
            if (!productOpt.isPresent()) {
                return ResponseEntity.status(404).body(createErrorResponse("Product not found"));
            }

            Optional<Cart> cartOpt = cartRepository.findByUserAndProduct(currentUser, productOpt.get());
            if (!cartOpt.isPresent()) {
                return ResponseEntity.status(404).body(createErrorResponse("Cart item not found"));
            }

            Cart cart = cartOpt.get();
            cart.setQuantity(quantity);
            cartRepository.save(cart);

            return ResponseEntity.ok(createSuccessResponse("Cart updated"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse("Failed to update cart"));
        }
    }

    // Remove item from cart
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long productId) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            Optional<Product> productOpt = productRepository.findById(productId);
            if (!productOpt.isPresent()) {
                return ResponseEntity.status(404).body(createErrorResponse("Product not found"));
            }

            Optional<Cart> cartOpt = cartRepository.findByUserAndProduct(currentUser, productOpt.get());
            if (cartOpt.isPresent()) {
                cartRepository.delete(cartOpt.get());
            }

            return ResponseEntity.ok(createSuccessResponse("Item removed from cart"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse("Failed to remove from cart"));
        }
    }

    // Clear entire cart
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearCart() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            cartRepository.deleteByUser(currentUser);

            return ResponseEntity.ok(createSuccessResponse("Cart cleared"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(createErrorResponse("Failed to clear cart"));
        }
    }

    // Helper methods
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName(); // Spring Security sets this as principal
            Optional<User> userOpt = userRepository.findByEmail(email);
            return userOpt.orElse(null);
        }
        return null;
    }


    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}

