import OpenAI from 'openai';
import config from '../config/index.js';
import supabase from '../config/supabase.js';
import {
  analyzeRFPPrompt,
  generateProposalPrompt,
  compliancePrompt,
  reviewPrompt,
} from './prompts.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Call OpenAI chat completion with structured JSON output
 */
const callAI = async (systemPrompt, userPrompt, model = 'gpt-4o') => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('OpenAI API error:', err.message);
    throw new Error(`AI processing failed: ${err.message}`);
  }
};

/**
 * Generate embeddings for text using OpenAI
 */
export const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error('Embedding error:', err.message);
    throw new Error(`Failed to generate embedding: ${err.message}`);
  }
};

/**
 * Search knowledge base using vector similarity
 */
export const searchKnowledgeBase = async (query, userId, matchCount = 5) => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      filter_user_id: userId,
    });

    if (error) throw error;
    return data?.map((d) => d.content).join('\n\n') || '';
  } catch (err) {
    console.error('Knowledge base search error:', err.message);
    return '';
  }
};

/**
 * Agent 1: Analyze RFP
 */
export const analyzeRFP = async (rfpText, userId) => {
  const context = await searchKnowledgeBase(
    rfpText.substring(0, 1000),
    userId
  );
  const prompt = analyzeRFPPrompt(rfpText, context);
  return await callAI(prompt.system, prompt.user);
};

/**
 * Agent 2: Generate Proposal
 */
export const generateProposal = async (rfpText, analysis, userId) => {
  const context = await searchKnowledgeBase(
    analysis.summary || rfpText.substring(0, 1000),
    userId
  );
  const prompt = generateProposalPrompt(rfpText, analysis, context);
  return await callAI(prompt.system, prompt.user);
};

/**
 * Agent 3: Generate Compliance Matrix
 */
export const generateComplianceMatrix = async (rfpText, analysis, proposal, userId) => {
  const context = await searchKnowledgeBase(
    'compliance requirements',
    userId
  );
  const prompt = compliancePrompt(rfpText, analysis, proposal, context);
  return await callAI(prompt.system, prompt.user);
};

/**
 * Agent 4: Review Proposal
 */
export const reviewProposal = async (proposal, analysis) => {
  const prompt = reviewPrompt(proposal, analysis);
  return await callAI(prompt.system, prompt.user);
};

/**
 * Store document embeddings in vector store
 */
export const storeEmbeddings = async (chunks, docId, userId) => {
  const embeddings = [];

  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await generateEmbedding(chunks[i]);
      embeddings.push({
        content: chunks[i],
        embedding,
        doc_id: docId,
        user_id: userId,
        metadata: {
          chunk_index: i,
          total_chunks: chunks.length,
        },
      });
    } catch (err) {
      console.error(`Embedding failed for chunk ${i}:`, err.message);
    }
  }

  if (embeddings.length > 0) {
    const { error } = await supabase
      .from('document_embeddings')
      .insert(embeddings);

    if (error) {
      console.error('Failed to store embeddings:', error.message);
      throw error;
    }
  }

  return embeddings.length;
};

export default {
  analyzeRFP,
  generateProposal,
  generateComplianceMatrix,
  reviewProposal,
  generateEmbedding,
  storeEmbeddings,
  searchKnowledgeBase,
};
