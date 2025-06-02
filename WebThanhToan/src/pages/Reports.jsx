import { useState, useEffect } from 'react';
import { invoicesAPI, productsAPI, customersAPI } from '../services/api';
import { 
  CalendarDaysIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Reports = () => {
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    loadReports();
    loadProducts();
    loadCustomers();
  }, [dateRange, startDate, endDate, paymentStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, startDate, endDate, paymentStatus]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing reports...');
      loadReports();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dateRange, startDate, endDate, paymentStatus]);

  // Refresh when user focuses on window (comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing reports...');
      loadReports();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dateRange, startDate, endDate, paymentStatus]);

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

  const loadReports = async () => {
    try {
      setLoading(true);
      console.log('Loading reports with params:', { dateRange, startDate, endDate, paymentStatus });
      
      let data;
      
      // Add timestamp to avoid caching
      const timestamp = new Date().getTime();
      
      if (dateRange === 'custom' && startDate && endDate) {
        // Custom date range
        data = await invoicesAPI.getByDateRange(startDate, endDate, paymentStatus || null);
      } else if (dateRange !== 'all') {
        // Predefined date ranges
        const today = new Date();
        let calculatedStartDate, calculatedEndDate;

        switch (dateRange) {
          case 'today':
            calculatedStartDate = calculatedEndDate = today.toISOString().split('T')[0];
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            calculatedStartDate = weekAgo.toISOString().split('T')[0];
            calculatedEndDate = today.toISOString().split('T')[0];
            break;
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            calculatedStartDate = monthStart.toISOString().split('T')[0];
            calculatedEndDate = today.toISOString().split('T')[0];
            break;
          case 'year':
            const yearStart = new Date(today.getFullYear(), 0, 1);
            calculatedStartDate = yearStart.toISOString().split('T')[0];
            calculatedEndDate = today.toISOString().split('T')[0];
            break;
          default:
            calculatedStartDate = calculatedEndDate = null;
        }

        if (calculatedStartDate && calculatedEndDate) {
          data = await invoicesAPI.getByDateRange(calculatedStartDate, calculatedEndDate, paymentStatus || null);
        } else {
          data = await invoicesAPI.getAll();
        }
      } else {
        // All invoices - always get fresh data
        if (paymentStatus) {
          data = await invoicesAPI.getByDateRange(null, null, paymentStatus);
        } else {
          data = await invoicesAPI.getAll();
        }
      }

      console.log('Reports data loaded:', data?.length || 0, 'invoices at', new Date().toLocaleTimeString());
      setInvoices(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Không thể tải báo cáo. Vui lòng thử lại.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvoice = async (invoice) => {
    try {
      console.log('=== DEBUG: Starting handleEditInvoice ===');
      console.log('Invoice input:', invoice);
      
      // Get full invoice details
      const fullInvoice = await invoicesAPI.getById(invoice.id);
      console.log('=== Full invoice data from API ===');
      console.log('Full invoice:', JSON.stringify(fullInvoice, null, 2));
      console.log('Invoice items:', fullInvoice.items);
      
      if (fullInvoice.items && fullInvoice.items.length > 0) {
        console.log('=== First item structure ===');
        console.log('First item:', JSON.stringify(fullInvoice.items[0], null, 2));
        console.log('Product in first item:', fullInvoice.items[0].product);
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
          console.log(`=== Processing item ${index} ===`);
          console.log('Item:', item);
          
          // Xử lý productId từ nhiều nguồn khác nhau
          let productId = null;
          if (item.product && item.product.id) {
            productId = parseInt(item.product.id);
          } else if (item.productId) {
            productId = parseInt(item.productId);
          }
          
          console.log('Resolved productId:', productId);
          
          return {
            productId: productId,
            quantity: item.quantity || 1,
            discountAmount: item.discountAmount || 0,
            discountPercentage: item.discountPercentage || 0
          };
        }) || []
      };
      
      console.log('=== Form data prepared ===');
      console.log('Form data:', JSON.stringify(formData, null, 2));
      console.log('Available products:', products.length, 'products');
      
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

      console.log('Updating invoice with data:', invoiceData);
      await invoicesAPI.update(editingInvoice.id, invoiceData);
      
      toast.success('Hóa đơn đã được cập nhật thành công');
      handleCloseModal();
      loadReports(); // Reload to get updated data
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
        console.log('Fetching full invoice details for printing...');
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
            
            .items-table tr:hover {
              background: #f1f5f9;
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
            
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-paid {
              background: #dcfce7;
              color: #166534;
            }
            
            .status-pending {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-cancelled {
              background: #fee2e2;
              color: #991b1b;
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
                  <span class="info-label">Trạng thái:</span>
                  <span class="info-value">
                    <span class="status-badge ${
                      fullInvoice.paymentStatus === 'PAID' ? 'status-paid' : 
                      fullInvoice.paymentStatus === 'PENDING' ? 'status-pending' : 'status-cancelled'
                    }">
                      ${
                        fullInvoice.paymentStatus === 'PAID' ? 'Đã thanh toán' : 
                        fullInvoice.paymentStatus === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'
                      }
                    </span>
                  </span>
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

  const handlePrintAllInvoices = async () => {
    if (invoices.length === 0) {
      toast.error('Không có hóa đơn nào để in');
      return;
    }

    try {
      toast.info('Đang tải chi tiết hóa đơn...');
      
      // Lấy chi tiết đầy đủ của tất cả hóa đơn
      const fullInvoicesPromises = invoices.map(async (invoice) => {
        if (!invoice.items || invoice.items.length === 0) {
          return await invoicesAPI.getById(invoice.id);
        }
        return invoice;
      });
      
      const fullInvoices = await Promise.all(fullInvoicesPromises);

      // Tạo HTML template cho báo cáo tổng hợp
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Báo cáo tổng hợp hóa đơn</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 15mm;
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
              font-size: 11px;
              line-height: 1.4;
              color: #333;
              background: white;
            }
            
            .report-container {
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
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            
            .report-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-top: 10px;
            }
            
            .report-info {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border: 1px solid #e2e8f0;
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
            
            .summary-stats {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            
            .stat-card {
              background: #f0f9ff;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #bae6fd;
            }
            
            .stat-value {
              font-size: 16px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            
            .stat-label {
              font-size: 10px;
              color: #4b5563;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .invoice-item {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              margin-bottom: 15px;
              overflow: hidden;
              page-break-inside: avoid;
            }
            
            .invoice-header {
              background: #2563eb;
              color: white;
              padding: 10px 15px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .invoice-body {
              padding: 15px;
            }
            
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 15px;
            }
            
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 10px;
            }
            
            .products-table th {
              background: #f8fafc;
              padding: 8px 6px;
              text-align: left;
              font-weight: 600;
              border-bottom: 1px solid #e2e8f0;
              font-size: 9px;
              text-transform: uppercase;
            }
            
            .products-table td {
              padding: 6px;
              border-bottom: 1px solid #f1f5f9;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .currency {
              font-weight: 500;
            }
            
            .invoice-total {
              background: #f8fafc;
              padding: 10px;
              border-radius: 6px;
              margin-top: 10px;
              text-align: right;
            }
            
            .total-amount {
              font-size: 14px;
              font-weight: bold;
              color: #2563eb;
            }
            
            .status-badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 600;
              text-transform: uppercase;
            }
            
            .status-paid {
              background: #dcfce7;
              color: #166534;
            }
            
            .status-pending {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-cancelled {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .footer {
              margin-top: 30px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #6b7280;
              font-size: 10px;
            }
            
            @media print {
              .report-container {
                max-width: none;
                padding: 0;
              }
              
              .invoice-item {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <!-- Header -->
            <div class="header">
              <div class="company-name">CỬA HÀNG BÁN LẺ</div>
              <div class="report-title">BÁO CÁO TỔNG HỢP HÓA ĐƠN</div>
            </div>

            <!-- Report Info -->
            <div class="report-info">
              <div class="info-row">
                <span class="info-label">Thời gian xuất báo cáo:</span>
                <span class="info-value">${new Date().toLocaleString('vi-VN')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bộ lọc:</span>
                <span class="info-value">${getDateRangeText()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tổng số hóa đơn:</span>
                <span class="info-value">${fullInvoices.length} hóa đơn</span>
              </div>
            </div>

            <!-- Summary Stats -->
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-value">${formatCurrency(fullInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}</div>
                <div class="stat-label">Tổng doanh thu</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${fullInvoices.filter(inv => inv.paymentStatus === 'PAID').length}</div>
                <div class="stat-label">Đã thanh toán</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${fullInvoices.filter(inv => inv.paymentStatus === 'PENDING').length}</div>
                <div class="stat-label">Chờ thanh toán</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${formatCurrency(fullInvoices.reduce((sum, inv) => sum + (inv.discountAmount || 0), 0))}</div>
                <div class="stat-label">Tổng giảm giá</div>
              </div>
            </div>

            <!-- Invoice List -->
            ${fullInvoices.map((invoice, index) => `
              <div class="invoice-item">
                <div class="invoice-header">
                  <span>HÓA ĐƠN ${index + 1}: ${invoice.invoiceNumber}</span>
                  <span class="status-badge ${
                    invoice.paymentStatus === 'PAID' ? 'status-paid' : 
                    invoice.paymentStatus === 'PENDING' ? 'status-pending' : 'status-cancelled'
                  }">
                    ${
                      invoice.paymentStatus === 'PAID' ? 'Đã thanh toán' : 
                      invoice.paymentStatus === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'
                    }
                  </span>
                </div>
                
                <div class="invoice-body">
                  <div class="invoice-details">
                    <div>
                      <strong>Thông tin hóa đơn:</strong><br>
                      Ngày: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('vi-VN') : 'N/A'}<br>
                      Giờ: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleTimeString('vi-VN') : 'N/A'}<br>
                      Phương thức: ${
                        invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : 
                        invoice.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 
                        invoice.paymentMethod === 'CARD' ? 'Thẻ tín dụng' : 
                        invoice.paymentMethod || 'Không xác định'
                      }
                    </div>
                    <div>
                      <strong>Khách hàng:</strong><br>
                      Tên: ${invoice.customer?.name || 'Khách lẻ'}<br>
                      SĐT: ${invoice.customer?.phone || 'Không có'}<br>
                      Email: ${invoice.customer?.email || 'Không có'}
                    </div>
                  </div>

                  ${invoice.items && invoice.items.length > 0 ? `
                    <table class="products-table">
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Sản phẩm</th>
                          <th class="text-center">SL</th>
                          <th class="text-right">Đơn giá</th>
                          <th class="text-right">Giảm giá</th>
                          <th class="text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${invoice.items.map((item, itemIndex) => {
                          const itemPrice = item.unitPrice || item.price || 0;
                          const itemQuantity = item.quantity || 0;
                          const itemSubtotal = itemPrice * itemQuantity;
                          const itemDiscountAmount = item.discountAmount || 0;
                          const itemDiscountPercent = item.discountPercentage || 0;
                          const totalItemDiscount = itemDiscountAmount + (itemSubtotal * itemDiscountPercent / 100);
                          const itemTotal = itemSubtotal - totalItemDiscount;
                          const productName = item.product?.name || item.productName || `Sản phẩm ID: ${item.productId || 'N/A'}`;
                          
                          return `
                            <tr>
                              <td class="text-center">${itemIndex + 1}</td>
                              <td>${productName}</td>
                              <td class="text-center">${itemQuantity}</td>
                              <td class="text-right currency">${formatCurrency(itemPrice)}</td>
                              <td class="text-right currency">${totalItemDiscount > 0 ? formatCurrency(totalItemDiscount) : '-'}</td>
                              <td class="text-right currency">${formatCurrency(itemTotal)}</td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  ` : '<p style="text-align: center; color: #6b7280; padding: 20px;">Không có sản phẩm</p>'}

                  <div class="invoice-total">
                    <div>Tổng phụ: <span class="currency">${formatCurrency(invoice.subtotal || 0)}</span></div>
                    ${invoice.discountAmount > 0 ? `<div>Giảm giá: <span class="currency">-${formatCurrency(invoice.discountAmount)}</span></div>` : ''}
                    <div class="total-amount">TỔNG CỘNG: ${formatCurrency(invoice.totalAmount || 0)}</div>
                  </div>

                  ${invoice.notes ? `<div style="margin-top: 10px;"><strong>Ghi chú:</strong> ${invoice.notes}</div>` : ''}
                </div>
              </div>
            `).join('')}

            <!-- Footer -->
            <div class="footer">
              <p><strong>🙏 Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ!</strong></p>
              <p style="margin-top: 10px;">
                In lúc: ${new Date().toLocaleString('vi-VN')} | 
                Nhân viên: Admin | 
                Trang: <span id="pageNumber"></span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Tạo cửa sổ in mới
      const printWindow = window.open('', '_blank', 'width=1000,height=700');
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

      toast.success(`Đang in báo cáo ${fullInvoices.length} hóa đơn...`);
    } catch (error) {
      console.error('Error printing all invoices:', error);
      toast.error('Không thể in báo cáo. Vui lòng thử lại.');
    }
  };

  const handleAddItem = () => {
    setEditForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, discountAmount: 0, discountPercentage: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setEditForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setEditForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateItemTotal = (item) => {
    // Tìm sản phẩm với nhiều cách so sánh
    const product = products.find(p => 
      p.id === item.productId || 
      p.id === parseInt(item.productId) || 
      parseInt(p.id) === parseInt(item.productId)
    );
    
    if (!product) {
      console.log('Không tìm thấy sản phẩm để tính toán:', item.productId);
      return 0;
    }
    
    let total = product.price * item.quantity;
    total -= item.discountAmount || 0;
    if (item.discountPercentage > 0) {
      total -= (total * item.discountPercentage / 100);
    }
    return Math.max(0, total);
  };

  const calculateInvoiceTotal = () => {
    let subtotal = editForm.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    subtotal -= editForm.discountAmount || 0;
    if (editForm.discountPercentage > 0) {
      subtotal -= (subtotal * editForm.discountPercentage / 100);
    }
    return Math.max(0, subtotal);
  };

  const calculateStats = () => {
    const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'PAID');
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalInvoices = paidInvoices.length;
    const averageOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const totalDiscount = paidInvoices.reduce((sum, inv) => sum + (inv.discountAmount || 0), 0);

    return {
      totalRevenue,
      totalInvoices,
      averageOrderValue,
      totalDiscount
    };
  };

  const getTopPaymentMethods = () => {
    const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'PAID');
    const methods = {};
    
    paidInvoices.forEach(inv => {
      methods[inv.paymentMethod] = (methods[inv.paymentMethod] || 0) + 1;
    });

    return Object.entries(methods)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);
  };

  const exportToCSV = () => {
    if (invoices.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    const headers = ['Mã hóa đơn', 'Khách hàng', 'Ngày tạo', 'Tổng tiền', 'Giảm giá', 'Phương thức thanh toán', 'Trạng thái'];
    const csvContent = [
      headers.join(','),
      ...invoices.map(inv => [
        inv.invoiceNumber || '',
        inv.customer ? `${inv.customer.name}${inv.customer.phone ? ` - ${inv.customer.phone}` : ''}` : 'Khách lẻ',
        inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('vi-VN') : '',
        inv.totalAmount || 0,
        inv.discountAmount || 0,
        inv.paymentMethod || '',
        inv.paymentStatus || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Đã xuất báo cáo thành công');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Thêm hàm highlight text cho tìm kiếm sản phẩm
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
      ) : (
        part
      )
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const stats = calculateStats();
  const paymentMethods = getTopPaymentMethods();

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

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend.type === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <ArrowTrendingUpIcon className={`h-3 w-3 ${trend.type === 'down' ? 'rotate-180' : ''}`} />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

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

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-700">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, invoices.length)} của {invoices.length} hóa đơn
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Báo cáo bán hàng
          </h1>
          <p className="text-slate-600 mt-1">
            Phân tích doanh thu và hiệu suất kinh doanh - {getDateRangeText()}
            {lastUpdated && (
              <span className="ml-2 text-sm text-slate-500">
                • Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadReports}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowTrendingUpIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-green-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Lọc theo khoảng thời gian:</span>
            
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Hôm nay' },
                { key: 'week', label: '7 ngày qua' },
                { key: 'month', label: 'Tháng này' },
                { key: 'year', label: 'Năm này' },
                { key: 'custom', label: 'Tùy chọn' },
                { key: 'all', label: 'Tất cả' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setDateRange(period.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    dateRange === period.key
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  min={startDate}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái thanh toán</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={`${stats.totalInvoices} giao dịch`}
          trend={{ type: 'up', value: '+12%' }}
        />
        
        <StatCard
          title="Số giao dịch"
          value={stats.totalInvoices}
          icon={ShoppingBagIcon}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={`Trung bình: ${formatCurrency(stats.averageOrderValue)}`}
          trend={{ type: 'up', value: '+8%' }}
        />
        
        <StatCard
          title="Giao dịch trung bình"
          value={formatCurrency(stats.averageOrderValue)}
          icon={ArrowTrendingUpIcon}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend={{ type: 'up', value: '+5%' }}
        />

        <StatCard
          title="Tổng giảm giá"
          value={formatCurrency(stats.totalDiscount)}
          icon={ChartBarIcon}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle="Khuyến mãi"
          trend={{ type: 'down', value: '-2%' }}
        />
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <ShoppingBagIcon className="h-5 w-5 mr-2 text-blue-600" />
            Danh sách hóa đơn ({invoices.length})
          </h3>
          {invoices.length > 0 && (
            <button
              onClick={handlePrintAllInvoices}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              title="In tất cả hóa đơn"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>In tất cả ({invoices.length})</span>
            </button>
          )}
        </div>
        
        {invoices.length > 0 ? (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-100"
                            title="Sửa hóa đơn"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(invoice)}
                            className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-100"
                            title="In hóa đơn"
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Pagination />
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">Không có dữ liệu</p>
            <p className="text-sm">Thay đổi bộ lọc để xem báo cáo</p>
          </div>
        )}
      </div>

      {/* Payment Methods Chart */}
      {paymentMethods.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
            Phương thức thanh toán phổ biến
          </h3>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-700">
                    {method.method === 'CASH' ? 'Tiền mặt' : 
                     method.method === 'TRANSFER' ? 'Chuyển khoản' : 
                     method.method === 'CARD' ? 'Thẻ tín dụng' : method.method}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{method.count} giao dịch</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Sửa hóa đơn {editingInvoice?.invoiceNumber}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer and Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Khách hàng</label>
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phương thức thanh toán</label>
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
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900">
                    Sản phẩm ({editForm.items.length} sản phẩm)
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-500">
                      {products.length} sản phẩm có sẵn
                    </span>
                    <button
                      onClick={handleAddItem}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Thêm sản phẩm</span>
                    </button>
                  </div>
                </div>

                {/* Product Search */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm sản phẩm để thêm</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm..."
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        if (e.target.value.trim().length > 0) {
                          const filtered = products.filter(product =>
                            product.name.toLowerCase().includes(e.target.value.toLowerCase())
                          ).slice(0, 5);
                          setFilteredProducts(filtered);
                          setShowProductSuggestions(filtered.length > 0);
                        } else {
                          setFilteredProducts([]);
                          setShowProductSuggestions(false);
                        }
                      }}
                      onFocus={() => {
                        if (productSearchTerm.trim().length > 0 && filteredProducts.length > 0) {
                          setShowProductSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowProductSuggestions(false), 200);
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="off"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  </div>

                  {/* Product Suggestions Dropdown */}
                  {showProductSuggestions && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            // Kiểm tra tồn kho trước khi thêm
                            if (product.stock <= 0) {
                              toast.error(`Sản phẩm "${product.name}" đã hết hàng`);
                              return;
                            }

                            // Kiểm tra xem sản phẩm đã có trong danh sách chưa
                            const existingItemIndex = editForm.items.findIndex(item => item.productId === product.id);
                            if (existingItemIndex >= 0) {
                              // Nếu đã có, tăng số lượng
                              const currentQuantity = editForm.items[existingItemIndex].quantity;
                              if (currentQuantity >= product.stock) {
                                toast.error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm`);
                                return;
                              }
                              
                              setEditForm(prev => ({
                                ...prev,
                                items: prev.items.map((item, index) => 
                                  index === existingItemIndex 
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                                )
                              }));
                              toast.success(`Đã tăng số lượng ${product.name} lên ${currentQuantity + 1}`);
                            } else {
                              // Nếu chưa có, thêm mới
                              const newItem = {
                                productId: product.id,
                                quantity: 1,
                                discountAmount: 0,
                                discountPercentage: 0
                              };
                              setEditForm(prev => ({
                                ...prev,
                                items: [...prev.items, newItem]
                              }));
                              toast.success(`Đã thêm ${product.name} vào hóa đơn`);
                            }
                            
                            setProductSearchTerm('');
                            setShowProductSuggestions(false);
                            setFilteredProducts([]);
                          }}
                          className={`p-3 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                            product.stock <= 0 
                              ? 'bg-red-50 hover:bg-red-100' 
                              : 'hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{highlightText(product.name, productSearchTerm)}</p>
                              <p className="text-sm text-blue-600">{formatCurrency(product.price)}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  product.stock <= 0 
                                    ? 'bg-red-100 text-red-800' 
                                    : product.stock <= 10 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {product.stock <= 0 ? 'Hết hàng' : `Tồn kho: ${product.stock}`}
                                </span>
                              </div>
                            </div>
                            {product.stock > 0 ? (
                              <PlusIcon className="h-5 w-5 text-blue-600" />
                            ) : (
                              <XMarkIcon className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {editForm.items.map((item, index) => {
                    // Tìm sản phẩm với nhiều cách so sánh để đảm bảo tìm được
                    const product = products.find(p => 
                      p.id === item.productId || 
                      p.id === parseInt(item.productId) || 
                      parseInt(p.id) === parseInt(item.productId)
                    );
                    
                    // Debug log để kiểm tra
                    console.log(`=== Rendering item ${index} ===`);
                    console.log('Item:', item);
                    console.log('Item productId:', item.productId, 'type:', typeof item.productId);
                    console.log('Available products:', products.length);
                    console.log('Product found:', product);
                    if (product) {
                      console.log('Product ID:', product.id, 'type:', typeof product.id);
                      console.log('Product name:', product.name);
                    }
                    
                    return (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sản phẩm</label>
                            {product ? (
                              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="font-medium text-slate-900">{product.name}</p>
                                <p className="text-sm text-blue-600">{formatCurrency(product.price)}</p>
                                <p className="text-xs text-slate-500">Tồn kho: {product.stock}</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                  <p className="font-medium text-red-900">⚠️ Sản phẩm không tìm thấy</p>
                                  <p className="text-sm text-red-600">ID: {item.productId} (Có thể sản phẩm đã bị xóa)</p>
                                </div>
                                <select
                                  value=""
                                  onChange={(e) => handleItemChange(index, 'productId', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Chọn sản phẩm thay thế</option>
                                  {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                      {product.name} - {formatCurrency(product.price)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Số lượng</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Giảm giá (VND)</label>
                            <input
                              type="number"
                              min="0"
                              value={item.discountAmount}
                              onChange={(e) => handleItemChange(index, 'discountAmount', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Giảm giá (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercentage}
                              onChange={(e) => handleItemChange(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-slate-900">
                              {formatCurrency(calculateItemTotal(item))}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Invoice Discounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Giảm giá hóa đơn (VND)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.discountAmount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Giảm giá hóa đơn (%)</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú cho hóa đơn..."
                />
              </div>

              {/* Total */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-slate-900">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateInvoiceTotal())}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handlePrintInvoice(editingInvoice)}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>In hóa đơn</span>
              </button>
              <button
                onClick={handleSaveInvoice}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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

export default Reports;