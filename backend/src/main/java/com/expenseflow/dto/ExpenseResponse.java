package com.expenseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {

    private String id;
    private String userId;
    private String title;
    private Double amount;
    private String category;
    private String date;
    private String paymentMethod;
    private String description;
    private String notes;
    private Long createdAt;
    private Long updatedAt;
    private Instant createdAtIso;
    private Instant updatedAtIso;
}
