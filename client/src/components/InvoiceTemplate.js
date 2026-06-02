import API_BASE, { formatPrice } from '../config';

export const getImgUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};

export const generateInvoiceHTML = (order, headerLogo = '') => {
  const date = new Date(order.createdAt || Date.now()).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const orderId = order._id ? order._id.toUpperCase() : 'N/A';
  const logoUrl = headerLogo ? getImgUrl(headerLogo) : '';

  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Product'}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${orderId}</title>
      <style>
        body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
        .logo { max-height: 50px; }
        .logo-text { font-size: 32px; font-weight: bold; color: #081F5C; letter-spacing: 8px; margin: 0; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0; color: #081F5C; font-size: 24px; letter-spacing: 2px; }
        .details { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; }
        .details div { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background: #081F5C; color: #fff; padding: 12px 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .total-section { display: flex; justify-content: flex-end; }
        .total-table { width: 250px; }
        .total-table td { padding: 10px 0; }
        .total-label { font-weight: bold; color: #777; }
        .total-amount { text-align: right; font-size: 24px; font-weight: bold; color: #081F5C; }
        .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 30px; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
          .invoice-box { border: none; box-shadow: none; width: 100%; max-width: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div class="logo-container">
            ${logoUrl ? `<img src="${logoUrl}" alt="LOOM" class="logo">` : `<h1 class="logo-text">LOOM</h1>`}
          </div>
          <div class="invoice-title">
            <h2>SALES INVOICE</h2>
            <p style="margin: 5px 0; color: #777;">Order ID: #${orderId}</p>
            <p style="margin: 5px 0; color: #777;">Date: ${date}</p>
          </div>
        </div>

        <div class="details">
          <div>
            <strong style="color: #081F5C; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Customer Details</strong><br>
            <p style="margin: 10px 0 0 0;">
              Name: ${order.recipientName}<br>
              Phone: ${order.phone}<br>
              Address: ${order.address}
            </p>
          </div>
          <div style="text-align: right;">
            <strong style="color: #081F5C; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Payment Method</strong><br>
            <p style="margin: 10px 0 0 0;">
              ${order.paymentMethod || 'Cash on Delivery (COD)'}
            </p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="border-top-left-radius: 4px;">Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right; border-top-right-radius: 4px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="total-section">
          <table class="total-table">
            <tr>
              <td class="total-label">Grand Total</td>
              <td class="total-amount">${formatPrice(order.totalAmount)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for shopping at LOOM!</p>
          <p>For any inquiries, please contact our support at support@loom.com</p>
          <p>&copy; ${new Date().getFullYear()} LOOM Studio. All rights reserved.</p>
        </div>
      </div>
      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 30px; background: #081F5C; color: white; border: none; border-radius: 30px; cursor: pointer; font-weight: bold; font-size: 14px; box-shadow: 0 4px 15px rgba(8, 31, 92, 0.2); transition: transform 0.2s;">
          Print Invoice
        </button>
      </div>
    </body>
    </html>
  `;
};
