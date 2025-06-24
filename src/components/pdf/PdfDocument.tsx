import React from 'react';
import { Page, Document, StyleSheet } from '@react-pdf/renderer';
import WordCardPDF from './WordCardPDF';
import { WordEntry } from '../WordCardShared';

// 定义组件的Props - 直接使用ProcessedWordData
interface PdfDocumentProps {
  words: WordEntry[];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: '10mm', // A4 (210mm) - 2*85mm(cards) = 40mm. 10mm padding on each side, 20mm between cards.
    justifyContent: 'space-around',
    alignContent: 'space-around',
  },
});

// Helper function to chunk array
const chunk = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const PdfDocument: React.FC<PdfDocumentProps> = ({ words }) => {
  const pages = chunk(words, 4);

  return (
    <Document>
      {pages.map((pageWords, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {pageWords.map((wordEntry, wordIndex) => (
            <WordCardPDF key={wordIndex} wordEntry={wordEntry} />
          ))}
        </Page>
      ))}
    </Document>
  );
};

export default PdfDocument; 