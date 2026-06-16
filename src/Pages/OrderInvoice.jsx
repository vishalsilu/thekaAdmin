import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import adminApi from "../config/api";
import html2canvas from 'html2canvas/dist/html2canvas.esm.js';
import { jsPDF } from 'jspdf';

const OrderInvoice = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const handlePrint = async () => {
    const content = document.getElementById('invoice-print-area');
    if (!content) return alert('Nothing to print');
    try {
      const canvas = await html2canvas(content, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to generate PDF preview', err);
      alert('Failed to generate PDF preview');
    }
  };

  const handleDownload = async () => {
    const content = document.getElementById('invoice-print-area');
    if (!content) return alert('Nothing to download');

    try {
      const canvas = await html2canvas(content, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${orderId || 'order'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to download invoice as PDF');
    }
  };
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await adminApi.get(`orders/admin/${orderId}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error('Failed to load invoice order', err);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await adminApi.get(`invoices/order/${orderId}`);
        if (res.data?.invoice) setInvoice(res.data.invoice);
      } catch (err) {
        // no invoice found or error; that's fine
      }
    };
    if (orderId) fetchInvoice();
  }, [orderId]);

  const siteData = useSelector((state) => state.siteData?.data || {});
  const billing = invoice?.billing || order?.billingAddress || order?.shippingAddress || {};
  const shipping = invoice?.shipping || order?.shippingAddress || {};
  const customerName = `${billing.firstName || shipping.firstName || ''} ${billing.lastName || shipping.lastName || ''}`.trim() || 'Customer';
  const customerReference = order?.userId || invoice?.meta?.customerId || 'N/A';
  const itemList = invoice?.itemsSnapshot || order?.items || [];
  const subtotal = itemList.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const discount = order?.discount || 0;
  const shippingFee = order?.shipping || 0;
  const tax = order?.tax || 0;
  const total = invoice?.amount || order?.total || subtotal - discount + shippingFee + tax;
  const orderStatus = order?.status || 'Pending';
  const invoiceNumber = invoice?.invoiceNumber || `INV-${order?.orderId || ''}`;
  const invoiceDate = invoice ? new Date(invoice.createdAt) : order ? new Date(order.createdAt) : null;
  const formattedInvoiceDate = invoiceDate ? invoiceDate.toLocaleDateString() : '';

  return (
    <section className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <button className="text-sm" onClick={() => navigate(`/orders/${orderId || ''}`)}>← Back To Order</button>
        <div className="flex gap-2">
          <button className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase text-white" onClick={handlePrint}>Print Invoice</button>
          <button className="border border-black bg-white px-4 py-2 text-xs font-bold uppercase" onClick={handleDownload}>Download Invoice</button>
        </div>
      </div>

      <div id="invoice-print-area" className="mx-auto mt-3 max-w-6xl border border-stone-300 bg-white p-10 text-stone-800">
        {/* Company Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-4">
            {siteData.logoUrl ? <img src={siteData.logoUrl} alt="logo" className="h-14 w-14 object-contain" /> : null}
            <div>
              <h1 className="text-4xl font-bold">{siteData.websiteName || 'LUXE'}</h1>
              {siteData.tagline ? <p className="mt-1 text-sm text-stone-600">{siteData.tagline}</p> : null}
              {siteData.contact?.address ? <p className="text-sm text-stone-600">{siteData.contact.address}</p> : null}
              <p className="text-sm text-stone-600">{siteData.contact?.phone ? `Phone: ${siteData.contact.phone}` : ''}{siteData.contact?.email ? ` | ${siteData.contact.email}` : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold">Invoice</h2>
            <p className="mt-1">Invoice: <span className="font-medium">{invoice?.invoiceNumber || `INV-${order?.orderId || ''}`}</span></p>
            <p>Date: {invoice ? new Date(invoice.createdAt).toLocaleDateString() : (order ? new Date(order.createdAt).toLocaleDateString() : '')}</p>
            <p>Order: {order?.orderId}</p>
            <p>Payment: {order?.paymentMethod || 'COD'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">Bill To</p>
            <p className="mt-2 font-semibold">{invoice?.billing?.firstName || order?.billingAddress?.firstName || order?.shippingAddress?.firstName} {invoice?.billing?.lastName || order?.billingAddress?.lastName || order?.shippingAddress?.lastName}</p>
            <p className="text-sm">{invoice?.billing?.street || order?.billingAddress?.street || order?.shippingAddress?.street}</p>
            <p className="text-sm">{invoice?.billing?.city || order?.billingAddress?.city || order?.shippingAddress?.city}, {invoice?.billing?.state || order?.billingAddress?.state || order?.shippingAddress?.state} {invoice?.billing?.zip || order?.billingAddress?.zip || order?.shippingAddress?.zip}</p>
            <p className="text-sm">{invoice?.billing?.country || order?.billingAddress?.country || order?.shippingAddress?.country}</p>
            <p className="text-sm mt-1">Phone: {invoice?.billing?.phone || order?.shippingAddress?.mobile || ''}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">Ship To</p>
            <p className="mt-2 font-semibold">{invoice?.shipping?.firstName || order?.shippingAddress?.firstName} {invoice?.shipping?.lastName || order?.shippingAddress?.lastName}</p>
            <p className="text-sm">{invoice?.shipping?.street || order?.shippingAddress?.street}</p>
            <p className="text-sm">{invoice?.shipping?.city || order?.shippingAddress?.city}, {invoice?.shipping?.state || order?.shippingAddress?.state} {invoice?.shipping?.zip || order?.shippingAddress?.zip}</p>
            <p className="text-sm">{invoice?.shipping?.country || order?.shippingAddress?.country}</p>
          </div>
        </div>

        {/* Items table */}
        <div className="mt-6 overflow-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-stone-100">
                <th className="text-left px-4 py-2 text-sm">Item</th>
                <th className="text-left px-4 py-2 text-sm">SKU</th>
                <th className="text-right px-4 py-2 text-sm">Unit Price</th>
                <th className="text-right px-4 py-2 text-sm">Qty</th>
                <th className="text-right px-4 py-2 text-sm">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(invoice?.itemsSnapshot || order?.items || []).map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-3 text-sm">{it.name}</td>
                  <td className="px-4 py-3 text-sm">{it.sku || it.productId || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right">₹{(it.price||0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-right">{it.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right">₹{((it.price||0) * (it.quantity||1)).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-sm">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{((invoice?.amount && invoice?.itemsSnapshot) ? (invoice?.itemsSnapshot || []).reduce((s,it)=>s+((it.price||0)*(it.quantity||1)),0) : (order?.subtotal||0)).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span>Discount</span><span>-₹{(order?.discount||0).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span>₹{(order?.shipping||0).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span>Tax</span><span>₹{(order?.tax||0).toLocaleString('en-IN')}</span></div>
            <div className="mt-3 border-t pt-3 text-lg font-semibold flex justify-between"><span>Total</span><span>₹{(invoice?.amount || order?.total || 0).toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div className="mt-8 text-sm text-stone-600">
          <p>Notes: {order?.notes || 'Thank you for your purchase.'}</p>
          <p className="mt-2">If you have questions about this invoice, contact {siteData.contact?.email || 'support@example'}{siteData.contact?.phone ? ` or call ${siteData.contact.phone}` : ''}.</p>
        </div>
      </div>
    </section>
  );
};

export default OrderInvoice;
