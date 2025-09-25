package com.JavaProjcet.Vetcare.controller;

import com.JavaProjcet.Vetcare.entity.Services;
import com.JavaProjcet.Vetcare.repository.ServicesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServicesRepository servicesRepository;

    @GetMapping
    public ResponseEntity<?> getAllServices() {
        return ResponseEntity.ok(servicesRepository.findAll());
    }
}
