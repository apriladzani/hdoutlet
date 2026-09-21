/**
 * Print utility for HD Fried Chicken Daily Report
 * Supports direct window.print() and isolated hidden iframe printing fallback
 */

export function printElement(elementId: string, title: string = 'Formulir Laporan HD Fried Chicken'): void {
  const content = document.getElementById(elementId);
  if (!content) {
    window.print();
    return;
  }

  // Attempt direct window.print() first
  try {
    window.print();
  } catch (err) {
    console.warn('Standard window.print() failed, trying hidden iframe print:', err);
    printViaHiddenIframe(content.innerHTML, title);
  }
}

export function printViaHiddenIframe(htmlContent: string, title: string): void {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('title', 'Print Frame');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return;
    }

    // Collect all stylesheets and style blocks from parent
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 5mm 7mm;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              padding: 0 !important;
              margin: 0 !important;
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              font-size: 8pt !important;
              line-height: 1.25 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            .print-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container w-full max-w-4xl mx-auto">
            ${htmlContent}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Give iframe time to parse styles and images
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (printErr) {
        console.error('Iframe print error:', printErr);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }
    }, 300);
  } catch (error) {
    console.error('printViaHiddenIframe error:', error);
    window.print();
  }
}
