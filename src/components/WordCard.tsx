import React from 'react';
import { FourLineGrid } from './FourLineGrid';

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

interface WordCardProps {
  word: ProcessedWordData;
  side: 'front' | 'back';
  className?: string;
}

export const WordCard: React.FC<WordCardProps> = ({ word, side, className = '' }) => {
  if (side === 'front') {
    return (
      <div 
        className={`w-full h-full bg-white border border-gray-300 ${className}`}
        style={{ 
          boxSizing: 'border-box',
          minHeight: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
          {/* Picture Section - 已验证布局，请勿随意修改 */}
          <div className="picture-container">
            <img 
              src={word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`} 
              alt={word.Word}
              className="card-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                console.log(`Failed to load image: ${word.Picture}`);
              }}
            />
          </div>
          
          {/* Word Section with Four-Line Grid - Middle 1/3 */}
          <div 
            style={{ 
              flex: '1 1 33.333%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            {/* SVG Four-Line Writing Grid - 教学标准精确版本 */}
            <div style={{ marginBottom: '0px' }}>
              <FourLineGrid word={word.Word} width={600} height={150} />
            </div>
            
            {/* IPA - 优化与单词的距离 */}
            <p 
              style={{
                margin: 0,
                marginTop: '0px', // 适中距离，既不太近也不太远
                fontSize: '22px',
                lineHeight: '1.2',
                fontWeight: '500',
                color: '#6b7280',
                fontFamily: 'monospace',
                textAlign: 'center'
              }}
            >
              {word.IPA}
            </p>
          </div>
          
          {/* Definition Section - Bottom 1/3 */}
          <div 
            style={{ 
              flex: '1 1 33.333%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 24px'
            }}
          >
            <p 
              style={{ 
                fontSize: '16px',
                lineHeight: '1.4',
                margin: 0,
                width: '100%',
                textAlign: 'center',
                color: '#374151',
                fontWeight: '400'
              }}
            >
              {word.Definition}
            </p>
          </div>
        </div>
    );
  }

  /* ========================================
   * 背面卡片标准版本 - 已确认设计
   * ======================================== 
   * 
   * ✅ 此版本已经过用户确认，各项排版均已达标：
   * - 发音和释义的排版清晰
   * - 中文释义样式突出（浅蓝背景）
   * - 英文例句悬挂缩进对齐逻辑正确
   * - 中英文例句之间的间距合适（紧凑成对）
   * - 整体垂直位置合适，适配最多三组例句
   * 
   * ⚠️ 重要提醒：
   * 请保持这个设计作为后续所有卡片背面的统一模板
   * 如果以后有新的修改建议，用户会单独说明
   * 当前版本请作为标准保持不变，不要随意调整
   * 
   * 最后确认时间：2024年
   * ======================================== */
  
  return (
    <div 
      className={`w-full h-full bg-white border-2 border-gray-200 rounded-lg ${className}`}
      style={{ 
        boxSizing: 'border-box',
        minHeight: '0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 24px'
      }}
    >
      {/* 内容容器 - 稍偏下的垂直居中，预留三组例句空间 */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: 'translateY(5%)',
        minHeight: '75%'
      }}>
      {/* IPA 音标 - 顶部显示，最大字号 */}
      <div style={{ marginBottom: '18px' }}>
        <p style={{
          fontSize: '24px',
          lineHeight: '1.2',
          color: '#6b7280',
          fontFamily: 'monospace',
          textAlign: 'center',
          margin: 0,
          fontWeight: '500'
        }}>
          {word.IPA}
        </p>
      </div>
      
      {/* 中文释义区 - 支持多释义，次大字号 */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#E6F2FF',
          padding: '12px 20px',
          borderRadius: '8px',
          textAlign: 'center',
          width: 'fit-content',
          minWidth: '60%'
        }}>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.4',
            color: '#374151',
            margin: 0,
            fontWeight: '600'
          }}>
            {word.Definition_CN}
          </p>
        </div>
        
        {/* 预留多释义空间 - 如果有第二个释义可以在这里添加 */}
        {/* 未来扩展：
        {word.Definition_CN_2 && (
          <div style={{
            backgroundColor: '#E6F2FF',
            padding: '12px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            width: 'fit-content',
            minWidth: '60%'
          }}>
            <p style={{
              fontSize: '20px',
              lineHeight: '1.4',
              color: '#374151',
              margin: 0,
              fontWeight: '600'
            }}>
              {word.Definition_CN_2}
            </p>
          </div>
        )} */}
      </div>
      
      {/* 分隔线 - 拉开释义区与例句区的距离 */}
      <div style={{
        width: '75%',
        height: '1px',
        backgroundColor: '#d1d5db',
        margin: '0 0 20px 0'
      }}></div>
      
      {/* 例句区域 - 左对齐排版，第三大字号 */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        width: '100%',
        maxWidth: '90%',
        flex: '1'
      }}>
        {/* 第一组例句 - 英文和中文作为一个整体 */}
        <div style={{
          paddingLeft: '8px'
        }}>
          {/* 英文例句 - 悬挂缩进效果 */}
          <div style={{
            display: 'flex',
            marginBottom: '4px'
          }}>
            {/* 序号部分 - 固定宽度 */}
            <span style={{
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#374151',
              fontWeight: '400',
              flexShrink: 0,
              width: '20px'
            }}>
              1.
            </span>
            
            {/* 正文部分 - 可换行，悬挂缩进 */}
            <p style={{ 
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#374151',
              margin: 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              letterSpacing: '0.3px',
              fontWeight: '400',
              textAlign: 'left',
              flex: 1,
              paddingLeft: '4px'
            }}>
              {word.Example}
            </p>
          </div>
          
          {/* 中文翻译 - 紧贴英文例句，形成一对 */}
          <div style={{
            paddingLeft: '24px'
          }}>
            <p style={{ 
              fontSize: '15px',
              lineHeight: '1.5',
              color: '#6b7280',
              margin: 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontWeight: '400',
              textAlign: 'left'
            }}>
              {word.Example_CN}
            </p>
          </div>
        </div>
        
        {/* 预留第二个例句空间 - 未来扩展，同样紧凑排版 */}
        {/* 
        {word.Example_2 && (
          <div style={{
            paddingLeft: '8px'
          }}>
            <div style={{
              display: 'flex',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '16px',
                lineHeight: '1.5',
                color: '#374151',
                fontWeight: '400',
                flexShrink: 0,
                width: '20px'
              }}>
                2.
              </span>
              
              <p style={{ 
                fontSize: '16px',
                lineHeight: '1.5',
                color: '#374151',
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                letterSpacing: '0.3px',
                fontWeight: '400',
                textAlign: 'left',
                flex: 1,
                paddingLeft: '4px'
              }}>
                {word.Example_2}
              </p>
            </div>
            
            <div style={{
              paddingLeft: '24px'
            }}>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.5',
                color: '#6b7280',
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                fontWeight: '400',
                textAlign: 'left'
              }}>
                {word.Example_CN_2}
              </p>
            </div>
          </div>
        )} */}
        
        {/* 预留第三个例句空间 - 未来扩展，同样紧凑排版 */}
        {/* 
        {word.Example_3 && (
          <div style={{
            paddingLeft: '8px'
          }}>
            <div style={{
              display: 'flex',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '16px',
                lineHeight: '1.5',
                color: '#374151',
                fontWeight: '400',
                flexShrink: 0,
                width: '20px'
              }}>
                3.
              </span>
              
              <p style={{ 
                fontSize: '16px',
                lineHeight: '1.5',
                color: '#374151',
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                letterSpacing: '0.3px',
                fontWeight: '400',
                textAlign: 'left',
                flex: 1,
                paddingLeft: '4px'
              }}>
                {word.Example_3}
              </p>
            </div>
            
            <div style={{
              paddingLeft: '24px'
            }}>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.5',
                color: '#6b7280',
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                fontWeight: '400',
                textAlign: 'left'
              }}>
                {word.Example_CN_3}
              </p>
            </div>
          </div>
        )} */}
      </div>
      </div>
    </div>
  );
};