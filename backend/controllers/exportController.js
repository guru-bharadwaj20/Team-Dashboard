import Proposal from '../models/Proposal.js';

const pct = (n, total) => (total > 0 ? Math.round((n / total) * 100) : 0);
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A');

// ─── Markdown Builder ─────────────────────────────────────────────────────────

const buildMarkdown = (proposal) => {
  const { votes } = proposal;
  const responses = { agree: 0, disagree: 0, neutral: 0 };
  for (const v of votes) if (responses[v.vote] !== undefined) responses[v.vote]++;
  const totalVotes = votes.length;

  const lines = [
    `# ${proposal.title}`,
    '',
    `> **Status:** ${proposal.status.toUpperCase()}  `,
    `> **Created:** ${fmt(proposal.createdAt)}  `,
    `> **Deadline:** ${fmt(proposal.deadline)}  `,
    proposal.closedAt ? `> **Resolved:** ${fmt(proposal.closedAt)}` : '',
    '',
    '---',
    '',
    '## Description',
    '',
    proposal.description || '_No description provided._',
    '',
  ];

  if (proposal.options?.length) {
    lines.push('## Options', '');
    proposal.options.forEach((o, i) => lines.push(`${i + 1}. ${o.text}`));
    lines.push('');
  }

  lines.push(
    '## Vote Results',
    '',
    `| Option | Votes | Percentage |`,
    `|--------|-------|------------|`,
    `| ✅ Agree | ${responses.agree} | ${pct(responses.agree, totalVotes)}% |`,
    `| 😐 Neutral | ${responses.neutral} | ${pct(responses.neutral, totalVotes)}% |`,
    `| ❌ Disagree | ${responses.disagree} | ${pct(responses.disagree, totalVotes)}% |`,
    `| **Total** | **${totalVotes}** | **100%** |`,
    '',
  );

  if (proposal.consensusReached) {
    lines.push(
      `> 🎯 **Consensus reached** — ${proposal.consensusPercentage}% agreement`,
      '',
    );
  }

  if (proposal.aiSummary) {
    const s = proposal.aiSummary;
    lines.push(
      '## AI Decision Summary',
      '',
      '### Executive Summary',
      s.executiveSummary || '_N/A_',
      '',
    );
    if (s.supportingArguments?.length) {
      lines.push('### Supporting Arguments', '');
      s.supportingArguments.forEach((a) => lines.push(`- ${a}`));
      lines.push('');
    }
    if (s.opposingArguments?.length) {
      lines.push('### Opposing Arguments', '');
      s.opposingArguments.forEach((a) => lines.push(`- ${a}`));
      lines.push('');
    }
    if (s.outcome) lines.push('### Outcome', s.outcome, '');
    if (s.nextAction) lines.push('### Recommended Next Action', s.nextAction, '');
  }

  if (proposal.comments?.length) {
    lines.push('## Discussion', '');
    proposal.comments.forEach((c) => {
      const author = c.user?.name || 'Anonymous';
      lines.push(`**${author}** — ${fmt(c.createdAt)}`, `> ${c.text}`, '');
    });
  }

  lines.push('---', `_Exported on ${new Date().toISOString()}_`);
  return lines.join('\n');
};

// ─── PDF Builder ──────────────────────────────────────────────────────────────

const buildPDF = async (proposal, res) => {
  // Dynamic import so the app works even if pdfkit is not installed
  let PDFDocument;
  try {
    const mod = await import('pdfkit');
    PDFDocument = mod.default;
  } catch {
    res.status(501).json({ message: 'PDF export unavailable — pdfkit not installed' });
    return;
  }

  const { votes } = proposal;
  const responses = { agree: 0, disagree: 0, neutral: 0 };
  for (const v of votes) if (responses[v.vote] !== undefined) responses[v.vote]++;
  const totalVotes = votes.length;

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="proposal-${proposal._id}.pdf"`);
  doc.pipe(res);

  // Title
  doc.fontSize(22).font('Helvetica-Bold').text(proposal.title, { align: 'center' });
  doc.moveDown(0.5);

  // Meta
  doc.fontSize(10).font('Helvetica').fillColor('#555555');
  doc.text(`Status: ${proposal.status.toUpperCase()}   Created: ${fmt(proposal.createdAt)}   Deadline: ${fmt(proposal.deadline)}`, { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  // Description
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#111111').text('Description');
  doc.fontSize(11).font('Helvetica').fillColor('#333333').text(proposal.description || 'No description.', { indent: 10 });
  doc.moveDown();

  // Options
  if (proposal.options?.length) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#111111').text('Options');
    proposal.options.forEach((o, i) => {
      doc.fontSize(11).font('Helvetica').fillColor('#333333').text(`${i + 1}. ${o.text}`, { indent: 10 });
    });
    doc.moveDown();
  }

  // Vote results
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#111111').text('Vote Results');
  doc.moveDown(0.3);
  const rows = [
    ['Option', 'Votes', '%'],
    ['Agree', String(responses.agree), `${pct(responses.agree, totalVotes)}%`],
    ['Neutral', String(responses.neutral), `${pct(responses.neutral, totalVotes)}%`],
    ['Disagree', String(responses.disagree), `${pct(responses.disagree, totalVotes)}%`],
    ['Total', String(totalVotes), '100%'],
  ];
  const colW = [200, 100, 100];
  const tableX = 60;
  rows.forEach((row, ri) => {
    const y = doc.y;
    if (ri === 0) doc.font('Helvetica-Bold');
    else doc.font('Helvetica').fillColor('#333333');
    row.forEach((cell, ci) => {
      doc.text(cell, tableX + colW.slice(0, ci).reduce((a, b) => a + b, 0), y, { width: colW[ci] });
    });
    doc.moveDown(0.3);
  });
  doc.moveDown();

  if (proposal.consensusReached) {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text(`Consensus reached — ${proposal.consensusPercentage}% agreement`);
    doc.moveDown();
  }

  // AI summary
  if (proposal.aiSummary) {
    const s = proposal.aiSummary;
    doc.fillColor('#111111').fontSize(14).font('Helvetica-Bold').text('AI Decision Summary');
    doc.moveDown(0.3);
    if (s.executiveSummary) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Executive Summary');
      doc.fontSize(11).font('Helvetica').text(s.executiveSummary, { indent: 10 });
      doc.moveDown(0.3);
    }
    if (s.outcome) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Outcome');
      doc.fontSize(11).font('Helvetica').text(s.outcome, { indent: 10 });
      doc.moveDown(0.3);
    }
    if (s.nextAction) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Recommended Next Action');
      doc.fontSize(11).font('Helvetica').text(s.nextAction, { indent: 10 });
      doc.moveDown();
    }
  }

  // Footer
  doc.fontSize(8).fillColor('#999999').text(`Exported on ${new Date().toISOString()}`, { align: 'center' });
  doc.end();
};

// ─── Route Handler ────────────────────────────────────────────────────────────

export const exportProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const format = (req.query.format || 'markdown').toLowerCase();

    const proposal = await Proposal.findById(id).populate('comments.user', 'name');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    if (format === 'pdf') {
      await buildPDF(proposal, res);
      return;
    }

    // Default: markdown
    const md = buildMarkdown(proposal);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="proposal-${proposal._id}.md"`);
    res.send(md);
  } catch (err) {
    console.error('Export error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Export failed' });
  }
};
