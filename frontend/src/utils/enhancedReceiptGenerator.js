import jsPDF from 'jspdf';

export const generateEnhancedReceipt = (sale, bookstoreInfo = {}) => {
  const doc = new jsPDF();
  
  // Default bookstore information
  const defaultInfo = {
    name: 'Bookstore',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: null, // Base64 encoded logo image
    taxNumber: '',
    footer: ''
  };

  const info = { ...defaultInfo, ...bookstoreInfo };
  
  // Set font sizes
  const titleSize = 16;
  const headerSize = 12;
  const normalSize = 10;
  const smallSize = 8;
  
  let yPosition = 20;
  
  // Add logo if provided
  if (info.logo) {
    try {
      doc.addImage(info.logo, 'JPEG', 20, yPosition, 30, 20);
      yPosition += 25;
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }
  
  // Store name and title
  doc.setFontSize(titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text(info.name, 105, yPosition, { align: 'center' });
  yPosition += 10;
  
  // Store details
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  if (info.address) {
    doc.text(info.address, 105, yPosition, { align: 'center' });
    yPosition += 6;
  }
  if (info.phone) {
    doc.text(`Phone: ${info.phone}`, 105, yPosition, { align: 'center' });
    yPosition += 6;
  }
  if (info.email) {
    doc.text(`Email: ${info.email}`, 105, yPosition, { align: 'center' });
    yPosition += 6;
  }
  if (info.website) {
    doc.text(`Website: ${info.website}`, 105, yPosition, { align: 'center' });
    yPosition += 6;
  }
  if (info.taxNumber) {
    doc.text(`Tax Number: ${info.taxNumber}`, 105, yPosition, { align: 'center' });
    yPosition += 6;
  }
  yPosition += 9;
  
  // Receipt header
  doc.setFontSize(headerSize);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', 105, yPosition, { align: 'center' });
  yPosition += 10;
  
  // Sale information
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${sale.id}`, 20, yPosition);
  const saleDate = new Date(sale.created_at || sale.date);
  doc.text(`Date: ${saleDate.toLocaleDateString()}`, 120, yPosition);
  yPosition += 6;
  doc.text(`Time: ${saleDate.toLocaleTimeString()}`, 20, yPosition);
  doc.text(`Staff: ${sale.staffName || 'Unknown'}`, 120, yPosition);
  yPosition += 10;
  
  // Items table header
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 20, yPosition);
  doc.text('Qty', 80, yPosition);
  doc.text('Price', 110, yPosition);
  doc.text('Total', 150, yPosition);
  yPosition += 6;
  
  // Separator line
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  // Items
  doc.setFont('helvetica', 'normal');
  (sale.items || []).forEach((item) => {
    const itemName = (item.name || 'Unknown Item').length > 25 ? (item.name || 'Unknown Item').substring(0, 22) + '...' : (item.name || 'Unknown Item');
    doc.text(itemName, 20, yPosition);
    doc.text(item.quantity.toString(), 80, yPosition);
    doc.text(`GHS ${item.price.toFixed(2)}`, 110, yPosition);
    doc.text(`GHS ${(item.price * item.quantity).toFixed(2)}`, 150, yPosition);
    yPosition += 6;
  });
  
  yPosition += 5;
  
  // Separator line
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  // Totals
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 120, yPosition);
  doc.text(`GHS ${sale.subtotal?.toFixed(2) || sale.total.toFixed(2)}`, 150, yPosition);
  yPosition += 6;
  
  if (sale.tax) {
    doc.text('Tax:', 120, yPosition);
    doc.text(`GHS ${sale.tax.toFixed(2)}`, 150, yPosition);
    yPosition += 6;
  }
  
  if (sale.discount) {
    doc.text('Discount:', 120, yPosition);
    doc.text(`-GHS ${sale.discount.toFixed(2)}`, 150, yPosition);
    yPosition += 6;
  }
  
  doc.setFontSize(headerSize);
  doc.text('TOTAL:', 120, yPosition);
  doc.text(`GHS ${sale.total.toFixed(2)}`, 150, yPosition);
  yPosition += 15;
  
  // Payment method
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${sale.paymentMethod || 'Cash'}`, 20, yPosition);
  yPosition += 10;
  
  // Footer
  doc.setFontSize(smallSize);
  if (info.footer) {
    doc.text(info.footer, 105, yPosition, { align: 'center' });
    yPosition += 8;
  }
  doc.text('This is a computer generated receipt', 105, yPosition, { align: 'center' });
  yPosition += 8;
  doc.text('No signature required', 105, yPosition, { align: 'center' });
  
  // QR Code for digital verification (placeholder)
  // In a real implementation, you would generate a QR code with sale details
  doc.setFontSize(smallSize);
  doc.text('Scan for digital copy', 105, yPosition + 20, { align: 'center' });
  
  return doc;
};

// Function to convert image to base64 for logo
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Function to save bookstore information
export const saveBookstoreInfo = (info) => {
  localStorage.setItem('bookstoreInfo', JSON.stringify(info));
};

// Function to load bookstore information
export const loadBookstoreInfo = () => {
  const saved = localStorage.getItem('bookstoreInfo');
  return saved ? JSON.parse(saved) : null;
}; 