import React from 'react';
import { Text, View, Image, Svg, Line } from '@react-pdf/renderer';
import WordCardShared, { WordEntry } from '../WordCardShared';

// 定义组件的Props - 直接接受WordEntry
interface WordCardPDFProps {
  wordEntry: WordEntry;
}

const WordCardPDF: React.FC<WordCardPDFProps> = ({ wordEntry }) => {
  // 直接使用统一的WordCardShared组件，传入PDF模式的组件
  return (
    <WordCardShared
      word={wordEntry}
      mode="pdf"
      side="front"
      components={{
        View,
        Text,
        Image,
        Svg,
        Line,
      }}
    />
  );
};

export default WordCardPDF; 