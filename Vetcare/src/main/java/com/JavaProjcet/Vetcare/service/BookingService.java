package com.JavaProjcet.Vetcare.service;

import com.JavaProjcet.Vetcare.entity.Appointment;
import com.JavaProjcet.Vetcare.entity.AppointmentStatus;
import com.JavaProjcet.Vetcare.entity.BookingRequest;
import com.JavaProjcet.Vetcare.entity.Pet;
import com.JavaProjcet.Vetcare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
@Service
public class BookingService {

    @Autowired
    private PetService petService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // Book an appointment
    public Appointment bookAppointment(Long petId, LocalDate date, LocalTime time, BigDecimal fee) {

        // 1. Fetch Pet
        Pet pet = petService.findById(petId);
        if (pet == null) {
            throw new IllegalArgumentException("Pet not found with id: " + petId);
        }

        // 2. Check availability
        Optional<Appointment> existing = appointmentRepository.findByAppointmentDateAndAppointmentTime(date, time);
        if (existing.isPresent()) {
            throw new IllegalStateException("Slot already booked!");
        }

        // 3. Create Appointment
        Appointment appointment = new Appointment();
        appointment.setPet(pet);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);

        // Use BigDecimal for money
        appointment.setFee(fee != null ? fee : BigDecimal.valueOf(200.0));

        // Enum for status
        appointment.setStatus(AppointmentStatus.PENDING);

        // Save
        return appointmentRepository.save(appointment);
    }

    // Update appointment status
    public Appointment updateStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    // Create booking from BookingRequest
    public Appointment createBooking(BookingRequest request) {
        return bookAppointment(
                request.getPetId(),
                request.getAppointmentDate(),
                request.getAppointmentTime(),
                request.getFee() != null ? request.getFee() : BigDecimal.valueOf(200.0)
        );
    }
} // ✅ closing brace for the class
