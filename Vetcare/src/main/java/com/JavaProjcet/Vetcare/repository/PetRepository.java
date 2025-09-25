package com.JavaProjcet.Vetcare.repository;

import com.JavaProjcet.Vetcare.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByUserId(Long userId);
    List<Pet> findByUserIdAndType(Long userId, String type);
}
