'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Eye, Check, X, Truck, AlertCircle, RefreshCw, FileText, Trash2, ShoppingBag } from 'lucide-react';
import { API_BASE, fetchAdminOrders, updateAdminOrderStatus, deleteAdminOrder } from '@/lib/api';
import { Order } from '@/lib/types';

function getOrderImageUrl(imageUrl?: string): string {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiOrigin = API_BASE.replace(/\/api\/v1\/?$/, '');
  return `${apiOrigin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending Review',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    RETURNED: 'Returned',
  };
  return labels[status] || status;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadOrders = () => {
    setLoading(true);
    fetchAdminOrders(statusFilter || undefined, search || undefined)
      .then((res) => setOrders(res.results || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, search]);

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setInternalNotes(order.internal_notes || '');
    setCarrier(order.shipping_carrier || 'Aramex Express');
    setTrackingNumber(order.tracking_number || '');
    setUpdateSuccess(false);
    setConfirmDelete(false);
    setActionError(null);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      await updateAdminOrderStatus(selectedOrder.id, newStatus, internalNotes, carrier, trackingNumber);
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus as Order['status'],
        status_display: getOrderStatusLabel(newStatus),
        internal_notes: internalNotes,
        shipping_carrier: carrier,
        tracking_number: trackingNumber,
      });
      setUpdateSuccess(true);
      loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      setActionError(null);
      await updateAdminOrderStatus(selectedOrder.id, 'CONFIRMED', internalNotes, carrier, trackingNumber);
      setSelectedOrder({
        ...selectedOrder,
        status: 'CONFIRMED',
        status_display: getOrderStatusLabel('CONFIRMED'),
        internal_notes: internalNotes,
        shipping_carrier: carrier,
        tracking_number: trackingNumber,
      });
      setNewStatus('CONFIRMED');
      setUpdateSuccess(true);
      loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Failed to confirm order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteAdminOrder(selectedOrder.id);
      setSelectedOrder(null);
      setConfirmDelete(false);
      loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-lavenderDark block mb-1">
            Fulfillment & Commerce
          </span>
          <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
            Order Management
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Track customer orders, assign courier tracking numbers, and audit fulfillment workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="px-4 py-2 border border-brand-border rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-white text-brand-charcoal transition-colors flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        
        <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 text-brand-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer name, email..."
              className="w-full bg-brand-light border border-brand-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-lavender"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-brand-secondary font-medium">Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-brand-light border border-brand-border rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-charcoal focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light text-brand-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-secondary animate-pulse">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-secondary">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-light/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-charcoal">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4 text-brand-secondary">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-brand-charcoal block">{ord.customer_name}</span>
                      <span className="text-[11px] text-brand-secondary font-mono">{ord.customer_email}</span>
                    </td>
                    <td className="py-3 px-4 text-brand-secondary">
                      {ord.payment_method_display}
                    </td>
                    <td className="py-3 px-4 font-medium text-brand-charcoal">
                      {ord.items?.length || 1} item(s)
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-charcoal">
                      {ord.total} {ord.currency}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${ord.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' : ord.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {ord.status_display}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrderDetails(ord)}
                        className="px-3 py-1 bg-brand-light hover:bg-brand-charcoal hover:text-white rounded text-[11px] font-medium text-brand-charcoal transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Order Details & Status Updater Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-brand-border">
              <div>
                <span className="text-xs font-mono font-bold text-brand-lavenderDark block">
                  Order Reference: {selectedOrder.order_number}
                </span>
                <h3 className="font-serif text-xl font-normal text-brand-charcoal">
                  Fulfillment & Invoice Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-brand-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {updateSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Order information saved successfully.</span>
              </div>
            )}
            {actionError && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {actionError}
              </div>
            )}

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs bg-brand-light p-4 sm:p-5 rounded-xl border border-brand-border">
              <div>
                <span className="font-semibold text-brand-charcoal block mb-0.5">Client Information</span>
                <p className="text-brand-charcoal font-medium">{selectedOrder.customer_name}</p>
                <a href={`mailto:${selectedOrder.customer_email}`} className="block text-brand-secondary hover:text-brand-lavenderDark">{selectedOrder.customer_email}</a>
                <a href={`tel:${selectedOrder.customer_phone}`} className="block text-brand-secondary hover:text-brand-lavenderDark">{selectedOrder.customer_phone}</a>
                <p className="mt-2 text-brand-secondary">Order placed: {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-semibold text-brand-charcoal block mb-0.5">Shipping Address</span>
                <p className="text-brand-secondary">{selectedOrder.shipping_address?.address_line_1 || 'Address not provided'}</p>
                <p className="text-brand-secondary">
                  {[selectedOrder.shipping_address?.city, selectedOrder.shipping_address?.state, selectedOrder.shipping_address?.postal_code, selectedOrder.shipping_address?.country]
                    .filter(Boolean).join(', ')}
                </p>
                {selectedOrder.shipping_address?.notes && <p className="mt-1 text-brand-secondary">Delivery notes: {selectedOrder.shipping_address.notes}</p>}
                <p className="text-brand-secondary font-medium mt-2">Method: {selectedOrder.shipping_method}</p>
                {(selectedOrder.shipping_carrier || selectedOrder.tracking_number) && (
                  <p className="mt-1 text-brand-secondary">
                    {selectedOrder.shipping_carrier && `Carrier: ${selectedOrder.shipping_carrier}`}
                    {selectedOrder.shipping_carrier && selectedOrder.tracking_number && ' · '}
                    {selectedOrder.tracking_number && `Tracking: ${selectedOrder.tracking_number}`}
                  </p>
                )}
              </div>
            </div>

            {/* Items Snapshot Table */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-brand-charcoal mb-2">
                Purchased Products
              </h4>
              <div className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden text-xs">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white">
                    <div className="flex min-w-0 items-center gap-3">
                      {item.image_url ? (
                        <Image
                          src={getOrderImageUrl(item.image_url)}
                          alt={item.product_name}
                          width={72}
                          height={88}
                          unoptimized
                          className="h-[88px] w-[72px] shrink-0 rounded-lg border border-brand-border bg-brand-light object-cover"
                        />
                      ) : (
                        <div className="flex h-[88px] w-[72px] shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-light text-brand-secondary">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-serif font-medium text-sm text-brand-charcoal">{item.product_name}</span>
                        <span className="text-brand-secondary block mt-1 text-[11px]">Variant: {item.variant_name}</span>
                        <span className="text-brand-secondary block text-[11px]">SKU: {item.sku}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-6 text-right sm:flex-col sm:items-end sm:gap-1">
                      <span className="font-medium text-brand-charcoal">{item.quantity} × {item.unit_price} {selectedOrder.currency}</span>
                      <span className="font-bold text-brand-charcoal">{item.line_total} {selectedOrder.currency}</span>
                    </div>
                  </div>
                ))}
                <div className="space-y-2 bg-brand-light p-4 text-xs text-brand-secondary">
                  <div className="flex justify-between gap-4"><span>Subtotal</span><span>{selectedOrder.subtotal} {selectedOrder.currency}</span></div>
                  {Number(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between gap-4"><span>Discount{selectedOrder.coupon_code ? ` (${selectedOrder.coupon_code})` : ''}</span><span>-{selectedOrder.discount_amount} {selectedOrder.currency}</span></div>
                  )}
                  <div className="flex justify-between gap-4"><span>Shipping</span><span>{selectedOrder.shipping_fee} {selectedOrder.currency}</span></div>
                  {Number(selectedOrder.tax_amount) > 0 && (
                    <div className="flex justify-between gap-4"><span>Tax</span><span>{selectedOrder.tax_amount} {selectedOrder.currency}</span></div>
                  )}
                  <div className="flex justify-between gap-4 border-t border-brand-border pt-3 text-sm font-bold text-brand-charcoal">
                    <span>Total Amount</span>
                    <span>{selectedOrder.total} {selectedOrder.currency}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-brand-border p-4">
                <h4 className="font-semibold text-brand-charcoal">Payment</h4>
                <p className="mt-1 text-brand-secondary">{selectedOrder.payment_method_display}</p>
                <p className="mt-1 text-brand-secondary">Payment status: {selectedOrder.payment_status_display}</p>
              </div>
              <div className="rounded-xl border border-brand-border p-4">
                <h4 className="font-semibold text-brand-charcoal">Customer Notes</h4>
                <p className="mt-1 whitespace-pre-wrap text-brand-secondary">{selectedOrder.notes || 'No notes provided.'}</p>
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs pt-3 border-t border-brand-border">
              <h4 className="font-semibold uppercase tracking-wider text-brand-charcoal">
                Update Order Status & Logistics
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-semibold"
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled (Rollback Stock)</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-brand-charcoal block mb-1">Courier Carrier</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="Aramex / DHL / Express Colis"
                    className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TN-98127391-ARM"
                  className="w-full bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-brand-charcoal block mb-1">Admin Internal Notes</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Private notes for your team..."
                  className="w-full resize-y bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-brand-charcoal"
                />
              </div>

              {confirmDelete && (
                <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-red-800">Delete order {selectedOrder.order_number}?</p>
                    <p className="mt-1 text-[11px] text-red-700">This permanently removes the order. Its item stock will be returned to inventory.</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={isDeleting}
                      className="rounded-lg border border-brand-border bg-white px-3 py-2 text-xs font-medium text-brand-charcoal"
                    >
                      Keep Order
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteOrder}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-brand-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setConfirmDelete(true);
                  }}
                  disabled={isUpdating || isDeleting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Order
                </button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-brand-border rounded-lg text-brand-secondary font-medium"
                  >
                    Close
                  </button>
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      disabled={isUpdating || isDeleting}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-green-800 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {isUpdating ? 'Confirming...' : 'Confirm Order'}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isUpdating || isDeleting}
                    className="px-5 py-2 bg-brand-charcoal hover:bg-brand-lavenderDark text-white rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
