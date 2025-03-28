const BaseTemplate = require("./BaseTemplate");

class ConfirmedTemplate extends BaseTemplate {
  constructor(orderData) {
    super("Order Confirmed ✅");
    this.orderData = orderData;
  }

  getTemplate() {
    // Custom styles for Confirmed state
    const customStyles = `
      .state-Confirmed .header {
        background-color: #3b82f6;
      }
      
      .state-Confirmed .btn {
        background-color: rgba(59, 130, 246, 0.1);
      }
      
      .state-Confirmed .btn:hover {
        background-color: rgba(59, 130, 246, 0.2);
      }
    `;

    // Header content specific to Confirmed state
    const headerContent = `
      <style>${customStyles}</style>
      <div class="header state-Confirmed">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        
        <h1>Your order is confirmed.</h1>
        
        <p class="subtext">
          Thank you for confirming receipt of your order. We hope you enjoy your purchase! View your order here
        </p>
        
        <a href="https://store.mohammed-zuhair.online/view-order/${this.orderData.orderId}/" class="btn">View order</a>
      </div>
    `;

    // Order details
    const orderDetails = `
    <div class="detail-row">
      <div class="detail-label">Order items</div>
      <div class="detail-value">
        ${this.orderData.items.map((order) => order.orderItem).join("<br>")}
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

module.exports = ConfirmedTemplate;
