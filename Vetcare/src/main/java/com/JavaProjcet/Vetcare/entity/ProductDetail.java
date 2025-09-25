package com.JavaProjcet.Vetcare.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "product_details")
public class ProductDetail {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    @Column(name = "specifications", columnDefinition = "TEXT")
    private String specifications;

    @Column(name = "stock", columnDefinition = "INT DEFAULT 0")
    private Integer stock = 0;

    // One-to-one relationship with Product
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @MapsId
    private Product product;

    // Constructors
    public ProductDetail() {}

    public ProductDetail(Long productId, String fullDescription, String specifications, Integer stock) {
        this.productId = productId;
        this.fullDescription = fullDescription;
        this.specifications = specifications;
        this.stock = stock;
    }

    // Getters and Setters
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getFullDescription() {
        return fullDescription;
    }

    public void setFullDescription(String fullDescription) {
        this.fullDescription = fullDescription;
    }

    public String getSpecifications() {
        return specifications;
    }

    public void setSpecifications(String specifications) {
        this.specifications = specifications;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
