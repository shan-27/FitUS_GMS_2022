import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./payment.css";

function payment() {
  return (
    <div className="App-body">
      
      <PayPalScriptProvider
        options={{ "client-id": "AU2taCxYpOChKUoAv6mkUytMMBCNnHnmKtQo4CjpO7vFVHAYIWT9UYtVA60-g4SviVQ2bMFZ2loy2nVB" }}
      >
        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "13.99",
                  },
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            const details = await actions.order.capture();
            const name = details.payer.name.given_name;
            alert("Transaction completed by " + name);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}

export default payment;
