package com.JavaProjcet.Vetcare.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentResponse {
    private Long id;
    private String appointmentId;
    private ServiceResponse service;
    private PetResponse pet;
    private DoctorResponse doctor;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String additionalRequests;
    private String status;
    private BigDecimal totalCost;
    private String userName;
    private String userPhone;
    private String userEmail;

    public AppointmentResponse(Long id, String appointmentId, ServiceResponse service, PetResponse pet,
                               DoctorResponse doctor, LocalDate appointmentDate, LocalTime appointmentTime,
                               String additionalRequests, String status, BigDecimal totalCost,
                               String userName, String userPhone, String userEmail) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.service = service;
        this.pet = pet;
        this.doctor = doctor;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.additionalRequests = additionalRequests;
        this.status = status;
        this.totalCost = totalCost;
        this.userName = userName;
        this.userPhone = userPhone;
        this.userEmail = userEmail;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public ServiceResponse getService() {
        return service;
    }

    public void setService(ServiceResponse service) {
        this.service = service;
    }

    public PetResponse getPet() {
        return pet;
    }

    public void setPet(PetResponse pet) {
        this.pet = pet;
    }

    public DoctorResponse getDoctor() {
        return doctor;
    }

    public void setDoctor(DoctorResponse doctor) {
        this.doctor = doctor;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getAdditionalRequests() {
        return additionalRequests;
    }

    public void setAdditionalRequests(String additionalRequests) {
        this.additionalRequests = additionalRequests;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}