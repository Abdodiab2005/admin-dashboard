const BaseTemplate = require("./BaseTemplate");

class ToPayTemplate extends BaseTemplate {
  constructor(orderData) {
    super("Payment confirmed");
    this.orderData = orderData;
  }

  getTemplate() {
    // Custom styles for ToPay state
    const customStyles = `
      .state-ToPay .header {
        background-color: #f59e0b;
      }
      
      .state-ToPay .btn {
        background-color: rgba(245, 158, 11, 0.1);
      }
      
      .state-ToPay .btn:hover {
        background-color: rgba(245, 158, 11, 0.2);
      }
    `;

    // Header content specific to ToPay state
    const headerContent = `
      <style>${customStyles}</style>
      <div class="header state-ToPay">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        
        <h1>You've been confirmed the payment successfully.</h1>
        
        <p class="subtext">
          You have confirmed the payment successfully. Awaiting for confirmation of the payment from seller.
          We will notify you once the payment is confirmed. Thank you for your purchase!
        </p>
        
        <a href="https://store.mohammed-zuhair.online/view-order/${this.orderData.orderId}/" class="btn">Check status</a>
      </div>
    `;

    // Order details
    const orderDetails = `
    <div class="detail-row">
      <div class="detail-label">Order items</div>
      <div class="detail-value">
        ${this.orderData.items.map((order) => order.orderItem).join("<br><hr><br>")}
      </div>
    </div>

          
          <div class="detail-row">
            <div class="detail-label">Order item no.</div>
            <div class="detail-value">${this.orderData.orderId}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Placed on</div>
            <div class="detail-value">${this.orderData.placedDate}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Total price</div>
            <div class="detail-value">${this.orderData.items.reduce((acc, order) => acc + order.totalPrice, 0)} ${
      this.orderData.currency === "EG" ? "L.E" : "$" || "L.E"
    }</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Payment</div>
            <div class="detail-value">${this.orderData.paymentMethod}</div>
          </div>
        `;

    return this.getBaseHTML(headerContent, orderDetails);
  }
}

module.exports = ToPayTemplate;
