import supabase from '../config/supabase.js';
import { generateProposalDOCX, generateComplianceExcel } from '../services/exportService.js';

/** GET /api/export/:id/docx - Export proposal as DOCX */
export const exportDOCX = async (req, res) => {
  try {
    const { data: rfp } = await supabase.from('rfps').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (!rfp) return res.status(404).json({ success: false, message: 'RFP not found.' });
    if (!rfp.proposal) return res.status(400).json({ success: false, message: 'No proposal generated yet.' });

    const buffer = await generateProposalDOCX(rfp);
    const fileName = `ProposalIQ-${rfp.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Export DOCX error:', err);
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
};

/** GET /api/export/:id/excel - Export compliance matrix as Excel */
export const exportExcel = async (req, res) => {
  try {
    const { data: rfp } = await supabase.from('rfps').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (!rfp) return res.status(404).json({ success: false, message: 'RFP not found.' });
    if (!rfp.compliance_matrix) return res.status(400).json({ success: false, message: 'No compliance matrix generated.' });

    const buffer = await generateComplianceExcel(rfp);
    const fileName = `ProposalIQ-Compliance-${rfp.title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Export Excel error:', err);
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
};
