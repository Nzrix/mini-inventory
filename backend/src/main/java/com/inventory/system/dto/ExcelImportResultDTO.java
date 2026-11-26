package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportResultDTO {
    private Integer totalRows;
    private Integer successCount;
    private Integer errorCount;
    private List<RowError> errors = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RowError {
        private Integer rowNumber;
        private String error;
    }
}
