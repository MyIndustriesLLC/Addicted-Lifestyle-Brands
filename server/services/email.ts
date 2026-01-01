import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface NFTEmailData {
  recipientEmail: string;
  recipientName: string;
  nftTokenId: string;
  companyWalletAddress: string; // Company wallet that holds the NFT
  productName: string;
  qrCodeDataUrl: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Use environment variables for email configuration
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const emailPort = parseInt(process.env.EMAIL_PORT || "587");

    if (!emailUser || !emailPassword) {
      console.warn("Email credentials not configured. NFT emails will not be sent.");
      console.warn("Set EMAIL_USER and EMAIL_PASSWORD in .env file");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  async sendNFTEmail(data: NFTEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.error("Email service not configured. Cannot send NFT email.");
      return false;
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .nft-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .qr-code { text-align: center; margin: 30px 0; }
            .qr-code img { max-width: 250px; border: 2px solid #667eea; border-radius: 8px; padding: 10px; background: white; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .value { color: #4b5563; font-family: monospace; word-break: break-all; }
            .instructions { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your NFT is Ready!</h1>
              <p>Your purchase of ${data.productName} includes a unique NFT</p>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p>Thank you for your purchase! Your exclusive NFT has been minted on the Ripple network and is ready to be added to your wallet.</p>

              <div class="nft-info">
                <h2>📋 NFT Details</h2>
                <div class="info-row">
                  <div class="label">NFT Token ID:</div>
                  <div class="value">${data.nftTokenId}</div>
                </div>
                <div class="info-row">
                  <div class="label">Company Wallet (Issuer):</div>
                  <div class="value">${data.companyWalletAddress}</div>
                </div>
                <div class="info-row">
                  <div class="label">Product:</div>
                  <div class="value">${data.productName}</div>
                </div>
              </div>

              <div class="qr-code">
                <h3>QR Code for Your NFT</h3>
                <img src="${data.qrCodeDataUrl}" alt="NFT QR Code" />
                <p style="color: #6b7280; font-size: 14px;">Scan this code to quickly access your NFT details</p>
              </div>

              <div class="instructions">
                <h3>🎁 How to Import Your NFT to Your Wallet</h3>
                <p><strong>Your NFT has been minted and is ready to import!</strong></p>
                <p>The NFT is currently held in our company wallet for safekeeping. To import it into your own XRP wallet:</p>
                <ol>
                  <li><strong>Open your XRP wallet</strong> (XUMM, Crossmark, Gem Wallet, or any XRP-compatible wallet)</li>
                  <li><strong>Navigate to "Add NFT"</strong> or "Import NFT Token" section</li>
                  <li><strong>Enter the Token ID:</strong> ${data.nftTokenId}</li>
                  <li><strong>Enter the Issuer Address:</strong> ${data.companyWalletAddress}</li>
                  <li><strong>Confirm</strong> - The NFT will appear in your wallet!</li>
                </ol>
                <p><strong>Important:</strong> Importing the NFT to your wallet allows you to view and verify it. The NFT remains in our company wallet. If you'd like full ownership transferred to your wallet, please contact us at support@nftstreetw ear.com</p>
                <p><strong>Verify Authenticity:</strong> You can verify your NFT anytime on the XRP Ledger Explorer or by scanning the QR code on your ${data.productName}</p>
                <p><strong>Keep this email safe!</strong> It contains your unique NFT Token ID.</p>
              </div>

              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

              <div class="footer">
                <p>NFT Streetwear - Where Fashion Meets Blockchain</p>
                <p>This email contains your unique NFT information. Please keep it safe.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Your NFT is Ready!

Hi ${data.recipientName},

Thank you for your purchase of ${data.productName}! Your exclusive NFT has been minted on the Ripple network and is ready to import.

NFT Details:
- Token ID: ${data.nftTokenId}
- Company Wallet (Issuer): ${data.companyWalletAddress}
- Product: ${data.productName}

How to Import Your NFT to Your Wallet:

Your NFT has been minted and is ready to import!

The NFT is currently held in our company wallet for safekeeping. To import it into your own XRP wallet:

1. Open your XRP wallet (XUMM, Crossmark, Gem Wallet, or any XRP-compatible wallet)
2. Navigate to "Add NFT" or "Import NFT Token" section
3. Enter the Token ID: ${data.nftTokenId}
4. Enter the Issuer Address: ${data.companyWalletAddress}
5. Confirm - The NFT will appear in your wallet!

Important: Importing the NFT to your wallet allows you to view and verify it. The NFT remains in our company wallet. If you'd like full ownership transferred to your wallet, please contact us at support@nftstreetw ear.com

Verify Authenticity: You can verify your NFT anytime on the XRP Ledger Explorer or by scanning the QR code on your ${data.productName}

Keep this email safe! It contains your unique NFT Token ID.

If you have any questions, please contact our support team.

NFT Streetwear - Where Fashion Meets Blockchain
      `;

      await this.transporter.sendMail({
        from: `"NFT Streetwear" <${process.env.EMAIL_USER}>`,
        to: data.recipientEmail,
        subject: `Your NFT for ${data.productName} is Ready! 🎉`,
        text: textContent,
        html: htmlContent,
      });

      console.log(`NFT email sent successfully to ${data.recipientEmail}`);
      return true;
    } catch (error) {
      console.error("Failed to send NFT email:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
