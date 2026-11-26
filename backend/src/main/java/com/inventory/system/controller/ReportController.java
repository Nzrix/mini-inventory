package com.inventory.system.controller;

import com.inventory.system.dto.DashboardDTO;
import com.inventory.system.dto.ProductDTO;
import com.inventory.system.dto.StockReportDTO;
import com.inventory.system.dto.StockTransactionDTO;
import com.inventory.system.service.ExcelService;
import com.inventory.system.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private ExcelService excelService;
    
    @GetMapping("/stock")
    public ResponseEntity<List<StockReportDTO>> getCurrentStockReport() {
        return ResponseEntity.ok(reportService.getCurrentStockReport());
    }
    
    @GetMapping("/stock/export")
    public ResponseEntity<byte[]> exportStockReport() throws IOException {
        List<StockReportDTO> reportData = reportService.getCurrentStockReport();
        byte[] excelData = excelService.exportStockReport(reportData);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock-report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }
    
    @GetMapping("/stock-movement")
    public ResponseEntity<List<StockTransactionDTO>> getStockMovementReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getStockMovementReport(startDate, endDate));
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductDTO>> getLowStockProducts() {
        return ResponseEntity.ok(reportService.getLowStockProducts());
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboardData() {
        return ResponseEntity.ok(reportService.getDashboardData());
    }
}
