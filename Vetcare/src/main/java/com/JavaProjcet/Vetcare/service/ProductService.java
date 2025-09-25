package com.JavaProjcet.Vetcare.service;

import com.JavaProjcet.Vetcare.entity.Product;
import com.JavaProjcet.Vetcare.entity.ProductDetail;
import com.JavaProjcet.Vetcare.entity.ProductImage;
import com.JavaProjcet.Vetcare.repository.ProductDetailRepository;
import com.JavaProjcet.Vetcare.repository.ProductImageRepository;
import com.JavaProjcet.Vetcare.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductDetailRepository productDetailRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    /**
     * Get all products - KEEPS YOUR EXISTING FUNCTIONALITY
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Get product by ID with enhanced details - NEW FUNCTIONALITY
     */
    public Map<String, Object> getProductWithDetails(Long id) {
        Map<String, Object> result = new HashMap<>();

        // Get basic product info
        Optional<Product> productOpt = productRepository.findById(id);
        if (!productOpt.isPresent()) {
            result.put("success", false);
            result.put("message", "Product not found");
            return result;
        }

        Product product = productOpt.get();
        result.put("success", true);
        result.put("product", product);

        // Get product details
        Optional<ProductDetail> detailOpt = productDetailRepository.findById(id);
        if (detailOpt.isPresent()) {
            result.put("productDetail", detailOpt.get());
        }

        // Get product images
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(id);
        result.put("images", images);

        return result;
    }

    /**
     * Get products by category
     */
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    /**
     * Search products by title
     */
    public List<Product> searchProductsByTitle(String title) {
        return productRepository.findByTitleContainingIgnoreCase(title);
    }

    /**
     * Get related products (excluding current product)
     */
    public List<Product> getRelatedProducts(Long productId, String category, int limit) {
        List<Product> allProducts = productRepository.findByCategory(category);
        return allProducts.stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(limit)
                .toList();
    }

    /**
     * Check if product exists
     */
    public boolean productExists(Long id) {
        return productRepository.existsById(id);
    }
}