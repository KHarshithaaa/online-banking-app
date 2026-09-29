package com.example.backend.controller;

import com.example.backend.entity.Account;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.service.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BankController {

    @Autowired
    private BankService bankService;

    // 1. Register API
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        return ResponseEntity.ok(bankService.registerUser(user));
    }

    // 2. Login API
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(bankService.login(request.get("email"), request.get("password")));
    }

    // 3. Balance Check API
    @GetMapping("/accounts/{accountNumber}/balance")
    public ResponseEntity<?> getBalance(@PathVariable String accountNumber) {
        return ResponseEntity.ok(bankService.getAccount(accountNumber));
    }

    // 4. Deposit API
    @PostMapping("/transactions/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Object> req) {
        String acc = (String) req.get("accountNumber");
        BigDecimal amt = new BigDecimal(req.get("amount").toString());
        return ResponseEntity.ok(bankService.deposit(acc, amt));
    }

    // 5. Withdraw API
    @PostMapping("/transactions/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> req) {
        String acc = (String) req.get("accountNumber");
        BigDecimal amt = new BigDecimal(req.get("amount").toString());
        return ResponseEntity.ok(bankService.withdraw(acc, amt));
    }

    // 6. Transfer API
    @PostMapping("/transactions/transfer")
    public ResponseEntity<?> transfer(@RequestBody Map<String, Object> req) {
        String fromAcc = (String) req.get("fromAccount");
        String toAcc = (String) req.get("toAccount");
        BigDecimal amt = new BigDecimal(req.get("amount").toString());
        bankService.transfer(fromAcc, toAcc, amt);
        return ResponseEntity.ok(Map.of("message", "Transfer successful"));
    }

    // 7. Transaction History API
    @GetMapping("/transactions/history/{accountNumber}")
    public ResponseEntity<List<Transaction>> getHistory(@PathVariable String accountNumber) {
        return ResponseEntity.ok(bankService.getHistory(accountNumber));
    }
}