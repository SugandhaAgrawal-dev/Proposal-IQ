import supabase from '../config/supabase.js';
import { parseDocument, chunkText } from '../services/documentParser.js';
import { storeEmbeddings } from '../ai/aiService.js';
import { logAction } from '../middleware/activityLog.js';
import { v4 as uuidv4 } from 'uuid';

/** GET /api/knowledge - List knowledge base documents */
export const getDocuments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('knowledge_docs')
      .select('id, title, file_name, file_size, chunk_count, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
  }
};

/** POST /api/knowledge/upload - Upload and embed knowledge document */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const file = req.file;
    const { title } = req.body;

    // Upload to storage
    const fileName = `${uuidv4()}-${file.originalname}`;
    const { data: uploadData } = await supabase.storage
      .from('knowledge-docs').upload(`${req.user.id}/${fileName}`, file.buffer, {
        contentType: file.mimetype, upsert: false,
      }).catch(() => ({ data: null }));

    const fileUrl = uploadData
      ? supabase.storage.from('knowledge-docs').getPublicUrl(`${req.user.id}/${fileName}`).data.publicUrl
      : null;

    // Parse and chunk
    const rawText = await parseDocument(file.buffer, file.mimetype);
    const chunks = chunkText(rawText, 1000, 150);

    // Create document record
    const { data: doc, error } = await supabase.from('knowledge_docs').insert({
      title: title || file.originalname.replace(/\.[^/.]+$/, ''),
      file_url: fileUrl, file_name: file.originalname,
      file_size: file.size, raw_text: rawText,
      chunk_count: chunks.length, user_id: req.user.id,
    }).select().single();

    if (error) throw error;

    // Generate and store embeddings (non-blocking)
    storeEmbeddings(chunks, doc.id, req.user.id).catch((err) =>
      console.error('Embedding storage failed:', err.message)
    );

    await logAction(req.user.id, 'KNOWLEDGE_UPLOADED', 'knowledge_doc', doc.id);
    res.status(201).json({
      success: true,
      data: { id: doc.id, title: doc.title, fileName: doc.file_name, chunkCount: chunks.length },
    });
  } catch (err) {
    console.error('Upload knowledge error:', err);
    res.status(500).json({ success: false, message: `Failed to upload document: ${err.message}` });
  }
};

/** DELETE /api/knowledge/:id */
export const deleteDocument = async (req, res) => {
  try {
    // Delete embeddings first
    await supabase.from('document_embeddings').delete().eq('doc_id', req.params.id);
    const { error } = await supabase.from('knowledge_docs').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    await logAction(req.user.id, 'KNOWLEDGE_DELETED', 'knowledge_doc', req.params.id);
    res.json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
};
