import React, { useState, useEffect } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Info, Plus, Edit } from "lucide-react";
import { 
  generateNewInventoryTemplate,
  generateInventoryUpdateTemplate, 
  importNewInventory,
  importInventoryUpdates, 
  exportInventoryToExcel, 
  exportSalesToExcel,
  exportDetailedSalesReport 
} from "../utils/excelHandler";
import { itemService } from '../services/itemService';
import { salesService } from '../services/salesService';

const ExcelManager = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(JSON.parse(sessionStorage.getItem('authUser')));
    const fetchData = async () => {
      try {
        const itemsResult = await itemService.getItems();
        const salesResult = await salesService.getSales();
        if (!itemsResult.success || !salesResult.success) throw new Error('Failed to fetch data');
        setItems(itemsResult.data.items || []);
        setSales(salesResult.data.sales || []);
      } catch (err) {
        setUploadStatus({ type: 'error', message: 'Failed to load items or sales.' });
      }
    };
    fetchData();
  }, []);

  const isAdmin = user?.role === 'admin';
  const canUploadExcel = user?.permissions?.includes('upload_excel');
  const canApproveUploads = user?.permissions?.includes('approve_uploads');

  const handleNewTemplateDownload = () => {
    generateNewInventoryTemplate();
  };

  const handleUpdateTemplateDownload = () => {
    generateInventoryUpdateTemplate(items);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a valid Excel file (.xlsx or .xls)'
      });
      return;
    }

    setUploadFile(file);
    setUploadStatus(null);
  };

  const processUpload = async () => {
    if (!uploadFile) return;

    setIsProcessing(true);
    setUploadStatus(null);

    try {
      let result;
      
      if (activeTab === 'new') {
        result = await importNewInventory(uploadFile, (newItem) => {
          setItems(prevItems => [...prevItems, newItem]);
        });
        
        if (result.errors.length > 0) {
          setUploadStatus({
            type: 'error',
            message: `Found ${result.errors.length} errors in the file`,
            details: result.errors
          });
          return;
        }

        if (isAdmin) {
          // Admin can directly add items
          let addedCount = 0;
          result.newItems.forEach(newItem => {
            setItems(prevItems => [...prevItems, newItem]);
            addedCount++;
          });

          setUploadStatus({
            type: 'success',
            message: `Successfully added ${addedCount} new items`,
            details: result.warnings.length > 0 ? result.warnings : null
          });
        } else {
          // Staff uploads go to approval queue
          const approval = {
            type: 'new_items',
            uploadedBy: user.name,
            fileName: uploadFile.name,
            changes: result.newItems.map(item => ({ item }))
          };

          // In a real app, you'd send this to a backend endpoint for approval
          if (import.meta.env.DEV) console.log('Approval request:', approval);

          setUploadStatus({
            type: 'success',
            message: `Upload submitted for approval. ${result.newItems.length} new items pending review.`,
            details: ['Your upload has been sent to the admin for approval.']
          });
        }
      } else {
        result = await importInventoryUpdates(uploadFile, (updatedItem) => {
          setItems(prevItems => prevItems.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          ));
        });
        
        if (result.errors.length > 0) {
          setUploadStatus({
            type: 'error',
            message: `Found ${result.errors.length} errors in the file`,
            details: result.errors
          });
          return;
        }

        if (isAdmin) {
          // Admin can directly update items
          let updatedCount = 0;
          result.updates.forEach(update => {
            const updateData = {};
            
            if (update.price !== null) updateData.price = update.price;
            if (update.stock !== null) updateData.stock = update.stock;
            if (update.name) updateData.name = update.name;
            if (update.category) updateData.category = update.category;
            if (update.description !== undefined) updateData.description = update.description;

            if (Object.keys(updateData).length > 0) {
              setItems(prevItems => prevItems.map(item => 
                item.id === update.id ? { ...item, ...updateData } : item
              ));
              updatedCount++;
            }
          });

          setUploadStatus({
            type: 'success',
            message: `Successfully updated ${updatedCount} items`,
            details: result.warnings.length > 0 ? result.warnings : null
          });
        } else {
          // Staff uploads go to approval queue
          const approval = {
            type: 'inventory_update',
            uploadedBy: user.name,
            fileName: uploadFile.name,
            changes: result.updates.map(update => ({
              id: update.id,
              itemName: update.name,
              updates: {
                ...(update.price !== null && { price: update.price }),
                ...(update.stock !== null && { stock: update.stock }),
                ...(update.name && { name: update.name }),
                ...(update.category && { category: update.category }),
                ...(update.description !== undefined && { description: update.description })
              }
            }))
          };

          // In a real app, you'd send this to a backend endpoint for approval
          if (import.meta.env.DEV) console.log('Approval request:', approval);

          setUploadStatus({
            type: 'success',
            message: `Upload submitted for approval. ${result.updates.length} items pending review.`,
            details: ['Your upload has been sent to the admin for approval.']
          });
        }
      }

      setUploadFile(null);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to process file: ' + error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = (type) => {
    switch (type) {
      case 'inventory':
        exportInventoryToExcel(items);
        break;
      case 'sales':
        exportSalesToExcel(sales);
        break;
      case 'detailed-sales':
        exportDetailedSalesReport(sales);
        break;
      default:
        break;
    }
  };

  // Check permissions
  if (!isAdmin && !canUploadExcel && !canApproveUploads) {
    return (
      <div className="p-6 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access Excel management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 w-full">
      <div className="max-w-xs sm:max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Excel Import/Export Manager</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add New Items
          </button>
          <button
            onClick={() => setActiveTab('update')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'update'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Edit className="w-4 h-4 inline mr-2" />
            Update Existing Items
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0 mb-8">
          {/* Import Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                {activeTab === 'new' ? 'Import New Items' : 'Import Inventory Updates'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Step 1: Download Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {activeTab === 'new' 
                      ? 'Download an empty Excel template to add new inventory items. Fill in the required fields for each new item.'
                      : 'Download the Excel template with your current inventory data. Update the prices, stock levels, and other information as needed.'
                    }
                  </p>
                  <button
                    onClick={activeTab === 'new' ? handleNewTemplateDownload : handleUpdateTemplateDownload}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download {activeTab === 'new' ? 'New Items' : 'Update'} Template
                  </button>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Step 2: Upload File</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {activeTab === 'new'
                      ? 'Select your Excel file with new items to add them to the system.'
                      : 'Select your updated Excel file to import changes back into the system.'
                    }
                    {!isAdmin && (
                      <span className="block mt-1 text-blue-600">
                        Note: Staff uploads require admin approval.
                      </span>
                    )}
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Excel files only (.xlsx, .xls)</p>
                  </div>

                  {uploadFile && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        Selected: {uploadFile.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        Size: {(uploadFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}

                  {uploadFile && (
                    <button
                      onClick={processUpload}
                      disabled={isProcessing}
                      className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {isAdmin ? 'Import Changes' : 'Submit for Approval'}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Upload Status */}
                {uploadStatus && (
                  <div className={`p-4 rounded-lg ${
                    uploadStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
                    uploadStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {uploadStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : uploadStatus.type === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          uploadStatus.type === 'success' ? 'text-green-800' :
                          uploadStatus.type === 'error' ? 'text-red-800' :
                          'text-blue-800'
                        }`}>
                          {uploadStatus.message}
                        </p>
                        {uploadStatus.details && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Details:</p>
                            <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                              {uploadStatus.details.map((detail, index) => (
                                <li key={index} className="text-gray-600">• {detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Export Data
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Inventory Export</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Export all inventory items with current prices, stock levels, and metadata.
                  </p>
                  <button
                    onClick={() => handleExport('inventory')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Inventory
                  </button>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Sales Export</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Export sales data with transaction details and customer information.
                  </p>
                  <button
                    onClick={() => handleExport('sales')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Sales
                  </button>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Detailed Sales Report</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Export detailed sales report with individual item breakdowns.
                  </p>
                  <button
                    onClick={() => handleExport('detailed-sales')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Detailed Report
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Instructions
              </h2>
              
              <div className="space-y-3 text-sm text-gray-600">
                {activeTab === 'new' ? (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">For Adding New Items:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Download the empty template for new items</li>
                      <li>Fill in Name, Category, Price, and Stock (required)</li>
                      <li>Add Description and Notes (optional)</li>
                      <li>Save the file and upload it to add items</li>
                      <li>Each row represents one new item</li>
                      {!isAdmin && <li className="text-blue-600">Staff uploads require admin approval</li>}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">For Inventory Updates:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Download the template with your current inventory</li>
                      <li>Update only the "New Price" and "New Stock" columns</li>
                      <li>Do not modify the "ID" column - it's used for matching</li>
                      <li>Save the file and upload it back to the system</li>
                      {!isAdmin && <li className="text-blue-600">Staff uploads require admin approval</li>}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Supported Formats:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Excel files (.xlsx, .xls)</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Template includes instructions sheet</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelManager; 