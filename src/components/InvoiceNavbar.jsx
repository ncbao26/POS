import React, { useState, useEffect } from 'react';
import { invoicesAPI, productsAPI, customersAPI } from '../services/api';
import { 
  CalendarDaysIcon, 
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const InvoiceNavbar = () => {
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Edit invoice modal state
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [editForm, setEditForm] = useState({
    customerId: '',
    paymentMethod: 'CASH',
    discountAmount: 0,
    discountPercentage: 0,
    notes: '',
    items: []
  });
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    loadInvoices();
    loadProducts();
    loadCustomers();
  }, [dateRange, startDate, endDate, paymentStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, startDate, endDate, paymentStatus, searchTerm]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      let invoicesData = [];

      if (dateRange === 'custom' && startDate && endDate) {
        invoicesData = await invoicesAPI.getByDateRange(startDate, endDate, paymentStatus);
      } else if (dateRange !== 'all') {
        const today = new Date();
        let start, end;

        switch (dateRange) {
          case 'today':
            start = end = today.toISOString().split('T')[0];
            break;
          case 'week':
            start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            end = today.toISOString().split('T')[0];
            break;
          case 'month':
            start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            end = today.toISOString().split('T')[0];
            break;
          case 'year':
            start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
            end = today.toISOString().split('T')[0];
            break;
          default:
            start = end = today.toISOString().split('T')[0];
        }

        invoicesData = await invoicesAPI.getByDateRange(start, end, paymentStatus);
      } else {
        invoicesData = await invoicesAPI.getAll();
        if (paymentStatus) {
          invoicesData = invoicesData.filter(inv => inv.paymentStatus === paymentStatus);
        }
      }

      setInvoices(invoicesData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Lỗi khi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await customersAPI.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      return;
    }

    try {
      await invoicesAPI.delete(invoiceId);
      toast.success('Xóa hóa đơn thành công');
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Lỗi khi xóa hóa đơn');
    }
  };

  const handleEditInvoice = async (invoice) => {
    try {
      // Get full invoice details
      const fullInvoice = await invoicesAPI.getById(invoice.id);
      console.log('Full invoice:', JSON.stringify(fullInvoice, null, 2));
      if (fullInvoice.items && fullInvoice.items.length > 0) {
        console.log('First item:', JSON.stringify(fullInvoice.items[0], null, 2));
        }
      
      setEditingInvoice(fullInvoice);
      
      // Set form data - sửa để hoạt động với cả product object và productId
      const formData = {
        customerId: fullInvoice.customer?.id || '',
        paymentMethod: fullInvoice.paymentMethod || 'CASH',
        discountAmount: fullInvoice.discountAmount || 0,
        discountPercentage: fullInvoice.discountPercentage || 0,
        notes: fullInvoice.notes || '',
        items: fullInvoice.items?.map((item, index) => {
          // Xử lý productId từ nhiều nguồn khác nhau
          let productId = null;
          if (item.product && item.product.id) {
            productId = parseInt(item.product.id);
          } else if (item.productId) {
            productId = parseInt(item.productId);
          }
          
          return {
            productId: productId,
            quantity: item.quantity || 1,
            discountAmount: item.discountAmount || 0,
            discountPercentage: item.discountPercentage || 0
          };
        }) || []
      };
      
      console.log('Form data:', JSON.stringify(formData, null, 2));
      setEditForm(formData);
      
      // Reset search states
      setProductSearchTerm('');
      setShowProductSuggestions(false);
      setFilteredProducts([]);
      
      setEditModalOpen(true);
    } catch (error) {
      console.error('Error loading invoice details:', error);
      toast.error('Không thể tải chi tiết hóa đơn');
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingInvoice(null);
    setEditForm({
      customerId: '',
      paymentMethod: 'CASH',
      discountAmount: 0,
      discountPercentage: 0,
      notes: '',
      items: []
    });
    setProductSearchTerm('');
    setShowProductSuggestions(false);
    setFilteredProducts([]);
  };

  const handleSaveInvoice = async () => {
    try {
      if (editForm.items.length === 0) {
        toast.error('Vui lòng thêm ít nhất một sản phẩm');
        return;
      }

      const invoiceData = {
        customerId: editForm.customerId || null,
        paymentMethod: (editForm.paymentMethod || 'CASH').toUpperCase(),
        discountAmount: parseFloat(editForm.discountAmount) || 0,
        discountPercentage: parseFloat(editForm.discountPercentage) || 0,
        notes: editForm.notes || '',
        items: editForm.items.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          discountAmount: parseFloat(item.discountAmount) || 0,
          discountPercentage: parseFloat(item.discountPercentage) || 0
        }))
      };

      await invoicesAPI.update(editingInvoice.id, invoiceData);
      
      toast.success('Hóa đơn đã được cập nhật thành công');
      handleCloseModal();
      loadInvoices(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Không thể cập nhật hóa đơn');
    }
  };

  const handlePrintInvoice = async (invoice) => {
    try {
      // Nếu hóa đơn không có items hoặc items rỗng, lấy chi tiết đầy đủ từ API
      let fullInvoice = invoice;
      if (!invoice.items || invoice.items.length === 0) {
        fullInvoice = await invoicesAPI.getById(invoice.id);
      }

      // Tạo HTML template cho in hóa đơn
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Hóa đơn ${fullInvoice.invoiceNumber}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background: white;
            }
            
            .invoice-container {
              max-width: 210mm;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            
            .company-info {
              font-size: 11px;
              color: #666;
              margin-bottom: 10px;
            }
            
            .invoice-title {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              margin-top: 15px;
            }
            
            .paid-notice {
              background: #dcfce7;
              color: #166534;
              padding: 10px;
              border-radius: 8px;
              text-align: center;
              font-weight: bold;
              margin-bottom: 20px;
              border: 2px solid #16a34a;
            }
            
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              gap: 20px;
            }
            
            .invoice-details, .customer-details {
              flex: 1;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            
            .section-title {
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            
            .info-label {
              font-weight: 500;
              color: #4b5563;
            }
            
            .info-value {
              color: #1f2937;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .items-table th {
              background: #2563eb;
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .items-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 11px;
            }
            
            .items-table tr:nth-child(even) {
              background: #f8fafc;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .product-name {
              font-weight: 500;
              color: #1f2937;
            }
            
            .summary {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            
            .summary-table {
              width: 300px;
              border-collapse: collapse;
            }
            
            .summary-table td {
              padding: 8px 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .summary-table .label {
              font-weight: 500;
              color: #4b5563;
            }
            
            .summary-table .value {
              text-align: right;
              color: #1f2937;
            }
            
            .total-row {
              background: #2563eb;
              color: white;
              font-weight: bold;
              font-size: 14px;
            }
            
            .total-row td {
              border-bottom: none;
            }
            
            .payment-info {
              margin-top: 20px;
              padding: 15px;
              background: #f0f9ff;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }
            
            .notes {
              margin-top: 20px;
              padding: 15px;
              background: #fffbeb;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            
            .footer {
              margin-top: 30px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #6b7280;
              font-size: 11px;
            }
            
            .thank-you {
              font-size: 16px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            
            .currency {
              font-weight: 500;
            }
            
            @media print {
              .invoice-container {
                max-width: none;
                padding: 0;
              }
              
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-name">CỬA HÀNG BÁN LẺ</div>
              <div class="company-info">
                Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>
                Điện thoại: (028) 1234 5678 | Email: info@cuahang.com<br>
                Website: www.cuahang.com
              </div>
              <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
            </div>

            ${fullInvoice.paymentStatus === 'PAID' ? '<div class="paid-notice">✅ ĐÃ THANH TOÁN</div>' : ''}

            <!-- Invoice & Customer Info -->
            <div class="invoice-info">
              <div class="invoice-details">
                <div class="section-title">Thông tin hóa đơn</div>
                <div class="info-row">
                  <span class="info-label">Mã hóa đơn:</span>
                  <span class="info-value">${fullInvoice.invoiceNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ngày tạo:</span>
                  <span class="info-value">${fullInvoice.createdAt ? new Date(fullInvoice.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Giờ tạo:</span>
                  <span class="info-value">${fullInvoice.createdAt ? new Date(fullInvoice.createdAt).toLocaleTimeString('vi-VN') : 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phương thức:</span>
                  <span class="info-value">${fullInvoice.paymentMethod === 'CASH' ? 'Tiền mặt' : fullInvoice.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : fullInvoice.paymentMethod === 'CARD' ? 'Thẻ tín dụng' : fullInvoice.paymentMethod}</span>
                </div>
              </div>

              <div class="customer-details">
                <div class="section-title">Thông tin khách hàng</div>
                <div class="info-row">
                  <span class="info-label">Tên khách hàng:</span>
                  <span class="info-value">${fullInvoice.customer?.name || 'Khách lẻ'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Số điện thoại:</span>
                  <span class="info-value">${fullInvoice.customer?.phone || 'Không có'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${fullInvoice.customer?.email || 'Không có'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Địa chỉ:</span>
                  <span class="info-value">${fullInvoice.customer?.address || 'Không có'}</span>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%">STT</th>
                  <th style="width: 35%">Tên sản phẩm</th>
                  <th style="width: 10%" class="text-center">SL</th>
                  <th style="width: 15%" class="text-right">Đơn giá</th>
                  <th style="width: 15%" class="text-right">Tạm tính</th>
                  <th style="width: 10%" class="text-right">Giảm giá</th>
                  <th style="width: 15%" class="text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${fullInvoice.items && fullInvoice.items.length > 0 ? fullInvoice.items.map((item, index) => {
                  // Xử lý cấu trúc dữ liệu khác nhau từ API
                  const itemPrice = item.unitPrice || item.price || 0;
                  const itemQuantity = item.quantity || 0;
                  const itemSubtotal = itemPrice * itemQuantity;
                  const itemDiscountAmount = item.discountAmount || 0;
                  const itemDiscountPercent = item.discountPercentage || 0;
                  const totalItemDiscount = itemDiscountAmount + (itemSubtotal * itemDiscountPercent / 100);
                  const itemTotal = itemSubtotal - totalItemDiscount;
                  
                  // Lấy tên sản phẩm từ nhiều nguồn có thể
                  const productName = item.product?.name || item.productName || `Sản phẩm ID: ${item.productId || 'N/A'}`;
                  
                  return `
                    <tr>
                      <td class="text-center">${index + 1}</td>
                      <td class="product-name">${productName}</td>
                      <td class="text-center">${itemQuantity}</td>
                      <td class="text-right currency">${formatCurrency(itemPrice)}</td>
                      <td class="text-right currency">${formatCurrency(itemSubtotal)}</td>
                      <td class="text-right currency">${totalItemDiscount > 0 ? formatCurrency(totalItemDiscount) : '-'}</td>
                      <td class="text-right currency">${formatCurrency(itemTotal)}</td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="7" class="text-center" style="padding: 20px; color: #6b7280;">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                `}
              </tbody>
            </table>

            <!-- Summary -->
            <div class="summary">
              <table class="summary-table">
                <tr>
                  <td class="label">Tổng phụ:</td>
                  <td class="value currency">${formatCurrency(fullInvoice.subtotal || 0)}</td>
                </tr>
                ${fullInvoice.discountAmount > 0 ? `
                  <tr>
                    <td class="label">Giảm giá hóa đơn:</td>
                    <td class="value currency">-${formatCurrency(fullInvoice.discountAmount)}</td>
                  </tr>
                ` : ''}
                ${fullInvoice.discountPercentage > 0 ? `
                  <tr>
                    <td class="label">Giảm giá (${fullInvoice.discountPercentage}%):</td>
                    <td class="value currency">-${formatCurrency((fullInvoice.subtotal || 0) * (fullInvoice.discountPercentage || 0) / 100)}</td>
                  </tr>
                ` : ''}
                <tr class="total-row">
                  <td class="label">TỔNG CỘNG:</td>
                  <td class="value currency">${formatCurrency(fullInvoice.totalAmount || 0)}</td>
                </tr>
              </table>
            </div>

            <!-- Payment Info -->
            <div class="payment-info">
              <div class="section-title">Thông tin thanh toán</div>
              <div class="info-row">
                <span class="info-label">Phương thức thanh toán:</span>
                <span class="info-value">
                  ${
                    fullInvoice.paymentMethod === 'CASH' ? '💵 Tiền mặt' : 
                    fullInvoice.paymentMethod === 'TRANSFER' ? '🏦 Chuyển khoản' : 
                    fullInvoice.paymentMethod === 'CARD' ? '💳 Thẻ tín dụng' : 
                    fullInvoice.paymentMethod || 'Không xác định'
                  }
                </span>
              </div>
            </div>

            ${fullInvoice.notes ? `
              <!-- Notes -->
              <div class="notes">
                <div class="section-title">Ghi chú</div>
                <p>${fullInvoice.notes}</p>
              </div>
            ` : ''}

            <!-- Footer -->
            <div class="footer">
              <div class="thank-you">🙏 Cảm ơn quý khách đã mua hàng!</div>
              <p>Hẹn gặp lại quý khách trong những lần mua sắm tiếp theo.</p>
              <p style="margin-top: 10px;">
                In lúc: ${new Date().toLocaleString('vi-VN')} | 
                Nhân viên: Admin
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Tạo cửa sổ in mới
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        toast.error('Không thể mở cửa sổ in. Vui lòng cho phép popup.');
        return;
      }

      // Ghi nội dung vào cửa sổ in
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Đợi tải xong rồi in
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Đóng cửa sổ sau khi in (tùy chọn)
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 500);
      };

      toast.success(`Đang in hóa đơn ${fullInvoice.invoiceNumber}...`);
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error('Không thể in hóa đơn. Vui lòng thử lại.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Filter invoices by search term
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
      invoice.customer?.name?.toLowerCase().includes(searchLower) ||
      invoice.customer?.phone?.includes(searchTerm) ||
      formatCurrency(invoice.totalAmount).toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getDateRangeText = () => {
    switch (dateRange) {
      case 'today':
        return 'Hôm nay';
      case 'week':
        return '7 ngày qua';
      case 'month':
        return 'Tháng này';
      case 'year':
        return 'Năm này';
      case 'custom':
        if (startDate && endDate) {
          return `Từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}`;
        }
        return 'Tùy chọn';
      default:
        return 'Tất cả';
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-700">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredInvoices.length)} của {filteredInvoices.length} hóa đơn
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border ${
              currentPage === 1
                ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                page === currentPage
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : page === '...'
                  ? 'border-transparent text-slate-400 cursor-default'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border ${
              currentPage === totalPages
                ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Danh sách hóa đơn
          </h1>
          <p className="text-slate-600 mt-1">Quản lý và theo dõi tất cả hóa đơn bán hàng</p>
        </div>
        {lastUpdated && (
          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>Cập nhật: {lastUpdated.toLocaleString('vi-VN')}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-blue-600" />
            Bộ lọc
          </h3>
          <span className="text-sm text-slate-500">
            {getDateRangeText()} • {filteredInvoices.length} hóa đơn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Thời gian</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm này</option>
              <option value="custom">Tùy chọn</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm theo mã hóa đơn, tên khách hàng, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <ShoppingBagIcon className="h-5 w-5 mr-2 text-blue-600" />
            Danh sách hóa đơn ({filteredInvoices.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : currentInvoices.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mã hóa đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Phương thức
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {currentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {invoice.customer ? `${invoice.customer.name}${invoice.customer.phone ? ` - ${invoice.customer.phone}` : ''}` : 'Khách lẻ'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : 
                         invoice.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 
                         invoice.paymentMethod === 'CARD' ? 'Thẻ tín dụng' : invoice.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-800' 
                            : invoice.paymentStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.paymentStatus === 'PAID' ? 'Đã thanh toán' : 
                           invoice.paymentStatus === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Chỉnh sửa hóa đơn"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="In hóa đơn"
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Xóa hóa đơn"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">Không tìm thấy hóa đơn nào</p>
            <p className="text-slate-400 text-sm mt-2">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Thử thay đổi bộ lọc hoặc tạo hóa đơn mới'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Invoice Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Chỉnh sửa hóa đơn {editingInvoice?.invoiceNumber}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Khách hàng
                </label>
                <select
                  value={editForm.customerId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Khách lẻ</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phương thức thanh toán
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="TRANSFER">Chuyển khoản</option>
                  <option value="CARD">Thẻ tín dụng</option>
                </select>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Sản phẩm trong hóa đơn
                  </label>
                  <button
                    onClick={() => setShowProductSuggestions(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Thêm sản phẩm</span>
                  </button>
                </div>

                {/* Product Search Modal */}
                {showProductSuggestions && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                      <div className="p-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Thêm sản phẩm</h3>
                          <button
                            onClick={() => {
                              setShowProductSuggestions(false);
                              setProductSearchTerm('');
                              setFilteredProducts([]);
                            }}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-4">
                          <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={productSearchTerm}
                            onChange={(e) => {
                              const term = e.target.value;
                              setProductSearchTerm(term);
                              if (term.trim()) {
                                const filtered = products.filter(product =>
                                  product.name.toLowerCase().includes(term.toLowerCase()) ||
                                  product.barcode?.toLowerCase().includes(term.toLowerCase())
                                );
                                setFilteredProducts(filtered);
                              } else {
                                setFilteredProducts(products.slice(0, 10));
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="p-4 max-h-96 overflow-y-auto">
                        {(productSearchTerm ? filteredProducts : products.slice(0, 10)).map(product => (
                          <div
                            key={product.id}
                            onClick={() => {
                              const existingItem = editForm.items.find(item => item.productId === product.id);
                              if (existingItem) {
                                setEditForm(prev => ({
                                  ...prev,
                                  items: prev.items.map(item =>
                                    item.productId === product.id
                                      ? { ...item, quantity: item.quantity + 1 }
                                      : item
                                  )
                                }));
                              } else {
                                setEditForm(prev => ({
                                  ...prev,
                                  items: [...prev.items, {
                                    productId: product.id,
                                    quantity: 1,
                                    discountAmount: 0,
                                    discountPercentage: 0
                                  }]
                                }));
                              }
                              setShowProductSuggestions(false);
                              setProductSearchTerm('');
                              setFilteredProducts([]);
                            }}
                            className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer rounded-lg border-b border-slate-100"
                          >
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-sm text-slate-500">
                                Giá: {formatCurrency(product.price)} • Tồn: {product.stock}
                              </p>
                            </div>
                            <PlusIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {editForm.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    
                    return (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500">Giá: {formatCurrency(product.price)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-slate-600">SL:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              setEditForm(prev => ({
                                ...prev,
                                items: prev.items.map((it, i) =>
                                  i === index ? { ...it, quantity: newQuantity } : it
                                )
                              }));
                            }}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setEditForm(prev => ({
                              ...prev,
                              items: prev.items.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giảm giá (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.discountAmount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.discountPercentage}
                    onChange={(e) => setEditForm(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú cho hóa đơn..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveInvoice}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceNavbar; 