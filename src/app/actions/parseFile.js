"use server";

import { marked } from "marked";
import matter from "gray-matter";
import * as XLSX from "xlsx";
// pdf-parse is dynamically imported inside the action to handle CJS/ESM compatibility

export async function parseFileAction(formData) {
  const file = formData.get("file");
  if (!file) throw new Error("No file uploaded");

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name;
  const fileExtension = fileName.split(".").pop().toLowerCase();

  let result = {
    name: fileName,
    type: fileExtension,
    content: '',
    metadata: {},
    raw: ''
  };

  try {
    if (fileExtension === "md") {
      const text = buffer.toString("utf-8");
      const { data, content } = matter(text);
      result.content = marked(content);
      // Simplify metadata - only keep primitive string/number values
      result.metadata = {
        title: data.title ? String(data.title) : fileName,
        author: data.author ? String(data.author) : null,
        date: data.date ? String(data.date) : null
      };
      result.raw = content.substring(0, 50000); // Limit to 50KB
    } 
    else if (fileExtension === "pdf") {
      const pdf = (await import("pdf-extraction")).default;
      const data = await pdf(buffer);
      // Smarter content structuring: Convert multiple newlines to paragraphs
      const structuredContent = data.text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p class="mb-4">${p.replace(/\n/g, " ")}</p>`)
        .join("");

      result.content = structuredContent;
      // Simplify metadata - only extract primitive values
      result.metadata = {
        title: data.info?.Title ? String(data.info.Title) : fileName,
        author: data.info?.Author ? String(data.info.Author) : null,
        pages: data.numpages || 0
      };
      result.raw = data.text.substring(0, 50000); // Limit to 50KB
    } 
    else if (["xlsx", "xls", "csv"].includes(fileExtension)) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      // Convert to a simple HTML table for preview
      let htmlTable = "<table class='min-w-full divide-y divide-slate-200 dark:divide-slate-800'><thead><tr>";
      if (json.length > 0) {
        const headers = Object.keys(json[0]);
        headers.forEach(key => {
          htmlTable += `<th class='px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider'>${key}</th>`;
        });
        htmlTable += "</tr></thead><tbody class='divide-y divide-slate-100 dark:divide-slate-900'>";

        // Limit to 50 rows for display
        json.slice(0, 50).forEach(row => {
          htmlTable += "<tr>";
          Object.values(row).forEach(val => {
            htmlTable += `<td class='px-4 py-2 text-sm text-slate-600 dark:text-slate-400'>${val}</td>`;
          });
          htmlTable += "</tr>";
        });
        htmlTable += "</tbody></table>";

        result.content = htmlTable;
        // CRITICAL: Only save simple metadata, NOT the raw JSON
        result.metadata = {
          sheets: workbook.SheetNames.length,
          sheetName: String(firstSheetName),
          rows: json.length,
          columns: headers.length
        };
        // DON'T save raw JSON - it's too complex for Firebase
        result.raw = `Excel file with ${json.length} rows and ${headers.length} columns`;
      } else {
        result.content = "<p>Empty spreadsheet</p>";
        result.metadata = { rows: 0, columns: 0 };
        result.raw = "Empty file";
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Parsing error:", error);
    return { success: false, error: error.message };
  }
}
