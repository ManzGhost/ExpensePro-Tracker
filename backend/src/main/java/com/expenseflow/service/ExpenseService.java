package com.expenseflow.service;

import com.expenseflow.dto.ExpenseRequest;
import com.expenseflow.dto.ExpenseResponse;
import com.expenseflow.dto.ExpenseSummaryResponse;
import com.expenseflow.exception.ResourceNotFoundException;
import com.expenseflow.model.Expense;
import com.expenseflow.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final MongoTemplate mongoTemplate;

    public List<ExpenseResponse> getExpenses(
            String userId,
            String search,
            String category,
            String paymentMethod,
            String startDate,
            String endDate,
            Double minAmount,
            Double maxAmount,
            String sortBy
    ) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId));

        // Search text across title, notes, description, category
        if (StringUtils.hasText(search)) {
            String regexPattern = "(?i)" + search.trim();
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("title").regex(regexPattern),
                    Criteria.where("notes").regex(regexPattern),
                    Criteria.where("description").regex(regexPattern),
                    Criteria.where("category").regex(regexPattern),
                    Criteria.where("paymentMethod").regex(regexPattern)
            );
            query.addCriteria(searchCriteria);
        }

        // Category filter
        if (StringUtils.hasText(category) && !"all".equalsIgnoreCase(category)) {
            query.addCriteria(Criteria.where("category").is(category));
        }

        // Payment Method filter
        if (StringUtils.hasText(paymentMethod) && !"all".equalsIgnoreCase(paymentMethod)) {
            query.addCriteria(Criteria.where("paymentMethod").is(paymentMethod));
        }

        // Date range filter
        if (StringUtils.hasText(startDate) && StringUtils.hasText(endDate)) {
            query.addCriteria(Criteria.where("date").gte(startDate).lte(endDate));
        } else if (StringUtils.hasText(startDate)) {
            query.addCriteria(Criteria.where("date").gte(startDate));
        } else if (StringUtils.hasText(endDate)) {
            query.addCriteria(Criteria.where("date").lte(endDate));
        }

        // Amount range filter
        if (minAmount != null && maxAmount != null) {
            query.addCriteria(Criteria.where("amount").gte(minAmount).lte(maxAmount));
        } else if (minAmount != null) {
            query.addCriteria(Criteria.where("amount").gte(minAmount));
        } else if (maxAmount != null) {
            query.addCriteria(Criteria.where("amount").lte(maxAmount));
        }

        // Sorting
        Sort sort = resolveSort(sortBy);
        query.with(sort);

        List<Expense> expenses = mongoTemplate.find(query, Expense.class);
        return expenses.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ExpenseResponse getExpenseById(String id, String userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found or unauthorized with id: " + id));

        return mapToResponse(expense);
    }

    public ExpenseResponse createExpense(ExpenseRequest request, String userId) {
        String effectiveNotes = StringUtils.hasText(request.getNotes()) ? request.getNotes() : request.getDescription();

        Expense expense = Expense.builder()
                .userId(userId)
                .title(request.getTitle().trim())
                .amount(request.getAmount())
                .category(request.getCategory().trim())
                .date(request.getDate().trim())
                .paymentMethod(request.getPaymentMethod().trim())
                .description(effectiveNotes)
                .notes(effectiveNotes)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Expense saved = expenseRepository.save(expense);
        log.debug("Created expense {} for user {}", saved.getId(), userId);
        return mapToResponse(saved);
    }

    public ExpenseResponse updateExpense(String id, ExpenseRequest request, String userId) {
        Expense existing = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found or unauthorized with id: " + id));

        String effectiveNotes = StringUtils.hasText(request.getNotes()) ? request.getNotes() : request.getDescription();

        if (StringUtils.hasText(request.getTitle())) {
            existing.setTitle(request.getTitle().trim());
        }
        if (request.getAmount() != null) {
            existing.setAmount(request.getAmount());
        }
        if (StringUtils.hasText(request.getCategory())) {
            existing.setCategory(request.getCategory().trim());
        }
        if (StringUtils.hasText(request.getDate())) {
            existing.setDate(request.getDate().trim());
        }
        if (StringUtils.hasText(request.getPaymentMethod())) {
            existing.setPaymentMethod(request.getPaymentMethod().trim());
        }
        if (effectiveNotes != null) {
            existing.setDescription(effectiveNotes);
            existing.setNotes(effectiveNotes);
        }

        existing.setUpdatedAt(Instant.now());
        Expense saved = expenseRepository.save(existing);
        log.debug("Updated expense {} for user {}", saved.getId(), userId);
        return mapToResponse(saved);
    }

    public void deleteExpense(String id, String userId) {
        Expense existing = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found or unauthorized with id: " + id));

        expenseRepository.delete(existing);
        log.debug("Deleted expense {} for user {}", id, userId);
    }

    public int bulkDeleteExpenses(List<String> ids, String userId) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        Query query = new Query();
        query.addCriteria(Criteria.where("id").in(ids).and("userId").is(userId));
        long deletedCount = mongoTemplate.remove(query, Expense.class).getDeletedCount();
        log.debug("Bulk deleted {} expenses for user {}", deletedCount, userId);
        return (int) deletedCount;
    }

    public void clearAllExpenses(String userId) {
        expenseRepository.deleteAllByUserId(userId);
        log.debug("Cleared all expenses for user {}", userId);
    }

    public List<ExpenseResponse> importExpenses(List<ExpenseRequest> requests, String userId) {
        if (requests == null || requests.isEmpty()) {
            return Collections.emptyList();
        }

        List<Expense> expensesToSave = requests.stream().map(req -> {
            String effectiveNotes = StringUtils.hasText(req.getNotes()) ? req.getNotes() : req.getDescription();
            return Expense.builder()
                    .userId(userId)
                    .title(req.getTitle())
                    .amount(req.getAmount())
                    .category(req.getCategory())
                    .date(req.getDate())
                    .paymentMethod(req.getPaymentMethod())
                    .description(effectiveNotes)
                    .notes(effectiveNotes)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
        }).collect(Collectors.toList());

        List<Expense> savedList = expenseRepository.saveAll(expensesToSave);
        return savedList.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ExpenseSummaryResponse getExpenseSummary(String userId) {
        List<Expense> allUserExpenses = expenseRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "date"));

        if (allUserExpenses.isEmpty()) {
            return ExpenseSummaryResponse.builder()
                    .totalExpenses(0.0)
                    .totalTransactions(0L)
                    .averageExpense(0.0)
                    .highestExpense(0.0)
                    .mostFrequentCategory("None")
                    .categoryBreakdown(Collections.emptyMap())
                    .paymentMethodBreakdown(Collections.emptyMap())
                    .monthlyTrends(Collections.emptyMap())
                    .build();
        }

        double totalAmount = allUserExpenses.stream().mapToDouble(Expense::getAmount).sum();
        long count = allUserExpenses.size();
        double average = totalAmount / count;
        double highest = allUserExpenses.stream().mapToDouble(Expense::getAmount).max().orElse(0.0);

        Map<String, Double> categoryMap = new HashMap<>();
        Map<String, Long> categoryCountMap = new HashMap<>();
        Map<String, Double> paymentMethodMap = new HashMap<>();
        Map<String, Double> monthlyMap = new TreeMap<>();

        for (Expense e : allUserExpenses) {
            String cat = e.getCategory() != null ? e.getCategory() : "Other";
            categoryMap.put(cat, categoryMap.getOrDefault(cat, 0.0) + e.getAmount());
            categoryCountMap.put(cat, categoryCountMap.getOrDefault(cat, 0L) + 1);

            String pm = e.getPaymentMethod() != null ? e.getPaymentMethod() : "Other";
            paymentMethodMap.put(pm, paymentMethodMap.getOrDefault(pm, 0.0) + e.getAmount());

            if (e.getDate() != null && e.getDate().length() >= 7) {
                String monthKey = e.getDate().substring(0, 7); // YYYY-MM
                monthlyMap.put(monthKey, monthlyMap.getOrDefault(monthKey, 0.0) + e.getAmount());
            }
        }

        String mostFrequent = categoryCountMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        return ExpenseSummaryResponse.builder()
                .totalExpenses(Math.round(totalAmount * 100.0) / 100.0)
                .totalTransactions(count)
                .averageExpense(Math.round(average * 100.0) / 100.0)
                .highestExpense(Math.round(highest * 100.0) / 100.0)
                .mostFrequentCategory(mostFrequent)
                .categoryBreakdown(categoryMap)
                .paymentMethodBreakdown(paymentMethodMap)
                .monthlyTrends(monthlyMap)
                .build();
    }

    private Sort resolveSort(String sortBy) {
        if (!StringUtils.hasText(sortBy)) {
            return Sort.by(Sort.Direction.DESC, "date", "createdAt");
        }

        return switch (sortBy.toLowerCase()) {
            case "date_asc" -> Sort.by(Sort.Direction.ASC, "date");
            case "amount_desc" -> Sort.by(Sort.Direction.DESC, "amount");
            case "amount_asc" -> Sort.by(Sort.Direction.ASC, "amount");
            case "title_asc" -> Sort.by(Sort.Direction.ASC, "title");
            case "title_desc" -> Sort.by(Sort.Direction.DESC, "title");
            default -> Sort.by(Sort.Direction.DESC, "date");
        };
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        Long createdTs = expense.getCreatedAt() != null ? expense.getCreatedAt().toEpochMilli() : System.currentTimeMillis();
        Long updatedTs = expense.getUpdatedAt() != null ? expense.getUpdatedAt().toEpochMilli() : createdTs;

        String noteVal = StringUtils.hasText(expense.getNotes()) ? expense.getNotes() : expense.getDescription();

        return ExpenseResponse.builder()
                .id(expense.getId())
                .userId(expense.getUserId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .date(expense.getDate())
                .paymentMethod(expense.getPaymentMethod())
                .description(noteVal)
                .notes(noteVal)
                .createdAt(createdTs)
                .updatedAt(updatedTs)
                .createdAtIso(expense.getCreatedAt())
                .updatedAtIso(expense.getUpdatedAt())
                .build();
    }
}
