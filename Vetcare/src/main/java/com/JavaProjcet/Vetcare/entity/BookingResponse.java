package com.JavaProjcet.Vetcare.entity;

public class BookingResponse {
    private String appointmentId;
    private String message;
    private String status;

    public BookingResponse() {}

    public BookingResponse(String appointmentId, String message, String status) {
        this.appointmentId = appointmentId;
        this.message = message;
        this.status = status;
    }

    // Getters and setters
    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}