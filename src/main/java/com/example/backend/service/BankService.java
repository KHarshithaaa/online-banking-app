package com.example.backend.service;

import com.example.backend.entity.Account;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.repository.AccountRepository;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BankService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public User registerUser(User user) {
        User savedUser = userRepository.save(user);
        Account account = new Account();
        account.setUser(savedUser);
        account.setAccountNumber("AC" + (System.currentTimeMillis() % 100000000));
        account.setBalance(BigDecimal.valueOf(1000.00));
        accountRepository.save(account);
        return savedUser;
    }

    public Account login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        return accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    public Account getAccount(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    @Transactional
    public Account deposit(String accountNumber, BigDecimal amount) {
        Account account = getAccount(accountNumber);
        account.setBalance(account.getBalance().add(amount));
        recordTransaction(accountNumber, "DEPOSIT", amount);
        return accountRepository.save(account);
    }

    @Transactional
    public Account withdraw(String accountNumber, BigDecimal amount) {
        Account account = getAccount(accountNumber);
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
        account.setBalance(account.getBalance().subtract(amount));
        recordTransaction(accountNumber, "WITHDRAW", amount);
        return accountRepository.save(account);
    }

    @Transactional
    public void transfer(String fromAcc, String toAcc, BigDecimal amount) {
        withdraw(fromAcc, amount);
        deposit(toAcc, amount);
    }

    public List<Transaction> getHistory(String accountNumber) {
        return transactionRepository.findByAccountNumberOrderByTimestampDesc(accountNumber);
    }

    private void recordTransaction(String acc, String type, BigDecimal amount) {
        Transaction tx = new Transaction();
        tx.setAccountNumber(acc);
        tx.setTransactionType(type);
        tx.setAmount(amount);
        transactionRepository.save(tx);
    }
}