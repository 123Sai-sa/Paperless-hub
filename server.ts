import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini client getter
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Digitize Paper Content into Structured Digital Workflow
app.post('/api/gemini/digitize', async (req, res) => {
  try {
    const { rawText, workflowType, targetAudience, audienceCount = 50 } = req.body;

    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are an expert institutional sustainability and paperless digitization specialist.
A user has provided the following paper-based notice, register template, assignment, or memo that used to be printed on paper:

"${rawText}"

Context:
- Suggested Workflow Category: ${workflowType || 'notice'} (can be 'notice', 'register', 'assignment', 'receipt_bill', 'record')
- Target Audience: ${targetAudience || 'institution'}
- Number of recipients/copies typically printed: ${audienceCount}

Convert this into a modernized digital internet entity.
Return ONLY valid JSON with this exact schema:
{
  "title": "Clean, descriptive digital title",
  "category": "notice" | "register" | "assignment" | "receipt_bill" | "record",
  "department": "Academic" | "Hostel" | "Administration" | "Finance" | "General",
  "priority": "High" | "Medium" | "Low",
  "formattedContent": "Clean markdown or formatted text representation for screen viewing",
  "keyFields": [
    { "label": "string", "value": "string" }
  ],
  "actionItems": ["string"],
  "estimatedPagesPerCopy": number,
  "totalSheetsSaved": number,
  "treesSavedFraction": number,
  "waterSavedLiters": number,
  "carbonSavedKg": number,
  "costSavedUSD": number,
  "digitalAdvantageExplanation": "Explain why sending/viewing this over the internet saves ink, paper, reprint time, and physical space"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ success: true, data: parsed, source: 'gemini' });
        }
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local digitizer:', err.message);
      }
    }

    // Fallback heuristic parsing when Gemini key is not configured or fails
    const pages = Math.max(1, Math.ceil(rawText.length / 500));
    const totalSheets = pages * Number(audienceCount || 40);
    const trees = Number((totalSheets / 8333).toFixed(4));
    const water = totalSheets * 10;
    const carbon = Number((totalSheets * 0.05).toFixed(2));
    const cost = Number((totalSheets * 0.08).toFixed(2));

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const fallbackTitle = lines[0]?.slice(0, 60) || 'Digitized Document';

    return res.json({
      success: true,
      data: {
        title: fallbackTitle,
        category: workflowType || 'notice',
        department: 'General',
        priority: 'Medium',
        formattedContent: rawText,
        keyFields: [
          { label: 'Recipient Count', value: `${audienceCount} recipients via instant internet link` },
          { label: 'Original Paper Pages', value: `${pages} printed sheet(s) per person` },
          { label: 'Zero-Print Distribution', value: 'Broadcasted electronically without ink or physical file' },
        ],
        actionItems: [
          'Review information digitally',
          'Acknowledge or reply online without paper slips',
        ],
        estimatedPagesPerCopy: pages,
        totalSheetsSaved: totalSheets,
        treesSavedFraction: trees,
        waterSavedLiters: water,
        carbonSavedKg: carbon,
        costSavedUSD: cost,
        digitalAdvantageExplanation:
          'By distributing this document over the internet, no physical copies needed printing, updating can be performed instantly without reprinting, and it occupies zero shelf space.',
      },
      source: 'local-heuristic',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// AI Student Performance Diagnostic Analysis
app.post('/api/gemini/analyze-student', async (req, res) => {
  try {
    const { studentName, grade } = req.body;
    const ai = getGeminiClient();

    if (ai && grade) {
      try {
        const prompt = `You are an elite educational counselor and academic performance analyst for the SDBMS (Student Database & Management System).
Analyze this student's grade matrix:
Student Name: ${studentName || grade.studentName}
Class / Section: ${grade.classSec}
Total Marks: ${grade.totalMarks}/${grade.maxPossible} (${grade.percentage}%)
Letter Grade: ${grade.grade}
Subject Breakdown: ${JSON.stringify(grade.scores)}

Generate an academic diagnostic in valid JSON with this exact schema:
{
  "overallStatus": "Short executive summary of academic standing",
  "strengthArea": "Detailed recognition of top performing subjects and competencies",
  "opportunityArea": "Constructive analysis of subjects with room for growth",
  "recommendedActions": ["action item 1", "action item 2", "action item 3"],
  "estimatedReadiness": "Projection for board exams, Olympiads, and future terms"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, data: parsed, source: 'gemini' });
        }
      } catch (err: any) {
        console.warn('Gemini student analysis failed:', err.message);
      }
    }

    // Heuristic fallback
    const scores = grade?.scores ? Object.entries(grade.scores) : [];
    const highest = [...scores].sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    const lowest = [...scores].sort((a, b) => (a[1] as number) - (b[1] as number))[0];

    return res.json({
      success: true,
      data: {
        overallStatus: `Student demonstrates strong scholastic engagement with an aggregate score of ${grade?.percentage || 85}%.`,
        strengthArea: `Highest performance registered in ${highest ? highest[0].replace('sub-', '').toUpperCase() : 'analytical modules'} (${highest ? highest[1] : 90}/100).`,
        opportunityArea: `Marginal opportunity in ${lowest ? lowest[0].replace('sub-', '').toUpperCase() : 'core disciplines'} (${lowest ? lowest[1] : 72}/100).`,
        recommendedActions: [
          'Solve two timed practice problem sets weekly to build pacing.',
          'Form peer study circles for structured problem discussions.',
          'Schedule targeted 20-minute bi-weekly consultations with course faculty.'
        ],
        estimatedReadiness: 'High readiness for semester finals and competitive scholarship assessments.'
      },
      source: 'local-heuristic'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Diagnostic failed' });
  }
});

// AI Advisor Query
app.post('/api/gemini/advisor-query', async (req, res) => {
  try {
    const { query, studentContext } = req.body;
    const ai = getGeminiClient();

    if (ai && query) {
      try {
        const prompt = `You are the AI Academic Advisor in the Sri Sathya Sai Anandam SDBMS portal.
Context: ${JSON.stringify(studentContext || {})}
User Query: "${query}"

Provide a concise, encouraging, and actionable response (formatted in clean markdown, 3-4 bullet points) focused on academic mastery, study pacing, zero-paper digital habits, and examination preparation.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response.text) {
          return res.json({ success: true, text: response.text, source: 'gemini' });
        }
      } catch (err: any) {
        console.warn('Gemini advisor failed:', err.message);
      }
    }

    return res.json({
      success: true,
      text: `### Strategic Recommendations:\n\n- **Structured Pacing**: Allocate 45-minute focused blocks followed by a 10-minute conceptual review.\n- **Zero-Paper Revision**: Leverage the digital academic matrix and online practice materials to track mistake logs electronically.\n- **Subject Balancing**: Dedicate earlier study sessions to high-friction numerical or scientific concepts before moving to review tasks.\n- **Faculty Consultation**: Utilize digital office hours to clarify edge cases and derivation proofs.`,
      source: 'local-heuristic'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Advisor request failed' });
  }
});

// Institutional Paper Audit API
app.post('/api/gemini/audit', async (req, res) => {
  try {
    const { institutionType, studentCount, staffCount, noticeFrequency, printBudgetMonthly } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `Conduct a rigorous paper-waste reduction audit for:
Institution Type: ${institutionType}
User/Student Count: ${studentCount}
Staff/Teacher Count: ${staffCount}
Printed notices/circulars per month: ${noticeFrequency}
Estimated Monthly Printing Budget: $${printBudgetMonthly}

Provide strategic recommendations and mathematical impact of adopting Internet-based digital alternatives (online notices, digital registers, homework portals, cloud records, digital receipts).
Return ONLY JSON with this format:
{
  "summary": "string",
  "yearlySheetsAvoided": number,
  "yearlyTreesConserved": number,
  "yearlyWaterSavedLiters": number,
  "yearlyDollarSavings": number,
  "topTransitions": [
    { "paperMethod": "string", "internetAlternative": "string", "sheetsSavedMonthly": number, "primaryBenefit": "string" }
  ],
  "implementationRoadmap": [
    { "phase": "string", "duration": "string", "keyMilestone": "string" }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, data: parsed, source: 'gemini' });
        }
      } catch (e: any) {
        console.warn('Gemini audit failed, using fallback:', e.message);
      }
    }

    // Heuristic calculation fallback
    const totalUsers = (Number(studentCount) || 500) + (Number(staffCount) || 50);
    const noticesPerMonth = Number(noticeFrequency) || 12;
    const monthlySheets = noticesPerMonth * totalUsers * 1.5 + totalUsers * 10;
    const yearlySheets = Math.round(monthlySheets * 12);
    const yearlyTrees = Number((yearlySheets / 8333).toFixed(2));
    const yearlyWater = yearlySheets * 10;
    const yearlyDollars = Math.round(yearlySheets * 0.08);

    return res.json({
      success: true,
      data: {
        summary: `By migrating ${institutionType} operations to internet-based communications and cloud document storage, you eliminate over ${yearlySheets.toLocaleString()} paper sheets annually.`,
        yearlySheetsAvoided: yearlySheets,
        yearlyTreesConserved: yearlyTrees,
        yearlyWaterSavedLiters: yearlyWater,
        yearlyDollarSavings: yearlyDollars,
        topTransitions: [
          {
            paperMethod: 'Printed Notice Board & Circulars',
            internetAlternative: 'Real-time Digital Notification Feed & Broadcasts',
            sheetsSavedMonthly: Math.round(noticesPerMonth * totalUsers),
            primaryBenefit: 'Instant distribution to thousands with zero reprint cost on edits',
          },
          {
            paperMethod: 'Bound Daily Attendance Registers',
            internetAlternative: 'Cloud Digital Attendance Logs',
            sheetsSavedMonthly: Math.round(totalUsers * 4),
            primaryBenefit: 'No bulky physical registers taking up staff room cabinet space',
          },
          {
            paperMethod: 'Printed Homework & Assignment Handouts',
            internetAlternative: 'Online Assignment Portal & PDF Resource Hub',
            sheetsSavedMonthly: Math.round(totalUsers * 6),
            primaryBenefit: 'Direct digital submission and electronic feedback loop',
          },
          {
            paperMethod: 'Paper Receipts, Fee Slips & Application Forms',
            internetAlternative: 'Instant Web Receipts & Digital Approval Workflows',
            sheetsSavedMonthly: Math.round(totalUsers * 2),
            primaryBenefit: 'Searchable forever, tamper-evident, zero carbon paper',
          },
        ],
        implementationRoadmap: [
          { phase: 'Phase 1: Zero-Print Notice Policy', duration: 'Week 1-2', keyMilestone: 'Adopt web circulars for all school/office announcements' },
          { phase: 'Phase 2: Digital Register & Attendance', duration: 'Week 3-4', keyMilestone: 'Retire physical paper attendance registers across all sections' },
          { phase: 'Phase 3: Online Homework & Materials', duration: 'Month 2', keyMilestone: 'Distribute study guides and homework digitally via portal' },
          { phase: 'Phase 4: Cloud Records & E-Receipts', duration: 'Month 3', keyMilestone: 'Digitize fee receipts, vouchers, and permanent archives' },
        ],
      },
      source: 'local-heuristic',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Audit computation failed' });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Reduce Paper Demand Server running at http://localhost:${PORT}`);
  });
}

startServer();
