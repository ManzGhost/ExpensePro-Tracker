package com.expenseflow.controller;

import com.expenseflow.dto.ApiResponse;
import com.expenseflow.dto.BulkDeleteRequest;
import com.expenseflow.dto.ExpenseRequest;
import com.expenseflow.dto.ExpenseResponse;
import com.expenseflow.dto.ExpenseSummaryResponse;
import com.expenseflow.security.UserDetailsImpl;
import com.expenseflow.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String sortBy
    ) {
        List<ExpenseResponse> expenses = expenseService.getExpenses(
                currentUser.getId(),
                search,
                category,
                paymentMethod,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                sortBy
        );
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        ExpenseResponse expense = expenseService.getExpenseById(id, currentUser.getId());
        return ResponseEntity.ok(expense);
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        ExpenseResponse created = expenseService.createExpense(request, currentUser.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable String id,
            @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        ExpenseResponse updated = expenseService.updateExpense(id, request, currentUser.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        expenseService.deleteExpense(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully"));
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<ApiResponse<Integer>> bulkDelete(
            @Valid @RequestBody BulkDeleteRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        int count = expenseService.bulkDeleteExpenses(request.getIds(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Deleted " + count + " expenses", count));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> importExpenses(
            @RequestBody List<ExpenseRequest> requests,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        List<ExpenseResponse> imported = expenseService.importExpenses(requests, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Successfully imported " + imported.size() + " expenses", imported));
    }

    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<Void>> clearAll(
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        expenseService.clearAllExpenses(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("All expenses cleared successfully"));
    }

    @GetMapping("/summary")
    public ResponseEntity<ExpenseSummaryResponse> getSummary(
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        ExpenseSummaryResponse summary = expenseService.getExpenseSummary(currentUser.getId());
        return ResponseEntity.ok(summary);
    }
}
