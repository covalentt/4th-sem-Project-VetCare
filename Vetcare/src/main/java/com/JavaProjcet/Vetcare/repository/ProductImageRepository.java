package com.JavaProjcet.Vetcare.repository;

import com.JavaProjcet.Vetcare.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);

    @Query("SELECT pi FROM ProductImage pi WHERE pi.productId = :productId AND pi.isMain = true")
    Optional<ProductImage> findMainImageByProductId(@Param("productId") Long productId);

    @Query("SELECT pi FROM ProductImage pi WHERE pi.productId = :productId AND pi.isMain = false ORDER BY pi.displayOrder ASC")
    List<ProductImage> findAdditionalImagesByProductId(@Param("productId") Long productId);
}
