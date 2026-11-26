package com.inventory.system.repository;

import com.inventory.system.model.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    
    @Query(
        value = "SELECT st FROM StockTransaction st " +
                "JOIN FETCH st.product p " +
                "JOIN FETCH p.category " +
                "JOIN FETCH st.user " +
                "WHERE st.product.id = :productId " +
                "ORDER BY st.createdAt DESC",
        countQuery = "SELECT COUNT(st) FROM StockTransaction st WHERE st.product.id = :productId"
    )
    Page<StockTransaction> findByProductIdWithDetails(@Param("productId") Long productId, Pageable pageable);

    @Query(
        value = "SELECT st FROM StockTransaction st " +
                "JOIN FETCH st.product p " +
                "JOIN FETCH p.category " +
                "JOIN FETCH st.user " +
                "ORDER BY st.createdAt DESC",
        countQuery = "SELECT COUNT(st) FROM StockTransaction st"
    )
    Page<StockTransaction> findAllWithDetails(Pageable pageable);
    
    @Query("SELECT st FROM StockTransaction st " +
           "JOIN FETCH st.product p " +
           "JOIN FETCH p.category " +
           "JOIN FETCH st.user " +
           "WHERE st.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY st.createdAt DESC")
    List<StockTransaction> findByDateRangeWithDetails(@Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COALESCE(SUM(CASE WHEN st.type = 'IN' OR st.type = 'ADJUSTMENT' AND st.quantity > 0 THEN st.quantity " +
           "WHEN st.type = 'OUT' THEN -st.quantity " +
           "WHEN st.type = 'ADJUSTMENT' AND st.quantity < 0 THEN st.quantity " +
           "ELSE 0 END), 0) " +
           "FROM StockTransaction st WHERE st.product.id = :productId")
    Integer calculateCurrentStock(@Param("productId") Long productId);
    
    @Query("SELECT st FROM StockTransaction st " +
           "WHERE st.product.id = :productId " +
           "ORDER BY st.createdAt DESC, st.id DESC")
    List<StockTransaction> findLatestByProductId(@Param("productId") Long productId, Pageable pageable);
}
