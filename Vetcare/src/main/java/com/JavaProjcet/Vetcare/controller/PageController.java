package com.JavaProjcet.Vetcare.controller;

import com.JavaProjcet.Vetcare.dto.UserRegistrationDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model; // Add this import
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping({"/", "/index"})
    public String index() {
        return "index";
    }

    @GetMapping("/about")
    public String about() {
        return "about";
    }

    @GetMapping("/services")
    public String services() {
        return "services";
    }

    @GetMapping("/products")
    public String products() {
        return "products";
    }

    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }

    @GetMapping("/book")
    public String book() {
        return "book";
    }

    @GetMapping("/profile")
    public String profile() {
        return "profile";
    }

    @GetMapping("/signup")
    public String signup(Model model) {
        model.addAttribute("userRegistrationDto", new UserRegistrationDto());
        return "signup";
    }

    @GetMapping("/productdetail")
    public String productDetail() {
        return "productdetail";
    }

    @GetMapping("/admin")
    public String admin() {
        return "admin";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }
}