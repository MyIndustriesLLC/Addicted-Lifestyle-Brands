import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

type Environment = "sandbox" | "live";

class PayPalClient {
  private client: checkoutNodeJssdk.core.PayPalHttpClient | null = null;
  private environment: Environment;

  constructor() {
    this.environment = (process.env.PAYPAL_ENVIRONMENT || "sandbox") as Environment;
    this.initialize();
  }

  private initialize() {
    const clientId = this.environment === "sandbox"
      ? process.env.PAYPAL_SANDBOX_CLIENT_ID
      : process.env.PAYPAL_LIVE_CLIENT_ID;

    const clientSecret = this.environment === "sandbox"
      ? process.env.PAYPAL_SANDBOX_SECRET
      : process.env.PAYPAL_LIVE_SECRET;

    if (!clientId || !clientSecret) {
      console.error("PayPal credentials not configured");
      return;
    }

    const environmentClass = this.environment === "sandbox"
      ? checkoutNodeJssdk.core.SandboxEnvironment
      : checkoutNodeJssdk.core.LiveEnvironment;

    const environment = new environmentClass(clientId, clientSecret);
    this.client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);
  }

  // Create PayPal order
  async createOrder(items: Array<{ name: string; quantity: number; price: string }>, totalAmount: string) {
    if (!this.client) throw new Error("PayPal client not initialized");

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: totalAmount,
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: totalAmount
            }
          }
        },
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: "USD",
            value: item.price
          }
        }))
      }],
      application_context: {
        brand_name: "NFT Streetwear",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.PUBLIC_URL}/checkout/success`,
        cancel_url: `${process.env.PUBLIC_URL}/checkout/cancel`
      }
    });

    const response = await this.client.execute(request);
    return {
      orderId: response.result.id,
      status: response.result.status,
      links: response.result.links
    };
  }

  // Capture PayPal order (finalize payment)
  async captureOrder(orderId: string) {
    if (!this.client) throw new Error("PayPal client not initialized");

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      const capture = response.result.purchase_units[0].payments.captures[0];

      return {
        success: true,
        orderId: response.result.id,
        transactionId: capture.id,
        status: capture.status, // COMPLETED, PENDING, DECLINED
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        payerEmail: response.result.payer.email_address,
        payerName: `${response.result.payer.name.given_name} ${response.result.payer.name.surname}`,
        payerId: response.result.payer.payer_id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Payment capture failed",
        details: error.details || []
      };
    }
  }

  // Get order details (for verification)
  async getOrderDetails(orderId: string) {
    if (!this.client) throw new Error("PayPal client not initialized");

    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);
    const response = await this.client.execute(request);
    return response.result;
  }

  // Refund a captured payment
  async refundPayment(captureId: string, amount?: string, currency: string = "USD") {
    if (!this.client) throw new Error("PayPal client not initialized");

    const request = new checkoutNodeJssdk.payments.CapturesRefundRequest(captureId);
    request.requestBody({
      amount: amount ? {
        currency_code: currency,
        value: amount
      } : undefined // Full refund if amount not specified
    });

    const response = await this.client.execute(request);
    return {
      refundId: response.result.id,
      status: response.result.status,
      amount: response.result.amount
    };
  }
}

export const paypalClient = new PayPalClient();
