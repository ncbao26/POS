import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, subMonths, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { invoicesAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = () => {
  const [chartData, setChartData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyComparison, setDailyComparison] = useState(0);
  const [monthlyComparison, setMonthlyComparison] = useState(0);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  // Fetch revenue data from API with retry mechanism
  const fetchRevenueData = async (month, isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
        setRetryCount(0);
      }
      
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');
      
      console.log('Fetching revenue data for:', startDate, 'to', endDate);
      const data = await invoicesAPI.getRevenueByDate(startDate, endDate);
      console.log('Revenue data received:', data);
      
      setRevenueData(data);
      await calculateComparisons(data, month);
      generateChartData(data, month);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (retryCount < maxRetries && !isRetry) {
        // Retry logic
        console.log(`Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchRevenueData(month, true);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      } else {
        setError('Không thể tải dữ liệu doanh thu. Vui lòng kiểm tra kết nối và thử lại.');
      }
      
      setRevenueData([]);
      setTotalRevenue(0);
      setDailyComparison(0);
      setMonthlyComparison(0);
      setChartData(null);
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  // Calculate daily and monthly comparisons
  const calculateComparisons = async (data, month) => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const lastMonth = subMonths(month, 1);

    // Daily comparison
    const todayRevenue = data.find(item => 
      isSameDay(new Date(item.date), today)
    )?.revenue || 0;

    const yesterdayRevenue = data.find(item => 
      isSameDay(new Date(item.date), yesterday)
    )?.revenue || 0;

    if (yesterdayRevenue > 0) {
      const dailyChange = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
      setDailyComparison(dailyChange);
    } else {
      setDailyComparison(0);
    }

    // Monthly comparison
    const currentMonthTotal = data.reduce((sum, item) => sum + item.revenue, 0);
    setTotalRevenue(currentMonthTotal);

    try {
      const lastMonthStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
      const lastMonthEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
      
      console.log('Fetching last month data for comparison:', lastMonthStart, 'to', lastMonthEnd);
      const lastMonthData = await invoicesAPI.getRevenueByDate(lastMonthStart, lastMonthEnd);
      console.log('Last month data received:', lastMonthData);
      
      const lastMonthTotal = lastMonthData.reduce((sum, item) => sum + item.revenue, 0);
      
      if (lastMonthTotal > 0) {
        const monthlyChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
        setMonthlyComparison(monthlyChange);
      } else {
        setMonthlyComparison(0);
      }
    } catch (error) {
      console.error('Error calculating monthly comparison:', error);
      setMonthlyComparison(0);
    }
  };

  // Generate chart data
  const generateChartData = (data, month) => {
    const days = eachDayOfInterval({
      start: startOfMonth(month),
      end: endOfMonth(month)
    });

    const labels = days.map(day => format(day, 'dd/MM'));
    const revenues = days.map(day => {
      const dayData = data.find(item => 
        isSameDay(new Date(item.date), day)
      );
      return dayData ? dayData.revenue : 0;
    });

    setChartData({
      labels,
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: revenues,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    });
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Doanh thu tháng ${format(currentMonth, 'MM/yyyy', { locale: vi })}`,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#1f2937',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex;
            const date = eachDayOfInterval({
              start: startOfMonth(currentMonth),
              end: endOfMonth(currentMonth)
            })[dataIndex];
            return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
          },
          label: function(context) {
            const value = context.parsed.y;
            return `Doanh thu: ${new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (percentage) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  // Manual retry function
  const handleRetry = () => {
    setRetryCount(0);
    fetchRevenueData(currentMonth);
  };

  useEffect(() => {
    fetchRevenueData(currentMonth);
  }, [currentMonth]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with navigation and stats */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tháng trước"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              Doanh thu tháng {format(currentMonth, 'MM/yyyy')}
            </h3>
            
            <button
              onClick={handleNextMonth}
              disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) > new Date()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Tháng sau"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Total revenue display */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-blue-600 mb-1">Tổng doanh thu tháng này</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
        </div>

        {/* Comparison stats */}
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">So với hôm qua</div>
            <div className={`text-lg font-semibold ${
              dailyComparison >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(dailyComparison)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">So với tháng trước</div>
            <div className={`text-lg font-semibold ${
              monthlyComparison >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(monthlyComparison)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData && <Bar data={chartData} options={options} />}
      </div>

      {/* Summary stats */}
      {revenueData.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-500">Ngày cao nhất</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(Math.max(...revenueData.map(d => d.revenue)))}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Trung bình/ngày</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalRevenue / revenueData.length)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Ngày thấp nhất</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(Math.min(...revenueData.map(d => d.revenue)))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart; 