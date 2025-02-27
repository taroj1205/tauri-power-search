export interface PdfPage {
  pageNumber: number;
  text: string;
  fileName: string;
}

export interface PdfResult {
  id: string;
  fileName: string;
  pages: PdfPage[];
  isLoading: boolean;
  totalPages: number;
  text: string;
  processingStage?: string;
  processingProgress?: number;
  processingMessage?: string;
}

export interface PdfSearchData {
  results: PdfResult[];
}
