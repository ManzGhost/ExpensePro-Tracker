package com.expenseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryResponse {

    private Double totalExpenses;
    private Long totalTransactions;
    private Double averageExpense;
    private Double highestExpense;
    private String mostFrequentCategory;
    private Map<String, Double> categoryBreakdown;
    private Map<String, Double> paymentMethodBreakdown;
    private Map<String, Double> monthlyTrends;
}
