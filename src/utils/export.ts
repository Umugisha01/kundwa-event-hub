/**
 * Premium Export Utilities for Kundwa Event Hub Admin
 * Designed to last 100 years by relying on native web standards instead of volatile libraries.
 */

/**
 * Exports data to a standard Excel-compatible CSV file.
 * Handles nested values, arrays, and forces UTF-8 BOM so characters display correctly in Microsoft Excel.
 */
export function exportToExcel(data: any[], filename: string) {
  if (!data || !data.length) return;

  // Extract all keys from the first object to form headers
  const headers = Object.keys(data[0]);
  
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.map(header => `"${String(header).replace(/"/g, '""')}"`).join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) {
        val = "";
      } else if (Array.isArray(val)) {
        val = val.join("; ");
      } else if (typeof val === "object") {
        val = JSON.stringify(val);
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  
  // Use UTF-8 Byte Order Mark (BOM) to force Excel to read UTF-8 properly
  const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports data to a beautifully formatted printable PDF layout.
 * Creates an elegant isolated print window with full styling and triggers the native printer dialog.
 */
export function exportToPDF(
  title: string,
  columns: { header: string; key: string; format?: (val: any) => string }[],
  data: any[]
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF documents.");
    return;
  }

  const dateStr = new Date().toLocaleString();
  
  // Generate HTML table structure
  const headerHtml = columns.map(col => `<th>${col.header}</th>`).join("");
  
  const rowsHtml = data.map((row, idx) => {
    const cells = columns.map(col => {
      let val = row[col.key];
      if (col.format) {
        val = col.format(val);
      } else if (val === null || val === undefined) {
        val = "";
      } else if (Array.isArray(val)) {
        val = val.join(", ");
      }
      return `<td>${String(val)}</td>`;
    }).join("");
    return `<tr class="${idx % 2 === 0 ? "even" : "odd"}">${cells}</tr>`;
  }).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
          
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #12141d;
            margin: 0;
            padding: 40px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
          }
          
          h1, h2, h3 {
            font-family: 'Outfit', sans-serif;
            margin: 0;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #f0b429;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo-text {
            font-size: 24px;
            font-weight: 800;
            color: #13223f;
          }
          
          .logo-text span {
            color: #f0b429;
          }
          
          .report-info {
            text-align: right;
            font-size: 12px;
            color: #627d98;
          }
          
          .report-title {
            font-size: 26px;
            font-weight: 700;
            color: #13223f;
            margin-bottom: 20px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          th {
            background-color: #13223f;
            color: #ffffff;
            font-family: 'Outfit', sans-serif;
            font-weight: 600;
            text-align: left;
            padding: 12px 16px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          td {
            padding: 12px 16px;
            font-size: 13px;
            border-bottom: 1px solid #dae1e7;
            word-break: break-word;
          }
          
          tr.even {
            background-color: #f8fafc;
          }
          
          tr:hover {
            background-color: #f1f5f9;
          }
          
          .footer {
            margin-top: 50px;
            border-top: 1px solid #dae1e7;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #829ab1;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
          
          .btn-print-now {
            background-color: #f0b429;
            color: #12141d;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Outfit', sans-serif;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s;
            margin-bottom: 20px;
          }
          
          .btn-print-now:hover {
            background-color: #df9e0b;
            transform: translateY(-1px);
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="display: flex; justify-content: flex-end;">
          <button class="btn-print-now" onclick="window.print()">Print / Save as PDF</button>
        </div>
        
        <div class="header">
          <div class="logo-area">
            <div class="logo-text">Kundwa <span>IB</span> Group</div>
          </div>
          <div class="report-info">
            <div>Generated: ${dateStr}</div>
            <div>Source: Admin Control Hub</div>
          </div>
        </div>
        
        <h1 class="report-title">${title}</h1>
        
        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        
        <div class="footer">
          © ${new Date().getFullYear()} Kundwa IB Group. All rights reserved. Confined and authenticated report.
        </div>
        
        <script>
          // Auto-trigger print dialog for user convenience
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
