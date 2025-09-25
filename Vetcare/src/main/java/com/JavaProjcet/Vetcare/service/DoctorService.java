package com.JavaProjcet.Vetcare.service;

import com.JavaProjcet.Vetcare.entity.DoctorResponse;
import com.JavaProjcet.Vetcare.entity.Doctor;
import com.JavaProjcet.Vetcare.entity.DoctorAvailability;
import com.JavaProjcet.Vetcare.repository.DoctorRepository;
import com.JavaProjcet.Vetcare.repository.DoctorAvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;

    public List<DoctorResponse> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        return doctors.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public Optional<Doctor> findById(Long id) {
        return doctorRepository.findById(id);
    }

    public List<DoctorAvailability> getDoctorAvailabilities(Long doctorId, LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue(); // Monday=1, Sunday=7

        if (doctorId != null) {
            // Get specific doctor's availability
            List<DoctorAvailability> specificDate = availabilityRepository
                    .findByDoctorIdAndSpecificDateAndIsActiveTrue(doctorId, date);
            if (!specificDate.isEmpty()) {
                return specificDate;
            }
            return availabilityRepository
                    .findByDoctorIdAndDayOfWeekAndIsActiveTrue(doctorId, dayOfWeek);
        } else {
            // Get all doctors' availability for the date
            return availabilityRepository.findAvailabilitiesForDate(date, dayOfWeek);
        }
    }

    private DoctorResponse convertToResponse(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialty()
        );
    }
}