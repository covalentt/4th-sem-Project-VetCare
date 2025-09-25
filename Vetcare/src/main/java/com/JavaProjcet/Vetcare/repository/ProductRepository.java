package com.JavaProjcet.Vetcare.repository;

import com.JavaProjcet.Vetcare.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import com.JavaProjcet.Vetcare.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);

    List<Product> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceBetween(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);

}
