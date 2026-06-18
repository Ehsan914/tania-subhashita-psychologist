import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

const scanTags = (startLine, endLine) => {
  const lines = content.split('\n').slice(startLine - 1, endLine);
  const stack = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Simplistic tag extractor
    // This isn't a true HTML parser but works for the structure
    // Ignore self-closing tags and those inside comments or strings (partially hard, let's just use regex)
    // We already know it's a JSX file.
    
    const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
      const tagStr = match[0];
      const tagName = match[1];
      
      // Ignore self closing tags like <img ... /> or <input ... /> etc.
      if (tagStr.endsWith('/>')) {
        continue;
      }
      
      // Ignore some known non-wrapping tags
      if (['img', 'input', 'br', 'hr', 'path', 'circle', 'g', 'svg', 'Check', 'X', 'ShieldAlert', 'Search', 'Menu', 'Info', 'ChevronRight'].includes(tagName)) {
        continue;
      }

      if (tagStr.startsWith('</')) {
        // Closing tag
        if (stack.length > 0) {
          const last = stack.pop();
          if (last.tag !== tagName) {
             console.log(`Mismatch at line ${startLine + i}: expected </${last.tag}> (opened at line ${last.line}) but found </${tagName}> | line: ${line.trim()}`);
             // Try to recover
             stack.push(last); // undo pop
          }
        }
      } else {
        // Open tag
        stack.push({ tag: tagName, line: startLine + i });
      }
    }
  }
  
  return stack;
};

console.log("Remaining stack:", scanTags(569, 2110));
