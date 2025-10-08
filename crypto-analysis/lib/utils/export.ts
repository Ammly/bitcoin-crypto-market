export function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

export async function exportChartAsImage(
  chartId: string,
  filename: string,
  format: 'png' | 'svg' = 'png'
) {
  const element = document.getElementById(chartId);
  if (!element) {
    console.error('Chart element not found');
    return;
  }

  try {
    // For SVG format
    if (format === 'svg') {
      const svgElement = element.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      return;
    }

    // For PNG format (requires html2canvas library - install: npm install html2canvas)
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error('Failed to export chart:', error);
  }
}

export async function exportDashboardPDF(filename: string = 'dashboard-report') {
  try {
    // This would require jsPDF library - install: npm install jspdf
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('Cryptocurrency Market Analysis Report', 20, 20);

    // Add date
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

    // Add content (this is a simplified example)
    doc.setFontSize(10);
    doc.text('Full report generation would include charts and data tables', 20, 40);
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    alert('PDF export requires additional libraries. Please use browser print instead (Ctrl/Cmd + P)');
    window.print();
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function createShareableLink(params: Record<string, any>): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  
  return `${baseUrl}?${queryString}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
