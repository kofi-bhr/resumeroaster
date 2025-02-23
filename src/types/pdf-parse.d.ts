declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PDFInfo {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  }

  interface PDFMetadata {
    'dc:title'?: string;
    'dc:creator'?: string;
    'dc:subject'?: string;
    'dc:description'?: string;
    'dc:publisher'?: string;
    'dc:contributor'?: string;
    'dc:date'?: string;
    'dc:type'?: string;
    'dc:format'?: string;
    'dc:identifier'?: string;
    'dc:source'?: string;
    'dc:language'?: string;
    'dc:relation'?: string;
    'dc:coverage'?: string;
    'dc:rights'?: string;
  }

  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata;
    version: string;
  }

  interface PDFParseOptions {
    pagerender?: (pageData: { pageIndex: number; pageId: string }) => Promise<string>;
    max?: number;
    version?: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: PDFParseOptions): Promise<PDFData>;
  export default pdfParse;
} 