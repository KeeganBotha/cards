// Ambient types for the Shape Detection API's BarcodeDetector, which lib.dom
// does not ship. Only the surface BarcodeScanner uses. Chromium-only as of
// writing — ALWAYS feature-detect (`"BarcodeDetector" in window`).
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<string[]>;
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}
