package com.JavaProjcet.Vetcare.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetResponse {
    private Long id;
    private String name;
    private String type;
    private String breed;
    private String ageRange;
    private String gender;
    private Double weight;
    private String medicalHistory;
}