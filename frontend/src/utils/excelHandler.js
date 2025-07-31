import * as XLSX from 'xlsx';

// Generate Excel template for adding new inventory items
export const generateNewInventoryTemplate = () => {
  const workbook = XLSX.utils.book_new();
  
  // Create empty template with headers only
  const templateData = [
    {
      'Name': '',
      'Category': '',
      'Description': '',
      'Price (GHS)': '',
      'Stock': '',
      'Notes': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  const columnWidths = [
    { wch: 40 }, // Name
    { wch: 15 }, // Category
    { wch: 50 }, // Description
    { wch: 15 }, // Price
    { wch: 12 }, // Stock
    { wch: 30 }  // Notes
  ];
  worksheet['!cols'] = columnWidths;

  // Add instructions sheet
  const instructionsData = [
    { 'Column': 'Name', 'Description': 'Item name (required)', 'Required': 'Yes' },
    { 'Column': 'Category', 'Description': 'Item category (required)', 'Required': 'Yes' },
    { 'Column': 'Description', 'Description': 'Item description (optional)', 'Required': 'No' },
    { 'Column': 'Price (GHS)', 'Description': 'Item price in Ghana Cedis (required)', 'Required': 'Yes' },
    { 'Column': 'Stock', 'Description': 'Initial stock quantity (required)', 'Required': 'Yes' },
    { 'Column': 'Notes', 'Description': 'Any additional notes or comments', 'Required': 'No' }
  ];

  const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [
    { wch: 20 }, // Column
    { wch: 50 }, // Description
    { wch: 10 }  // Required
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'New Inventory');
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  // Save the file
  XLSX.writeFile(workbook, `new-inventory-template-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Generate Excel template for inventory updates (existing items)
export const generateInventoryUpdateTemplate = (items) => {
  const workbook = XLSX.utils.book_new();
  
  // Create template data with existing items
  const templateData = items.map(item => ({
    'ID': item.id,
    'Name': item.name,
    'Category': item.category,
    'Description': item.description || '',
    'Current Price (GHS)': item.price,
    'New Price (GHS)': item.price, // Pre-filled with current price
    'Current Stock': item.stock,
    'New Stock': item.stock, // Pre-filled with current stock
    'Notes': '' // For any additional notes
  }));

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  const columnWidths = [
    { wch: 8 },  // ID
    { wch: 40 }, // Name
    { wch: 15 }, // Category
    { wch: 50 }, // Description
    { wch: 15 }, // Current Price
    { wch: 15 }, // New Price
    { wch: 12 }, // Current Stock
    { wch: 12 }, // New Stock
    { wch: 30 }  // Notes
  ];
  worksheet['!cols'] = columnWidths;

  // Add instructions sheet
  const instructionsData = [
    { 'Column': 'ID', 'Description': 'Item ID (DO NOT CHANGE - used for matching)', 'Required': 'Yes' },
    { 'Column': 'Name', 'Description': 'Item name (can be updated)', 'Required': 'Yes' },
    { 'Column': 'Category', 'Description': 'Item category (can be updated)', 'Required': 'Yes' },
    { 'Column': 'Description', 'Description': 'Item description (optional)', 'Required': 'No' },
    { 'Column': 'Current Price (GHS)', 'Description': 'Current price (read-only)', 'Required': 'No' },
    { 'Column': 'New Price (GHS)', 'Description': 'New price to update (leave unchanged if no update)', 'Required': 'No' },
    { 'Column': 'Current Stock', 'Description': 'Current stock level (read-only)', 'Required': 'No' },
    { 'Column': 'New Stock', 'Description': 'New stock level to update (leave unchanged if no update)', 'Required': 'No' },
    { 'Column': 'Notes', 'Description': 'Any additional notes or comments', 'Required': 'No' }
  ];

  const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [
    { wch: 20 }, // Column
    { wch: 50 }, // Description
    { wch: 10 }  // Required
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Update');
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  // Save the file
  XLSX.writeFile(workbook, `inventory-update-template-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Import new inventory items from Excel
export const importNewInventory = (file, addItem) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames.find(name => name !== 'Instructions');
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const newItems = [];
        const errors = [];
        const warnings = [];
        
        jsonData.forEach((row, index) => {
          try {
            // Skip empty rows
            if (!row.Name || !row.Category || !row['Price (GHS)'] || !row.Stock) {
              if (row.Name || row.Category || row['Price (GHS)'] || row.Stock) {
                errors.push(`Row ${index + 2}: Missing required fields (Name, Category, Price, or Stock)`);
              }
              return;
            }
            
            // Validate price
            const price = parseFloat(row['Price (GHS)']);
            if (isNaN(price) || price < 0) {
              errors.push(`Row ${index + 2}: Invalid price value for "${row.Name}"`);
              return;
            }
            
            // Validate stock
            const stock = parseInt(row.Stock);
            if (isNaN(stock) || stock < 0) {
              errors.push(`Row ${index + 2}: Invalid stock value for "${row.Name}"`);
              return;
            }
            
            const newItem = {
              name: row.Name.trim(),
              category: row.Category.trim(),
              description: row.Description ? row.Description.trim() : '',
              price: price,
              stock: stock,
              notes: row.Notes ? row.Notes.trim() : ''
            };
            
            newItems.push(newItem);
          } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
          }
        });
        
        resolve({ newItems, errors, warnings });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Import and update inventory from Excel (existing items)
export const importInventoryUpdates = (file, updateItem) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames.find(name => name !== 'Instructions');
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const updates = [];
        const errors = [];
        const warnings = [];
        
        jsonData.forEach((row, index) => {
          try {
            // Validate required fields
            if (!row.ID || !row.Name || !row.Category) {
              errors.push(`Row ${index + 2}: Missing required fields (ID, Name, or Category)`);
              return;
            }
            
            const itemId = parseInt(row.ID);
            if (isNaN(itemId)) {
              errors.push(`Row ${index + 2}: Invalid ID format`);
              return;
            }
            
            // Check if new price is provided and valid
            let newPrice = null;
            if (row['New Price (GHS)'] !== undefined && row['New Price (GHS)'] !== '') {
              newPrice = parseFloat(row['New Price (GHS)']);
              if (isNaN(newPrice) || newPrice < 0) {
                errors.push(`Row ${index + 2}: Invalid new price value`);
                return;
              }
            }
            
            // Check if new stock is provided and valid
            let newStock = null;
            if (row['New Stock'] !== undefined && row['New Stock'] !== '') {
              newStock = parseInt(row['New Stock']);
              if (isNaN(newStock) || newStock < 0) {
                errors.push(`Row ${index + 2}: Invalid new stock value`);
                return;
              }
            }
            
            const update = {
              id: itemId,
              name: row.Name.trim(),
              category: row.Category.trim(),
              description: row.Description ? row.Description.trim() : '',
              price: newPrice,
              stock: newStock,
              notes: row.Notes ? row.Notes.trim() : ''
            };
            
            // Check if any updates are actually being made
            if (newPrice === null && newStock === null) {
              warnings.push(`Row ${index + 2}: No updates specified for item "${row.Name}"`);
            }
            
            updates.push(update);
          } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
          }
        });
        
        resolve({ updates, errors, warnings });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Export inventory to Excel (for backup/export)
export const exportInventoryToExcel = (items) => {
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for export
  const inventoryData = items.map(item => ({
    'ID': item.id,
    'Name': item.name,
    'Category': item.category,
    'Description': item.description || '',
    'Price (GHS)': item.price,
    'Stock': item.stock,
    'Created Date': new Date(item.createdAt).toLocaleDateString(),
    'Last Updated': new Date(item.updatedAt).toLocaleDateString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(inventoryData);
  
  // Set column widths
  const columnWidths = [
    { wch: 8 },  // ID
    { wch: 40 }, // Name
    { wch: 15 }, // Category
    { wch: 50 }, // Description
    { wch: 12 }, // Price
    { wch: 8 },  // Stock
    { wch: 12 }, // Created Date
    { wch: 12 }  // Last Updated
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  
  // Save the file
  XLSX.writeFile(workbook, `inventory-export-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export sales to Excel
export const exportSalesToExcel = (sales) => {
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for export
  const salesData = sales.map(sale => ({
    'Sale ID': sale.id,
    'Date': new Date(sale.date).toLocaleDateString(),
    'Time': new Date(sale.date).toLocaleTimeString(),
    'Customer': sale.customerName,
    'Payment Method': sale.paymentMethod,
    'Total (GHS)': sale.total,
    'Items Count': sale.items.length,
    'Items': sale.items.map(item => `${item.name} (${item.quantity})`).join('; ')
  }));

  const worksheet = XLSX.utils.json_to_sheet(salesData);
  
  // Set column widths
  const columnWidths = [
    { wch: 10 }, // Sale ID
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 20 }, // Customer
    { wch: 15 }, // Payment Method
    { wch: 12 }, // Total
    { wch: 12 }, // Items Count
    { wch: 60 }  // Items
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
  
  // Save the file
  XLSX.writeFile(workbook, `sales-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export detailed sales report
export const exportDetailedSalesReport = (sales, dateRange = null) => {
  const workbook = XLSX.utils.book_new();
  
  // Filter sales by date range if provided
  let filteredSales = sales;
  if (dateRange) {
    filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= dateRange.start && saleDate <= dateRange.end;
    });
  }
  
  // Create detailed sales data
  const detailedData = [];
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      detailedData.push({
        'Sale ID': sale.id,
        'Date': new Date(sale.date).toLocaleDateString(),
        'Time': new Date(sale.date).toLocaleTimeString(),
        'Customer': sale.customerName,
        'Payment Method': sale.paymentMethod,
        'Item Name': item.name,
        'Quantity': item.quantity,
        'Unit Price (GHS)': item.price,
        'Item Total (GHS)': item.price * item.quantity,
        'Sale Total (GHS)': sale.total
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(detailedData);
  
  // Set column widths
  const columnWidths = [
    { wch: 10 }, // Sale ID
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 20 }, // Customer
    { wch: 15 }, // Payment Method
    { wch: 40 }, // Item Name
    { wch: 10 }, // Quantity
    { wch: 15 }, // Unit Price
    { wch: 15 }, // Item Total
    { wch: 15 }  // Sale Total
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Detailed Sales');
  
  // Save the file
  const fileName = dateRange 
    ? `detailed-sales-${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}.xlsx`
    : `detailed-sales-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
}; 