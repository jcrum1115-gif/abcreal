package com.abcbank.bankapi2.dto;

public class TokenResponse {

    private String token;
    private String customerId;
    private String username;

    public TokenResponse() {}

    public TokenResponse(String token, String customerId, String username) {
        this.token = token;
        this.customerId = customerId;
        this.username = username;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
