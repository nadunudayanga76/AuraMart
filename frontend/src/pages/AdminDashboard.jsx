import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { FiUsers, FiShield, FiSlash, FiCheckCircle, FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

import ProductModal from '../components/ProductModal';
import CategoryModal from '../components/CategoryModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [banLoading, setBanLoading] = useState(null);
  
  // Inquiry State
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyingInquiry, setReplyingInquiry] = useState(false);
  
  // Reviews State
  const [allReviews, setAllReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Product Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');

  // Order Filter State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('All');
  const [orderDeliveryFilter, setOrderDeliveryFilter] = useState('All');
  const [orderDateFilter, setOrderDateFilter] = useState('All Time');

  // Finance Filter State
  const [financeTimeFilter, setFinanceTimeFilter] = useState('Last 30 Days');

  // Invoice Filter State
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceDateFilter, setInvoiceDateFilter] = useState('All Time');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, config);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const deleteProductHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}`, config);
        fetchProducts();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, config);
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateDeliveryStatusHandler = async (orderId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/deliverystatus`, { deliveryStatus: status }, config);
      fetchOrders();
    } catch (error) {
      alert('Failed to update delivery status');
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries`, config);
      setInquiries(data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedInquiry || !replyMessage.trim()) return;
    
    setReplyingInquiry(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries/${selectedInquiry._id}/reply`,
        { replyMessage },
        config
      );
      
      setInquiries(inquiries.map(inq => inq._id === data._id ? data : inq));
      setSelectedInquiry(null);
      setReplyMessage('');
      alert('Reply sent successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setReplyingInquiry(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/reviews/all`, config);
      setAllReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (productId, reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews/${reviewId}`, config);
        setAllReviews(allReviews.filter((r) => r._id !== reviewId));
        alert('Review deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  const handleDeleteInvoice = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this invoice/order? This action cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`, config);
        setOrders(orders.filter((o) => o._id !== orderId));
        alert('Invoice deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete invoice');
      }
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      if (activeTab === 'users' || activeTab === 'overview') fetchUsers();
      if (activeTab === 'orders' || activeTab === 'overview' || activeTab === 'finance' || activeTab === 'invoices') fetchOrders(); 
      if (activeTab === 'inquiries') fetchInquiries();
      if (activeTab === 'reviews') fetchReviews();
    }
    if (activeTab === 'products' || activeTab === 'overview' || activeTab === 'discounts') {
      fetchProducts();
    }
    if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab, userInfo]);

  const handleBanToggle = async (userId, currentStatus) => {
    setBanLoading(userId);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${userId}/ban`,
        { isBanned: !currentStatus },
        config
      );
      setUsers(users.map(u => u._id === userId ? { ...u, isBanned: !currentStatus } : u));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setBanLoading(null);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        alert('Category deleted successfully!');
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries/${id}`, config);
        setInquiries(inquiries.filter((inq) => inq._id !== id));
        alert('Inquiry deleted successfully!');
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting inquiry');
      }
    }
  };

  const handleRemoveDiscount = async (product) => {
    if (window.confirm(`Are you sure you want to remove the discount for "${product.name}"?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        // Reset price to original price and clear flash sale date
        const updatedData = {
          ...product,
          price: product.originalPrice || product.price,
          flashSaleEndDate: ''
        };
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${product._id}`, updatedData, config);
        alert('Discount removed successfully!');
        fetchProducts(); // Refresh products list
      } catch (err) {
        alert(err.response?.data?.message || 'Error removing discount');
      }
    }
  };


  const generateInvoiceDoc = (order) => {
    const doc = new jsPDF();
    const invoiceNumber = order.invoiceNumber || `INV-${order._id.substring(0, 6).toUpperCase()}`;
    const primaryColor = [255, 0, 79];
    const textColor = [51, 65, 85];
    const lightGray = [156, 163, 175];
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- HEADER ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("AuraMart Inc.", pageWidth - 14, 20, { align: "right" });
    doc.text("contact@auramart.com", pageWidth - 14, 26, { align: "right" });
    doc.text("+94 11 234 5678", pageWidth - 14, 32, { align: "right" });

    // --- INVOICE DETAILS ---
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice Number:`, 14, 50);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceNumber, 50, 50);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Date Issued:`, 14, 56);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 50, 56);

    // --- BILLING TO ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO:", 14, 68);
    
    doc.setFontSize(11);
    doc.text(order.shippingAddress?.fullName || order.user?.name || 'N/A', 14, 75);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(order.shippingAddress?.emailAddress || order.user?.email || 'N/A', 14, 80);
    if (order.shippingAddress?.address) {
      doc.text(order.shippingAddress.address, 14, 85);
      const cityZip = `${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || ''}`;
      doc.text(cityZip, 14, 90);
      doc.text(order.shippingAddress.country || '', 14, 95);
    }
    if (order.shippingAddress?.phone1) {
      doc.text(`Phone: ${order.shippingAddress.phone1}`, 14, 100);
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
        startY: 110,
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

    const finalY = doc.lastAutoTable.finalY || 110;

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

    // --- STATUS BADGE (Paid vs Pending) ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    if (order.isPaid) {
      doc.setTextColor(22, 163, 74); // Green
      doc.text("PAID", 14, currentY);
    } else {
      doc.setTextColor(234, 179, 8); // Yellow
      doc.text("PENDING", 14, currentY);
    }

    // --- FOOTER NOTES ---
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...lightGray);
    doc.text("Payment is due within 15 days. Late payments are subject to fees.", 14, pageWidth > currentY ? currentY + 30 : 270);
    
    doc.setDrawColor(240, 240, 240);
    doc.line(14, 280, pageWidth - 14, 280);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business! - AuraMart Inc.", pageWidth / 2, 285, { align: "center" });

    return { doc, invoiceNumber };
  };

  const downloadInvoice = (order) => {
    try {
      const { doc, invoiceNumber } = generateInvoiceDoc(order);
      doc.save(`Invoice_${invoiceNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error generating PDF: ' + err.message);
    }
  };

  const previewInvoice = (order) => {
    try {
      const { doc } = generateInvoiceDoc(order);
      const pdfBlobUrl = doc.output('bloburl');
      setPreviewPdfUrl(pdfBlobUrl);
    } catch (err) {
      console.error(err);
      alert('Error previewing PDF: ' + err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    // 1. Search Query
    const searchLower = orderSearchQuery.toLowerCase();
    const matchesSearch = 
      order._id.toLowerCase().includes(searchLower) ||
      (order.user?.name || '').toLowerCase().includes(searchLower) ||
      (order.user?.email || '').toLowerCase().includes(searchLower);

    // 2. Payment Status
    const matchesPayment = 
      orderPaymentFilter === 'All' || 
      (orderPaymentFilter === 'Paid' && order.isPaid) ||
      (orderPaymentFilter === 'Pending' && !order.isPaid);

    // 3. Delivery Status
    const matchesDelivery = 
      orderDeliveryFilter === 'All' || 
      order.deliveryStatus === orderDeliveryFilter;

    // 4. Date Filter
    let matchesDate = true;
    if (orderDateFilter !== 'All Time') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      if (orderDateFilter === 'Today') {
        matchesDate = orderDate.toDateString() === today.toDateString();
      } else if (orderDateFilter === 'Last 7 Days') {
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 7);
        matchesDate = orderDate >= last7;
      } else if (orderDateFilter === 'This Month') {
        matchesDate = orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
      }
    }

    return matchesSearch && matchesPayment && matchesDelivery && matchesDate;
  });

  // --- FINANCE COMPUTATIONS ---
  const filteredFinanceOrders = orders.filter(order => {
    if (financeTimeFilter === 'All Time') return true;
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    if (financeTimeFilter === 'Today') {
      return orderDate.toDateString() === today.toDateString();
    }
    if (financeTimeFilter === 'This Week') {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 7);
      return orderDate >= last7;
    }
    if (financeTimeFilter === 'This Month') {
      return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
    }
    if (financeTimeFilter === 'This Year') {
      return orderDate.getFullYear() === today.getFullYear();
    }
    if (financeTimeFilter === 'Last 30 Days') {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);
      return orderDate >= last30;
    }
    return true;
  });

  const grossRevenue = filteredFinanceOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const shippingRevenue = filteredFinanceOrders.reduce((acc, o) => acc + (o.shippingPrice || 0), 0);
  
  // Calculate refunds (cancelled orders)
  const refunds = filteredFinanceOrders
    .filter(o => o.deliveryStatus === 'Cancelled')
    .reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  const netRevenue = grossRevenue - refunds;
  const pendingPayments = filteredFinanceOrders.filter(o => !o.isPaid && o.deliveryStatus !== 'Cancelled').reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const paidOrdersCount = filteredFinanceOrders.filter(o => o.isPaid).length;
  const avgOrderValue = paidOrdersCount > 0 ? grossRevenue / paidOrdersCount : 0;

  // Chart Data preparation (grouping by date)
  const chartDataMap = {};
  filteredFinanceOrders.forEach(order => {
    if (order.deliveryStatus !== 'Cancelled') {
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!chartDataMap[dateStr]) chartDataMap[dateStr] = 0;
      chartDataMap[dateStr] += (order.totalPrice || 0);
    }
  });
  const chartData = Object.keys(chartDataMap).map(date => ({
    date,
    Revenue: chartDataMap[date]
  }));
  // -----------------------------

  const exportTransactionsToCSV = () => {
    if (filteredFinanceOrders.length === 0) {
      alert("No transactions to export for this time period.");
      return;
    }

    const headers = ["Transaction ID", "Date", "Customer", "Amount (LKR)", "Payment Method", "Status", "Delivery"];
    
    const csvRows = [headers.join(',')];
    
    filteredFinanceOrders.forEach(order => {
      const id = order.paymentResult?.id || `txn_${order._id}`;
      const date = new Date(order.createdAt).toLocaleString('en-US').replace(/,/g, '');
      const customer = order.user?.name || 'Unknown';
      const amount = order.totalPrice;
      const method = order.paymentMethod;
      const status = order.isPaid ? 'Completed' : 'Pending';
      const delivery = order.deliveryStatus || 'Processing';
      
      csvRows.push(`${id},${date},${customer},${amount},${method},${status},${delivery}`);
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions_${financeTimeFilter.replace(/ /g, '_')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- INVOICES COMPUTATIONS ---
  const filteredInvoices = orders.filter(order => {
    // 1. Search Query
    const searchLower = invoiceSearchQuery.toLowerCase();
    const invoiceNumber = order.invoiceNumber || `INV-${order._id.substring(0, 6).toUpperCase()}`;
    const matchesSearch = 
      invoiceNumber.toLowerCase().includes(searchLower) ||
      (order.user?.name || '').toLowerCase().includes(searchLower) ||
      (order.user?.email || '').toLowerCase().includes(searchLower);

    // 2. Status Filter
    const matchesStatus = 
      invoiceStatusFilter === 'All' || 
      (invoiceStatusFilter === 'Paid' && order.isPaid) ||
      (invoiceStatusFilter === 'Pending' && !order.isPaid);

    // 3. Date Filter
    let matchesDate = true;
    if (invoiceDateFilter !== 'All Time') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      if (invoiceDateFilter === 'Today') {
        matchesDate = orderDate.toDateString() === today.toDateString();
      } else if (invoiceDateFilter === 'This Week') {
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 7);
        matchesDate = orderDate >= last7;
      } else if (invoiceDateFilter === 'This Month') {
        matchesDate = orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportInvoicesToCSV = () => {
    if (filteredInvoices.length === 0) {
      alert("No invoices to export.");
      return;
    }

    const headers = ["Invoice Number", "Date", "Customer Name", "Customer Email", "Amount (LKR)", "Status"];
    const csvRows = [headers.join(',')];
    
    filteredInvoices.forEach(order => {
      const invNum = order.invoiceNumber || `INV-${order._id.substring(0, 6).toUpperCase()}`;
      const date = new Date(order.createdAt).toLocaleDateString('en-US').replace(/,/g, '');
      const customer = order.user?.name || 'Unknown';
      const email = order.user?.email || 'N/A';
      const amount = order.totalPrice;
      const status = order.isPaid ? 'Paid' : 'Pending';
      
      csvRows.push(`${invNum},${date},${customer},${email},${amount},${status}`);
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `invoices_${invoiceDateFilter.replace(/ /g, '_')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // --- OVERVIEW TAB CALCULATIONS ---
  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  
  const pendingOrdersCount = orders.filter(o => !o.isDelivered && !o.isPaid).length;
  const processingOrdersCount = orders.filter(o => o.isPaid && !o.isDelivered).length;
  const deliveredOrdersCount = orders.filter(o => o.isDelivered).length;
  const orderStatusData = [
    { name: 'Pending', value: pendingOrdersCount, color: '#f59e0b' },
    { name: 'Processing', value: processingOrdersCount, color: '#3b82f6' },
    { name: 'Delivered', value: deliveredOrdersCount, color: '#10b981' }
  ].filter(d => d.value > 0);

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    return d;
  }).reverse();

  const overviewTrendData = last7Days.map(date => {
    const dayOrders = orders.filter(o => {
      const oDate = new Date(o.createdAt);
      return oDate.getDate() === date.getDate() && oDate.getMonth() === date.getMonth() && oDate.getFullYear() === date.getFullYear();
    });
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0)
    };
  });

  const recentPendingOrders = orders.filter(o => !o.isDelivered).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const lowStockProducts = products.filter(p => p.countInStock > 0 && p.countInStock <= 5);
  const outOfStockProducts = products.filter(p => p.countInStock === 0);
  
  const topSellingProducts = [...products].sort((a,b) => (b.orders || 0) - (a.orders || 0)).slice(0, 4);

  // -----------------------------

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-transparent flex flex-col gap-1 pr-4">
              <nav className="flex flex-col space-y-1">
                
                {/* Dashboard */}
                <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                  Dashboard
                </button>

                {/* All orders */}
                <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5 absolute -ml-10" style={{position:'relative', marginLeft:0}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                  All orders
                </button>

                {/* Products */}
                <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  Products
                </button>

                {/* Manage Categories */}
                <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                  Categories
                </button>

                {/* Invoices */}
                <button onClick={() => setActiveTab('invoices')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'invoices' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Invoices
                </button>

                {/* Finance */}
                <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'finance' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Finance
                </button>

                {/* Customers */}
                <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'users' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  Customers
                </button>

                {/* Inquiries */}
                <button onClick={() => setActiveTab('inquiries')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'inquiries' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Inquiries
                </button>

                {/* Reviews */}
                <button onClick={() => setActiveTab('reviews')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'reviews' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                  Reviews
                </button>

                {/* Discounts */}
                <button onClick={() => setActiveTab('discounts')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'discounts' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                  Discounts
                </button>

                {/* Reports */}
                <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'reports' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  Reports
                </button>
              </nav>
              
              <hr className="my-4 border-slate-200" />
              
              {/* Settings */}
              <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Settings
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
              
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex justify-between items-end mb-2">
                     <div>
                       <h3 className="text-2xl font-black text-gray-900">Dashboard Overview</h3>
                       <p className="text-gray-500 text-sm mt-1">Here is what's happening with your store today.</p>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => setActiveTab('products')} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-sm transition cursor-pointer flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                           Add Product
                        </button>
                     </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              </div>
                              <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Revenue</span>
                           </div>
                           <h4 className="text-2xl font-black text-gray-900">LKR {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                              </div>
                              <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Orders</span>
                           </div>
                           <h4 className="text-2xl font-black text-gray-900">{totalOrdersCount}</h4>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                              </div>
                              <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Avg. Order Value</span>
                           </div>
                           <h4 className="text-2xl font-black text-gray-900">LKR {averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                              </div>
                              <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Users</span>
                           </div>
                           <h4 className="text-2xl font-black text-gray-900">{users.length}</h4>
                        </div>
                     </div>
                  </div>
                  
                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Trend Area Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                       <h4 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (Last 7 Days)</h4>
                       <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={overviewTrendData} margin={{ top: 5, right: 0, left: 20, bottom: 5 }}>
                                <defs>
                                   <linearGradient id="colorOverviewRevenue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `LKR ${value.toLocaleString()}`} />
                                <RechartsTooltip 
                                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                   formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorOverviewRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    {/* Order Status Donut Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                       <h4 className="text-lg font-bold text-gray-900 mb-2">Orders by Status</h4>
                       {orderStatusData.length > 0 ? (
                         <div className="flex-grow flex items-center justify-center relative min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                  <Pie
                                     data={orderStatusData}
                                     innerRadius={60}
                                     outerRadius={90}
                                     paddingAngle={5}
                                     dataKey="value"
                                  >
                                     {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                     ))}
                                  </Pie>
                                  <RechartsTooltip 
                                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  />
                                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                               </PieChart>
                            </ResponsiveContainer>
                         </div>
                       ) : (
                         <div className="flex-grow flex items-center justify-center text-gray-400">
                            No active orders
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Actionable Insights Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Pending Orders */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                       <div className="flex justify-between items-center mb-6">
                          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                             <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             Action Needed: Pending Orders
                          </h4>
                          <button onClick={() => setActiveTab('orders')} className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
                       </div>
                       
                       <div className="space-y-4">
                         {recentPendingOrders.length > 0 ? (
                           recentPendingOrders.map(order => (
                             <div key={order._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                <div>
                                   <div className="font-bold text-sm text-gray-900">{order.user?.name || 'Guest'}</div>
                                   <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                   <div className="font-bold text-sm text-gray-900">LKR {order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                   <span className="text-[10px] uppercase tracking-wider font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md mt-1 inline-block">
                                     {order.isPaid ? 'Processing' : 'Pending Payment'}
                                   </span>
                                </div>
                             </div>
                           ))
                         ) : (
                           <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl">No pending orders. You're all caught up!</div>
                         )}
                       </div>
                    </div>

                    {/* Inventory Alerts & Top Products */}
                    <div className="space-y-6">
                       {/* Inventory Alerts */}
                       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                             <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                Inventory Alerts
                             </h4>
                             <button onClick={() => setActiveTab('products')} className="text-indigo-600 text-sm font-bold hover:underline">Manage</button>
                          </div>
                          
                          <div className="space-y-3">
                             {outOfStockProducts.length > 0 && (
                               <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
                                 <span className="text-sm font-bold text-red-800">{outOfStockProducts.length} Product(s) Out of Stock</span>
                               </div>
                             )}
                             {lowStockProducts.length > 0 ? (
                               lowStockProducts.slice(0, 4).map(product => (
                                 <div key={product._id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                                    <span className="text-gray-700 truncate w-2/3" title={product.name}>{product.name}</span>
                                    <span className="font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">Only {product.countInStock} left</span>
                                 </div>
                               ))
                             ) : (
                               outOfStockProducts.length === 0 && <div className="text-sm text-green-600 font-medium p-3 bg-green-50 rounded-lg border border-green-100">All products have healthy stock levels.</div>
                             )}
                          </div>
                       </div>

                       {/* Top Products */}
                       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                             <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                             Trending Products
                          </h4>
                          <div className="space-y-3">
                            {topSellingProducts.length > 0 ? (
                              topSellingProducts.map((product, index) => (
                                <div key={product._id} className="flex items-center gap-4 group">
                                   <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">{index + 1}</div>
                                   <div className="flex-1 truncate">
                                      <div className="text-sm font-bold text-gray-900 truncate" title={product.name}>{product.name}</div>
                                      <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <span className="text-yellow-400">★</span> {product.rating} ({product.numReviews} reviews)
                                      </div>
                                   </div>
                                   <div className="text-sm font-bold text-indigo-600">LKR {product.price?.toLocaleString()}</div>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500">No product data available.</div>
                            )}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'inquiries' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      Customer Inquiries
                    </h3>
                    <button onClick={fetchInquiries} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition cursor-pointer text-sm">
                      <svg className={`w-4 h-4 ${loadingInquiries ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      Refresh
                    </button>
                  </div>
                  
                  {loadingInquiries ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : inquiries.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                       <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                       <p className="text-gray-500 font-medium">No inquiries found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b-2 border-gray-200 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="py-4 px-6 font-semibold">Date & Time</th>
                            <th className="py-4 px-6 font-semibold">Customer</th>
                            <th className="py-4 px-6 font-semibold">Product</th>
                            <th className="py-4 px-6 font-semibold">Status</th>
                            <th className="py-4 px-6 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inquiries.map((inquiry) => (
                            <tr key={inquiry._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                              <td className="py-4 px-6">
                                <div className="text-sm font-medium text-gray-900">{new Date(inquiry.createdAt).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleTimeString()}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-bold text-gray-900 text-sm">{inquiry.name}</div>
                                <div className="text-xs text-gray-500">{inquiry.email}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-900 truncate max-w-[200px]" title={inquiry.productName}>{inquiry.productName}</div>
                                <div className="text-xs text-gray-500 uppercase">ID: {inquiry.product}</div>
                              </td>
                              <td className="py-4 px-6">
                                 {inquiry.isReplied ? (
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                      <FiCheckCircle size={12}/> Replied
                                    </span>
                                 ) : (
                                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                      <FiAlertTriangle size={12}/> Pending
                                    </span>
                                 )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                 <div className="flex justify-end gap-2">
                                   <button 
                                     onClick={() => setSelectedInquiry(inquiry)}
                                     className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition cursor-pointer"
                                   >
                                     View & Reply
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteInquiry(inquiry._id)}
                                     className="inline-flex items-center justify-center p-2 bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition shadow-sm cursor-pointer"
                                     title="Delete Inquiry"
                                   >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                   </button>
                                 </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                      Customer Reviews
                    </h3>
                    <button onClick={fetchReviews} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition cursor-pointer text-sm">
                      <svg className={`w-4 h-4 ${loadingReviews ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      Refresh
                    </button>
                  </div>
                  
                  {loadingReviews ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : allReviews.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                       <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                       <p className="text-gray-500 font-medium">No reviews found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b-2 border-gray-200 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="py-4 px-6 font-semibold">Date</th>
                            <th className="py-4 px-6 font-semibold">Product</th>
                            <th className="py-4 px-6 font-semibold">Customer</th>
                            <th className="py-4 px-6 font-semibold">Rating & Comment</th>
                            <th className="py-4 px-6 font-semibold text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allReviews.map((review) => (
                            <tr key={review._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                              <td className="py-4 px-6 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{new Date(review.createdAt).toLocaleDateString()}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm font-bold text-gray-900 truncate max-w-[200px]" title={review.productName}>{review.productName}</div>
                                <div className="text-xs text-gray-500 uppercase">ID: {review.productId}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-900">{review.name}</div>
                              </td>
                              <td className="py-4 px-6 max-w-xs">
                                <div className="flex items-center gap-1 mb-1 text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                  ))}
                                </div>
                                <p className="text-sm text-gray-700 italic truncate" title={review.comment}>"{review.comment}"</p>
                              </td>
                              <td className="py-4 px-6 text-center">
                                 <button 
                                   onClick={() => handleDeleteReview(review.productId, review._id)}
                                   className="inline-flex items-center justify-center p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition cursor-pointer"
                                   title="Delete Review"
                                 >
                                   <FiTrash2 size={16} />
                                 </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Products</h3>
                    <button 
                      onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                      className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-red-600 transition cursor-pointer"
                    >
                      + Add New Product
                    </button>
                  </div>
                  
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : products.length === 0 ? (
                    <p className="text-gray-500 text-center py-20">No products found.</p>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm items-center justify-between">
                        <div className="flex-1 w-full md:max-w-md relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Search by product name or brand..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full md:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 text-gray-700"
                          >
                            <option value="All">All Categories</option>
                            {[...new Set(products.map(p => p.category))].filter(Boolean).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <select 
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                            className="w-full md:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 text-gray-700"
                          >
                            <option value="All">All Stock</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </div>
                      </div>

                      <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50">
                            <tr className="border-b border-gray-200 text-gray-600 text-sm">
                              <th className="py-4 px-6 font-semibold">Image</th>
                              <th className="py-4 px-6 font-semibold">Name</th>
                              <th className="py-4 px-6 font-semibold">Price</th>
                              <th className="py-4 px-6 font-semibold">Category</th>
                              <th className="py-4 px-6 font-semibold">Brand</th>
                              <th className="py-4 px-6 font-semibold">Status</th>
                              <th className="py-4 px-6 font-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.filter(p => {
                              const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
                              const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
                              const matchesStock = filterStock === 'All' ? true : filterStock === 'In Stock' ? p.countInStock > 0 : p.countInStock === 0;
                              return matchesSearch && matchesCategory && matchesStock;
                            }).length === 0 ? (
                              <tr>
                                <td colSpan="7" className="py-12 text-center text-gray-500 font-medium">No products match your filters.</td>
                              </tr>
                            ) : products.filter(p => {
                              const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
                              const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
                              const matchesStock = filterStock === 'All' ? true : filterStock === 'In Stock' ? p.countInStock > 0 : p.countInStock === 0;
                              return matchesSearch && matchesCategory && matchesStock;
                            }).map((product) => (
                            <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-6">
                                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm" />
                              </td>
                              <td className="py-4 px-6 font-bold text-gray-800 text-sm">{product.name}</td>
                              <td className="py-4 px-6 font-bold text-primary text-sm">LKR {product.price.toFixed(2)}</td>
                              <td className="py-4 px-6 text-sm text-gray-600">{product.category}</td>
                              <td className="py-4 px-6 text-sm text-gray-600">{product.brand}</td>
                              <td className="py-4 px-6">
                                {product.countInStock > 0 ? (
                                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-full text-xs font-semibold">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> In Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg> Out of Stock
                                  </span>
                                )}
                              </td>
                               <td className="py-4 px-6 text-center">
                                 <div className="flex gap-2 justify-center">
                                   <button 
                                     onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                     className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 cursor-pointer transition-colors font-medium text-xs px-4"
                                   >Edit</button>
                                   <button 
                                     onClick={() => deleteProductHandler(product._id)}
                                     className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 cursor-pointer transition-colors font-medium text-xs px-4 flex items-center gap-1"
                                   >
                                     <FiTrash2 className="w-3 h-3" /> Delete
                                   </button>
                                 </div>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </>
                 )}

                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Categories</h3>
                    <button 
                      onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
                      className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-red-600 transition cursor-pointer"
                    >
                      + Add New Category
                    </button>
                  </div>
                  
                  {loadingCategories ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : categories.length === 0 ? (
                    <p className="text-gray-500 text-center py-20">No categories found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories.map((category) => (
                        <div key={category._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                          <div className={`h-32 ${category.heroBg} relative`}>
                            <img src={category.heroImage} alt={category.name} className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                              <h4 className="text-white font-bold text-lg">{category.heroTitle}</h4>
                            </div>
                          </div>
                          <div className="p-4 flex items-center justify-between border-b border-gray-100">
                             <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full ${category.homepageColor} flex items-center justify-center border border-gray-200`}>
                                 <img src={category.homepageImage} alt="icon" className="w-full h-full rounded-full object-cover" />
                               </div>
                               <div>
                                 <h5 className="font-bold text-gray-900">{category.name}</h5>
                                 <span className="text-xs text-gray-500">{category.slug}</span>
                               </div>
                             </div>
                             <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{category.subCategories.length} Subcats</span>
                          </div>
                          <div className="p-4 bg-gray-50 flex gap-2 justify-end">
                            <button 
                              onClick={() => { setEditingCategory(category); setIsCategoryModalOpen(true); }}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-bold text-sm transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(category._id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded font-bold text-sm transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <CategoryModal 
                    isOpen={isCategoryModalOpen} 
                    onClose={() => setIsCategoryModalOpen(false)} 
                    category={editingCategory}
                    onCategorySaved={fetchCategories}
                  />
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                      Order Management
                    </h3>
                  </div>
                  
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Filter Bar */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                        <div className="w-full md:w-1/3 relative">
                          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                          <input 
                            type="text" 
                            placeholder="Search by Order ID, Name or Email"
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                        <div className="w-full md:w-auto flex flex-wrap gap-3">
                          <select 
                            value={orderDateFilter}
                            onChange={(e) => setOrderDateFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50 text-gray-700"
                          >
                            <option value="All Time">All Time</option>
                            <option value="Today">Today</option>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="This Month">This Month</option>
                          </select>
                          <select 
                            value={orderPaymentFilter}
                            onChange={(e) => setOrderPaymentFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50 text-gray-700"
                          >
                            <option value="All">All Payments</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <select 
                            value={orderDeliveryFilter}
                            onChange={(e) => setOrderDeliveryFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50 text-gray-700"
                          >
                            <option value="All">All Deliveries</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {filteredOrders.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                           <p className="text-gray-500 font-medium">No orders match your filters.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50">
                              <tr className="border-b-2 border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="py-3 px-4 font-semibold">Order ID</th>
                                <th className="py-3 px-4 font-semibold">Customer</th>
                                <th className="py-3 px-4 font-semibold">Date</th>
                                <th className="py-3 px-4 font-semibold">Total</th>
                                <th className="py-3 px-4 font-semibold">Payment</th>
                                <th className="py-3 px-4 font-semibold">Delivery</th>
                                <th className="py-3 px-4 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredOrders.map((order) => (
                                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                  <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                    #{order._id.substring(0, 8).toUpperCase()}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="font-bold text-gray-900 text-sm block">{order.user?.name || 'Unknown User'}</span>
                                    <span className="text-xs text-gray-500">{order.user?.email || 'N/A'}</span>
                                  </td>
                                  <td className="py-4 px-4 text-gray-600 text-sm font-medium">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="py-4 px-4 font-black text-gray-900 text-sm">
                                    LKR {order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-4 px-4">
                                     {order.isPaid ? (
                                       <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                          <FiCheckCircle size={12}/> Paid
                                       </span>
                                     ) : (
                                       <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold w-fit block">
                                          Pending
                                       </span>
                                     )}
                                  </td>
                                  <td className="py-4 px-4">
                                    <select 
                                      value={order.deliveryStatus || 'Processing'}
                                      onChange={(e) => updateDeliveryStatusHandler(order._id, e.target.value)}
                                      className={`px-2.5 py-1 rounded text-xs font-bold outline-none cursor-pointer border ${
                                        order.deliveryStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                        order.deliveryStatus === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        order.deliveryStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-purple-50 text-purple-700 border-purple-200'
                                      }`}
                                    >
                                      <option value="Processing">Processing</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  </td>
                                  <td className="py-4 px-4">
                                     <button 
                                       onClick={() => setSelectedOrder(order)}
                                       className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded text-xs font-bold transition cursor-pointer"
                                     >
                                       View Details
                                     </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Order Details Modal */}
              {selectedOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold tracking-wider">
                          {selectedOrder.invoiceNumber || `#${selectedOrder._id.substring(0, 8).toUpperCase()}`}
                        </span>
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto bg-white">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                          <div className="border border-gray-100 rounded-xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Customer Info</h3>
                            <p className="font-bold text-gray-900">{selectedOrder.user?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
                          </div>
                          
                          <div className="border border-gray-100 rounded-xl p-5 shadow-sm bg-blue-50/30">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Order Date & Time</h3>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">
                                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                  {new Date(selectedOrder.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="border border-gray-100 rounded-xl p-5 shadow-sm bg-gray-50/50">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Payment Summary</h3>
                            <div className="space-y-2 text-sm font-medium">
                              <div className="flex justify-between"><span>Total</span><span className="text-primary font-black">LKR {selectedOrder.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                            </div>
                          </div>
                        </div>
                        <div className="lg:col-span-2">
                          <div className="border border-gray-100 rounded-xl shadow-sm h-full flex flex-col">
                            <div className="p-5 overflow-y-auto space-y-4">
                              {selectedOrder.orderItems?.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-3 border border-gray-100 rounded-lg">
                                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                                  <div className="flex-1">
                                    <h4 className="font-bold text-sm">{item.name}</h4>
                                    <p className="text-xs text-gray-500">Qty: {item.qty} × LKR {item.price?.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'finance' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Financial Overview
                    </h3>
                    <div className="flex items-center gap-4">
                      <select 
                        value={financeTimeFilter}
                        onChange={(e) => setFinanceTimeFilter(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium outline-none shadow-sm cursor-pointer"
                      >
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="This Year">This Year</option>
                        <option value="All Time">All Time</option>
                      </select>
                      <button onClick={fetchOrders} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition cursor-pointer text-sm shadow-sm">
                        <svg className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Refresh
                      </button>
                    </div>
                  </div>
                  
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      {/* Financial Breakdown Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Gross Revenue</div>
                            <div className="text-2xl font-black text-gray-900 mb-1">
                               LKR {grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">Total amount collected</div>
                         </div>
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm bg-green-50/30">
                            <div className="text-green-600 font-bold uppercase text-xs tracking-wider mb-2 flex items-center justify-between">
                              Net Revenue
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </div>
                            <div className="text-2xl font-black text-green-700 mb-1">
                               LKR {netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-green-600/70 mt-2">Gross - Refunds</div>
                         </div>
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Refunds / Cancelled</div>
                            <div className="text-2xl font-black text-red-500 mb-1">
                               LKR {refunds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">From cancelled orders</div>
                         </div>
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="text-primary font-bold uppercase text-xs tracking-wider mb-2">Avg. Order Value</div>
                            <div className="text-2xl font-black text-primary mb-1">
                               LKR {avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-primary/60 mt-2">Per paid order</div>
                         </div>
                      </div>

                      {/* Revenue Chart */}
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                          Revenue Trend
                        </h4>
                        <div className="h-[300px] w-full">
                          {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff004f" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ff004f" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dx={-10} tickFormatter={(value) => `LKR ${(value/1000).toFixed(0)}k`} />
                                <RechartsTooltip 
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="Revenue" stroke="#ff004f" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                              <p className="text-gray-400 font-medium">No revenue data for selected period</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent Transactions */}
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-gray-900">Recent Transactions</h4>
                        <button 
                          onClick={exportTransactionsToCSV}
                          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs shadow-sm"
                        >
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          Export CSV
                        </button>
                      </div>
                      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                              <th className="py-3 px-4 font-semibold">Transaction ID</th>
                              <th className="py-3 px-4 font-semibold">Date & Time</th>
                              <th className="py-3 px-4 font-semibold">Amount</th>
                              <th className="py-3 px-4 font-semibold">Payment Method</th>
                              <th className="py-3 px-4 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredFinanceOrders.slice(0, 10).map((order) => (
                              <tr key={order._id} className="border-b border-gray-50 hover:bg-blue-50/50 transition">
                                <td className="py-3 px-4 text-sm font-medium text-gray-700">
                                  {order.paymentResult?.id || `txn_${order._id.substring(0, 8)}`}
                                </td>
                                <td className="py-3 px-4 text-xs text-gray-500">
                                  {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </td>
                                <td className="py-3 px-4 font-bold text-sm text-gray-900">
                                  LKR {order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600 flex items-center gap-2">
                                  {order.paymentMethod === 'Stripe' ? (
                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Stripe</span>
                                  ) : (
                                    order.paymentMethod
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                   {order.isPaid ? (
                                     <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[11px] font-bold">Completed</span>
                                   ) : (
                                     <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-[11px] font-bold">Pending</span>
                                   )}
                                </td>
                              </tr>
                            ))}
                            {filteredFinanceOrders.length === 0 && (
                              <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-400 text-sm font-medium">No transactions found for the selected period.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
              {activeTab === 'invoices' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      Invoices & Billing
                    </h3>
                    <div className="flex gap-3">
                      <button 
                        onClick={exportInvoicesToCSV}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold transition cursor-pointer text-sm shadow-sm"
                      >
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Export CSV
                      </button>
                      <button onClick={fetchOrders} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition cursor-pointer text-sm shadow-sm">
                        <svg className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-grow relative">
                      <input 
                        type="text" 
                        placeholder="Search Invoice #, Name, Email..." 
                        value={invoiceSearchQuery}
                        onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition text-sm"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <select 
                        value={invoiceStatusFilter}
                        onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm font-medium cursor-pointer"
                      >
                        <option value="All">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                      
                      <select 
                        value={invoiceDateFilter}
                        onChange={(e) => setInvoiceDateFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm font-medium cursor-pointer"
                      >
                        <option value="All Time">All Time</option>
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                      </select>
                    </div>
                  </div>
                  
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredInvoices.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                       <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       <p className="text-gray-500 font-medium">No invoices found matching your criteria.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b-2 border-gray-200 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="py-4 px-6 font-semibold">Invoice #</th>
                            <th className="py-4 px-6 font-semibold">Date</th>
                            <th className="py-4 px-6 font-semibold">Customer</th>
                            <th className="py-4 px-6 font-semibold">Amount</th>
                            <th className="py-4 px-6 font-semibold">Status</th>
                            <th className="py-4 px-6 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInvoices.map((order) => (
                            <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                              <td className="py-4 px-6 text-sm font-bold text-indigo-600">
                                {order.invoiceNumber || `INV-${order._id.substring(0, 6).toUpperCase()}`}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 text-sm">{order.user?.name || 'Unknown User'}</span>
                                  <span className="text-xs text-gray-500">{order.user?.email || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 font-black text-gray-900 text-sm">
                                LKR {order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-6">
                                 {order.isPaid ? (
                                   <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Paid
                                   </span>
                                 ) : (
                                   <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Pending
                                   </span>
                                 )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                 <div className="flex justify-end gap-2">
                                   <button 
                                     onClick={() => previewInvoice(order)}
                                     className="inline-flex items-center justify-center p-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition shadow-sm cursor-pointer"
                                     title="Preview PDF"
                                   >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                   </button>
                                   <button 
                                     onClick={() => downloadInvoice(order)}
                                     className="inline-flex items-center justify-center p-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition shadow-sm cursor-pointer"
                                     title="Download PDF"
                                   >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteInvoice(order._id)}
                                     className="inline-flex items-center justify-center p-2 bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition shadow-sm cursor-pointer"
                                     title="Delete Invoice"
                                   >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                   </button>
                                 </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FiUsers className="text-primary" /> Registered Users
                    </h3>
                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {users.length} user{users.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <p className="text-gray-500 text-center py-20">No users found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b-2 border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="py-3 font-semibold">User</th>
                            <th className="py-3 font-semibold">Email</th>
                            <th className="py-3 font-semibold">Role</th>
                            <th className="py-3 font-semibold">Status</th>
                            <th className="py-3 font-semibold">Joined</th>
                            <th className="py-3 font-semibold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user._id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${user.isBanned ? 'opacity-60 bg-red-50/40' : ''}`}>
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                    <img
                                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=EF4444&color=fff&bold=true`}
                                      alt={user.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=EF4444&color=fff&bold=true`; }}
                                    />
                                  </div>
                                  <span className="font-semibold text-gray-900">{user.name}</span>
                                </div>
                              </td>
                              <td className="py-4 text-gray-600 text-sm">{user.email}</td>
                              <td className="py-4">
                                {user.isAdmin ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                    <FiShield size={12} /> Admin
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                                    Customer
                                  </span>
                                )}
                              </td>
                              <td className="py-4">
                                {user.isBanned ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                    <FiSlash size={12} /> Banned
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    <FiCheckCircle size={12} /> Active
                                  </span>
                                )}
                              </td>
                              <td className="py-4 text-gray-500 text-sm">
                                {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="py-4 text-center">
                                {user.isAdmin ? (
                                  <span className="text-xs text-gray-400 italic">Protected</span>
                                ) : (
                                  <button
                                    onClick={() => handleBanToggle(user._id, user.isBanned)}
                                    disabled={banLoading === user._id}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                      user.isBanned
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                    } disabled:opacity-50`}
                                  >
                                    {banLoading === user._id ? (
                                      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                                    ) : user.isBanned ? (
                                      <><FiCheckCircle size={13} /> Unban</>
                                    ) : (
                                      <><FiSlash size={13} /> Ban</>
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex justify-between items-end mb-2">
                     <div>
                       <h3 className="text-2xl font-black text-gray-900">Comprehensive Reports</h3>
                       <p className="text-gray-500 text-sm mt-1">Analyze your store's performance and generate detailed reports.</p>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={exportTransactionsToCSV} className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg font-bold text-sm transition cursor-pointer flex items-center gap-2 shadow-sm shadow-primary/30">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                           Export Report Data
                        </button>
                     </div>
                  </div>

                  {/* Key Metrics Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {/* Total Revenue */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           </div>
                           <div className="min-w-0">
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Sales</p>
                             <h4 className="text-xl font-black text-gray-900 truncate" title={`LKR ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}>LKR {grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                           </div>
                        </div>
                     </div>
                     
                     {/* Products Sold */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                           </div>
                           <div className="min-w-0">
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Items Sold</p>
                             <h4 className="text-xl font-black text-gray-900">{orders.reduce((acc, o) => acc + (o.orderItems?.reduce((iAcc, item) => iAcc + item.qty, 0) || 0), 0)}</h4>
                           </div>
                        </div>
                     </div>

                     {/* Total Customers */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                              <FiUsers className="w-6 h-6" />
                           </div>
                           <div className="min-w-0">
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">New Customers</p>
                             <h4 className="text-xl font-black text-gray-900">{users.length}</h4>
                           </div>
                        </div>
                     </div>

                     {/* Refunds */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           </div>
                           <div className="min-w-0">
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Refunds</p>
                             <h4 className="text-xl font-black text-gray-900 truncate" title={`LKR ${refunds.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}>LKR {refunds.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Sales Report Bar Chart */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                           <h4 className="text-lg font-bold text-gray-900">Sales Report</h4>
                           <select 
                             value={financeTimeFilter}
                             onChange={(e) => setFinanceTimeFilter(e.target.value)}
                             className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 text-gray-600 bg-gray-50 cursor-pointer"
                           >
                             <option value="Last 30 Days">Last 30 Days</option>
                             <option value="This Month">This Month</option>
                             <option value="This Year">This Year</option>
                             <option value="All Time">All Time</option>
                           </select>
                        </div>
                        <div className="h-80 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `LKR ${(value/1000).toFixed(0)}k`} />
                                 <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                                    cursor={{ fill: '#f1f5f9' }}
                                 />
                                 <Bar dataKey="Revenue" fill="var(--color-primary, #ff004f)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     {/* Product Stock Distribution Pie Chart */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                        <h4 className="text-lg font-bold text-gray-900 mb-6">Product Stock Distribution</h4>
                        <div className="flex-grow flex items-center justify-center min-h-[300px]">
                           {products.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                   <Pie
                                      data={[
                                        { name: 'In Stock', value: products.filter(p => p.countInStock > 5).length, color: '#10b981' },
                                        { name: 'Low Stock', value: products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length, color: '#f59e0b' },
                                        { name: 'Out of Stock', value: products.filter(p => p.countInStock === 0).length, color: '#ef4444' }
                                      ].filter(d => d.value > 0)}
                                      innerRadius={80}
                                      outerRadius={110}
                                      paddingAngle={5}
                                      dataKey="value"
                                   >
                                      {[
                                        { name: 'In Stock', value: products.filter(p => p.countInStock > 5).length, color: '#10b981' },
                                        { name: 'Low Stock', value: products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length, color: '#f59e0b' },
                                        { name: 'Out of Stock', value: products.filter(p => p.countInStock === 0).length, color: '#ef4444' }
                                      ].filter(d => d.value > 0).map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                      ))}
                                   </Pie>
                                   <RechartsTooltip 
                                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                   />
                                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                             </ResponsiveContainer>
                           ) : (
                             <div className="text-gray-400">No product data available for distribution.</div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Recent Transactions Table embedded in report */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                     <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="text-lg font-bold text-gray-900">Recent Transactions</h4>
                        <button onClick={() => setActiveTab('finance')} className="px-4 py-2 text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 cursor-pointer">
                           View All Finance
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50/50">
                              <tr className="text-gray-500 text-xs uppercase tracking-wider">
                                 <th className="py-4 px-6 font-semibold">Order ID</th>
                                 <th className="py-4 px-6 font-semibold">Date</th>
                                 <th className="py-4 px-6 font-semibold">Customer</th>
                                 <th className="py-4 px-6 font-semibold text-right">Amount</th>
                              </tr>
                           </thead>
                           <tbody>
                              {orders.slice(0, 5).map(order => (
                                 <tr key={order._id} className="border-t border-gray-50 hover:bg-gray-50/50 transition">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">#{order._id.substring(0,8)}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4 px-6 text-sm text-gray-700">{order.user?.name || 'Guest'}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-gray-900 text-right">LKR {order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                 </tr>
                              ))}
                              {orders.length === 0 && (
                                 <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500 text-sm">No recent transactions.</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'discounts' && (() => {
                const flashDeals = products.filter(p => p.flashSaleEndDate && new Date(p.flashSaleEndDate) > new Date());
                const normalDiscounts = products.filter(p => p.originalPrice > p.price && !(p.flashSaleEndDate && new Date(p.flashSaleEndDate) > new Date()));

                return (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="flex justify-between items-end mb-2">
                       <div>
                         <h3 className="text-2xl font-black text-gray-900">Manage Discounts & Deals</h3>
                         <p className="text-gray-500 text-sm mt-1">Control your active flash sales and regular discounted products.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Flash Deals Section */}
                      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-pink-50 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-lg shadow-inner">⚡</div>
                              <div>
                                 <h4 className="font-bold text-gray-900">Active Flash Deals</h4>
                                 <p className="text-xs text-orange-600 font-medium">{flashDeals.length} items currently on flash sale</p>
                              </div>
                           </div>
                        </div>
                        <div className="p-4 flex-grow overflow-y-auto max-h-[600px] space-y-3">
                           {flashDeals.length === 0 ? (
                             <div className="text-center py-10 text-gray-400 text-sm font-medium">No active flash deals found.</div>
                           ) : flashDeals.map(product => (
                             <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md hover:bg-orange-50/20 transition-all duration-300 group">
                                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-gray-50 border border-gray-100" />
                                <div className="flex-1 min-w-0">
                                   <h5 className="font-bold text-gray-900 text-sm truncate" title={product.name}>{product.name}</h5>
                                   <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-sm font-black text-gray-900">LKR {product.price?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                      {product.originalPrice > product.price && (
                                        <span className="text-xs text-gray-400 line-through font-medium">LKR {product.originalPrice?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                      )}
                                      {product.originalPrice > product.price && (
                                        <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded shadow-sm">
                                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                        </span>
                                      )}
                                   </div>
                                   <div className="text-[10px] text-orange-600 mt-1.5 font-bold flex items-center gap-1.5 bg-orange-50 w-fit px-2 py-0.5 rounded-full border border-orange-100">
                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                     Ends: {new Date(product.flashSaleEndDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                   </div>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                   <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary px-3 py-1.5 rounded-lg font-bold transition shadow-sm cursor-pointer">Edit</button>
                                   <button onClick={() => handleRemoveDiscount(product)} className="text-xs bg-white border border-gray-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold transition shadow-sm cursor-pointer">Remove</button>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Normal Discounts Section */}
                      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-lg shadow-inner">🏷️</div>
                              <div>
                                 <h4 className="font-bold text-gray-900">Normal Discounts</h4>
                                 <p className="text-xs text-blue-600 font-medium">{normalDiscounts.length} items with regular discounts</p>
                              </div>
                           </div>
                        </div>
                        <div className="p-4 flex-grow overflow-y-auto max-h-[600px] space-y-3">
                           {normalDiscounts.length === 0 ? (
                             <div className="text-center py-10 text-gray-400 text-sm font-medium">No regular discounted items found.</div>
                           ) : normalDiscounts.map(product => (
                             <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md hover:bg-blue-50/20 transition-all duration-300 group">
                                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-gray-50 border border-gray-100" />
                                <div className="flex-1 min-w-0">
                                   <h5 className="font-bold text-gray-900 text-sm truncate" title={product.name}>{product.name}</h5>
                                   <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-sm font-black text-gray-900">LKR {product.price?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                      <span className="text-xs text-gray-400 line-through font-medium">LKR {product.originalPrice?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                      <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded shadow-sm">
                                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                      </span>
                                   </div>
                                   <div className="text-[10px] text-green-700 mt-1.5 font-bold flex items-center gap-1.5 bg-green-50 w-fit px-2 py-0.5 rounded-full border border-green-100">
                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                     Active Deal
                                   </div>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                   <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary px-3 py-1.5 rounded-lg font-bold transition shadow-sm cursor-pointer">Edit</button>
                                   <button onClick={() => handleRemoveDiscount(product)} className="text-xs bg-white border border-gray-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold transition shadow-sm cursor-pointer">Remove</button>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      </main>

      {/* Inquiry Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative">
             <button 
               onClick={() => { setSelectedInquiry(null); setReplyMessage(''); }}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition cursor-pointer"
             >
               <FiX size={20} />
             </button>
             
             <h2 className="text-2xl font-black text-gray-900 mb-6">Reply to Inquiry</h2>
             
             <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer</div>
                      <div className="text-sm font-medium text-gray-900">{selectedInquiry.name}</div>
                      <div className="text-xs text-gray-500">{selectedInquiry.email}</div>
                   </div>
                   <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product</div>
                      <div className="text-sm font-medium text-gray-900 truncate" title={selectedInquiry.productName}>{selectedInquiry.productName}</div>
                      <div className="text-xs text-gray-500">ID: {selectedInquiry.product}</div>
                   </div>
                </div>
                <div>
                   <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message</div>
                   <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-gray-100">
                      {selectedInquiry.message}
                   </div>
                </div>
             </div>

             {selectedInquiry.isReplied ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                   <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                      <FiCheckCircle /> Previously Replied
                   </div>
                   <div className="text-sm text-green-900 whitespace-pre-wrap">
                      {selectedInquiry.replyMessage}
                   </div>
                </div>
             ) : (
                <form onSubmit={handleReplySubmit}>
                   <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Your Reply</label>
                      <textarea
                         rows="5"
                         required
                         value={replyMessage}
                         onChange={(e) => setReplyMessage(e.target.value)}
                         className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                         placeholder="Type your reply here. This will be emailed directly to the customer..."
                      ></textarea>
                   </div>
                   <div className="flex justify-end gap-3">
                      <button 
                         type="button"
                         onClick={() => { setSelectedInquiry(null); setReplyMessage(''); }}
                         className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                      >
                         Cancel
                      </button>
                      <button 
                         type="submit"
                         disabled={replyingInquiry}
                         className="px-6 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                         {replyingInquiry && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
                         Send Reply
                      </button>
                   </div>
                </form>
             )}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
             <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Invoice Preview</h3>
                <div className="flex gap-2">
                   <a 
                     href={previewPdfUrl} 
                     download="Invoice.pdf"
                     className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-[#e60047] rounded-lg font-medium transition cursor-pointer text-sm shadow-sm"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                     Download
                   </a>
                   <button 
                     onClick={() => setPreviewPdfUrl(null)}
                     className="text-gray-500 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition cursor-pointer"
                   >
                     <FiX size={20} />
                   </button>
                </div>
             </div>
             <div className="flex-grow bg-gray-100 p-4">
                <iframe 
                  src={previewPdfUrl} 
                  className="w-full h-full rounded border border-gray-300 shadow-inner"
                  title="PDF Preview"
                />
             </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        product={editingProduct}
        onProductSaved={fetchProducts}
      />

      <Footer />
    </div>
  );
};

export default AdminDashboard;

