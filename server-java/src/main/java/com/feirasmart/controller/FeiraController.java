package com.feirasmart.controller;

import com.feirasmart.model.Feira;
import com.feirasmart.service.FeiraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/feiras")
@CrossOrigin(origins = "*")
public class FeiraController {
    @Autowired
    private FeiraService feiraService;

    @GetMapping
    public ResponseEntity<List<Feira>> getAll() {
        return ResponseEntity.ok(feiraService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feira> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(feiraService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<Feira> create(@RequestBody Feira feira) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feiraService.create(feira));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feira> update(@PathVariable UUID id, @RequestBody Feira feira) {
        try {
            return ResponseEntity.ok(feiraService.update(id, feira));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            feiraService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}



