const BaseTemplate = require("./BaseTemplate");

class RepliedTicketTemplate extends BaseTemplate {
  constructor(ticketData) {
    super("Ticket Replied ✅");
    this.ticketData = ticketData;
  }

  getTemplate() {
    // Custom styles for ticket reply state
    const customStyles = `
            .state-RepliedTicket .header {
                background-color: #3b82f6;
            }
            
            .state-RepliedTicket .btn {
                background-color: rgba(59, 130, 246, 0.1);
            }
            
            .state-RepliedTicket .btn:hover {
                background-color: rgba(59, 130, 246, 0.2);
            }
        `;

    // Header content specific to replied ticket state
    const headerContent = `
            <style>${customStyles}</style>
            <div class="header state-RepliedTicket">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                
                <h1>Your ticket has been replied to.</h1>
                
                <p class="subtext">
                    Thank you for contacting us. We've responded to your ticket. You can check the reply below or view the full ticket.
                </p>
                
                <a href="https://store.mohammed-zuhair.online/support/ticket/view/${this.ticketData.ticketId}/" class="btn">View ticket</a>
            </div>
        `;

    // Ticket details
    const ticketDetails = `
            <div class="detail-row">
                <div class="detail-label">Ticket ID</div>
                <div class="detail-value">${this.ticketData.ticketId}</div>
            </div>
                    
            <div class="detail-row">
                <div class="detail-label">Submitted on</div>
                <div class="detail-value">${new Date(this.ticketData.createdAt).toLocaleString("en")}</div>
            </div>
                    
            <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value">${this.ticketData.status}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Check status</div>
                <div class="detail-value">
                    <a href="https://store.mohammed-zuhair.online/support/ticket/view/${
                      this.ticketData.ticketId
                    }/" class="btn">Check ticket status</a>
                </div>
            </div>
        `;

    return this.getBaseHTML(headerContent, ticketDetails);
  }
}

module.exports = RepliedTicketTemplate;
