import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './components/Card';
import Button from './components/Button';

const OrderTracking = ({ embedded = false, orderId }) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockOrder = {
      id: orderId || 'ORD001',
      status: 'In Transit',
      estimatedDelivery: '2024-01-20',
      trackingNumber: 'TRK123456789',
      currentLocation: 'Distribution Center, New York',
      timeline: [
        {
          status: 'Order Placed',
          date: '2024-01-15 10:30 AM',
          completed: true,
          description: 'Your order has been placed successfully'
        },
        {
          status: 'Payment Confirmed',
          date: '2024-01-15 10:35 AM',
          completed: true,
          description: 'Payment has been processed'
        },
        {
          status: 'Order Processed',
          date: '2024-01-16 2:15 PM',
          completed: true,
          description: 'Your order is being prepared for shipment'
        },
        {
          status: 'Shipped',
          date: '2024-01-17 9:00 AM',
          completed: true,
          description: 'Order has been shipped and is on its way'
        },
        {
          status: 'In Transit',
          date: '2024-01-18 11:30 AM',
          completed: true,
          description: 'Package is in transit to your location'
        },
        {
          status: 'Out for Delivery',
          date: '2024-01-20 8:00 AM',
          completed: false,
          description: 'Package will be delivered today'
        },
        {
          status: 'Delivered',
          date: 'Estimated: 2024-01-20 6:00 PM',
          completed: false,
          description: 'Package delivered successfully'
        }
      ],
      items: [
        { name: 'Paracetamol', quantity: 2, price: 15.99 },
        { name: 'Vitamin C', quantity: 1, price: 14.01 }
      ],
      total: 45.99,
      shippingAddress: '123 Main St, New York, NY 10001'
    };

    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 1000);
  }, [orderId]);

  const getStatusIcon = (status, completed) => {
    if (completed) {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
          <p className="mb-4">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard/orders')}>Back to Order History</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`${embedded ? '' : 'max-w-4xl mx-auto p-6'}`}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Track Order #{order.id}</h2>
        <p className="text-gray-600">Track your order status and delivery updates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking:</span>
                <span className="font-medium">{order.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-blue-600">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Delivery:</span>
                <span className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {item.name} (x{item.quantity})
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address:</h4>
              <p className="text-sm text-gray-600">{order.shippingAddress}</p>
            </div>
          </Card>
        </div>

        {/* Tracking Timeline */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking Timeline</h3>
            <div className="space-y-6">
              {order.timeline.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status, step.completed)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.status}
                      </h4>
                      <span className={`text-xs ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.date}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                    {step.status === 'In Transit' && step.completed && (
                      <p className="text-sm text-blue-600 mt-1">
                        Current Location: {order.currentLocation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => navigate('/dashboard/orders')}>
          Back to Order History
        </Button>
        <Button variant="outline">
          Contact Support
        </Button>
      </div>
    </div>
  );
};

export default OrderTracking;