package com.feirasmart.repository;

import com.feirasmart.model.Feirante;
import com.feirasmart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeiranteRepository extends JpaRepository<Feirante, UUID> {
    List<Feirante> findByFeiraId(UUID feiraId);
    List<Feirante> findByUserId(UUID userId);
    Optional<Feirante> findByUserIdAndFeiraId(UUID userId, UUID feiraId);
    
    @Query("SELECT f FROM Feirante f WHERE f.user.id = :userId")
    List<Feirante> findByUser(@Param("userId") UUID userId);
}













