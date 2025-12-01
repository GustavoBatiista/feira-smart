package com.feirasmart.repository;

import com.feirasmart.model.Feira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeiraRepository extends JpaRepository<Feira, UUID> {
}

