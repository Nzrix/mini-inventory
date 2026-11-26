package com.inventory.system.service;

import com.inventory.system.dto.StockReportDTO;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ExcelServiceTest {
    
    @Mock
    private ProductService productService;
    
    @InjectMocks
    private ExcelService excelService;
    
    @Test
    void testExportStockReport() throws IOException {
        List<StockReportDTO> reportData = Arrays.asList(
            new StockReportDTO(1L, "PROD-001", "Product 1", "Category 1", 50, "piece", 
                BigDecimal.valueOf(100), BigDecimal.valueOf(150), BigDecimal.valueOf(5000), 10, false),
            new StockReportDTO(2L, "PROD-002", "Product 2", "Category 2", 5, "box", 
                BigDecimal.valueOf(200), BigDecimal.valueOf(300), BigDecimal.valueOf(1000), 10, true)
        );
        
        byte[] excelData = excelService.exportStockReport(reportData);
        
        assertNotNull(excelData);
        assertTrue(excelData.length > 0);
        
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(excelData))) {
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals("Stock Report", sheet.getSheetName());
            
            Row headerRow = sheet.getRow(0);
            assertNotNull(headerRow);
            assertEquals("SKU", headerRow.getCell(0).getStringCellValue());
            assertEquals("Product Name", headerRow.getCell(1).getStringCellValue());
            
            Row dataRow1 = sheet.getRow(1);
            assertEquals("PROD-001", dataRow1.getCell(0).getStringCellValue());
            assertEquals("Product 1", dataRow1.getCell(1).getStringCellValue());
            assertEquals(50.0, dataRow1.getCell(3).getNumericCellValue());
            
            Row dataRow2 = sheet.getRow(2);
            assertEquals("PROD-002", dataRow2.getCell(0).getStringCellValue());
            assertEquals("Yes", dataRow2.getCell(9).getStringCellValue());
        }
    }
    
    @Test
    void testGenerateProductTemplate() throws IOException {
        byte[] template = excelService.generateProductTemplate();
        
        assertNotNull(template);
        assertTrue(template.length > 0);
        
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(template))) {
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals("Product Import Template", sheet.getSheetName());
            
            Row headerRow = sheet.getRow(0);
            assertNotNull(headerRow);
            assertEquals("SKU", headerRow.getCell(0).getStringCellValue());
            assertEquals("Product Name", headerRow.getCell(1).getStringCellValue());
            assertEquals("Category", headerRow.getCell(2).getStringCellValue());
            
            Row exampleRow = sheet.getRow(1);
            assertNotNull(exampleRow);
            assertEquals("PROD-001", exampleRow.getCell(0).getStringCellValue());
        }
    }
}
