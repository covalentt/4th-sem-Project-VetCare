    package com.JavaProjcet.Vetcare.controller;


    import com.JavaProjcet.Vetcare.entity.BookingRequest;
    import com.JavaProjcet.Vetcare.service.BookingService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.CrossOrigin;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import java.util.Collections;
    import java.util.Map;

    @RestController
    @RequestMapping("/api/bookings")
    @CrossOrigin(origins = "*")
    public class BookingController {

        @Autowired
        private BookingService bookingService;

        @PostMapping
        public ResponseEntity<Map<String, String>> createBooking(@RequestBody BookingRequest request) {
            bookingService.createBooking(request);
            return ResponseEntity.ok(Collections.singletonMap("message", "Booking created"));
        }
    }