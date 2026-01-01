interface PrintfulFile {
  url?: string;
  filename?: string;
  visible?: boolean;
  position?: {
    area_width?: number;
    area_height?: number;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
  };
}

interface PrintfulOrderItem {
  variant_id: number; // Printful product variant ID
  quantity: number;
  files: PrintfulFile[];
  retail_price?: string;
  name?: string;
}

interface PrintfulRecipient {
  name: string;
  address1: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip: string;
  phone?: string;
  email?: string;
}

interface PrintfulOrderRequest {
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  retail_costs?: {
    currency: string;
    subtotal: string;
    shipping: string;
    tax: string;
  };
  confirm?: boolean; // true to submit for fulfillment immediately
}

interface PrintfulOrderResponse {
  code: number;
  result: {
    id: number;
    external_id?: string;
    status: string;
    shipping?: string;
    created?: number;
    updated?: number;
    costs?: {
      currency: string;
      subtotal: string;
      shipping: string;
      tax: string;
      total: string;
    };
  };
}

class PrintfulClient {
  private apiKey: string;
  private baseUrl = "https://api.printful.com";

  constructor() {
    const apiKey = process.env.PRINTFUL_API_KEY;
    if (!apiKey) {
      console.warn("PRINTFUL_API_KEY not set. Printful integration will not work.");
      console.warn("Get your API key from: https://www.printful.com/dashboard/store");
    }
    this.apiKey = apiKey || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("Printful API key not configured");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Printful API error:", response.status, errorText);
      throw new Error(`Printful API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Upload a file to Printful's file library
   * @param fileBuffer Image buffer (PNG recommended)
   * @param filename File name
   * @returns File ID for use in orders
   */
  async uploadFile(fileBuffer: Buffer, filename: string): Promise<number> {
    try {
      // Convert buffer to base64
      const base64 = fileBuffer.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      const response = await this.request<{
        code: number;
        result: { id: number; url: string };
      }>("/files", {
        method: "POST",
        body: JSON.stringify({
          url: dataUrl,
          filename: filename,
        }),
      });

      console.log(`File uploaded to Printful: ID ${response.result.id}`);
      return response.result.id;
    } catch (error) {
      console.error("Failed to upload file to Printful:", error);
      throw error;
    }
  }

  /**
   * Create an order in Printful
   * @param orderData Order configuration
   * @returns Printful order response
   */
  async createOrder(orderData: PrintfulOrderRequest): Promise<PrintfulOrderResponse> {
    try {
      const response = await this.request<PrintfulOrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      console.log(`Printful order created: ID ${response.result.id}`);
      return response;
    } catch (error) {
      console.error("Failed to create Printful order:", error);
      throw error;
    }
  }

  /**
   * Get Printful product catalog variants
   * Use this to find the variant_id for different products/sizes
   */
  async getProductVariants(productId: number): Promise<any> {
    try {
      const response = await this.request(`/products/${productId}`);
      return response;
    } catch (error) {
      console.error("Failed to get product variants:", error);
      throw error;
    }
  }

  /**
   * Confirm an order for production
   * @param orderId Printful order ID
   */
  async confirmOrder(orderId: number): Promise<void> {
    try {
      await this.request(`/orders/${orderId}/confirm`, {
        method: "POST",
      });
      console.log(`Printful order ${orderId} confirmed for production`);
    } catch (error) {
      console.error("Failed to confirm Printful order:", error);
      throw error;
    }
  }

  /**
   * Get order status
   * @param orderId Printful order ID
   */
  async getOrderStatus(orderId: number): Promise<any> {
    try {
      const response = await this.request(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error("Failed to get order status:", error);
      throw error;
    }
  }
}

export const printfulClient = new PrintfulClient();

// Common Printful product variant IDs (as reference)
// You'll need to update these based on your actual Printful catalog
export const PRINTFUL_VARIANTS = {
  // Unisex T-Shirt (Bella + Canvas 3001)
  T_SHIRT_S: 4012,
  T_SHIRT_M: 4013,
  T_SHIRT_L: 4014,
  T_SHIRT_XL: 4015,
  T_SHIRT_2XL: 4016,

  // Unisex Hoodie (Gildan 18500)
  HOODIE_S: 4321,
  HOODIE_M: 4322,
  HOODIE_L: 4323,
  HOODIE_XL: 4324,
  HOODIE_2XL: 4325,
};
