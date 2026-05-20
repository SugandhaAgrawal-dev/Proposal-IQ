import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Parse uploaded file buffer to extract text
 * Supports PDF and DOCX formats
 */
export const parseDocument = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      return await parsePDF(buffer);
    }

    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      return await parseDOCX(buffer);
    }

    if (mimetype === 'text/plain' || mimetype === 'text/markdown') {
      return buffer.toString('utf-8');
    }

    throw new Error(`Unsupported file type: ${mimetype}`);
  } catch (err) {
    console.error('Document parsing error:', err.message);
    throw new Error(`Failed to parse document: ${err.message}`);
  }
};

/**
 * Parse PDF buffer to text
 */
const parsePDF = async (buffer) => {
  const data = await pdf(buffer);
  return data.text || '';
};

/**
 * Parse DOCX buffer to text
 */
const parseDOCX = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

/**
 * Chunk text into smaller segments for processing
 * Uses sentence-aware splitting with overlap
 */
export const chunkText = (text, chunkSize = 1500, overlap = 200) => {
  if (!text || text.length === 0) return [];

  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);

  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      // Keep overlap from end of current chunk
      const words = currentChunk.split(' ');
      const overlapWords = [];
      let overlapLen = 0;

      for (let i = words.length - 1; i >= 0 && overlapLen < overlap; i--) {
        overlapWords.unshift(words[i]);
        overlapLen += words[i].length + 1;
      }

      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

export default { parseDocument, chunkText };
