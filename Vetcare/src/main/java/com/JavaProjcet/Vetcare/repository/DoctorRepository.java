package com.JavaProjcet.Vetcare.repository;


import com.JavaProjcet.Vetcare.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecialtyContainingIgnoreCase(String specialty);
    List<Doctor> findAllByOrderByNameAsc();
}
