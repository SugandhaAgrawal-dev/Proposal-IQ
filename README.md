# ProposalIQ: AI-Powered RFP Automation Platform

## 1. Project Overview

**ProposalIQ** is a comprehensive, enterprise-grade SaaS platform designed to revolutionize how businesses respond to Requests for Proposals (RFPs). By leveraging state-of-the-art Generative AI and Retrieval-Augmented Generation (RAG), ProposalIQ dramatically reduces the time, effort, and cost associated with crafting high-quality, compliant proposal responses. 

The platform acts as a digital proposal team, capable of instantly analyzing complex RFP documents, querying a company's historical knowledge base, generating tailored responses, and verifying compliance. This allows teams to focus on strategy and pricing rather than tedious document parsing and boilerplate writing, ultimately increasing their win rate.

---

## 2. Implemented Features

### 🤖 Multi-Agent AI Workflow
ProposalIQ utilizes a sophisticated pipeline of specialized AI agents, each handling a distinct phase of the proposal lifecycle:
*   **RFP Analyzer Agent**: Ingests raw RFP documents (PDF, DOCX) and automatically extracts critical metadata such as submission deadlines, core requirements, evaluation criteria, and potential risks.
*   **Proposal Architect Agent**: Drafts the actual proposal content. It intelligently queries the Knowledge Base (via RAG) to ensure the generated text aligns with the company's past performance, capabilities, and brand voice.
*   **Compliance Officer Agent**: Cross-references the newly generated proposal against the original RFP requirements to ensure 100% compliance, highlighting any gaps.
*   **Final Reviewer Agent**: Acts as a critical evaluator, scoring the proposal on clarity, persuasiveness, and completeness, while providing actionable suggestions for improvement.

### 📚 Intelligent Knowledge Base (RAG)
*   **Document Ingestion**: Users can upload past proposals, technical whitepapers, and company profiles.
*   **Vectorization**: The system parses these documents, chunks the text, and stores them as mathematical vectors (embeddings) in Supabase.
*   **Semantic Search**: During proposal generation, the AI seamlessly retrieves the most relevant contextual information from this repository to ground its responses in factual, company-specific data.

### 🎨 Branding & Theme Management
*   **Custom Themes**: Administrators can define global brand assets, including primary colors, typography, and logo URLs.
*   **Consistent Output**: The application interface and exported documents dynamically adapt to the selected theme, ensuring brand consistency across all touchpoints.

### 📄 Professional Export Capabilities
*   **DOCX Generation**: Users can export the finalized AI-generated proposal into a beautifully formatted Microsoft Word document (.docx), complete with custom styling based on the active theme.
*   **Excel Compliance Matrix**: The generated compliance matrix can be exported to Excel (.xlsx) for easy sharing and tracking by project managers.

### 📊 Dashboard & Activity Tracking
*   **Centralized Hub**: A responsive dashboard provides a bird's-eye view of all active proposals, their current status, and recent user activity.
*   **Secure Authentication**: Role-based access control (User, Admin, Super Admin) secured by JWT to ensure data privacy and organizational hierarchy.

---

## 3. Pending Features & Future Planning

While the MVP establishes a robust AI foundation, the following features are planned for upcoming development cycles to enhance collaboration and enterprise readiness:

### 🔄 Multi-User Collaboration (Teams)
*   **Explanation**: Currently, proposals are tied to individual users. The future plan includes "Workspaces" where multiple team members (sales, engineering, legal) can concurrently view, edit, and comment on a single proposal.

### 🔌 CRM Integrations
*   **Explanation**: Seamless bi-directional integration with popular CRM platforms like Salesforce and HubSpot. This will allow RFPs to be automatically pulled from CRM opportunities and final proposals to be pushed back, streamlining the sales pipeline.

### 📈 Advanced Analytics & "Win Rate" Tracking
*   **Explanation**: A comprehensive analytics suite to track which proposals won or lost. By feeding this outcome data back into the AI, the system will learn over time, identifying which phrasing, pricing structures, and past performance references correlate highest with winning bids.

### 📧 Automated Email Parsing
*   **Explanation**: The ability for users to simply forward an RFP email to a dedicated ProposalIQ address, automatically triggering the ingestion and analysis workflow without needing to manually upload files via the web interface.

---

## 4. How We Implemented This Project (Technical Architecture)

The project is built on a modern, decoupled Full-Stack architecture:

### Frontend (User Experience)
*   **React 19 & Vite**: Chosen for rapid development and optimized build performance.
*   **Tailwind CSS 4 & Framer Motion**: Provides a premium, highly responsive, and animated user interface out of the box, crucial for a modern SaaS aesthetic.
*   **State Management**: Utilizes React Context for global state (Authentication, Themes) to avoid prop drilling in complex views like the RFP workspace.

### Backend (Core Logic)
*   **Node.js & Express.js**: A lightweight, non-blocking runtime perfect for handling multiple asynchronous AI API calls.
*   **Database (Supabase / PostgreSQL)**: Serves as the primary data store. We heavily utilize the `pgvector` extension to store and query document embeddings natively within Postgres.
*   **File Parsing**: Employs libraries like `pdf-parse` and `mammoth` to extract raw text from uploaded files before chunking them for the AI.

### AI Integration (The "Brain")
*   **OpenAI GPT-4o**: The primary LLM used across all agents for its superior reasoning capabilities and ability to adhere strictly to requested JSON output formats.
*   **text-embedding-3-small**: Used to convert text chunks into high-dimensional vectors for the RAG pipeline.
*   **Implementation Flow**: 
    1. User uploads RFP -> Backend parses text.
    2. Analyzer Agent processes text -> returns JSON summary.
    3. Generator Agent receives summary + Vector DB Context -> streams proposal draft.
    4. Reviewer Agent evaluates draft -> returns scores and feedback.

### Security & Deployment
*   **Security**: Express rate-limiting prevents API abuse (crucial for expensive LLM calls). Passwords are encrypted via `bcrypt`, and sessions are managed via stateless JWTs.
*   **Storage**: Supabase Storage securely holds raw document files, with access governed by row-level security (RLS).
# Proposal-IQ
