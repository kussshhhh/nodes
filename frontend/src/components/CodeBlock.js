import React from 'react';
import  { Highlight } from 'prism-react-renderer';

import { themes } from 'prism-react-renderer';

export default function CodeBlock({ code, language } ) {
  return (
    <Highlight  theme={themes.nightOwl} code={code.trim()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className="rounded-md p-4 overflow-auto" style={{ ...style, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              <span className="inline-block w-8 text-right mr-4 text-gray-500 select-none">{i + 1}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}