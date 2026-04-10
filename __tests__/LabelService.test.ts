import { buildLabelHtml } from '../src/services/LabelService';
import { StoredCue } from '../src/types';

const MOCK_CUE: StoredCue = {
  id: 'cue_abc123_1234567890',
  tagId: 'abc123',
  ownerPhone: '+15555550100',
  ownerName: 'Mike Sigel',
  tournamentName: 'Spring Classic 2026',
  tableNumber: '7',
  description: 'Black Predator hard case – 2 cues',
  checkedInAt: '2026-04-10T14:00:00.000Z',
  lastActivityAt: '2026-04-10T14:00:00.000Z',
  claimCode: '482910',
  status: 'checked_in',
  amountCents: 500,
  checkOutCount: 0,
};

describe('buildLabelHtml', () => {
  it('includes the player name', () => {
    const html = buildLabelHtml(MOCK_CUE);
    expect(html).toContain('Mike Sigel');
  });

  it('includes the tournament name', () => {
    const html = buildLabelHtml(MOCK_CUE);
    expect(html).toContain('Spring Classic 2026');
  });

  it('includes the table number when provided', () => {
    const html = buildLabelHtml(MOCK_CUE);
    expect(html).toContain('7');
  });

  it('omits the table row when tableNumber is undefined', () => {
    const cueNoTable: StoredCue = { ...MOCK_CUE, tableNumber: undefined };
    const html = buildLabelHtml(cueNoTable);
    // The table label cell text should not appear
    expect(html).not.toMatch(/class="label">Table</);
  });

  it('includes the case description', () => {
    const html = buildLabelHtml(MOCK_CUE);
    expect(html).toContain('Black Predator hard case');
  });

  it('includes the claim code prominently', () => {
    const html = buildLabelHtml(MOCK_CUE);
    expect(html).toContain('482910');
    expect(html).toContain('claim-code');
  });

  it('HTML-escapes special characters in player name', () => {
    const cueXss: StoredCue = { ...MOCK_CUE, ownerName: '<script>alert("xss")</script>' };
    const html = buildLabelHtml(cueXss);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('HTML-escapes special characters in tournament name', () => {
    const cueName: StoredCue = { ...MOCK_CUE, tournamentName: 'O\'Brien & Sons Classic' };
    const html = buildLabelHtml(cueName);
    expect(html).toContain('O&#39;Brien &amp; Sons Classic');
  });

  it('HTML-escapes special characters in description', () => {
    const cueDesc: StoredCue = { ...MOCK_CUE, description: 'Case with <special> & "chars"' };
    const html = buildLabelHtml(cueDesc);
    expect(html).toContain('&lt;special&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;chars&quot;');
  });

  it('returns a valid HTML document string', () => {
    const html = buildLabelHtml(MOCK_CUE);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  it('includes the Cue Guard brand name', () => {
    const html = buildLabelHtml(MOCK_CUE);
    expect(html).toContain('Cue Guard');
  });
});
