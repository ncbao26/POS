import { createContext, useContext, useReducer, useEffect } from 'react';
import { productsAPI, customersAPI, invoicesAPI } from '../services/api';

const InvoiceContext = createContext();

const initialState = {
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

const invoiceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };

    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload, loading: false };

    case 'ADD_TAB':
      const newTabId = Math.max(...state.tabs.map(t => t.id)) + 1;
      return {
        ...state,
        tabs: [
          ...state.tabs,
          {
            id: newTabId,
            name: `Hóa đơn ${newTabId}`,
            items: [],
            customer: null,
            paymentMethod: 'CASH',
            discount: 0,
            total: 0
          }
        ],
        activeTabId: newTabId
      };

    case 'REMOVE_TAB':
      const filteredTabs = state.tabs.filter(tab => tab.id !== action.payload);
      let newActiveTabId = state.activeTabId;
      
      if (state.activeTabId === action.payload && filteredTabs.length > 0) {
        newActiveTabId = filteredTabs[0].id;
      }
      
      return {
        ...state,
        tabs: filteredTabs,
        activeTabId: newActiveTabId
      };

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTabId: action.payload
      };

    case 'ADD_ITEM_TO_INVOICE':
      const { tabId, productId } = action.payload;
      const product = state.products.find(p => p.id === productId);
      
      if (!product) {
        return state; // Không thêm nếu không tìm thấy sản phẩm
      }
      
      return {
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

    case 'UPDATE_ITEM_QUANTITY':
      const { tabId: updateTabId, productId: updateProductId, quantity } = action.payload;
      
      return {
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

    case 'REMOVE_ITEM_FROM_INVOICE':
      const { tabId: removeTabId, productId: removeProductId } = action.payload;
      
      return {
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

    case 'SET_CUSTOMER':
      const { tabId: customerTabId, customer } = action.payload;
      
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === customerTabId
            ? { ...tab, customer }
            : tab
        )
      };

    case 'SET_PAYMENT_METHOD':
      const { tabId: paymentTabId, method } = action.payload;
      
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === paymentTabId
            ? { ...tab, paymentMethod: method }
            : tab
        )
      };

    case 'SET_DISCOUNT':
      const { tabId: discountTabId, discount } = action.payload;
      
      return {
        ...state,
        tabs: state.tabs.map(tab => {
          if (tab.id === discountTabId) {
            const subtotal = tab.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const newTotal = subtotal - discount;
            
            return {
              ...tab,
              discount,
              total: Math.max(0, newTotal)
            };
          }
          return tab;
        })
      };

    case 'CLEAR_INVOICE':
      const clearTabId = action.payload;
      
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === clearTabId
            ? {
                ...tab,
                items: [],
                customer: null,
                paymentMethod: 'CASH',
                discount: 0,
                total: 0
              }
            : tab
        )
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
    if (token && state.products.length === 0) {
      console.log('InvoiceContext: Auto-loading products on initialization...');
      loadProducts();
    }
    if (token && state.customers.length === 0) {
      console.log('InvoiceContext: Auto-loading customers on initialization...');
      loadCustomers();
    }
  }, []); // Empty dependency array - only run once on mount

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      dispatch({ type: 'SET_LOADING', payload: true });
      const products = await productsAPI.getAll();
      console.log('Products loaded:', products.length);
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    } catch (error) {
      console.error('Error loading products:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải danh sách sản phẩm' });
    }
  };

  const loadCustomers = async () => {
    try {
      console.log('Loading customers...');
      const customers = await customersAPI.getAll();
      console.log('Customers loaded:', customers.length);
      dispatch({ type: 'SET_CUSTOMERS', payload: customers });
    } catch (error) {
      console.error('Error loading customers:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải danh sách khách hàng' });
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

      console.log('Creating invoice with data:', invoiceData);
      const invoice = await invoicesAPI.create(invoiceData);
      
      // Clear the tab after successful invoice creation
      dispatch({ type: 'CLEAR_INVOICE', payload: tabId });
      
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
    reloadData
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