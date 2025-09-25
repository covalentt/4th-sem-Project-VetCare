package com.JavaProjcet.Vetcare.controller;

import com.JavaProjcet.Vetcare.entity.Pet;
import com.JavaProjcet.Vetcare.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "*")
public class PetController {

    @Autowired
    private PetService petService;

    @GetMapping
    public ResponseEntity<List<Pet>> getPets(@RequestParam Long userId) {
        List<Pet> pets = petService.getPetsByUserId(userId);
        return ResponseEntity.ok(pets);
    }
}