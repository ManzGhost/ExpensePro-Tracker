package com.expenseflow.repository;

import com.expenseflow.model.Expense;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {

    List<Expense> findByUserId(String userId, Sort sort);

    Optional<Expense> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);

    void deleteAllByUserId(String userId);

    void deleteAllByIdInAndUserId(List<String> ids, String userId);

    @Query("{ 'userId': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<Expense> findByUserIdAndDateBetween(String userId, String startDate, String endDate, Sort sort);

    @Query("{ 'userId': ?0, 'category': ?1 }")
    List<Expense> findByUserIdAndCategory(String userId, String category, Sort sort);

    long countByUserId(String userId);
}
