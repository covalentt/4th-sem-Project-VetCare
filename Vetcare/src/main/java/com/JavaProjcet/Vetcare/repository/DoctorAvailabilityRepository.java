package com.JavaProjcet.Vetcare.repository;

import com.JavaProjcet.Vetcare.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    List<DoctorAvailability> findByDoctorIdAndIsActiveTrue(Long doctorId);

    List<DoctorAvailability> findByDoctorIdAndDayOfWeekAndIsActiveTrue(Long doctorId, Integer dayOfWeek);

    List<DoctorAvailability> findByDoctorIdAndSpecificDateAndIsActiveTrue(Long doctorId, LocalDate specificDate);

    List<DoctorAvailability> findByDayOfWeekAndIsActiveTrueAndIsRecurringTrue(Integer dayOfWeek);

    List<DoctorAvailability> findBySpecificDateAndIsActiveTrue(LocalDate specificDate);

    @Query("SELECT da FROM DoctorAvailability da WHERE " +
            "((da.isRecurring = true AND da.dayOfWeek = :dayOfWeek) OR " +
            "(da.specificDate = :date)) AND da.isActive = true")
    List<DoctorAvailability> findAvailabilitiesForDate(@Param("date") LocalDate date,
                                                       @Param("dayOfWeek") Integer dayOfWeek);
}
