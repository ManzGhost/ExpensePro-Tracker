package com.expenseflow.service;

import com.expenseflow.dto.AuthRequest;
import com.expenseflow.dto.AuthResponse;
import com.expenseflow.dto.RegisterRequest;
import com.expenseflow.dto.UserResponse;
import com.expenseflow.exception.BadRequestException;
import com.expenseflow.exception.UserAlreadyExistsException;
import com.expenseflow.model.User;
import com.expenseflow.repository.UserRepository;
import com.expenseflow.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        String trimmedEmail = request.getEmail().trim().toLowerCase();
        String trimmedName = request.getName().trim();

        if (userRepository.existsByEmailIgnoreCase(trimmedEmail)) {
            throw new UserAlreadyExistsException("An account with email " + trimmedEmail + " already exists.");
        }

        if (request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long.");
        }

        User user = User.builder()
                .name(trimmedName)
                .email(trimmedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user with ID: {} and email: {}", savedUser.getId(), savedUser.getEmail());

        String jwt = jwtUtils.generateTokenFromUserIdAndEmail(savedUser.getId(), savedUser.getEmail());

        UserResponse userResponse = UserResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .createdAt(savedUser.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(userResponse)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        String trimmedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(trimmedEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmailIgnoreCase(trimmedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        String jwt = jwtUtils.generateTokenFromUserIdAndEmail(user.getId(), user.getEmail());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(userResponse)
                .build();
    }
}
