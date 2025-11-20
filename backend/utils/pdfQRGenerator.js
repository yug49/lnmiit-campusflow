const { PDFDocument, rgb } = require("pdf-lib");
const QRCode = require("qrcode");
const fs = require("fs").promises;
const path = require("path");

/**
 * Add QR code to an existing PDF by modifying it in place
 * @param {string} originalPdfPath - Path to the original PDF file
 * @param {string} signatureHash - The signature hash to encode in QR
 * @param {string} outputPath - Path where the modified PDF should be saved
 * @returns {Promise<string>} - Path to the modified PDF with QR code
 */
async function addQRCodeToPDF(originalPdfPath, signatureHash, outputPath) {
    try {
        console.log("[QR Generator] Starting QR code addition to PDF...");
        console.log("[QR Generator] Signature hash:", signatureHash);
        console.log("[QR Generator] Original PDF path:", originalPdfPath);
        console.log("[QR Generator] Output path:", outputPath);

        // Ensure the output directory exists
        const dir = path.dirname(outputPath);
        await fs.mkdir(dir, { recursive: true });

        // Read the original PDF
        console.log("[QR Generator] Reading original PDF...");
        const existingPdfBytes = await fs.readFile(originalPdfPath);

        // Load the PDF
        console.log("[QR Generator] Loading PDF document...");
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Generate QR code as PNG buffer
        console.log("[QR Generator] Generating QR code...");
        const qrCodeBuffer = await QRCode.toBuffer(signatureHash, {
            width: 150,
            margin: 1,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        });
        console.log("[QR Generator] QR code generated successfully");

        // Embed the QR code image
        console.log("[QR Generator] Embedding QR code in PDF...");
        const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
        const qrDims = qrImage.scale(0.5); // Scale down the QR code

        // Get the last page
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        const { width, height } = lastPage.getSize();

        // Calculate position for QR code (bottom-center)
        const qrX = (width - qrDims.width) / 2; // Center horizontally
        const qrY = 30; // 30 points from bottom

        // Draw QR code on the last page
        console.log("[QR Generator] Drawing QR code on last page...");
        lastPage.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: qrDims.width,
            height: qrDims.height,
        });

        // Add verification text below QR code
        const fontSize = 8;
        const textY = qrY - 15;
        lastPage.drawText("Scan to verify document authenticity", {
            x: width / 2 - 80, // Approximate center
            y: textY,
            size: fontSize,
            color: rgb(0.5, 0.5, 0.5),
        });

        // Save the modified PDF
        console.log("[QR Generator] Saving modified PDF...");
        const pdfBytes = await pdfDoc.save();
        await fs.writeFile(outputPath, pdfBytes);

        console.log(
            "[QR Generator] PDF with QR code saved successfully:",
            outputPath
        );
        return outputPath;
    } catch (error) {
        console.error("[QR Generator] Error adding QR code to PDF:", error);
        throw error;
    }
}

/**
 * Create a separate QR verification PDF (legacy function, kept for reference)
 * This creates a single-page PDF with QR code that can be shown alongside the original
 * @param {string} signatureHash - The signature hash to encode in QR
 * @param {string} documentTitle - Title of the document
 * @param {string} documentType - Type of document (MoU, Event Permission, Invoice)
 * @param {Object} documentInfo - Additional document information
 * @param {string} outputPath - Path where the PDF should be saved
 * @returns {Promise<string>} - Path to the generated QR verification PDF
 */
async function generateQRVerificationPDF(
    signatureHash,
    documentTitle,
    documentType,
    documentInfo,
    outputPath
) {
    console.log(
        "[QR Generator] generateQRVerificationPDF is deprecated - use addQRCodeToPDF instead"
    );
    console.log(
        "[QR Generator] This function creates a separate verification PDF, not the modified original"
    );

    // For now, we'll throw an error to prevent accidental use
    throw new Error(
        "generateQRVerificationPDF is deprecated. Use addQRCodeToPDF to modify the original PDF instead."
    );
}

module.exports = {
    addQRCodeToPDF,
    generateQRVerificationPDF, // Keep for backward compatibility but will throw error
};
