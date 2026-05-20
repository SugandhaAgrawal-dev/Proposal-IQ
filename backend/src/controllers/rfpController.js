import supabase from '../config/supabase.js';
import { parseDocument, chunkText } from '../services/documentParser.js';
import { analyzeRFP, generateProposal, generateComplianceMatrix, reviewProposal } from '../ai/aiService.js';
import { logAction } from '../middleware/activityLog.js';
import { v4 as uuidv4 } from 'uuid';

/** GET /api/rfps - List all RFPs for current user */
export const getRFPs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rfps')
      .select('id, title, description, status, file_name, file_size, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch RFPs.' });
  }
};

/** GET /api/rfps/:id - Get single RFP with all data */
export const getRFP = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rfps').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (error || !data) return res.status(404).json({ success: false, message: 'RFP not found.' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch RFP.' });
  }
};

/** POST /api/rfps/upload - Upload and parse RFP document */
export const uploadRFP = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const { title, description } = req.body;
    const file = req.file;

    // Upload file to Supabase Storage
    const fileName = `${uuidv4()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rfp-documents').upload(`${req.user.id}/${fileName}`, file.buffer, {
        contentType: file.mimetype, upsert: false,
      });

    if (uploadError) console.warn('Storage upload failed, continuing without file URL:', uploadError.message);

    const fileUrl = uploadData ? supabase.storage.from('rfp-documents').getPublicUrl(`${req.user.id}/${fileName}`).data.publicUrl : null;

    // Parse document
    const rawText = await parseDocument(file.buffer, file.mimetype);
    const chunks = chunkText(rawText);

    // Create RFP record
    const { data: rfp, error } = await supabase.from('rfps').insert({
      title: title || file.originalname.replace(/\.[^/.]+$/, ''),
      description: description || '',
      status: 'uploaded',
      file_url: fileUrl,
      file_name: file.originalname,
      file_size: file.size,
      raw_text: rawText,
      chunks,
      user_id: req.user.id,
    }).select().single();

    if (error) throw error;
    await logAction(req.user.id, 'RFP_UPLOADED', 'rfp', rfp.id);

    res.status(201).json({
      success: true,
      data: { id: rfp.id, title: rfp.title, status: rfp.status, fileName: rfp.file_name, chunkCount: chunks.length },
    });
  } catch (err) {
    console.error('Upload RFP error:', err);
    res.status(500).json({ success: false, message: `Failed to upload RFP: ${err.message}` });
  }
};

/** POST /api/rfps/:id/analyze - Run AI Analyzer agent */
export const analyzeRFPHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: rfp, error } = await supabase.from('rfps').select('*').eq('id', id).eq('user_id', req.user.id).single();
    if (error || !rfp) return res.status(404).json({ success: false, message: 'RFP not found.' });
    if (!rfp.raw_text) return res.status(400).json({ success: false, message: 'RFP has no text content.' });

    await supabase.from('rfps').update({ status: 'analyzing' }).eq('id', id);

    const analysis = await analyzeRFP(rfp.raw_text, req.user.id);

    const { data: updated } = await supabase.from('rfps')
      .update({ analysis, status: 'analyzed', updated_at: new Date().toISOString() })
      .eq('id', id).select().single();

    await logAction(req.user.id, 'RFP_ANALYZED', 'rfp', id);
    res.json({ success: true, data: { id, analysis: updated.analysis, status: updated.status } });
  } catch (err) {
    console.error('Analyze RFP error:', err);
    await supabase.from('rfps').update({ status: 'error' }).eq('id', req.params.id);
    res.status(500).json({ success: false, message: `Analysis failed: ${err.message}` });
  }
};

/** POST /api/rfps/:id/generate - Run Proposal Generator agent */
export const generateProposalHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: rfp } = await supabase.from('rfps').select('*').eq('id', id).eq('user_id', req.user.id).single();
    if (!rfp) return res.status(404).json({ success: false, message: 'RFP not found.' });
    if (!rfp.analysis) return res.status(400).json({ success: false, message: 'RFP must be analyzed first.' });

    await supabase.from('rfps').update({ status: 'generating' }).eq('id', id);

    const proposal = await generateProposal(rfp.raw_text, rfp.analysis, req.user.id);

    const { data: updated } = await supabase.from('rfps')
      .update({ proposal, status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id).select().single();

    await logAction(req.user.id, 'PROPOSAL_GENERATED', 'rfp', id);
    res.json({ success: true, data: { id, proposal: updated.proposal, status: updated.status } });
  } catch (err) {
    console.error('Generate proposal error:', err);
    await supabase.from('rfps').update({ status: 'error' }).eq('id', req.params.id);
    res.status(500).json({ success: false, message: `Proposal generation failed: ${err.message}` });
  }
};

/** POST /api/rfps/:id/compliance - Run Compliance Matrix agent */
export const complianceHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: rfp } = await supabase.from('rfps').select('*').eq('id', id).eq('user_id', req.user.id).single();
    if (!rfp) return res.status(404).json({ success: false, message: 'RFP not found.' });
    if (!rfp.analysis || !rfp.proposal) return res.status(400).json({ success: false, message: 'Analysis and proposal required first.' });

    const matrix = await generateComplianceMatrix(rfp.raw_text, rfp.analysis, rfp.proposal, req.user.id);

    await supabase.from('rfps')
      .update({ compliance_matrix: matrix, updated_at: new Date().toISOString() }).eq('id', id);

    await logAction(req.user.id, 'COMPLIANCE_GENERATED', 'rfp', id);
    res.json({ success: true, data: { id, compliance_matrix: matrix } });
  } catch (err) {
    console.error('Compliance error:', err);
    res.status(500).json({ success: false, message: `Compliance generation failed: ${err.message}` });
  }
};

/** POST /api/rfps/:id/review - Run Reviewer agent */
export const reviewHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: rfp } = await supabase.from('rfps').select('*').eq('id', id).eq('user_id', req.user.id).single();
    if (!rfp) return res.status(404).json({ success: false, message: 'RFP not found.' });
    if (!rfp.proposal) return res.status(400).json({ success: false, message: 'Proposal required first.' });

    const review = await reviewProposal(rfp.proposal, rfp.analysis);

    await supabase.from('rfps')
      .update({ review, updated_at: new Date().toISOString() }).eq('id', id);

    await logAction(req.user.id, 'PROPOSAL_REVIEWED', 'rfp', id);
    res.json({ success: true, data: { id, review } });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ success: false, message: `Review failed: ${err.message}` });
  }
};

/** DELETE /api/rfps/:id */
export const deleteRFP = async (req, res) => {
  try {
    const { error } = await supabase.from('rfps').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    await logAction(req.user.id, 'RFP_DELETED', 'rfp', req.params.id);
    res.json({ success: true, message: 'RFP deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete RFP.' });
  }
};
