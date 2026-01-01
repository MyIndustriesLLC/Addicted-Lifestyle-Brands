// Quick test script to verify Printful integration services
import { qrCodeGenerator } from "./server/services/qrcode-generator.js";
import { imageComposer } from "./server/services/image-composer.js";

console.log("🧪 Testing Printful Integration Services\n");

async function testServices() {
  try {
    // Test 1: QR Code Generation
    console.log("✅ Test 1: Generating NFT QR Code...");
    const qrDataUrl = await qrCodeGenerator.generateNFTQRCode({
      tokenId: "00081B5825AFBD3711E8F66069FC349E4D5F08ACE2C8F59B1F9100000001ABCD",
      issuer: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      walletAddress: "rLMgviGKgYN13e8TyBD6ZydRYAuk4ntebD",
    });

    console.log(`   QR Code generated: ${qrDataUrl.substring(0, 50)}...`);
    console.log(`   Length: ${qrDataUrl.length} characters\n`);

    // Test 2: QR Code Buffer
    console.log("✅ Test 2: Generating QR Code Buffer...");
    const qrBuffer = await qrCodeGenerator.generateNFTQRCodeBuffer({
      tokenId: "00081B5825AFBD3711E8F66069FC349E4D5F08ACE2C8F59B1F9100000001ABCD",
      issuer: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      walletAddress: "rLMgviGKgYN13e8TyBD6ZydRYAuk4ntebD",
    });

    console.log(`   Buffer size: ${qrBuffer.length} bytes\n`);

    // Test 3: Print File Creation
    console.log("✅ Test 3: Creating Printful print file...");
    const printFile = await imageComposer.createQRPrintFile(qrBuffer, 1000);

    console.log(`   Print file size: ${printFile.length} bytes`);
    console.log(`   Ready for upload to Printful\n`);

    console.log("🎉 All services working correctly!\n");
    console.log("📝 Note: Email and Printful API calls will fail without credentials in .env");
    console.log("   Set PRINTFUL_API_KEY and EMAIL_* variables to enable full integration\n");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testServices();
