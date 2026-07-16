package com.abcbank.bankapi2.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public org.springframework.http.ResponseEntity<Map<String, Object>>
    handleIllegalArgument(IllegalArgumentException ex) {

        Map<String, Object> error = new HashMap<>();

        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", ex.getMessage());

        return new org.springframework.http.ResponseEntity<>(
                error,
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public org.springframework.http.ResponseEntity<Map<String, Object>>
    handleValidation(MethodArgumentNotValidException ex) {

        Map<String, Object> error = new HashMap<>();

        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());

        error.put(
                "error",
                ex.getBindingResult()
                        .getFieldError()
                        .getDefaultMessage()
        );

        return new org.springframework.http.ResponseEntity<>(
                error,
                HttpStatus.BAD_REQUEST
        );
    }
}