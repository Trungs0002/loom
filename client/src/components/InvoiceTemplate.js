import { formatPrice } from '../config';

export const generateInvoiceHTML = (order) => {
  const date = new Date(order.createdAt || Date.now()).toLocaleString('vi-VN');
  const orderId = order._id ? order._id.toUpperCase() : 'N/A';

  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Sản phẩm'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hóa đơn #${orderId}</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #081F5C; letter-spacing: 5px; }
        .invoice-title { text-align: right; }
        .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .details div { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f8f8f8; padding: 10px; text-align: left; border-bottom: 2px solid #eee; }
        .total { text-align: right; font-size: 20px; font-weight: bold; color: #081F5C; }
        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
          .invoice-box { border: none; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div class="logo">LOOM</div>
          <div class="invoice-title">
            <h2 style="margin: 0;">HÓA ĐƠN BÁN HÀNG</h2>
            <p style="margin: 5px 0;">Mã đơn: #${orderId}</p>
            <p style="margin: 5px 0;">Ngày: ${date}</p>
          </div>
        </div>

        <div class="details">
          <div>
            <strong>Thông tin khách hàng:</strong><br>
            Tên: ${order.recipientName}<br>
            SĐT: ${order.phone}<br>
            Địa chỉ: ${order.address}
          </div>
          <div style="text-align: right;">
            <strong>Phương thức thanh toán:</strong><br>
            ${order.paymentMethod || 'Thanh toán khi nhận hàng (COD)'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th style="text-align: center;">SL</th>
              <th style="text-align: right;">Đơn giá</th>
              <th style="text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="total">
          Tổng cộng: ${formatPrice(order.totalAmount)}
        </div>

        <div class="footer">
          <p>Cảm ơn bạn đã mua sắm tại LOOM!</p>
          <p>Mọi thắc mắc vui lòng liên hệ hotline: 1900 xxxx</p>
        </div>
      </div>
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #081F5C; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">In hóa đơn</button>
      </div>
    </body>
    </html>
  `;
};
