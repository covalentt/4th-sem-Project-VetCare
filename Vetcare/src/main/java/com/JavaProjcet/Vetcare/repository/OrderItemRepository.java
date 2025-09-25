package com.JavaProjcet.Vetcare.repository;

import com.JavaProjcet.Vetcare.entity.OrderItem;
import com.JavaProjcet.Vetcare.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Find items by order
    List<OrderItem> findByOrder(Order order);

    // Delete items by order
    void deleteByOrder(Order order);
}
