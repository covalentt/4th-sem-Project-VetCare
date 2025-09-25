package com.JavaProjcet.Vetcare.controller;

import com.JavaProjcet.Vetcare.entity.Product;
import com.JavaProjcet.Vetcare.entity.ProductDetail;
import com.JavaProjcet.Vetcare.entity.ProductImage;
import com.JavaProjcet.Vetcare.repository.ProductRepository;
import com.JavaProjcet.Vetcare.repository.ProductDetailRepository;
import com.JavaProjcet.Vetcare.repository.ProductImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductDetailRepository productDetailRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    /**
     * GET /api/products - Your existing endpoint (unchanged)
     */
    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    /**
     * GET /api/products/{id} - New endpoint for product details with images
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Get basic product info
            Optional<Product> productOpt = productRepository.findById(id);
            if (!productOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Product not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Product product = productOpt.get();
            response.put("success", true);
            response.put("product", product);

            // Get product details if available
            Optional<ProductDetail> detailOpt = productDetailRepository.findById(id);
            if (detailOpt.isPresent()) {
                ProductDetail detail = detailOpt.get();
                Map<String, Object> detailMap = new HashMap<>();
                detailMap.put("fullDescription", detail.getFullDescription());
                detailMap.put("specifications", detail.getSpecifications());
                detailMap.put("stock", detail.getStock());
                response.put("productDetail", detailMap);
            }

            // Get product images
            List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(id);
            List<Map<String, Object>> imageList = new ArrayList<>();
            for (ProductImage img : images) {
                Map<String, Object> imageMap = new HashMap<>();
                imageMap.put("id", img.getId());
                imageMap.put("imageUrl", img.getImageUrl());
                imageMap.put("altText", img.getAltText());
                imageMap.put("displayOrder", img.getDisplayOrder());
                imageMap.put("isMain", img.getIsMain());
                imageList.add(imageMap);
            }
            response.put("images", imageList);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * GET /api/products/search - Search products by title
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProducts(@RequestParam String q) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Product> products = productRepository.findByTitleContainingIgnoreCase(q);
            response.put("success", true);
            response.put("products", products);
            response.put("count", products.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error searching products: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * GET /api/products/category/{category} - Get products by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getProductsByCategory(@PathVariable String category) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Product> products = productRepository.findByCategory(category);
            response.put("success", true);
            response.put("products", products);
            response.put("category", category);
            response.put("count", products.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving products by category: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * GET /api/products/{id}/related - Get related products
     */
    @GetMapping("/{id}/related")
    public ResponseEntity<Map<String, Object>> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit) {
        Map<String, Object> response = new HashMap<>();

        try {
            // First get the product to find its category
            Optional<Product> productOpt = productRepository.findById(id);
            if (!productOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Product not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Product product = productOpt.get();
            List<Product> allProducts = productRepository.findByCategory(product.getCategory());

            // Filter out the current product and limit results
            List<Product> relatedProducts = allProducts.stream()
                    .filter(p -> !p.getId().equals(id))
                    .limit(limit)
                    .toList();

            response.put("success", true);
            response.put("products", relatedProducts);
            response.put("count", relatedProducts.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving related products: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * GET /api/products/price-range - Get products within price range
     */
    @GetMapping("/price-range")
    public ResponseEntity<Map<String, Object>> getProductsByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Product> products = productRepository.findByPriceBetween(minPrice, maxPrice);
            response.put("success", true);
            response.put("products", products);
            response.put("minPrice", minPrice);
            response.put("maxPrice", maxPrice);
            response.put("count", products.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving products by price range: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}