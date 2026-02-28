/**
 * Extract text from a PDF file using pdfjs-dist.
 */
import * as pdfjsLib from 'pdfjs-dist';

// Use a CDN for the worker to avoid Vite import errors with pdfjs-dist 5.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
            .map((item: any) => item.str)
            .join(' ');
        pages.push(text);
    }

    return pages.join('\n\n');
}
