/**
 * Sanitize data for Firestore with depth limiting
 * Firebase Firestore doesn't accept:
 * - undefined values (use null instead)
 * - deeply nested objects (max safe depth: 10)
 * - non-serializable data
 */
export function sanitizeForFirestore(obj, depth = 0) {
  // Prevent infinite recursion and excessive nesting
  const MAX_DEPTH = 10;

  if (depth > MAX_DEPTH) {
    console.warn('Max depth reached, converting to string:', obj);
    return typeof obj === 'object' ? JSON.stringify(obj) : String(obj);
  }

  if (obj === null || obj === undefined) {
    return null;
  }

  // Handle primitives
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj
      .map(item => sanitizeForFirestore(item, depth + 1))
      .filter(item => item !== null && item !== undefined);
  }

  // Handle dates
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle functions (should not exist, but just in case)
  if (typeof obj === 'function') {
    return null;
  }

  // Handle objects
  if (typeof obj === 'object' && obj !== null) {
    // Check for circular references or complex types
    try {
      const cleaned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = sanitizeForFirestore(obj[key], depth + 1);
          // Only add if not null/undefined
          if (value !== null && value !== undefined) {
            cleaned[key] = value;
          }
        }
      }
      return cleaned;
    } catch (error) {
      console.error('Error sanitizing object:', error);
      return null;
    }
  }

  return null;
}

/**
 * Flatten parsed data for Firestore storage
 * Converts complex nested structures to a flat, serializable format
 */
export function flattenParsedData(parsedData) {
  if (!parsedData) {
    return {
      name: 'Untitled',
      type: 'unknown',
      content: '',
      raw: ''
    };
  }

  // Extract only the essential fields as primitives
  const flattened = {
    name: String(parsedData.name || 'Untitled'),
    type: String(parsedData.type || 'unknown'),
    content: String(parsedData.content || ''),
    raw: String(parsedData.raw || '')
  };

  // Safely handle metadata - only add if it exists and is simple
  if (parsedData.metadata && typeof parsedData.metadata === 'object') {
    const meta = parsedData.metadata;

    // For Excel files
    if (meta.rows !== undefined) {
      flattened.rows = Number(meta.rows) || 0;
      flattened.columns = Number(meta.columns) || 0;
      flattened.sheetName = String(meta.sheetName || '');
    }

    // For PDF/Markdown files
    if (meta.title) {
      flattened.title = String(meta.title);
    }
    if (meta.author) {
      flattened.author = String(meta.author);
    }
    if (meta.pages !== undefined) {
      flattened.pages = Number(meta.pages) || 0;
    }
  }

  return flattened;
}
