import React from 'react';
import { WordCard } from './WordCard';

interface ProcessedWordData {
  Word: string;
  Definition: string;
  IPA: string;
  Example: string;
  Example_CN: string;
  Definition_CN: string;
  Audio: string;
  Picture: string;
}

interface PrintPageProps {
  words: ProcessedWordData[];
  side: 'front' | 'back';
  pageNumber: number;
}

export const PrintPage: React.FC<PrintPageProps> = ({ words, side, pageNumber }) => {
  // Each page shows 4 cards (2x2 grid)
  const startIndex = pageNumber * 4;
  const pageWords = words.slice(startIndex, startIndex + 4);
  
  // Keep the same order for both front and back
  // Let the user verify if this matches their expectation
  const displayWords = pageWords;

  return (
    <div className="print-page" style={{ pageBreakAfter: 'always' }}>
      {/* Page Header */}
      <div className="text-center py-1 text-xs text-gray-500 no-print" style={{ height: '20px', flexShrink: 0 }}>
        Page {pageNumber + 1} - {side === 'front' ? 'Front' : 'Back'} Side
      </div>
      
      {/* Card Grid - 2x2 layout for A6 cards on A4 */}
      <div className="grid">
        {displayWords.map((word, index) => (
          <div key={`${word?.Word || 'empty'}-${side}-${index}`}>
            {word ? (
              <WordCard 
                word={word} 
                side={side}
                className="w-full h-full"
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                border: '2px dashed #e5e7eb', 
                borderRadius: '8px',
                background: 'white'
              }}></div>
            )}
          </div>
        ))}
        
        {/* Fill empty slots if less than 4 cards */}
        {displayWords.length < 4 && 
          Array.from({ length: 4 - displayWords.length }).map((_, index) => (
            <div key={`empty-${index + displayWords.length}`} style={{ 
              width: '100%', 
              height: '100%', 
              border: '2px dashed #e5e7eb', 
              borderRadius: '8px',
              background: 'white'
            }}></div>
          ))
        }
      </div>
    </div>
  );
};