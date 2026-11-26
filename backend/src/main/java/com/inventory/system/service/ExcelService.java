package com.inventory.system.service;

import com.inventory.system.dto.ExcelImportResultDTO;
import com.inventory.system.dto.ProductDTO;
import com.inventory.system.dto.StockReportDTO;
import com.inventory.system.exception.BadRequestException;
import com.inventory.system.model.Category;
import com.inventory.system.repository.CategoryRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelService {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public byte[] exportStockReport(List<StockReportDTO> reportData) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Stock Report");
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"SKU", "Product Name", "Category", "Current Stock", "Unit", 
                              "Cost Price", "Selling Price", "Stock Value", "Min Stock", "Low Stock"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (StockReportDTO data : reportData) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(data.getSku());
                row.createCell(1).setCellValue(data.getProductName());
                row.createCell(2).setCellValue(data.getCategoryName());
                row.createCell(3).setCellValue(data.getCurrentStock());
                row.createCell(4).setCellValue(data.getUnit());
                row.createCell(5).setCellValue(data.getCostPrice().doubleValue());
                row.createCell(6).setCellValue(data.getSellingPrice().doubleValue());
                row.createCell(7).setCellValue(data.getStockValue().doubleValue());
                row.createCell(8).setCellValue(data.getMinimumStock());
                row.createCell(9).setCellValue(data.getIsLowStock() ? "Yes" : "No");
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    public ExcelImportResultDTO importProducts(MultipartFile file) throws IOException {
        ExcelImportResultDTO result = new ExcelImportResultDTO();
        result.setErrors(new ArrayList<>());
        
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();
            result.setTotalRows(totalRows);
            
            int successCount = 0;
            int errorCount = 0;
            
            for (int i = 1; i <= totalRows; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    ProductDTO productDTO = parseProductRow(row, i + 1);
                    
                    if (productService.getProductById(productDTO.getId()) != null) {
                        productService.updateProduct(productDTO.getId(), productDTO);
                    } else {
                        productService.createProduct(productDTO);
                    }
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                    result.getErrors().add(new ExcelImportResultDTO.RowError(i + 1, e.getMessage()));
                }
            }
            
            result.setSuccessCount(successCount);
            result.setErrorCount(errorCount);
        }
        
        return result;
    }
    
    private ProductDTO parseProductRow(Row row, int rowNumber) {
        ProductDTO dto = new ProductDTO();
        
        try {
            String sku = getCellValueAsString(row.getCell(0));
            if (sku == null || sku.trim().isEmpty()) {
                throw new BadRequestException("SKU is required");
            }
            dto.setSku(sku.trim());
            
            String name = getCellValueAsString(row.getCell(1));
            if (name == null || name.trim().isEmpty()) {
                throw new BadRequestException("Product name is required");
            }
            dto.setName(name.trim());
            
            String categoryName = getCellValueAsString(row.getCell(2));
            if (categoryName == null || categoryName.trim().isEmpty()) {
                throw new BadRequestException("Category is required");
            }
            
            Category category = categoryRepository.findByName(categoryName.trim())
                    .orElseThrow(() -> new BadRequestException("Category not found: " + categoryName));
            dto.setCategoryId(category.getId());
            
            String unit = getCellValueAsString(row.getCell(3));
            if (unit == null || unit.trim().isEmpty()) {
                throw new BadRequestException("Unit is required");
            }
            dto.setUnit(unit.trim());
            
            Double costPrice = getCellValueAsDouble(row.getCell(4));
            if (costPrice == null || costPrice < 0) {
                throw new BadRequestException("Invalid cost price");
            }
            dto.setCostPrice(BigDecimal.valueOf(costPrice));
            
            Double sellingPrice = getCellValueAsDouble(row.getCell(5));
            if (sellingPrice == null || sellingPrice < 0) {
                throw new BadRequestException("Invalid selling price");
            }
            dto.setSellingPrice(BigDecimal.valueOf(sellingPrice));
            
            Double minStock = getCellValueAsDouble(row.getCell(6));
            if (minStock == null || minStock < 0) {
                throw new BadRequestException("Invalid minimum stock");
            }
            dto.setMinimumStock(minStock.intValue());
            
            String description = getCellValueAsString(row.getCell(7));
            dto.setDescription(description);
            
        } catch (Exception e) {
            throw new BadRequestException("Row " + rowNumber + ": " + e.getMessage());
        }
        
        return dto;
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }
    
    private Double getCellValueAsDouble(Cell cell) {
        if (cell == null) return null;
        
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getNumericCellValue();
            } else if (cell.getCellType() == CellType.STRING) {
                return Double.parseDouble(cell.getStringCellValue());
            }
        } catch (Exception e) {
            return null;
        }
        
        return null;
    }
    
    public byte[] generateProductTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Product Import Template");
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"SKU", "Product Name", "Category", "Unit", 
                              "Cost Price", "Selling Price", "Minimum Stock", "Description"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }
            
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("PROD-001");
            exampleRow.createCell(1).setCellValue("Sample Product");
            exampleRow.createCell(2).setCellValue("Electronics");
            exampleRow.createCell(3).setCellValue("piece");
            exampleRow.createCell(4).setCellValue(100.00);
            exampleRow.createCell(5).setCellValue(150.00);
            exampleRow.createCell(6).setCellValue(10);
            exampleRow.createCell(7).setCellValue("Sample product description");
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}
