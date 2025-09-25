package com.JavaProjcet.Vetcare.repository;


import com.JavaProjcet.Vetcare.entity.Order;
import com.JavaProjcet.Vetcare.entity.User;
import com.JavaProjcet.Vetcare.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find orders by user
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    // Find order by order number
    Optional<Order> findByOrderNumber(String orderNumber);

    // Find orders by status
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    // Find orders by user and status
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, OrderStatus status);

    // Count orders by user
    Long countByUser(User user);

    // Find orders created between dates
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);

    // Admin query to get all orders with user info
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user ORDER BY o.createdAt DESC")
    List<Order> findAllOrdersWithUser();
}
