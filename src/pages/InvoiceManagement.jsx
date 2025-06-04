import { useState, useEffect } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { 
  PlusIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  MinusIcon, 
  ShoppingCartIcon,
  CreditCardIcon,
  BanknotesIcon,
  UserIcon,
  UserPlusIcon,
  ReceiptPercentIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const InvoiceManagement = () => {
  const { state, dispatch, addCustomer, createInvoice, validateStock, validateInvoiceStock, loadProducts, loadCustomers, clearTabsFromLocalStorage } = useInvoice();
  const [searchTerm, setSearchTerm] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState('VND'); // 'VND' or 'PERCENT'
  const [itemDiscounts, setItemDiscounts] = useState({});
  const [itemDiscountTypes, setItemDiscountTypes] = useState({});
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load products and customers when component mounts - only once
  useEffect(() => {
    const initializeData = async () => {
      if (!dataLoaded) {
        try {
          const promises = [];
          if (state.products.length === 0) {
            promises.push(loadProducts());
          }
          if (state.customers.length === 0) {
            promises.push(loadCustomers());
          }
          
          if (promises.length > 0) {
            await Promise.all(promises);
          }
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading initial data:', error);
          setDataLoaded(true); // Set to true even on error to prevent infinite loading
        }
      }
    };

    initializeData();
  }, []); // Empty dependency array - only run once

  // Khai báo activeTab và filteredProducts với safe checks
  const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
  const filteredProducts = (state.products || []).filter(product =>
    product && product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tự động tạo tab mặc định nếu không có activeTab
  useEffect(() => {
    if (dataLoaded && !activeTab && state.tabs.length === 0) {
      dispatch({ type: 'ADD_TAB' });
    }
  }, [activeTab, state.tabs.length, dispatch, dataLoaded]);

  // Hàm xóa tất cả dữ liệu localStorage
  const handleClearAllData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu hóa đơn đã lưu? Hành động này không thể hoàn tác.')) {
      clearTabsFromLocalStorage();
      // Reset về trạng thái ban đầu
      dispatch({ type: 'RESET_TO_INITIAL' });
      toast.success('Đã xóa tất cả dữ liệu hóa đơn');
    }
  };

  const handleAddTab = () => {
    dispatch({ type: 'ADD_TAB' });
  };

  const handleRemoveTab = (tabId) => {
    if (state.tabs.length > 1) {
      dispatch({ type: 'REMOVE_TAB', payload: tabId });
    } else {
      toast.error('Phải có ít nhất một tab thanh toán');
    }
  };

  const handleSetActiveTab = (tabId) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  };

  const handleAddProduct = (productId) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) {
      toast.error('Sản phẩm không tồn tại');
      return;
    }

    // Kiểm tra tồn kho hiện tại
    if (product.stock <= 0) {
      toast.error(`Sản phẩm "${product.name}" đã hết hàng`);
      return;
    }

    // Kiểm tra số lượng hiện tại trong hóa đơn
    const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
    const existingItem = activeTab?.items.find(item => item.productId === productId);
    const currentQuantityInInvoice = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantityInInvoice + 1;

    // Kiểm tra tồn kho với số lượng mới
    const stockValidation = validateStock(productId, newQuantity);
    if (!stockValidation.isValid) {
      toast.error(stockValidation.message);
      return;
    }
    
    dispatch({
      type: 'ADD_ITEM_TO_INVOICE',
      payload: { tabId: state.activeTabId, productId }
    });
    toast.success('Đã thêm sản phẩm vào hóa đơn');
    
    // Clear search term sau khi thêm sản phẩm thành công
    setSearchTerm('');
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      dispatch({
        type: 'UPDATE_ITEM_QUANTITY',
        payload: { tabId: state.activeTabId, productId, quantity }
      });
      return;
    }

    // Kiểm tra tồn kho trước khi cập nhật
    const stockValidation = validateStock(productId, quantity);
    if (!stockValidation.isValid) {
      toast.error(stockValidation.message);
      return;
    }

    dispatch({
      type: 'UPDATE_ITEM_QUANTITY',
      payload: { tabId: state.activeTabId, productId, quantity }
    });
  };

  const handleRemoveItem = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM_FROM_INVOICE',
      payload: { tabId: state.activeTabId, productId }
    });
    // Remove item discount when item is removed
    const newItemDiscounts = { ...itemDiscounts };
    const newItemDiscountTypes = { ...itemDiscountTypes };
    delete newItemDiscounts[productId];
    delete newItemDiscountTypes[productId];
    setItemDiscounts(newItemDiscounts);
    setItemDiscountTypes(newItemDiscountTypes);
  };

  const calculateItemDiscount = (productId, discountValue, discountType, itemPrice, itemQuantity) => {
    const itemTotal = itemPrice * itemQuantity;
    if (discountType === 'PERCENT') {
      return Math.min((itemTotal * discountValue) / 100, itemTotal);
    } else {
      return Math.min(discountValue, itemTotal);
    }
  };

  const handleItemDiscount = (productId, discount, type = 'VND') => {
    setItemDiscounts(prev => ({
      ...prev,
      [productId]: discount
    }));
    setItemDiscountTypes(prev => ({
      ...prev,
      [productId]: type
    }));
  };

  const calculateTotalDiscount = () => {
    const subtotal = activeTab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (discountType === 'PERCENT') {
      return Math.min((subtotal * discountAmount) / 100, subtotal);
    } else {
      return Math.min(discountAmount, subtotal);
    }
  };

  const handleDiscountChange = (value) => {
    setDiscountAmount(Number(value) || 0);
    const calculatedDiscount = discountType === 'PERCENT' 
      ? Math.min((activeTab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * value) / 100, 
                 activeTab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))
      : Math.min(value, activeTab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    
    dispatch({
      type: 'SET_DISCOUNT',
      payload: { tabId: state.activeTabId, discount: calculatedDiscount }
    });
  };

  const handleCustomerSearch = () => {
    const customer = state.customers.find(c => c.phone === customerPhone);
    if (customer) {
      dispatch({
        type: 'SET_CUSTOMER',
        payload: { tabId: state.activeTabId, customer }
      });
      toast.success(`Đã chọn khách hàng: ${customer.name}`);
      setShowCustomerSuggestions(false);
    } else {
      setShowAddCustomer(true);
      setShowCustomerSuggestions(false);
    }
  };

  // Thêm hàm xử lý thay đổi số điện thoại với autocomplete
  const handleCustomerPhoneChange = (value) => {
    setCustomerPhone(value);
    setSelectedSuggestionIndex(-1); // Reset selection khi thay đổi input
    
    if (value.trim().length > 0) {
      // Lọc khách hàng dựa trên số điện thoại hoặc tên
      const filtered = state.customers.filter(customer => 
        customer.phone.includes(value) || 
        customer.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Giới hạn 5 gợi ý
      
      setFilteredCustomers(filtered);
      setShowCustomerSuggestions(filtered.length > 0);
    } else {
      setFilteredCustomers([]);
      setShowCustomerSuggestions(false);
    }
  };

  // Thêm hàm chọn khách hàng từ gợi ý
  const handleSelectCustomer = (customer) => {
    setCustomerPhone(customer.phone);
    dispatch({
      type: 'SET_CUSTOMER',
      payload: { tabId: state.activeTabId, customer }
    });
    setShowCustomerSuggestions(false);
    setFilteredCustomers([]);
    setSelectedSuggestionIndex(-1);
    toast.success(`Đã chọn khách hàng: ${customer.name}`);
  };

  // Thêm hàm xử lý keyboard navigation
  const handleKeyDown = (e) => {
    if (!showCustomerSuggestions || filteredCustomers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredCustomers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredCustomers.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < filteredCustomers.length) {
          handleSelectCustomer(filteredCustomers[selectedSuggestionIndex]);
        } else {
          handleCustomerSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowCustomerSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }

    try {
      const customerData = {
        name: newCustomerName,
        phone: customerPhone
      };

      const newCustomer = await addCustomer(customerData);
      
      dispatch({
        type: 'SET_CUSTOMER',
        payload: { tabId: state.activeTabId, customer: newCustomer }
      });

      setNewCustomerName('');
      setShowAddCustomer(false);
      toast.success('Đã thêm khách hàng mới');
    } catch (error) {
      toast.error('Không thể thêm khách hàng');
    }
  };

  const handleSetPaymentMethod = (method) => {
    dispatch({
      type: 'SET_PAYMENT_METHOD',
      payload: { tabId: state.activeTabId, method }
    });
  };

  const handlePayment = async () => {
    if (!activeTab || activeTab.items.length === 0) {
      toast.error('Hóa đơn trống, không thể thanh toán');
      return;
    }

    // Kiểm tra tồn kho toàn diện trước khi thanh toán
    const stockValidation = validateInvoiceStock(state.activeTabId);
    if (!stockValidation.isValid) {
      const errorMessage = stockValidation.errors.join('\n');
      toast.error(`Không thể thanh toán:\n${errorMessage}`, {
        duration: 6000,
        style: {
          whiteSpace: 'pre-line',
          maxWidth: '500px'
        }
      });
      return;
    }

    try {
      const currentTabName = activeTab.name;
      const hasMultipleTabs = state.tabs.length > 1;
      
      const invoice = await createInvoice(state.activeTabId);
      
      // Thông báo thanh toán thành công với thông tin về tab
      if (hasMultipleTabs) {
        toast.success(`Thanh toán thành công! Mã hóa đơn: ${invoice.invoiceNumber}\n${currentTabName} đã được đóng, chuyển sang tab khác.`, {
          duration: 4000,
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '500px'
          }
        });
      } else {
        toast.success(`Thanh toán thành công! Mã hóa đơn: ${invoice.invoiceNumber}\nĐã tạo hóa đơn mới để tiếp tục.`, {
          duration: 4000,
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '500px'
          }
        });
      }
      
      // Tự động in hóa đơn sau khi thanh toán thành công
      setTimeout(() => {
        handlePrintCompletedInvoice(invoice);
      }, 500); // Delay nhỏ để đảm bảo toast hiển thị trước
      
      // Reset form states (không cần reset tab vì đã được xóa)
      setCustomerPhone('');
      setDiscountAmount(0);
      setItemDiscounts({});
      setItemDiscountTypes({});
      setShowCustomerSuggestions(false);
      setFilteredCustomers([]);
      setSelectedSuggestionIndex(-1);
      setShowAddCustomer(false);
      setNewCustomerName('');
    } catch (error) {
      // Hiển thị thông báo lỗi chi tiết từ backend
      const errorMessage = error.message || 'Không thể tạo hóa đơn';
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          whiteSpace: 'pre-line',
          maxWidth: '500px'
        }
      });
    }
  };

  const handlePrintCompletedInvoice = (invoice) => {
    try {
      // Tạo HTML template cho in hóa đơn đã thanh toán - Khổ K80 (80mm x 45mm)
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Hóa đơn ${invoice.invoiceNumber}</title>
          <style>
            @media print {
              @page {
                size: 80mm 45mm;
                margin: 2mm;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Courier New', monospace;
              font-size: 8px;
              line-height: 1.2;
              color: #000;
              background: white;
              width: 76mm;
              margin: 0 auto;
            }
            
            .invoice-container {
              width: 100%;
              padding: 1mm;
            }
            
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 2mm;
              margin-bottom: 2mm;
            }
            
            .company-name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            
            .company-info {
              font-size: 7px;
              margin-bottom: 1mm;
            }
            
            .invoice-title {
              font-size: 10px;
              font-weight: bold;
              margin-top: 1mm;
            }
            
            .paid-notice {
              text-align: center;
              font-weight: bold;
              margin-bottom: 2mm;
              font-size: 8px;
              border: 1px solid #000;
              padding: 1mm;
            }
            
            .invoice-info {
              margin-bottom: 2mm;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5mm;
              font-size: 7px;
            }
            
            .info-label {
              font-weight: bold;
            }
            
            .items-section {
              margin: 2mm 0;
            }
            
            .items-header {
              border-bottom: 1px solid #000;
              padding-bottom: 1mm;
              margin-bottom: 1mm;
              font-size: 7px;
              font-weight: bold;
            }
            
            .item-row {
              margin-bottom: 1mm;
              font-size: 7px;
            }
            
            .item-name {
              font-weight: bold;
              margin-bottom: 0.5mm;
            }
            
            .item-details {
              display: flex;
              justify-content: space-between;
            }
            
            .summary {
              border-top: 1px solid #000;
              padding-top: 1mm;
              margin-top: 2mm;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5mm;
              font-size: 7px;
            }
            
            .total-row {
              font-weight: bold;
              font-size: 8px;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 1mm 0;
              margin-top: 1mm;
            }
            
            .payment-info {
              margin-top: 2mm;
              font-size: 7px;
            }
            
            .footer {
              margin-top: 2mm;
              text-align: center;
              font-size: 6px;
              border-top: 1px solid #000;
              padding-top: 1mm;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            @media print {
              .invoice-container {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-name">MIXX STORE</div>
              <div class="company-info">
                136 Nguyễn Trọng Tuyển, P.8, Phú Nhuận, TP.HCM<br>
                DT: 0376 302 306
              </div>
              <div class="invoice-title">HOÁ ĐƠN BÁN HÀNG</div>
            </div>

            <!-- Paid Notice -->
            <div class="paid-notice">
              ĐÃ THANH TOÁN
            </div>

            <!-- Invoice Info -->
            <div class="invoice-info">
              <div class="info-row">
                <span class="info-label">Mã HD:</span>
                <span>${invoice.invoiceNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ngày:</span>
                <span>${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Giờ:</span>
                <span>${invoice.createdAt ? new Date(invoice.createdAt).toLocaleTimeString('vi-VN') : new Date().toLocaleTimeString('vi-VN')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">KH:</span>
                <span>${invoice.customer?.name || activeTab.customer?.name || 'Khach le'}</span>
              </div>
              ${(invoice.customer?.phone || activeTab.customer?.phone) ? `
              <div class="info-row">
                <span class="info-label">SDT:</span>
                <span>${invoice.customer?.phone || activeTab.customer?.phone}</span>
              </div>
              ` : ''}
            </div>

            <!-- Items -->
            <div class="items-section">
              <div class="items-header">
                SẢN PHẨM
              </div>
              ${(invoice.items || activeTab.items).map((item, index) => {
                const itemPrice = item.unitPrice || item.price || 0;
                const itemQuantity = item.quantity || 0;
                const itemSubtotal = itemPrice * itemQuantity;
                
                let itemDiscount = 0;
                if (invoice.items) {
                  itemDiscount = (item.discountAmount || 0) + (itemSubtotal * (item.discountPercentage || 0) / 100);
                } else {
                  const itemDiscountValue = itemDiscounts[item.productId] || 0;
                  const itemDiscountType = itemDiscountTypes[item.productId] || 'VND';
                  itemDiscount = calculateItemDiscount(item.productId, itemDiscountValue, itemDiscountType, itemPrice, itemQuantity);
                }
                
                const itemTotal = itemSubtotal - itemDiscount;
                const productName = item.product?.name || item.name || `SP ID: ${item.productId || 'N/A'}`;
                
                return `
                  <div class="item-row">
                    <div class="item-name">${productName}</div>
                    <div class="item-details">
                      <span>${itemQuantity} x ${formatCurrency(itemPrice)}</span>
                      <span>${formatCurrency(itemTotal)}</span>
                    </div>
                    ${itemDiscount > 0 ? `
                    <div class="item-details">
                      <span>Giảm giá:</span>
                      <span>-${formatCurrency(itemDiscount)}</span>
                    </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Summary -->
            <div class="summary">
              <div class="summary-row">
                <span>Tạm tính:</span>
                <span>${formatCurrency(invoice.subtotal || activeTab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
              </div>
              ${(invoice.discountAmount || calculateTotalDiscount()) > 0 ? `
                <div class="summary-row">
                  <span>Giảm giá HD:</span>
                  <span>-${formatCurrency(invoice.discountAmount || calculateTotalDiscount())}</span>
                </div>
              ` : ''}
              <div class="total-row">
                <div class="item-details">
                  <span>TỔNG CỘNG:</span>
                  <span>${formatCurrency(invoice.totalAmount || calculateFinalTotal())}</span>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="payment-info">
              <div class="info-row">
                <span class="info-label">Thanh toán:</span>
                <span>
                  ${
                    (invoice.paymentMethod || activeTab.paymentMethod) === 'CASH' || (invoice.paymentMethod || activeTab.paymentMethod) === 'cash' 
                      ? 'Tiền mặt' 
                      : 'Chuyển khoản'
                  }
                </span>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div>Cảm ơn quý khách!</div>
              <div>In luc: ${new Date().toLocaleString('vi-VN')}</div>
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

      toast.success(`Đang in hóa đơn ${invoice.invoiceNumber}...`);
    } catch (error) {
      console.error('Error printing completed invoice:', error);
      toast.error('Không thể in hóa đơn. Vui lòng thử lại.');
    }
  };

  const handlePrintInvoice = () => {
    if (!activeTab || activeTab.items.length === 0) {
      toast.error('Hóa đơn trống, không thể in');
      return;
    }

    try {
      // Tạo HTML template cho in hóa đơn tạm thời - Khổ K80 (80mm x 45mm)
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Hóa đơn tạm thời</title>
          <style>
            @media print {
              @page {
                size: 80mm 45mm;
                margin: 2mm;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Courier New', monospace;
              font-size: 8px;
              line-height: 1.2;
              color: #000;
              background: white;
              width: 76mm;
              margin: 0 auto;
            }
            
            .invoice-container {
              width: 100%;
              padding: 1mm;
            }
            
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 2mm;
              margin-bottom: 2mm;
            }
            
            .company-name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            
            .company-info {
              font-size: 7px;
              margin-bottom: 1mm;
            }
            
            .invoice-title {
              font-size: 10px;
              font-weight: bold;
              margin-top: 1mm;
            }
            
            .draft-notice {
              text-align: center;
              font-weight: bold;
              margin-bottom: 2mm;
              font-size: 8px;
              border: 1px dashed #000;
              padding: 1mm;
            }
            
            .invoice-info {
              margin-bottom: 2mm;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5mm;
              font-size: 7px;
            }
            
            .info-label {
              font-weight: bold;
            }
            
            .items-section {
              margin: 2mm 0;
            }
            
            .items-header {
              border-bottom: 1px solid #000;
              padding-bottom: 1mm;
              margin-bottom: 1mm;
              font-size: 7px;
              font-weight: bold;
            }
            
            .item-row {
              margin-bottom: 1mm;
              font-size: 7px;
            }
            
            .item-name {
              font-weight: bold;
              margin-bottom: 0.5mm;
            }
            
            .item-details {
              display: flex;
              justify-content: space-between;
            }
            
            .summary {
              border-top: 1px solid #000;
              padding-top: 1mm;
              margin-top: 2mm;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5mm;
              font-size: 7px;
            }
            
            .total-row {
              font-weight: bold;
              font-size: 8px;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 1mm 0;
              margin-top: 1mm;
            }
            
            .payment-info {
              margin-top: 2mm;
              font-size: 7px;
            }
            
            .footer {
              margin-top: 2mm;
              text-align: center;
              font-size: 6px;
              border-top: 1px solid #000;
              padding-top: 1mm;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            @media print {
              .invoice-container {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-name">MIXX STORE</div>
              <div class="company-info">
                123 Duong ABC, Quan XYZ, TP.HCM<br>
                DT: (028) 1234 5678
              </div>
              <div class="invoice-title">HOA DON TAM THOI</div>
            </div>

            <!-- Draft Notice -->
            <div class="draft-notice">
              CHUA THANH TOAN
            </div>

            <!-- Invoice Info -->
            <div class="invoice-info">
              <div class="info-row">
                <span class="info-label">Ma HD:</span>
                <span>DRAFT-${Date.now()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ngay:</span>
                <span>${new Date().toLocaleDateString('vi-VN')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Gio:</span>
                <span>${new Date().toLocaleTimeString('vi-VN')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">KH:</span>
                <span>${activeTab.customer?.name || 'Khach le'}</span>
              </div>
              ${activeTab.customer?.phone ? `
              <div class="info-row">
                <span class="info-label">SDT:</span>
                <span>${activeTab.customer.phone}</span>
              </div>
              ` : ''}
            </div>

            <!-- Items -->
            <div class="items-section">
              <div class="items-header">
                SAN PHAM
              </div>
              ${activeTab.items.map((item, index) => {
                const itemDiscountValue = itemDiscounts[item.productId] || 0;
                const itemDiscountType = itemDiscountTypes[item.productId] || 'VND';
                const itemDiscount = calculateItemDiscount(item.productId, itemDiscountValue, itemDiscountType, item.price, item.quantity);
                const itemSubtotal = item.price * item.quantity;
                const itemTotal = itemSubtotal - itemDiscount;
                
                return `
                  <div class="item-row">
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">
                      <span>${item.quantity} x ${formatCurrency(item.price)}</span>
                      <span>${formatCurrency(itemTotal)}</span>
                    </div>
                    ${itemDiscount > 0 ? `
                    <div class="item-details">
                      <span>Giam gia:</span>
                      <span>-${formatCurrency(itemDiscount)}</span>
                    </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Summary -->
            <div class="summary">
              <div class="summary-row">
                <span>Tam tinh:</span>
                <span>${formatCurrency(activeTab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
              </div>
              ${getItemDiscountTotal() > 0 ? `
                <div class="summary-row">
                  <span>Giam gia SP:</span>
                  <span>-${formatCurrency(getItemDiscountTotal())}</span>
                </div>
              ` : ''}
              ${calculateTotalDiscount() > 0 ? `
                <div class="summary-row">
                  <span>Giam gia HD:</span>
                  <span>-${formatCurrency(calculateTotalDiscount())}</span>
                </div>
              ` : ''}
              <div class="total-row">
                <div class="item-details">
                  <span>TONG CONG:</span>
                  <span>${formatCurrency(calculateFinalTotal())}</span>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="payment-info">
              <div class="info-row">
                <span class="info-label">Thanh toan:</span>
                <span>
                  ${activeTab.paymentMethod === 'cash' ? 'Tien mat' : 'Chuyen khoan'}
                </span>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div>HOA DON TAM THOI</div>
              <div>In luc: ${new Date().toLocaleString('vi-VN')}</div>
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

      toast.success('Đang in hóa đơn tạm thời...');
    } catch (error) {
      console.error('Error printing temporary invoice:', error);
      toast.error('Không thể in hóa đơn tạm thời. Vui lòng thử lại.');
    }
  };

  const getItemDiscountTotal = () => {
    return activeTab.items.reduce((total, item) => {
      const discountValue = itemDiscounts[item.productId] || 0;
      const discountType = itemDiscountTypes[item.productId] || 'VND';
      return total + calculateItemDiscount(item.productId, discountValue, discountType, item.price, item.quantity);
    }, 0);
  };

  const calculateFinalTotal = () => {
    const subtotal = activeTab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemDiscountTotal = getItemDiscountTotal();
    const totalDiscount = calculateTotalDiscount();
    return Math.max(0, subtotal - itemDiscountTotal - totalDiscount);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Thêm hàm highlight text tìm kiếm
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

  // Thêm loading state khi đang load products hoặc customers
  if (!dataLoaded || state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Đang khởi tạo hóa đơn...</p>
          <button onClick={handleAddTab} className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">
            Tạo hóa đơn mới
          </button>
        </div>
      </div>
    );
  }

  // Kiểm tra nếu không có sản phẩm nào trong hệ thống
  const hasNoProducts = !state.products || state.products.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Quản lý thanh toán
          </h1>
          <p className="text-slate-600 mt-1">Tạo và quản lý hóa đơn bán hàng</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Nút xóa dữ liệu localStorage */}
          {state.tabs.some(tab => tab.items.length > 0) && (
            <button 
              onClick={handleClearAllData}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg shadow-red-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              title="Xóa tất cả dữ liệu hóa đơn đã lưu"
            >
              <TrashIcon className="h-5 w-5" />
              <span>Xóa dữ liệu</span>
            </button>
          )}
          
          <button 
            onClick={handleAddTab} 
            className="bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-pink-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Thêm hóa đơn mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-2 overflow-x-auto">
          {state.tabs.map((tab) => (
            <div key={tab.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => handleSetActiveTab(tab.id)}
                className={`${
                  tab.id === state.activeTabId
                    ? 'border-pink-500 bg-pink-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200`}
              >
                {tab.name}
              </button>
              {state.tabs.length > 1 && (
                <button
                  onClick={() => handleRemoveTab(tab.id)}
                  className="ml-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Invoice Summary - Moved to top */}
        <div className="xl:col-span-1 order-1 xl:order-2">
          <div className="sticky top-6 space-y-6">
            {/* Total Summary */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200/50 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2 text-pink-600" />
                {activeTab.name}
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-pink-200/50">
                  <span className="text-slate-600">Số lượng sản phẩm:</span>
                  <span className="font-medium text-slate-900">
                    {activeTab.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-pink-200/50">
                  <span className="text-slate-600">Tạm tính:</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(activeTab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                  </span>
                </div>
                
                {getItemDiscountTotal() > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-pink-200/50">
                    <span className="text-slate-600">Giảm giá sản phẩm:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(getItemDiscountTotal())}
                    </span>
                  </div>
                )}
                
                {calculateTotalDiscount() > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-pink-200/50">
                    <span className="text-slate-600">Giảm giá tổng:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(calculateTotalDiscount())}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl px-4 text-white">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(calculateFinalTotal())}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-slate-600" />
                Thông tin khách hàng
              </h3>
              
              {activeTab.customer ? (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">{activeTab.customer.name}</p>
                        <p className="text-sm text-green-700">{activeTab.customer.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'SET_CUSTOMER',
                          payload: { tabId: state.activeTabId, customer: null }
                        });
                        setCustomerPhone('');
                        setShowCustomerSuggestions(false);
                        setFilteredCustomers([]);
                        setSelectedSuggestionIndex(-1);
                        toast.success('Đã xóa thông tin khách hàng');
                      }}
                      className="p-2 text-green-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                      title="Xóa khách hàng để chọn lại"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="flex space-x-2">
                      <input
                        type="tel"
                        placeholder="Số điện thoại khách hàng"
                        value={customerPhone}
                        onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                        onFocus={() => {
                          if (customerPhone.trim().length > 0 && filteredCustomers.length > 0) {
                            setShowCustomerSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay để cho phép click vào suggestion
                          setTimeout(() => setShowCustomerSuggestions(false), 200);
                        }}
                        onKeyDown={handleKeyDown}
                        className="input-field flex-1"
                        autoComplete="off"
                      />
                      <button
                        onClick={handleCustomerSearch}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        disabled={!customerPhone.trim()}
                      >
                        <MagnifyingGlassIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Customer Suggestions Dropdown */}
                    {showCustomerSuggestions && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer, index) => (
                            <div
                              key={customer.id}
                              onClick={() => handleSelectCustomer(customer)}
                              className={`p-3 hover:bg-pink-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                                index === selectedSuggestionIndex ? 'bg-pink-50' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{highlightText(customer.name, customerPhone)}</p>
                                  <p className="text-sm text-pink-600 font-mono">{highlightText(customer.phone, customerPhone)}</p>
                                </div>
                                <div className="text-xs text-slate-400">
                                  Click để chọn
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-slate-500">
                            <UserIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">Không tìm thấy khách hàng</p>
                            <p className="text-xs text-slate-400 mt-1">Nhấn Enter để thêm khách hàng mới</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {showAddCustomer && (
                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl">
                      <input
                        type="text"
                        placeholder="Tên khách hàng"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="input-field"
                      />
                      <div className="flex space-x-2">
                        <button onClick={handleAddCustomer} className="btn-primary flex-1 flex items-center justify-center space-x-2">
                          <UserPlusIcon className="h-4 w-4" />
                          <span>Thêm khách hàng</span>
                        </button>
                        <button
                          onClick={() => setShowAddCustomer(false)}
                          className="btn-secondary"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <ReceiptPercentIcon className="h-5 w-5 mr-2 text-slate-600" />
                Giảm giá tổng
              </h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder={discountType === 'PERCENT' ? 'Phần trăm' : 'Số tiền giảm'}
                    value={discountAmount}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="input-field flex-1"
                    min="0"
                    max={discountType === 'PERCENT' ? 100 : undefined}
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  >
                    <option value="VND">VNĐ</option>
                    <option value="PERCENT">%</option>
                  </select>
                </div>
                {calculateTotalDiscount() > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Tiết kiệm: {formatCurrency(calculateTotalDiscount())}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Phương thức thanh toán</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleSetPaymentMethod('cash')}
                  className={`w-full flex items-center justify-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                    activeTab.paymentMethod === 'cash'
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <BanknotesIcon className="h-5 w-5" />
                  <span className="font-medium">Tiền mặt</span>
                </button>
                <button
                  onClick={() => handleSetPaymentMethod('transfer')}
                  className={`w-full flex items-center justify-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                    activeTab.paymentMethod === 'transfer'
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5" />
                  <span className="font-medium">Chuyển khoản</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {(() => {
                // Kiểm tra tồn kho cho tất cả sản phẩm trong hóa đơn
                const stockValidation = activeTab && activeTab.items.length > 0 ? validateInvoiceStock(state.activeTabId) : { isValid: true, errors: [] };
                const hasStockIssues = !stockValidation.isValid;
                const isDisabled = !activeTab || activeTab.items.length === 0 || hasStockIssues;
                
                return (
                  <>
                    {hasStockIssues && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Cảnh báo tồn kho</span>
                        </div>
                        <div className="text-xs text-red-700 space-y-1">
                          {stockValidation.errors.slice(0, 2).map((error, index) => (
                            <div key={index}>• {error}</div>
                          ))}
                          {stockValidation.errors.length > 2 && (
                            <div>• Và {stockValidation.errors.length - 2} lỗi khác...</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handlePayment}
                      disabled={isDisabled}
                      className={`w-full font-medium py-4 rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center space-x-2 ${
                        isDisabled
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : hasStockIssues
                          ? 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105'
                      }`}
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>
                        {!activeTab || activeTab.items.length === 0 
                          ? 'Thanh toán' 
                          : hasStockIssues 
                          ? 'Không thể thanh toán' 
                          : 'Thanh toán'
                        }
                      </span>
                    </button>
                  </>
                );
              })()}
              
              <button
                onClick={handlePrintInvoice}
                disabled={!activeTab || activeTab.items.length === 0}
                className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <PrinterIcon className="h-5 w-5" />
                <span>In hóa đơn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Search and Invoice Items */}
        <div className="xl:col-span-3 order-2 xl:order-1 space-y-6">
          {/* Search */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Tìm kiếm sản phẩm</h3>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Search Results */}
            {searchTerm && (
              <div className="mt-4 max-h-60 overflow-y-auto">
                {hasNoProducts ? (
                  <div className="text-center py-8">
                    <CubeIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Chưa có sản phẩm nào trong hệ thống</p>
                    <p className="text-slate-400 text-xs mt-1">Vui lòng thêm sản phẩm từ trang Quản lý sản phẩm</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <CubeIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Không tìm thấy sản phẩm nào</p>
                    <p className="text-slate-400 text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map((product) => {
                      const isOutOfStock = product.stock === 0;
                      const isLowStock = product.stock > 0 && product.stock <= 10;
                      
                      return (
                        <div
                          key={product.id}
                          className={`p-3 border rounded-lg transition-all ${
                            isOutOfStock 
                              ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-75' 
                              : isLowStock
                              ? 'border-yellow-200 bg-yellow-50 cursor-pointer hover:border-yellow-300 hover:bg-yellow-100'
                              : 'border-slate-200 bg-white cursor-pointer hover:border-pink-300 hover:bg-pink-50'
                          }`}
                          onClick={() => !isOutOfStock && handleAddProduct(product.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{highlightText(product.name, searchTerm)}</h4>
                              <p className="text-sm text-pink-600 font-semibold">{formatCurrency(product.price)}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  isOutOfStock
                                    ? 'bg-red-100 text-red-800'
                                    : isLowStock
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {isOutOfStock ? 'Hết hàng' : isLowStock ? 'Sắp hết' : 'Còn hàng'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {isOutOfStock ? '0 sản phẩm' : `${product.stock} sản phẩm`}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isOutOfStock ? (
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <XMarkIcon className="h-4 w-4 text-red-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors">
                                  <PlusIcon className="h-4 w-4 text-pink-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Empty state when no search term */}
            {!searchTerm && hasNoProducts && (
              <div className="mt-4 text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <CubeIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg font-medium">Chưa có sản phẩm nào</p>
                <p className="text-slate-400 text-sm mt-2">Vui lòng thêm sản phẩm từ trang Quản lý sản phẩm để bắt đầu tạo hóa đơn</p>
                <a 
                  href="/products" 
                  className="inline-flex items-center mt-4 px-4 py-2 bg-pink-500 text-white text-sm font-medium rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <CubeIcon className="h-4 w-4 mr-2" />
                  Quản lý sản phẩm
                </a>
              </div>
            )}
          </div>

          {/* Current Invoice Items */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Sản phẩm trong hóa đơn</h3>
            
            {activeTab.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCartIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Chưa có sản phẩm nào trong hóa đơn</p>
                <p className="text-slate-400 text-sm mt-2">Tìm kiếm và thêm sản phẩm từ thanh tìm kiếm bên trên</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab.items.map((item) => {
                  const itemDiscountValue = itemDiscounts[item.productId] || 0;
                  const itemDiscountType = itemDiscountTypes[item.productId] || 'VND';
                  const itemDiscount = calculateItemDiscount(item.productId, itemDiscountValue, itemDiscountType, item.price, item.quantity);
                  
                  // Lấy thông tin tồn kho hiện tại
                  const product = state.products.find(p => p.id === item.productId);
                  const currentStock = product ? product.stock : 0;
                  const isOverStock = item.quantity > currentStock;
                  const isNearLimit = item.quantity === currentStock;
                  
                  return (
                    <div key={item.productId} className={`p-4 rounded-xl border ${
                      isOverStock 
                        ? 'bg-red-50 border-red-200' 
                        : isNearLimit 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-slate-900">{highlightText(item.name, searchTerm)}</p>
                            {isOverStock && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Vượt tồn kho
                              </span>
                            )}
                            {isNearLimit && !isOverStock && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                Hết tồn kho
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{formatCurrency(item.price)} x {item.quantity}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-lg font-bold text-pink-600">{formatCurrency((item.price * item.quantity) - itemDiscount)}</p>
                            {isOverStock && (
                              <span className="text-xs text-red-600 font-medium">
                                (Chỉ còn {currentStock} sản phẩm)
                              </span>
                            )}
                          </div>
                          {itemDiscount > 0 && (
                            <p className="text-sm text-green-600">Tiết kiệm: {formatCurrency(itemDiscount)}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className={`w-12 text-center font-semibold px-3 py-1 rounded-lg border ${
                            isOverStock 
                              ? 'text-red-900 bg-red-100 border-red-300' 
                              : 'text-slate-900 bg-white border-slate-300'
                          }`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className={`p-2 rounded-lg transition-all ${
                              isOverStock || isNearLimit
                                ? 'text-red-400 hover:text-red-600 hover:bg-red-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all ml-2"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Item Discount */}
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-200">
                        <ReceiptPercentIcon className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-slate-600">Giảm giá:</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={itemDiscounts[item.productId] || ''}
                          onChange={(e) => handleItemDiscount(item.productId, Number(e.target.value) || 0, itemDiscountTypes[item.productId] || 'VND')}
                          className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                          min="0"
                          max={itemDiscountTypes[item.productId] === 'PERCENT' ? 100 : undefined}
                        />
                        <select
                          value={itemDiscountTypes[item.productId] || 'VND'}
                          onChange={(e) => {
                            setItemDiscountTypes(prev => ({
                              ...prev,
                              [item.productId]: e.target.value
                            }));
                            // Recalculate discount with new type
                            handleItemDiscount(item.productId, itemDiscounts[item.productId] || 0, e.target.value);
                          }}
                          className="px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent bg-white"
                        >
                          <option value="VND">VNĐ</option>
                          <option value="PERCENT">%</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement; 