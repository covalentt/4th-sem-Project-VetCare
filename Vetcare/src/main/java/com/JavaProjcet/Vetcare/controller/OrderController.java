package com.JavaProjcet.Vetcare.controller;

import com.JavaProjcet.Vetcare.entity.*;
import com.JavaProjcet.Vetcare.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // Create order from cart
    @PostMapping("/create")
    @Transactional
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            // Validate required fields
            String customerName = (String) request.get("customerName");
            String customerPhone = (String) request.get("customerPhone");
            String deliveryAddress = (String) request.get("deliveryAddress");
            String paymentMethodStr = (String) request.get("paymentMethod");

            if (customerName == null || customerPhone == null ||
                    deliveryAddress == null || paymentMethodStr == null) {
                return ResponseEntity.status(400).body(createErrorResponse("All fields are required"));
            }

            PaymentMethod paymentMethod;
            try {
                paymentMethod = PaymentMethod.valueOf(paymentMethodStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(400).body(createErrorResponse("Invalid payment method"));
            }

            // Get cart items
            List<Cart> cartItems = cartRepository.findByUserOrderByCreatedAtDesc(currentUser);
            if (cartItems.isEmpty()) {
                return ResponseEntity.status(400).body(createErrorResponse("Cart is empty"));
            }

            // Calculate totals
            BigDecimal subtotal = BigDecimal.ZERO;
            for (Cart cartItem : cartItems) {
                Double priceDouble = cartItem.getProduct().getPrice();  // Get as Double
                BigDecimal price = BigDecimal.valueOf(priceDouble);  // FIXED: Convert to BigDecimal
                BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
                subtotal = subtotal.add(itemTotal);
            }

            BigDecimal deliveryFee = subtotal.compareTo(BigDecimal.valueOf(2000)) > 0 ?
                    BigDecimal.ZERO : BigDecimal.valueOf(100);
            BigDecimal totalAmount = subtotal.add(deliveryFee);

            // Generate unique order number
            String orderNumber = generateOrderNumber();

            // Create order
            Order order = new Order();
            order.setUser(currentUser);
            order.setOrderNumber(orderNumber);
            order.setCustomerName(customerName);
            order.setCustomerPhone(customerPhone);
            order.setDeliveryAddress(deliveryAddress);
            order.setPaymentMethod(paymentMethod);
            order.setSubtotal(subtotal);
            order.setDeliveryFee(deliveryFee);
            order.setTotalAmount(totalAmount);
            order.setStatus(OrderStatus.PENDING);

            Order savedOrder = orderRepository.save(order);

            // Create order items
            for (Cart cartItem : cartItems) {
                Double priceDouble = cartItem.getProduct().getPrice();  // Get as Double
                BigDecimal price = BigDecimal.valueOf(priceDouble);  // FIXED: Convert to BigDecimal
                BigDecimal itemSubtotal = price.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

                OrderItem orderItem = new OrderItem(
                        savedOrder,
                        cartItem.getProduct(),
                        cartItem.getProduct().getTitle(),
                        price,  // FIXED: Now BigDecimal
                        cartItem.getQuantity(),
                        itemSubtotal
                );

                orderItemRepository.save(orderItem);
            }

            // Clear cart after order creation
            cartRepository.deleteByUser(currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order placed successfully");
            response.put("orderId", savedOrder.getId());
            response.put("orderNumber", savedOrder.getOrderNumber());
            response.put("totalAmount", totalAmount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();  // TODO: Replace with proper logging in production
            return ResponseEntity.status(500).body(createErrorResponse("Failed to create order"));
        }
    }

    // Get all orders for current user
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserOrders() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orders", orders);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();  // TODO: Replace with proper logging in production
            return ResponseEntity.status(500).body(createErrorResponse("Failed to fetch orders"));
        }
    }

    // Get specific order details
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderDetails(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            Optional<Order> orderOpt = orderRepository.findById(id);
            if (!orderOpt.isPresent() || !orderOpt.get().getUser().equals(currentUser)) {
                return ResponseEntity.status(404).body(createErrorResponse("Order not found"));
            }

            Order order = orderOpt.get();
            List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

            Map<String, Object> data = new HashMap<>();
            data.put("order", order);
            data.put("items", orderItems);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();  // TODO: Replace with proper logging in production
            return ResponseEntity.status(500).body(createErrorResponse("Failed to fetch order details"));
        }
    }

    // Cancel order if still pending
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("User not authenticated"));
            }

            Optional<Order> orderOpt = orderRepository.findById(id);
            if (!orderOpt.isPresent() || !orderOpt.get().getUser().equals(currentUser)) {
                return ResponseEntity.status(404).body(createErrorResponse("Order not found"));
            }

            Order order = orderOpt.get();
            if (order.getStatus() != OrderStatus.PENDING) {
                return ResponseEntity.status(400).body(createErrorResponse("Order cannot be cancelled"));
            }

            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            return ResponseEntity.ok(createSuccessResponse("Order cancelled successfully"));

        } catch (Exception e) {
            e.printStackTrace();  // TODO: Replace with proper logging in production
            return ResponseEntity.status(500).body(createErrorResponse("Failed to cancel order"));
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

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", false);
        res.put("message", message);
        return res;
    }

    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", message);
        return res;
    }
}