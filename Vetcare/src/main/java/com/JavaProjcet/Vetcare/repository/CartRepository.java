package com.JavaProjcet.Vetcare.repository;

import com.JavaProjcet.Vetcare.entity.Cart;
import com.JavaProjcet.Vetcare.entity.User;
import com.JavaProjcet.Vetcare.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Find cart items by user
    List<Cart> findByUserOrderByCreatedAtDesc(User user);

    // Find specific cart item
    Optional<Cart> findByUserAndProduct(User user, Product product);

    // Count cart items for user
    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM Cart c WHERE c.user = :user")
    Long countCartItemsByUser(@Param("user") User user);

    // Delete all cart items for user
    void deleteByUser(User user);

    // Check if product exists in user's cart
    boolean existsByUserAndProduct(User user, Product product);
}