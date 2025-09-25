package com.JavaProjcet.Vetcare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/timeslots")
@CrossOrigin(origins = "*")
public class TimeSlotController {

    @GetMapping
    public ResponseEntity<List<Object>> getTimeSlots(@RequestParam String date) {
        // Return empty list for now
        return ResponseEntity.ok(Collections.emptyList());
    }
}
