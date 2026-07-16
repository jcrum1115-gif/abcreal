package com.abcbank.bankapi2.controller;

import com.abcbank.bankapi2.dto.LoginRequest;
import com.abcbank.bankapi2.dto.TokenResponse;
import com.abcbank.bankapi2.model.Customer;
import com.abcbank.bankapi2.repository.CustomerRepository;
import com.abcbank.bankapi2.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (request.getUsername() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }

        Customer customer = customerRepository
                .findByUsername(request.getUsername())
                .orElse(null);

        if (customer == null ||
                !passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");
        }

        String token = jwtService.generateToken(customer.getUsername());

        return ResponseEntity.ok(
                new TokenResponse(token, customer.getId(), customer.getUsername()));
    }
}
