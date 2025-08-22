import jsPDF from 'jspdf';

export const generateReceipt = async (sale) => {
  try {
    if (import.meta.env.DEV) console.log('Starting receipt generation for sale:', sale);
    
    if (!sale) {
      throw new Error('Sale data is required');
    }
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;

  // Fetch store details
  let storeDetails = { name: 'Bookstore' };
  try {
    const response = await fetch('/api/store-details');
    if (response.ok) {
      const data = await response.json();
      storeDetails = data.storeDetails;
    }
  } catch (error) {
    console.error('Failed to fetch store details:', error);
  }

  // Header with bookstore branding
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80); // Dark blue-gray
  doc.text(`📚 ${storeDetails.name || 'Bookstore'}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(127, 140, 141); // Gray
  doc.text('Your Trusted Educational Partner', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Receipt title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('SALES RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Sale Information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 73, 94);
  
  const saleDate = new Date(sale.created_at || sale.date);
  const formattedDate = saleDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = saleDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Left column
  doc.text(`Receipt #: ${sale.id}`, margin, yPosition);
  doc.text(`Date: ${formattedDate}`, margin, yPosition + 5);
  doc.text(`Time: ${formattedTime}`, margin, yPosition + 10);
  
  // Right column
  const paymentMethod = sale.paymentMethod || sale.payment_method || 'Cash';
  doc.text(`Payment: ${paymentMethod.toUpperCase()}`, pageWidth - margin - 60, yPosition);
  doc.text(`Items: ${(sale.items || []).length}`, pageWidth - margin - 60, yPosition + 5);
  
  yPosition += 20;

  // Items Table Header
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('Item', margin, yPosition);
  doc.text('Qty', margin + 85, yPosition);
  doc.text('Price', margin + 115, yPosition);
  doc.text('Total', margin + 145, yPosition);
  yPosition += 6;

  // Separator line
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Items
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 73, 94);
  
  (sale.items || []).forEach((item, index) => {
    const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
    
    // Item name (with wrapping if too long)
    const itemName = (item.name || 'Unknown Item').length > 35 ? (item.name || 'Unknown Item').substring(0, 35) + '...' : (item.name || 'Unknown Item');
    doc.text(itemName, margin, yPosition);
    
    doc.text((item.quantity || 0).toString(), margin + 85, yPosition);
    doc.text(`GHS ${(parseFloat(item.price) || 0).toFixed(2)}`, margin + 115, yPosition);
    doc.text(`GHS ${itemTotal.toFixed(2)}`, margin + 145, yPosition);
    
    yPosition += 6;
    
    // Add small gap after every 3 items for readability
    if ((index + 1) % 3 === 0) {
      yPosition += 2;
    }
  });

  yPosition += 5;

  // Separator line
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Total section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('TOTAL:', margin + 115, yPosition);
  const totalAmount = parseFloat(sale.total_amount || sale.total || 0);
  doc.text(`GHS ${totalAmount.toFixed(2)}`, margin + 145, yPosition);
  yPosition += 15;

  // Thank you message
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 204, 113); // Green
  doc.text('Thank you for your purchase!', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Footer information
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(127, 140, 141);
  doc.text('Please keep this receipt for your records.', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text('Returns accepted within 7 days with receipt.', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Contact Information
  doc.setFontSize(8);
  if (storeDetails.contact) {
    doc.text(`📞 ${storeDetails.contact}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
  }
  if (storeDetails.email) {
    doc.text(`📧 ${storeDetails.email}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
  }
  if (storeDetails.website) {
    doc.text(`🌐 ${storeDetails.website}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
  }
  if (storeDetails.address) {
    doc.text(`📍 ${storeDetails.address}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
  }

          if (import.meta.env.DEV) console.log('Receipt generation completed successfully');
    return doc;
  } catch (error) {
    console.error('Error in generateReceipt:', error);
    throw error;
  }
};

export const printReceipt = async (sale) => {
  try {
    if (import.meta.env.DEV) console.log('Generating receipt for sale:', sale);
    const doc = await generateReceipt(sale);
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  } catch (error) {
    console.error('Error printing receipt:', error);
    alert('Failed to print receipt. Please try again.');
  }
};

export const downloadReceipt = async (sale) => {
  try {
    if (import.meta.env.DEV) console.log('Generating receipt for download:', sale);
    const doc = await generateReceipt(sale);
    doc.save(`receipt-${sale.id}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    alert('Failed to download receipt. Please try again.');
  }
}; 