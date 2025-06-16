import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const usePDFExport = () => {
  const exportToPDF = useCallback(async (filename: string = 'word-cards.pdf') => {
    try {
      const printPages = document.querySelectorAll('.print-page');
      if (printPages.length === 0) {
        alert('No content to export');
        return;
      }

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      for (let i = 0; i < printPages.length; i++) {
        const page = printPages[i] as HTMLElement;
        
        // Create canvas from the page
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123 // A4 height in pixels at 96 DPI
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add image to PDF (A4 dimensions: 210 x 297 mm)
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }, []);

  return { exportToPDF };
};