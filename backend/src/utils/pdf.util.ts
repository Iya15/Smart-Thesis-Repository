import pdfParse from "pdf-parse";

// Hard cap on stored extracted text — prevents accidental 100MB rows for scanned PDFs
const MAX_TEXT_LENGTH = 100_000;

export const extractTextFromBuffer = async (buffer: Buffer): Promise<string> => {
  try {
    const result = await pdfParse(buffer);
    const text = result.text.trim();
    return text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) : text;
  } catch {
    // Extraction failures are non-fatal — thesis is still saved without text
    return "";
  }
};
