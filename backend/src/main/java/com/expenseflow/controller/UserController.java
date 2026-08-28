package com.expenseflow.controller;

import com.expenseflow.dto.ApiResponse;
import com.expenseflow.dto.UserResponse;
import com.expenseflow.security.UserDetailsImpl;
import com.expenseflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        UserResponse response = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/users/me -> Permanently delete user account & all personal expenses
     */
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteCurrentUserAccount(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        userService.deleteUserAccount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User account and all associated data permanently deleted."));
    }
}
