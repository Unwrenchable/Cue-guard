/**
 * LabelService – generates and prints a storage label (sticker) for a cue case.
 *
 * After a player checks in their cue, the label can be printed to any
 * AirPrint / Google Cloud Print compatible printer, or shared as a PDF.
 *
 * Label contents:
 *   • Player name
 *   • Tournament name & table number
 *   • Case description
 *   • 6-digit claim code (large, prominent)
 *   • Check-in date/time
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { StoredCue } from '../types';

/**
 * Renders the cue-case label as an HTML string.
 * This is exported so it can be unit-tested without native modules.
 */
export function buildLabelHtml(cue: StoredCue): string {
  const checkedInDate = new Date(cue.checkedInAt).toLocaleString();
  const tableRow = cue.tableNumber
    ? `<tr><td class="label">Table</td><td class="value">${escapeHtml(cue.tableNumber)}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, Helvetica, Arial, sans-serif;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 16px;
    }
    .card {
      width: 340px;
      border: 3px solid #1a1a2e;
      border-radius: 12px;
      padding: 20px;
    }
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 2px solid #1a1a2e;
      padding-bottom: 12px;
    }
    .ball { font-size: 32px; margin-right: 10px; }
    .brand { font-size: 22px; font-weight: 800; color: #1a1a2e; }
    .brand-sub { font-size: 11px; color: #888; letter-spacing: 1.5px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    td { padding: 5px 4px; vertical-align: top; }
    .label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase;
             letter-spacing: 1px; width: 88px; padding-top: 7px; }
    .value { font-size: 14px; color: #1a1a2e; font-weight: 600; }
    .claim-box {
      border: 2px dashed #1a1a2e;
      border-radius: 8px;
      text-align: center;
      padding: 12px;
      margin-top: 4px;
    }
    .claim-label { font-size: 10px; color: #888; text-transform: uppercase;
                   letter-spacing: 1.5px; margin-bottom: 4px; }
    .claim-code { font-size: 38px; font-weight: 800; color: #1a1a2e;
                  letter-spacing: 10px; }
    .footer { font-size: 10px; color: #aaa; text-align: center; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="ball">🎱</span>
      <div>
        <div class="brand">Cue Guard</div>
        <div class="brand-sub">Secure Cue Storage</div>
      </div>
    </div>

    <table>
      <tr>
        <td class="label">Player</td>
        <td class="value">${escapeHtml(cue.ownerName)}</td>
      </tr>
      <tr>
        <td class="label">Tournament</td>
        <td class="value">${escapeHtml(cue.tournamentName)}</td>
      </tr>
      ${tableRow}
      <tr>
        <td class="label">Case</td>
        <td class="value">${escapeHtml(cue.description)}</td>
      </tr>
      <tr>
        <td class="label">Checked In</td>
        <td class="value">${escapeHtml(checkedInDate)}</td>
      </tr>
    </table>

    <div class="claim-box">
      <div class="claim-label">Claim Code</div>
      <div class="claim-code">${escapeHtml(cue.claimCode)}</div>
    </div>

    <div class="footer">Keep this label on the case. Do not share your claim code.</div>
  </div>
</body>
</html>`;
}

/** Minimal HTML entity escaping to prevent XSS in the label. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

class LabelService {
  /**
   * Print a storage label for the given cue case.
   *
   * On iOS this opens the AirPrint sheet.
   * On Android this opens the system print dialog.
   * If printing is unavailable the label is shared as a PDF instead.
   */
  async printLabel(cue: StoredCue): Promise<void> {
    const html = buildLabelHtml(cue);

    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      // Generate a PDF and open the share / print sheet
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Print or share cue label',
        UTI: 'com.adobe.pdf',
      });
    } else {
      // Fallback: open the native print dialog directly
      await Print.printAsync({ html });
    }
  }
}

export const labelService = new LabelService();
