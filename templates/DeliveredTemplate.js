const BaseTemplate = require("./BaseTemplate");

class DeliveredTemplate extends BaseTemplate {
  constructor(orderData) {
    super("Your Order Has Been Delivered 🚚");
    this.orderData = orderData;
  }

  getTemplate() {
    // Custom styles for Delivered state
    const customStyles = `
      .state-Delivered .header {
        background-color: #10b981;
      }
      
      .state-Delivered .btn {
        background-color: rgba(16, 185, 129, 0.1);
      }
      
      .state-Delivered .btn:hover {
        background-color: rgba(16, 185, 129, 0.2);
      }
    `;

    // Header content specific to Delivered state
    const headerContent = `
      <style>${customStyles}</style>
      <div class="header state-Delivered">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
        
        <h1>Your order has been delivered.</h1>
        
        <p class="subtext">
          Please remember to review your purchase. If you have any questions, please contact our customer support.
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

module.exports = DeliveredTemplate;
