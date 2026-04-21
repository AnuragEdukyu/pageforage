import { marked } from "marked";
import matter from "gray-matter";
import * as XLSX from "xlsx";

/**
 * Parses a Markdown file string.
 * Returns both frontmatter and HTML content.
 */
export function parseMarkdown(content) {
  const { data, content: markdownBody } = matter(content);
  const html = marked(markdownBody);
  return { metadata: data, html, raw: markdownBody };
}

/**
 * Parses a Spreadsheet (XLSX, CSV) from an ArrayBuffer.
 */
export function parseSpreadsheet(buffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays
  return { 
    sheets: workbook.SheetNames,
    data,
    rows: data.length,
    columns: data[0]?.length || 0
  };
}

/**
 * Note: PDF parsing usually requires a Node environment or a wrapper like pdfjs-dist on client.
 * For Level 1, we will provide the structure and use a mock/simplified text extractor if on client,
 * or recommend the API route approach below.
 */
