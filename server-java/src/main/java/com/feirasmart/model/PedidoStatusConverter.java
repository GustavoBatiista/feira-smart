package com.feirasmart.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PedidoStatusConverter implements AttributeConverter<PedidoStatus, String> {
    @Override
    public String convertToDatabaseColumn(PedidoStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name().toLowerCase();
    }

    @Override
    public PedidoStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return PedidoStatus.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}













