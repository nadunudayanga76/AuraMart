import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order, returnAsBase64 = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [255, 0, 79]; // #ff004f
  const textColor = [51, 51, 51];
  const lightGray = [150, 150, 150];

  // --- HEADER ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...primaryColor);
  doc.text("AuraMart", 14, 25);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  doc.text("123 Commerce Avenue, Suite 100", 14, 32);
  doc.text("New York, NY 10001, USA", 14, 37);
  doc.text("support@auramart.com | +1 (555) 123-4567", 14, 42);

  // Invoice Title & Meta (Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(230, 230, 230);
  doc.text("INVOICE", pageWidth - 14, 25, { align: "right" });
  
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  const invoiceNumber = order.invoiceNumber || `INV-${(order._id || Math.random().toString(36).substring(2, 8)).substring(0, 6).toUpperCase()}`;
  doc.text(`Invoice Number:`, pageWidth - 50, 32, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(invoiceNumber, pageWidth - 14, 32, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.text(`Date of Issue:`, pageWidth - 50, 38, { align: "right" });
  doc.setFont("helvetica", "bold");
  const date = order.createdAt ? new Date(order.createdAt) : new Date();
  doc.text(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - 14, 38, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.text(`Status:`, pageWidth - 50, 44, { align: "right" });
  doc.setFont("helvetica", "bold");
  if (order.isPaid) {
    doc.setTextColor(34, 197, 94); // Green
    doc.text("PAID", pageWidth - 14, 44, { align: "right" });
  } else {
    doc.setTextColor(234, 179, 8); // Yellow/Orange
    doc.text("PENDING", pageWidth - 14, 44, { align: "right" });
  }

  // Divider Line
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 52, pageWidth - 14, 52);

  // --- BILLING TO ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...lightGray);
  doc.text("BILLED TO:", 14, 62);
  
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.text(order.shippingAddress?.fullName || order.user?.name || 'N/A', 14, 68);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(order.shippingAddress?.emailAddress || order.user?.email || 'N/A', 14, 73);
  if (order.shippingAddress?.address) {
    doc.text(order.shippingAddress.address, 14, 78);
    const cityZip = `${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || ''}`;
    doc.text(cityZip, 14, 83);
    doc.text(order.shippingAddress.country || '', 14, 88);
  }
  if (order.shippingAddress?.phone1) {
    doc.text(`Phone: ${order.shippingAddress.phone1}`, 14, 93);
  }

  // --- ITEMS TABLE ---
  const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
  const tableRows = [];

  if (order.orderItems && order.orderItems.length > 0) {
    order.orderItems.forEach(item => {
      const variantText = (item.selectedColor || item.selectedSize) 
        ? `\nVariant: ${[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}` 
        : '';
        
      tableRows.push([
          item.name + variantText,
          item.qty.toString(),
          `LKR ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          `LKR ${(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      ]);
    });
  }

  autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 105,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', halign: 'left' },
      styles: { fontSize: 9.5, cellPadding: 6, textColor: textColor },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
          0: { cellWidth: 'auto' },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'right', cellWidth: 40 },
          3: { halign: 'right', cellWidth: 45 }
      },
      drawBorder: false,
  });

  const finalY = doc.lastAutoTable.finalY || 105;

  // --- TOTALS SECTION ---
  const totalsXPos = pageWidth - 80;
  const valuesXPos = pageWidth - 14;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  
  let currentY = finalY + 15;
  
  doc.text("Subtotal:", totalsXPos, currentY, { align: "left" });
  doc.text(`LKR ${order.itemsPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, valuesXPos, currentY, { align: "right" });
  currentY += 8;
  
  doc.text("Shipping:", totalsXPos, currentY, { align: "left" });
  doc.text(`LKR ${order.shippingPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, valuesXPos, currentY, { align: "right" });
  currentY += 8;
  
  doc.text("Tax:", totalsXPos, currentY, { align: "left" });
  doc.text(`LKR ${order.taxPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, valuesXPos, currentY, { align: "right" });
  currentY += 10;

  // Grand Total Highlight
  doc.setFillColor(...primaryColor);
  doc.rect(totalsXPos - 5, currentY - 7, 90, 14, 'F');
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Grand Total:", totalsXPos, currentY + 2.5, { align: "left" });
  doc.text(`LKR ${order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, valuesXPos, currentY + 2.5, { align: "right" });

  // --- FOOTER NOTES ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...lightGray);
  doc.text("Payment is due within 15 days. Late payments are subject to fees.", 14, pageWidth > currentY ? currentY + 30 : 270);
  
  doc.setDrawColor(240, 240, 240);
  doc.line(14, 280, pageWidth - 14, 280);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business! - AuraMart Inc.", pageWidth / 2, 285, { align: "center" });

  if (returnAsBase64) {
    return doc.output('datauristring');
  } else {
    doc.save(`Invoice_${invoiceNumber}.pdf`);
  }
};
