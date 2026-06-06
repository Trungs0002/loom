import { formatPrice } from '../config';

/**
 * Generates a pixel-perfect HTML invoice by overlaying data on hoadon.png.
 * Canvas size: 1122x1402 px.
 * Display scale: 0.7 (for screen), 1.0 (for print).
 * Font: Navy Serif (#001D52).
 */
export const generateInvoiceHTML = (order, user = null) => {
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const orderId = order._id ? order._id.toUpperCase().slice(-8) : 'N/A';
  
  const subtotal = order.totalAmount;
  const shippingFee = "FREE";
  const discount = "0 VND";

  // Item Rows (Max 5 shown based on coordinates provided)
  const itemRowsY = [735, 776, 817, 858, 899];
  let currentRowIndex = 0;
  let itemsHTML = '';

  order.items.forEach((item) => {
    if (currentRowIndex < 5) {
      itemsHTML += `
        <div class="field item-row" style="top: ${itemRowsY[currentRowIndex]}px;">
          <span class="item-desc">${item.product?.name || 'Sản phẩm'}</span>
          <span class="item-qty">${item.quantity}</span>
          <span class="item-price">${formatPrice(item.price)}</span>
          <span class="item-amount">${formatPrice(item.price * item.quantity)}</span>
        </div>
      `;
      currentRowIndex++;
    }

    if (item.isCustomized && currentRowIndex < 5) {
      itemsHTML += `
        <div class="field item-row" style="top: ${itemRowsY[currentRowIndex]}px; font-style: italic; color: #666;">
          <span class="item-desc" style="padding-left: 20px;">+ Service Fee: Embroidery [${item.customName}]</span>
          <span class="item-qty">1</span>
          <span class="item-price">${formatPrice(50000)}</span>
          <span class="item-amount">${formatPrice(50000)}</span>
        </div>
      `;
      currentRowIndex++;
    }
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${orderId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        
        body { 
          margin: 0; 
          padding: 0; 
          background: #525252; 
          display: flex; 
          flex-direction: column; 
          align-items: center;
          font-family: 'Playfair Display', serif;
          color: #001D52;
          overflow-x: hidden;
        }

        .invoice-scaler {
          transform: scale(0.7);
          transform-origin: top center;
          height: 1050px; /* Reduced display height */
          margin-top: 40px;
        }

        .invoice-canvas { 
          position: relative; 
          width: 1122px; 
          height: 1402px; 
          background: #fff; 
          box-shadow: 0 20px 50px rgba(0,0,0,0.3); 
          overflow: hidden; 
        }

        .background-template { 
          position: absolute; 
          top: 0; 
          left: 0; 
          width: 1122px; 
          height: 1402px; 
          z-index: 1; 
        }

        .field { 
          position: absolute; 
          z-index: 10; 
          font-size: 15px; 
          white-space: nowrap;
          pointer-events: none;
        }

        /* HEADER CENTERED FIELDS */
        .centered { transform: translateX(-50%); text-align: center; }
        .invoice-no { top: 333px; left: 184px; font-weight: 700; }
        .date { top: 333px; left: 375px; }
        .due-date { top: 333px; left: 560px; }
        .payment-method { top: 333px; left: 745px; font-size: 13px; }
        .order-no { top: 333px; left: 935px; font-weight: 700; }

        /* BILL TO (Left x=262) */
        .bill-to-name { top: 462px; left: 262px; font-weight: 700; font-size: 17px; }
        .bill-to-phone { top: 505px; left: 262px; }
        .bill-to-email { top: 548px; left: 262px; font-style: italic; }
        .bill-to-addr { top: 591px; left: 262px; max-width: 350px; white-space: normal; line-height: 1.2; }

        /* SHIP TO (Left x=764) */
        .ship-to-name { top: 462px; left: 764px; font-weight: 700; font-size: 17px; }
        .ship-to-phone { top: 505px; left: 764px; }
        .ship-to-addr { top: 548px; left: 764px; max-width: 300px; white-space: normal; line-height: 1.2; }

        /* ITEMS TABLE */
        .item-row { left: 0; width: 1122px; display: block; }
        .item-desc { position: absolute; left: 105px; width: 450px; text-align: left; overflow: hidden; text-overflow: ellipsis; }
        .item-qty { position: absolute; left: 621px; transform: translateX(-50%); width: 50px; text-align: center; }
        .item-price { position: absolute; left: 850px; transform: translateX(-100%); width: 150px; text-align: right; }
        .item-amount { position: absolute; left: 1015px; transform: translateX(-100%); width: 150px; text-align: right; font-weight: 700; }

        /* TOTALS (Right x=1015) */
        .right-aligned { transform: translateX(-100%); text-align: right; width: 200px; }
        .subtotal { top: 965px; left: 1015px; }
        .shipping-fee { top: 1010px; left: 1015px; }
        .discount { top: 1054px; left: 1015px; }
        .total-final { top: 1112px; left: 1015px; font-size: 28px; font-weight: 700; }

        /* FOOTER LABELS */
        .prepared-by { top: 1235px; left: 120px; font-style: italic; }
        .customer-sig { top: 1235px; left: 636px; font-style: italic; }

        /* ACTIONS */
        .no-print { margin-bottom: 50px; z-index: 100; margin-top: 20px; }
        .btn-print { 
          padding: 15px 50px; 
          background: #001D52; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
          font-weight: 700; 
          font-family: serif;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        @media print {
          .no-print { display: none !important; }
          body { background: white; padding: 0; }
          .invoice-scaler { transform: scale(1); margin: 0; height: auto; }
          .invoice-canvas { box-shadow: none; }
          @page { size: 1122px 1402px; margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-scaler">
        <div class="invoice-canvas">
          <img src="/hoadon.png" class="background-template" alt="template">

          <!-- Header Info -->
          <div class="field centered invoice-no">${orderId}</div>
          <div class="field centered date">${dateStr}</div>
          <div class="field centered due-date">${dateStr}</div>
          <div class="field centered payment-method">${order.paymentMethod || 'COD'}</div>
          <div class="field centered order-no">${orderId}</div>

          <!-- Bill To -->
          <div class="field bill-to-name">${order.recipientName}</div>
          <div class="field bill-to-phone">${order.phone}</div>
          <div class="field bill-to-email">${user?.email || 'customer@loom.com'}</div>
          <div class="field bill-to-addr">${order.address}</div>

          <!-- Ship To -->
          <div class="field ship-to-name">${order.recipientName}</div>
          <div class="field ship-to-phone">${order.phone}</div>
          <div class="field ship-to-addr">${order.address}</div>

          <!-- Items -->
          ${itemsHTML}

          <!-- Totals -->
          <div class="field right-aligned subtotal">${formatPrice(subtotal)}</div>
          <div class="field right-aligned shipping-fee">${shippingFee}</div>
          <div class="field right-aligned discount">${discount}</div>
          <div class="field right-aligned total-final">${formatPrice(order.totalAmount)}</div>

          <!-- Footer Labels -->
          <div class="field prepared-by">LOOM Fulfillment Team</div>
          <div class="field customer-sig">_______________________</div>
        </div>
      </div>

      <div class="no-print">
        <button class="btn-print" onclick="window.print()">Print Invoice</button>
      </div>
    </body>
    </html>
  `;
};
