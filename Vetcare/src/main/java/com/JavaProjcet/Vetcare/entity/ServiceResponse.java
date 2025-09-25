// Put this in: src/main/java/com/JavaProjcet/Vetcare/entity/ServiceResponse.java
package com.JavaProjcet.Vetcare.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private String price;
}