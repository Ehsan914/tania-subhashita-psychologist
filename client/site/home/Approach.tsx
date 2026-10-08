// "How we'll work": the methodology quote beside the three-step timeline.
import type { MethodologyQuoteData, MethodologyStep } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';
import { accentTail } from './accent';

const FALLBACK_HEADING = 'At your own pace.';
const ACCENT_WORDS = 2;

// The design sets its own curly quotes around the text; stored quotes may already carry them.
const stripQuotes = (text: string) => text.replace(/^[\s"“”]+|[\s"“”]+$/g, '');

interface ApproachProps {
  quote: MethodologyQuoteData | null;
  steps: MethodologyStep[];
}

export default function Approach({ quote, steps }: ApproachProps) {
  const quoteText = stripQuotes(quote?.quote ?? '');

  return (
    <section className="section section--band approach">
      <div className="wrap layout">
        <div className="sticky">
          <p className="eyebrow" data-reveal="rise">How we'll work</p>
          <h2 className="h2" data-reveal="split" style={{ marginTop: 22 }}>
            <SplitWords>{accentTail(quote?.scriptTitle || FALLBACK_HEADING, ACCENT_WORDS)}</SplitWords>
          </h2>
          {quoteText && (
            <blockquote data-reveal="rise">
              “{quoteText}”{quote?.attribution && <cite>{quote.attribution}</cite>}
            </blockquote>
          )}
        </div>
        {steps.length > 0 && (
          <div className="timeline" data-reveal="timeline">
            <span className="spine" aria-hidden="true" />
            {steps.map((step, i) => (
              <div className="step" key={step.id}>
                <span className="node" aria-hidden="true">{i + 1}</span>
                <div className="step-body">
                  <p className="num">{step.stepNumber}</p>
                  <h3 className="h3">{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
