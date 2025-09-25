package com.JavaProjcet.Vetcare.service;

import com.JavaProjcet.Vetcare.entity.Pet;
import com.JavaProjcet.Vetcare.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PetService {

    @Autowired
    private PetRepository petRepository;

    public List<Pet> getPetsByUserId(Long userId) {
        return petRepository.findByUserId(userId);
    }

    public Pet findById(Long id) {
        return petRepository.findById(id).orElse(null);
    }

    // Add other methods as needed (e.g., findById, savePet from your BookingService references)
}