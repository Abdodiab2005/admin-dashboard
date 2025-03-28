// templates/index.js
const ToPayTemplate = require("./ToPayTemplate");
const DeliveredTemplate = require("./DeliveredTemplate");
const ConfirmedTemplate = require("./ConfirmedTemplate");
const EmailVerifyTemplate = require("./EmailVerifyTemplate");
const rejectedTemplate = require("./rejectedTemplate");

module.exports = {
  ToPayTemplate,
  DeliveredTemplate,
  ConfirmedTemplate,
  EmailVerifyTemplate,
  rejectedTemplate,
};
