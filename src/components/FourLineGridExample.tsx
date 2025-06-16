import React from 'react';
import { FourLineGrid } from './FourLineGrid';

/**
 * 四线三格组件使用示例
 * 展示不同类型字母的对齐效果
 */
export const FourLineGridExample: React.FC = () => {
  const examples = [
    { word: 'apple', description: '混合字母类型：a(单格) + p(下降) + p(下降) + l(上升) + e(单格)' },
    { word: 'happy', description: '混合字母类型：h(上升) + a(单格) + p(下降) + p(下降) + y(下降)' },
    { word: 'dog', description: '混合字母类型：d(上升) + o(单格) + g(下降)' },
    { word: 'cat', description: '混合字母类型：c(单格) + a(单格) + t(上升)' },
    { word: 'jump', description: '混合字母类型：j(下降) + u(单格) + m(单格) + p(下降)' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        四线三格英文书写教学示例
      </h2>
      
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ color: '#495057', marginBottom: '15px' }}>字母分类说明：</h3>
        <ul style={{ color: '#6c757d', lineHeight: '1.6' }}>
          <li><strong>单格字母</strong>（如 a, e, o, u, c, x）：占中格，底部对齐红色基线</li>
          <li><strong>上升字母</strong>（如 b, d, f, h, k, l, t）：从顶线延伸到红色基线</li>
          <li><strong>下降字母</strong>（如 g, j, p, q, y）：从中线延伸到底线，主体在中格</li>
        </ul>
      </div>

      {examples.map((example, index) => (
        <div key={index} style={{ marginBottom: '40px' }}>
          <h4 style={{ color: '#495057', marginBottom: '10px' }}>
            示例 {index + 1}: "{example.word}"
          </h4>
          <p style={{ color: '#6c757d', marginBottom: '15px', fontSize: '14px' }}>
            {example.description}
          </p>
          <div style={{ 
            border: '1px solid #dee2e6', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <FourLineGrid word={example.word} />
          </div>
        </div>
      ))}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h3 style={{ color: '#0056b3', marginBottom: '15px' }}>使用方法：</h3>
        <pre style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px',
          fontSize: '14px',
          overflow: 'auto'
        }}>
{`import { FourLineGrid } from './components/FourLineGrid';

// 基本使用
<FourLineGrid word="apple" />

// 自定义尺寸
<FourLineGrid 
  word="hello" 
  width={600} 
  height={400} 
/>`}
        </pre>
      </div>
    </div>
  );
};

export default FourLineGridExample; 