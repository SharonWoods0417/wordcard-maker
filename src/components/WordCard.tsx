import React from 'react';
import { WordCardShared, WordEntry } from './WordCardShared';

// 保持原有接口兼容性
interface ProcessedWordData {
  Word: string;
  IPA: string;
  PhonicsChunks: string[] | string;
  PhonicsIPA: string[] | string;
  Definition_CN: string;
  Example: string;
  Example_CN: string;
  Picture: string;
  Audio: string;
}

interface WordCardProps {
  word: ProcessedWordData;
  side: 'front' | 'back';
  className?: string;
}

/**
 * 新版统一WordCard组件 - 使用共享逻辑
 * 网页预览组件，调用WordCardShared进行统一渲染
 */
export const WordCard: React.FC<WordCardProps> = ({ word, side, className = '' }) => {
  // 转换数据格式以匹配WordEntry
  const wordEntry: WordEntry = {
    Word: word.Word,
    IPA: word.IPA,
    PhonicsChunks: word.PhonicsChunks,
    PhonicsIPA: word.PhonicsIPA,
    Definition_CN: word.Definition_CN,
    Example: word.Example,
    Example_CN: word.Example_CN,
    Picture: word.Picture,
    Audio: word.Audio,
  };

  // 定义Web组件
  const webComponents = {
    View: 'div',
    Text: 'span',
    Image: 'img',
  };

  return (
    <WordCardShared
      word={wordEntry}
      mode="web"
      side={side}
      components={webComponents}
      className={className}
    />
  );
};