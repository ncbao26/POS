import { useState, useCallback, useEffect } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const { state, addProduct, updateProduct, deleteProduct, loadProducts } = useInvoice();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costPrice: '',
    price: '',
    stock: ''
  });

  // Load products when component mounts
  useEffect(() => {
    if (state.products.length === 0) {
      console.log('ProductManagement: Loading products...');
      loadProducts();
    }
  }, [loadProducts, state.products.length]);

  const filteredProducts = state.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleAddProduct = useCallback(async () => {
    if (!formData.name.trim() || !formData.costPrice || !formData.price || !formData.stock) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (Number(formData.costPrice) >= Number(formData.price)) {
      toast.error('Giá bán phải lớn hơn giá vốn');
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        costPrice: Number(formData.costPrice),
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      await addProduct(productData);
      toast.success('Sản phẩm đã được thêm thành công');
      
      setFormData({ name: '', description: '', costPrice: '', price: '', stock: '' });
      setShowAddForm(false);
    } catch (error) {
      toast.error('Không thể thêm sản phẩm');
    }
  }, [formData, addProduct]);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      costPrice: product.costPrice?.toString() || '',
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setShowAddForm(true);
  }, []);

  const handleUpdateProduct = useCallback(async () => {
    if (!formData.name.trim() || !formData.costPrice || !formData.price || !formData.stock) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (Number(formData.costPrice) >= Number(formData.price)) {
      toast.error('Giá bán phải lớn hơn giá vốn');
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        costPrice: Number(formData.costPrice),
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      await updateProduct(editingProduct.id, productData);
      toast.success('Sản phẩm đã được cập nhật thành công');
      
      setEditingProduct(null);
      setFormData({ name: '', description: '', costPrice: '', price: '', stock: '' });
      setShowAddForm(false);
    } catch (error) {
      toast.error('Không thể cập nhật sản phẩm');
    }
  }, [formData, editingProduct, updateProduct]);

  const handleDeleteProduct = useCallback(async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(productId);
        toast.success('Sản phẩm đã được xóa thành công');
        
        // Adjust current page if necessary
        const newTotalPages = Math.ceil((filteredProducts.length - 1) / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (error) {
        toast.error('Không thể xóa sản phẩm');
      }
    }
  }, [deleteProduct, filteredProducts.length, itemsPerPage, currentPage]);

  const handleCancelForm = useCallback(() => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', costPrice: '', price: '', stock: '' });
  }, []);

  const handleShowAddForm = useCallback(() => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', costPrice: '', price: '', stock: '' });
    setShowAddForm(true);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateProfit = (costPrice, sellPrice) => {
    if (!costPrice || !sellPrice) return 0;
    return sellPrice - costPrice;
  };

  const calculateProfitMargin = (costPrice, sellPrice) => {
    if (!costPrice || !sellPrice) return 0;
    return ((sellPrice - costPrice) / sellPrice * 100).toFixed(1);
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl ${color} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
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
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} trong tổng số {filteredProducts.length} sản phẩm
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                page === currentPage
                  ? 'bg-blue-600 text-white shadow-lg'
                  : page === '...'
                  ? 'text-slate-400 cursor-default'
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  if (state.loading) {
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
            Quản lý sản phẩm
          </h1>
          <p className="text-slate-600 mt-1">Quản lý danh sách sản phẩm và tồn kho</p>
        </div>
        <button
          onClick={handleShowAddForm}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <CubeIcon className="h-6 w-6 mr-2 text-blue-600" />
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <button
              onClick={handleCancelForm}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên sản phẩm"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả sản phẩm
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giá vốn *
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                    step="1000"
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giá bán *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                    step="1000"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số lượng tồn kho *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="0"
                  autoComplete="off"
                />
              </div>

              {/* Profit Preview */}
              {formData.costPrice && formData.price && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Thông tin lợi nhuận</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Lợi nhuận/sản phẩm:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(calculateProfit(Number(formData.costPrice), Number(formData.price)))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tỷ suất lợi nhuận:</span>
                      <span className="font-semibold text-blue-600">
                        {calculateProfitMargin(Number(formData.costPrice), Number(formData.price))}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-6 mt-6 border-t border-slate-200">
            <button
              onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
              disabled={state.loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</span>
            </button>
            <button
              onClick={handleCancelForm}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl transition-all flex items-center space-x-2"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Hủy</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổng sản phẩm"
          value={state.products.length}
          icon={CubeIcon}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        
        <StatCard
          title="Còn hàng"
          value={state.products.filter(p => p.stock > 0).length}
          icon={CheckCircleIcon}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        
        <StatCard
          title="Hết hàng"
          value={state.products.filter(p => p.stock === 0).length}
          icon={ExclamationTriangleIcon}
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Danh sách sản phẩm</h3>
          {filteredProducts.length > 0 && (
            <div className="text-sm text-slate-600">
              Trang {currentPage} / {totalPages}
            </div>
          )}
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {!searchTerm && 'Thêm sản phẩm đầu tiên để bắt đầu'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Giá vốn
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Giá bán
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Lợi nhuận
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tồn kho
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                            <CubeIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-sm text-slate-500 max-w-xs truncate">
                                {product.description}
                              </div>
                            )}
                            <div className="text-xs text-slate-400">
                              ID: {product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {product.costPrice ? formatCurrency(product.costPrice) : 'Chưa có'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {formatCurrency(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.costPrice ? (
                          <div className="text-sm">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(calculateProfit(product.costPrice, product.price))}
                            </div>
                            <div className="text-xs text-slate-500">
                              {calculateProfitMargin(product.costPrice, product.price)}%
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">Chưa có</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-medium">
                          {product.stock} sản phẩm
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : product.stock <= 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock === 0 
                            ? 'Hết hàng' 
                            : product.stock <= 10 
                            ? 'Sắp hết' 
                            : 'Còn hàng'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all"
                            title="Xóa"
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
            
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductManagement; 