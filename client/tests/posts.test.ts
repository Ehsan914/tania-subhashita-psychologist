import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { RichText } from '../context/SiteDataContext';
import { readingTime } from '../site/journal/posts';

const paragraph = (words: number, key = 'p'): RichText[number] => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, text: Array.from({ length: words }, () => 'word').join(' '), marks: [] }],
});

describe('readingTime', () => {
  it('counts the words of every block at 200 a minute', () => {
    assert.equal(readingTime([paragraph(500, 'a'), paragraph(500, 'b')]), '5 min read');
  });

  it('rounds to the nearest minute', () => {
    assert.equal(readingTime([paragraph(649)]), '3 min read');
    assert.equal(readingTime([paragraph(701)]), '4 min read');
  });

  it('never says less than a minute, even for an empty post', () => {
    assert.equal(readingTime([paragraph(30)]), '1 min read');
    assert.equal(readingTime([]), '1 min read');
  });

  it('joins a block’s spans as written, so a bolded word is not split or doubled', () => {
    // "  three   words here": three words, with "here" in bold
    const block: RichText[number] = {
      _type: 'block', _key: 'x', style: 'normal', markDefs: [],
      children: [
        { _type: 'span', _key: 's1', text: '  three   words ', marks: [] },
        { _type: 'span', _key: 's2', text: 'here', marks: ['strong'] },
      ],
    };
    // 100 blocks × 3 words = 300 words = 1.5 minutes → 2
    assert.equal(readingTime(Array.from({ length: 100 }, () => block)), '2 min read');
  });

  it('keeps the last word of one block apart from the first of the next', () => {
    const one = paragraph(1, 'a');
    // 400 one-word blocks: 400 words, not one long run-on word
    assert.equal(readingTime(Array.from({ length: 400 }, () => one)), '2 min read');
  });
});
