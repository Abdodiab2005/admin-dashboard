const express = require("express");
const router = express.Router();
const { admin, db } = require("../utils/firebase");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { Timestamp } = admin.firestore;
const { sendEmail } = require("../utils/mailer");
const {
  ToPayTemplate,
  DeliveredTemplate,
  ConfirmedTemplate,
  EmailVerifyTemplate,
  rejectedTemplate,
} = require("../templates");
const { encryptData, decryptData } = require("../utils/cryptoHelper");

function formatTransactionData(transaction) {
  return {
    orderId: transaction.id,
    placedDate: new Date(transaction.createdAt._seconds * 1000).toISOString().split("T")[0], // Convert timestamp to YYYY-MM-DD
    paymentMethod: transaction.paymentMethod,
    currency: transaction.currency,
    items: transaction.products.map((product) => ({
      orderItem: product.name,
      totalPrice: parseFloat(product.price), // Convert price string to number
    })),
  };
}

router.get("/transactions", verifyAdmin, async (req, res) => {
  const transactions = await db.collection("transactions").get();
  const formattedData = transactions.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${year}-${month}-${day} ${hours}:${minutes} ${amPm}`;
  }

  // Pass it to EJS templates
  res.locals.formatTimestamp = formatTimestamp;

  // res.status(200).json({ transactions: formattedData });
  res.render("transactions/transactions", { transactions: formattedData });
});

router.post("/transaction/update-transaction", verifyAdmin, async (req, res) => {
  const { transactionId, status, proof } = req.body;

  if (!transactionId) {
    return res.status(400).json({ error: "Transaction ID is required." });
  }

  try {
    const transactionRef = await db.collection("transactions").doc(transactionId).get();
    if (!transactionRef.exists) {
      console.error("Transaction not found.");
      return res.status(404).json({ error: "Transaction not found." });
    }
    const transData = {
      id: transactionRef.id,
      ...transactionRef.data(),
    };

    let updatedProduct;
    if (proof && proof.id) {
      transData.products.forEach((product) => {
        if (product.productId === proof.id) {
          updatedProduct = proof.data;
        }
      });
    }

    if (status) {
      status.updatedAt = Timestamp.now();
      await db
        .collection("transactions")
        .doc(transactionId)
        .update({
          status: admin.firestore.FieldValue.arrayUnion(status),
        });

      // !-------------------------------------------------------!
      const userRecord = await admin.auth().getUser(transData.uid);
      const userEmail = userRecord.email;
      // ?=-----------------------------------------------------?

      switch (status.state) {
        case "ToPay":
          const formattedToPayOrder = formatTransactionData(transData);
          const toPayEmail = new ToPayTemplate(formattedToPayOrder);
          await sendEmail(userEmail, toPayEmail);
          break;

        case "Delivered":
          const formattedDeliveredOrder = formatTransactionData(transData);
          const DeliveredEmail = new DeliveredTemplate(formattedDeliveredOrder);
          await sendEmail(userEmail, DeliveredEmail);
          break;

        case "Preparing":
          const formattedPreparingOrder = formatTransactionData(transData);
          const PreparingEmail = new ConfirmedTemplate(formattedPreparingOrder);
          await sendEmail(userEmail, PreparingEmail);
          break;

        case "Rejected":
          const formattedRejectedOrder = formatTransactionData(transData);
          const rejectedEmail = new rejectedTemplate(formattedRejectedOrder, status.message, status.state);
          await sendEmail(userEmail, rejectedEmail);
          break;

        default:
          break;
      }

      return res.status(200).json({ success: true, message: "Transaction updated successfully." });
    }
    updatedProduct.forEach((product) => {
      product.createdAt = Timestamp.now();
    });

    if (proof) {
      const encryptedProofData = proof.data.map((p) => {
        const encryptedData = {};
        for (let k in p) {
          if (k !== "createdAt") {
            encryptedData[k] = encryptData(p[k]);
          } else {
            encryptedData[k] = p[k];
          }
        }
        encryptedData.updatedAt = Timestamp.now();
        return encryptedData;
      });
      const transactionDoc = await db.collection("transactions").doc(transactionId).get();
      const transactionData = transactionDoc.data();
      const updatedProduct = transactionData.products.map((product) => {
        if (product.productId === proof.id) {
          product.proof = encryptedProofData;
          return product;
        }
        return product;
      });

      await db.collection("transactions").doc(transactionId).update(
        {
          products: updatedProduct,
        },
        { merge: true }
      );

      return res.status(200).json({ success: true, message: "Transaction updated successfully." });
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update transaction." });
  }
});

router.get("/view/transaction/:transacationId", verifyAdmin, async (req, res) => {
  const transactionId = req.params.transacationId;
  try {
    const transaction = await db.collection("transactions").doc(transactionId).get();

    if (!transaction.exists) {
      return res.status(404).json({ error: "Transaction not found." });
    }
    const data = transaction.data();

    res.render("transactions/view-transacation", { transaction: data, transactionId }); // Ensure the response wraps the data in a 'transaction' key
  } catch (error) {
    console.error("Error getting transaction:", error);
    res.status(500).json({ error: "Failed to get transaction." });
  }
});

router.post("/view/user", verifyAdmin, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }
  try {
    const userRef = db.collection("users").doc(userId);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
      return res.status(404).json({ error: "User not found." });
    }
    const userData = userSnapshot.data();
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user." });
  }
});

router.get("/deliver-order/:orderId", verifyAdmin, async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const orderRef = db.collection("transactions").doc(orderId);
    const orderSnapshot = await orderRef.get();
    if (!orderSnapshot.exists) {
      return res.status(404).json({ error: "Order not found." });
    }
    const orderData = {
      id: orderSnapshot.id,
      ...orderSnapshot.data(),
    };
    const order = {
      orderId: orderData.id,
      orderDate: orderData.createdAt,
      status: orderData.status,
      totalPrice: orderData.totalPrice,
      currency: orderData.currency,
      products: orderData.products.map((p) => ({
        id: p.productId,
        title: p.title,
        price: p.price,
        quantity: p.quantity,
        details: p.description,
        img: p.img,
        proof: p.proof?.map((p) => {
          const decryptedData = {};
          for (let k in p) {
            if (k !== "createdAt" && k !== "updatedAt") {
              decryptedData[k] = decryptData(p[k], false);
            } else {
              decryptedData[k] = p[k];
            }
          }
          return decryptedData;
        }),
      })),
      paymentMethod: orderData.paymentMethod,
    };

    // Render the admin order page with data
    res.render("transactions/deliver-transaation", { order });
  } catch (error) {
    console.error("Error delivering order:", error);
    res.status(500).json({ error: "Failed to deliver order." });
  }
});

module.exports = router;
