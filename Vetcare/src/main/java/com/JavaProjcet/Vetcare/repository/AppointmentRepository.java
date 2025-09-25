package com.JavaProjcet.Vetcare.repository;

import com.JavaProjcet.Vetcare.entity.Appointment;
import com.JavaProjcet.Vetcare.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserId(Long userId);
    Optional<Appointment> findByAppointmentDateAndAppointmentTime(LocalDate date, LocalTime time);
    List<Appointment> findByUserIdOrderByAppointmentDateDesc(Long userId);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatus(Long doctorId, LocalDate date, AppointmentStatus status);

    List<Appointment> findByAppointmentDateAndAppointmentTimeAndStatus(LocalDate date, LocalTime time, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date AND " +
            "(:doctorId IS NULL OR a.doctor.id = :doctorId) AND " +
            "a.status IN ('CONFIRMED', 'PENDING')")
    List<Appointment> findBookedAppointments(@Param("date") LocalDate date,
                                             @Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE " +
            "a.appointmentDate = :date AND a.appointmentTime = :time AND " +
            "(:doctorId IS NULL OR a.doctor.id = :doctorId) AND " +
            "a.status IN ('CONFIRMED', 'PENDING')")
    boolean existsBookedAppointment(@Param("date") LocalDate date,
                                    @Param("time") LocalTime time,
                                    @Param("doctorId") Long doctorId);

    List<Appointment> findByStatusAndAppointmentDateBetween(AppointmentStatus status,
                                                            LocalDate startDate,
                                                            LocalDate endDate);
}
