import { createContext, useContext, useReducer, useEffect } from 'react';
import { productsAPI, customersAPI, invoicesAPI } from '../services/api';

const InvoiceContext = createContext();

// Hàm lưu tabs vào localStorage
const saveTabsToLocalStorage = (tabs, activeTabId, nextTabId) => {
  try {
    const tabsData = {
      tabs,
      activeTabId,
      nextTabId,
      timestamp: Date.now()
    };
    localStorage.setItem('invoice_tabs', JSON.stringify(tabsData));
  } catch (error) {
    console.error('Error saving tabs to localStorage:', error);
  }
};

// Hàm khôi phục tabs từ localStorage
const loadTabsFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem('invoice_tabs');
    if (savedData) {
      const tabsData = JSON.parse(savedData);
      // Kiểm tra dữ liệu không quá cũ (24 giờ)
      const isDataFresh = Date.now() - tabsData.timestamp < 24 * 60 * 60 * 1000;
      if (isDataFresh && tabsData.tabs && tabsData.tabs.length > 0) {
        return {
          tabs: tabsData.tabs,
          activeTabId: tabsData.activeTabId,
          nextTabId: tabsData.nextTabId || (Math.max(...tabsData.tabs.map(t => t.id)) + 1)
        };
      }
    }
  } catch (error) {
    console.error('Error loading tabs from localStorage:', error);
  }
  return null;
};

// Hàm xóa dữ liệu localStorage
const clearTabsFromLocalStorage = () => {
  try {
    localStorage.removeItem('invoice_tabs');
  } catch (error) {
    console.error('Error clearing tabs from localStorage:', error);
  }
};

// Khôi phục dữ liệu từ localStorage hoặc sử dụng dữ liệu mặc định
const getInitialState = () => {
  try {
    const savedTabs = loadTabsFromLocalStorage();
    
    if (savedTabs && savedTabs.tabs && savedTabs.tabs.length > 0) {
      // Đảm bảo tất cả tabs đều có cấu trúc đúng
      const validTabs = savedTabs.tabs.map(tab => ({
        id: tab.id || 1,
        name: tab.name || `Hóa đơn ${tab.id || 1}`,
        items: Array.isArray(tab.items) ? tab.items : [],
        customer: tab.customer || null,
        paymentMethod: tab.paymentMethod || 'CASH',
        discount: tab.discount || 0,
        total: tab.total || 0
      }));

      // Đảm bảo activeTabId hợp lệ
      const validActiveTabId = validTabs.find(tab => tab.id === savedTabs.activeTabId) 
        ? savedTabs.activeTabId 
        : validTabs[0].id;

      return {
        tabs: validTabs,
        activeTabId: validActiveTabId,
        nextTabId: savedTabs.nextTabId || (Math.max(...validTabs.map(t => t.id)) + 1),
        customers: [],
        products: [],
        loading: false,
        error: null
      };
    }
  } catch (error) {
    console.error('Error loading saved tabs:', error);
    // Xóa dữ liệu lỗi
    clearTabsFromLocalStorage();
  }
  
  // Dữ liệu mặc định nếu không có localStorage hoặc có lỗi
  return {
    tabs: [
      {
        id: 1,
        name: 'Hóa đơn 1',
        items: [],
        customer: null,
        paymentMethod: 'CASH',
        discount: 0,
        total: 0
      }
    ],
    activeTabId: 1,
    nextTabId: 2,
    customers: [],
    products: [],
    loading: false,
    error: null
  };
};

const initialState = getInitialState();

const invoiceReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false, error: null };

    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload, loading: false, error: null };

    case 'ADD_TAB':
      const newTab = {
        id: state.nextTabId,
        name: `Hóa đơn ${state.nextTabId}`,
        items: [],
        customer: null,
        paymentMethod: 'CASH',
        discount: 0,
        total: 0
      };
      
      newState = {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: state.nextTabId,
        nextTabId: state.nextTabId + 1
      };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'REMOVE_TAB':
      const { payload: tabIdToRemove } = action;
      const remainingTabs = state.tabs.filter(tab => tab.id !== tabIdToRemove);
      
      if (remainingTabs.length === 0) {
        // Nếu không còn tab nào, tạo tab mới
        const defaultTab = {
          id: state.nextTabId,
          name: `Hóa đơn ${state.nextTabId}`,
          items: [],
          customer: null,
          paymentMethod: 'CASH',
          discount: 0,
          total: 0
        };
        
        newState = {
          ...state,
          tabs: [defaultTab],
          activeTabId: state.nextTabId,
          nextTabId: state.nextTabId + 1
        };
      } else {
        // Nếu tab bị xóa là tab đang active, chuyển sang tab khác
        let newActiveTabId = state.activeTabId;
        if (tabIdToRemove === state.activeTabId) {
          // Chọn tab đầu tiên trong danh sách còn lại
          newActiveTabId = remainingTabs[0].id;
        }
        
        newState = {
          ...state,
          tabs: remainingTabs,
          activeTabId: newActiveTabId
        };
      }
      
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'REMOVE_TAB_AFTER_PAYMENT':
      const { payload: paidTabId } = action;
      const remainingTabsAfterPayment = state.tabs.filter(tab => tab.id !== paidTabId);
      
      if (remainingTabsAfterPayment.length === 0) {
        // Nếu không còn tab nào, tạo tab mới
        const defaultTab = {
          id: state.nextTabId,
          name: `Hóa đơn ${state.nextTabId}`,
          items: [],
          customer: null,
          paymentMethod: 'CASH',
          discount: 0,
          total: 0
        };
        
        newState = {
          ...state,
          tabs: [defaultTab],
          activeTabId: state.nextTabId,
          nextTabId: state.nextTabId + 1
        };
      } else {
        // Chọn tab tiếp theo để active
        let newActiveTabId;
        
        // Tìm tab có id nhỏ nhất lớn hơn tab vừa xóa
        const nextTab = remainingTabsAfterPayment.find(tab => tab.id > paidTabId);
        if (nextTab) {
          newActiveTabId = nextTab.id;
        } else {
          // Nếu không có tab nào có id lớn hơn, chọn tab cuối cùng
          newActiveTabId = remainingTabsAfterPayment[remainingTabsAfterPayment.length - 1].id;
        }
        
        newState = {
          ...state,
          tabs: remainingTabsAfterPayment,
          activeTabId: newActiveTabId
        };
      }
      
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'SET_ACTIVE_TAB':
      newState = { ...state, activeTabId: action.payload };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'ADD_ITEM_TO_INVOICE':
      const { tabId, productId } = action.payload;
      const product = state.products.find(p => p.id === productId);
      
      if (!product) {
        return state; // Không thêm nếu không tìm thấy sản phẩm
      }
      
      newState = {
        ...state,
        tabs: state.tabs.map(tab => {
          if (tab.id === tabId) {
            const existingItem = tab.items.find(item => item.productId === productId);
            
            if (existingItem) {
              // Kiểm tra tồn kho trước khi tăng số lượng
              const newQuantity = existingItem.quantity + 1;
              if (product.stock < newQuantity) {
                return tab; // Không cập nhật nếu không đủ hàng
              }
              
              const updatedItems = tab.items.map(item =>
                item.productId === productId
                  ? { ...item, quantity: newQuantity }
                  : item
              );
              const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) - tab.discount;
              
              return {
                ...tab,
                items: updatedItems,
                total: Math.max(0, newTotal)
              };
            } else {
              // Kiểm tra tồn kho trước khi thêm sản phẩm mới
              if (product.stock < 1) {
                return tab; // Không thêm nếu hết hàng
              }
              
              const newItem = {
                productId,
                name: product.name,
                price: product.price,
                quantity: 1
              };
              const updatedItems = [...tab.items, newItem];
              const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) - tab.discount;
              
              return {
                ...tab,
                items: updatedItems,
                total: Math.max(0, newTotal)
              };
            }
          }
          return tab;
        })
      };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'UPDATE_ITEM_QUANTITY':
      const { tabId: updateTabId, productId: updateProductId, quantity } = action.payload;
      
      newState = {
        ...state,
        tabs: state.tabs.map(tab => {
          if (tab.id === updateTabId) {
            let updatedItems;
            
            if (quantity <= 0) {
              updatedItems = tab.items.filter(item => item.productId !== updateProductId);
            } else {
              // Kiểm tra tồn kho trước khi cập nhật số lượng
              const product = state.products.find(p => p.id === updateProductId);
              if (product && product.stock < quantity) {
                // Không cập nhật nếu không đủ hàng, giữ nguyên số lượng hiện tại
                return tab;
              }
              
              updatedItems = tab.items.map(item =>
                item.productId === updateProductId
                  ? { ...item, quantity }
                  : item
              );
            }
            
            const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) - tab.discount;
            
            return {
              ...tab,
              items: updatedItems,
              total: Math.max(0, newTotal)
            };
          }
          return tab;
        })
      };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'REMOVE_ITEM_FROM_INVOICE':
      const { tabId: removeTabId, productId: removeProductId } = action.payload;
      
      newState = {
        ...state,
        tabs: state.tabs.map(tab => {
          if (tab.id === removeTabId) {
            const updatedItems = tab.items.filter(item => item.productId !== removeProductId);
            const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) - tab.discount;
            
            return {
              ...tab,
              items: updatedItems,
              total: Math.max(0, newTotal)
            };
          }
          return tab;
        })
      };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'SET_CUSTOMER':
      const { tabId: customerTabId, customer } = action.payload;
      
      newState = {
        ...state,
        tabs: state.tabs.map(tab => {
          if (tab.id === customerTabId) {
            return { ...tab, customer };
          }
          return tab;
        })
      };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'SET_PAYMENT_METHOD':
      const { tabId: paymentTabId, method } = action.payload;
      
      newState = {
        ...state,
        tabs: state.tabs.map(tab => {
          if (tab.id === paymentTabId) {
            return { ...tab, paymentMethod: method };
          }
          return tab;
        })
      };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'SET_DISCOUNT':
      const { tabId: discountTabId, discount } = action.payload;
      
      newState = {
        ...state,
        tabs: state.tabs.map(tab => {
          if (tab.id === discountTabId) {
            const newTotal = tab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - discount;
            return { 
              ...tab, 
              discount,
              total: Math.max(0, newTotal)
            };
          }
          return tab;
        })
      };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'CLEAR_TAB':
      const { tabId: clearTabId } = action.payload;
      
      newState = {
        ...state,
        tabs: state.tabs.map(tab => {
          if (tab.id === clearTabId) {
            return {
              ...tab,
              items: [],
              customer: null,
              paymentMethod: 'CASH',
              discount: 0,
              total: 0
            };
          }
          return tab;
        })
      };
      saveTabsToLocalStorage(newState.tabs, newState.activeTabId, newState.nextTabId);
      return newState;

    case 'RESET_TO_INITIAL':
      clearTabsFromLocalStorage();
      return {
        tabs: [
          {
            id: 1,
            name: 'Hóa đơn 1',
            items: [],
            customer: null,
            paymentMethod: 'CASH',
            discount: 0,
            total: 0
          }
        ],
        activeTabId: 1,
        nextTabId: 2,
        customers: state.customers, // Giữ lại dữ liệu customers và products
        products: state.products,
        loading: false,
        error: null
      };

    default:
      return state;
  }
};

export const InvoiceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(invoiceReducer, initialState);

  // Auto-load data when context initializes if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Only load if not already loaded and not currently loading
      if (state.products.length === 0 && !state.loading) {
        loadProducts();
      }
      if (state.customers.length === 0 && !state.loading) {
        loadCustomers();
      }
    }
  }, []); // Empty dependency array - only run once on mount

  const loadProducts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const products = await productsAPI.getAll();
      // Ensure products is always an array
      const safeProducts = Array.isArray(products) ? products : [];
      dispatch({ type: 'SET_PRODUCTS', payload: safeProducts });
      dispatch({ type: 'CLEAR_ERROR' }); // Clear any previous errors
    } catch (error) {
      console.error('Error loading products:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải danh sách sản phẩm' });
      // Set empty array on error to prevent undefined issues
      dispatch({ type: 'SET_PRODUCTS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadCustomers = async () => {
    try {
      const customers = await customersAPI.getAll();
      // Ensure customers is always an array
      const safeCustomers = Array.isArray(customers) ? customers : [];
      dispatch({ type: 'SET_CUSTOMERS', payload: safeCustomers });
    } catch (error) {
      console.error('Error loading customers:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải danh sách khách hàng' });
      // Set empty array on error to prevent undefined issues
      dispatch({ type: 'SET_CUSTOMERS', payload: [] });
    }
  };

  const addProduct = async (productData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newProduct = await productsAPI.create(productData);
      await loadProducts(); // Reload products to get updated list
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      dispatch({ type: 'SET_LOADING', payload: false }); // Clear loading state
      dispatch({ type: 'SET_ERROR', payload: 'Không thể thêm sản phẩm' });
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedProduct = await productsAPI.update(id, productData);
      await loadProducts(); // Reload products to get updated list
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      dispatch({ type: 'SET_LOADING', payload: false }); // Clear loading state
      dispatch({ type: 'SET_ERROR', payload: 'Không thể cập nhật sản phẩm' });
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await productsAPI.delete(id);
      await loadProducts(); // Reload products to get updated list
    } catch (error) {
      console.error('Error deleting product:', error);
      dispatch({ type: 'SET_LOADING', payload: false }); // Clear loading state
      dispatch({ type: 'SET_ERROR', payload: 'Không thể xóa sản phẩm' });
      throw error;
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const newCustomer = await customersAPI.create(customerData);
      await loadCustomers(); // Reload customers to get updated list
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể thêm khách hàng' });
      throw error;
    }
  };

  const createInvoice = async (tabId) => {
    try {
      const tab = state.tabs.find(t => t.id === tabId);
      if (!tab || tab.items.length === 0) {
        throw new Error('Hóa đơn không có sản phẩm');
      }

      // Kiểm tra tồn kho trước khi tạo hóa đơn
      const stockErrors = [];
      for (const item of tab.items) {
        const product = state.products.find(p => p.id === item.productId);
        if (!product) {
          stockErrors.push(`Sản phẩm ${item.name} không tồn tại`);
          continue;
        }
        
        if (product.stock < item.quantity) {
          if (product.stock === 0) {
            stockErrors.push(`Sản phẩm "${item.name}" đã hết hàng`);
          } else {
            stockErrors.push(`Sản phẩm "${item.name}" chỉ còn ${product.stock} sản phẩm, không đủ cho ${item.quantity} sản phẩm yêu cầu`);
          }
        }
      }

      if (stockErrors.length > 0) {
        throw new Error(`Không thể thanh toán:\n${stockErrors.join('\n')}`);
      }

      const invoiceData = {
        customerId: tab.customer?.id || null,
        paymentMethod: (tab.paymentMethod || 'CASH').toUpperCase(),
        discountAmount: Number(tab.discount) || 0,
        discountPercentage: 0,
        notes: '',
        items: tab.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discountAmount: 0,
          discountPercentage: 0
        }))
      };

      const invoice = await invoicesAPI.create(invoiceData);
      
      // Xóa tab sau khi thanh toán thành công và tự động chuyển sang tab khác
      dispatch({ type: 'REMOVE_TAB_AFTER_PAYMENT', payload: tabId });
      
      // Reload products to update stock
      await loadProducts();
      
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Không thể tạo hóa đơn' });
      throw error;
    }
  };

  // Thêm hàm kiểm tra tồn kho cho một sản phẩm cụ thể
  const validateStock = (productId, requestedQuantity) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) {
      return { isValid: false, message: 'Sản phẩm không tồn tại' };
    }
    
    if (product.stock < requestedQuantity) {
      if (product.stock === 0) {
        return { isValid: false, message: `Sản phẩm "${product.name}" đã hết hàng` };
      } else {
        return { 
          isValid: false, 
          message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm` 
        };
      }
    }
    
    return { isValid: true, message: '' };
  };

  // Thêm hàm kiểm tra tồn kho cho toàn bộ hóa đơn
  const validateInvoiceStock = (tabId) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab) {
      return { isValid: false, errors: ['Không tìm thấy hóa đơn'] };
    }

    const errors = [];
    for (const item of tab.items) {
      const validation = validateStock(item.productId, item.quantity);
      if (!validation.isValid) {
        errors.push(validation.message);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const reloadData = async () => {
    await Promise.all([loadProducts(), loadCustomers()]);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue = {
    state,
    dispatch,
    loadProducts,
    loadCustomers,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    createInvoice,
    validateStock,
    validateInvoiceStock,
    reloadData,
    clearTabsFromLocalStorage,
    clearError
  };

  return (
    <InvoiceContext.Provider value={contextValue}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
}; 