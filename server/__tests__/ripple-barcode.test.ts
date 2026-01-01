import express from "express";
import request from "supertest";
import type { Server } from "http";
import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { registerRoutes } from "../routes";
import { storage } from "../storage";

const { mintNftMock } = vi.hoisted(() => ({
  mintNftMock: vi.fn(async () => ({
    success: true,
    tokenId: `mock-token-${Date.now()}`,
    transactionHash: `mock-hash-${Date.now()}`,
  })),
}));

vi.mock("../ripple-service", () => ({
  rippleService: {
    mintNFT: mintNftMock,
  },
}));

describe("Ripple barcode generation", () => {
  let server: Server;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (!server.listening) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  beforeEach(() => {
    storage.reset();
    mintNftMock.mockClear();
  });

  it("creates a unique barcode for each purchase", async () => {
    const product = await storage.createProduct({
      name: "Test Tee",
      description: "Limited edition",
      price: "120.00",
      imageUrl: "https://example.com/tee.jpg",
      barcodeId: "BASE-BARCODE",
    });

    const randomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.111111111)
      .mockReturnValueOnce(0.999999999);

    const buyerWallet = "rTestWallet111111111111111111";

    const firstResponse = await request(server)
      .post(`/api/products/${product.id}/purchase`)
      .send({ buyerWallet });

    const secondResponse = await request(server)
      .post(`/api/products/${product.id}/purchase`)
      .send({ buyerWallet });

    randomSpy.mockRestore();

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    const firstBarcode = firstResponse.body.uniqueBarcodeId;
    const secondBarcode = secondResponse.body.uniqueBarcodeId;

    expect(typeof firstBarcode).toBe("string");
    expect(typeof secondBarcode).toBe("string");
    expect(firstBarcode).toMatch(/^[A-Z0-9]{10}$/);
    expect(secondBarcode).toMatch(/^[A-Z0-9]{10}$/);
    expect(firstBarcode).not.toEqual(secondBarcode);

    expect(mintNftMock).toHaveBeenCalledTimes(2);
    expect(mintNftMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        barcodeId: firstBarcode,
        productId: product.id,
      })
    );
    expect(mintNftMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        barcodeId: secondBarcode,
        productId: product.id,
      })
    );
  });
});
