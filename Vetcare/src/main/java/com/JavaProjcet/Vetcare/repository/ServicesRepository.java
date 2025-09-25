package com.JavaProjcet.Vetcare.repository;

import com.JavaProjcet.Vetcare.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

public interface ServicesRepository extends JpaRepository<Services, Long> {

}
