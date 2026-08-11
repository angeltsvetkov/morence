import React from 'react';

interface FormattedTextProps {
    text: string;
    className?: string;
}

const BULLET_PREFIX = /^\s*[-*•]\s+/;

/**
 * Renders free-form text while respecting line breaks and simple bullet lists.
 * Consecutive lines starting with "-", "*" or "•" are grouped into a <ul>,
 * blank lines start a new paragraph, and any other line breaks are preserved.
 */
const FormattedText: React.FC<FormattedTextProps> = ({ text, className }) => {
    if (!text) return null;

    const lines = text.split(/\r?\n/);

    type Block = { type: 'paragraph'; lines: string[] } | { type: 'list'; items: string[] };
    const blocks: Block[] = [];

    for (const rawLine of lines) {
        const line = rawLine;
        if (line.trim() === '') {
            continue;
        }
        if (BULLET_PREFIX.test(line)) {
            const item = line.replace(BULLET_PREFIX, '');
            const last = blocks[blocks.length - 1];
            if (last && last.type === 'list') {
                last.items.push(item);
            } else {
                blocks.push({ type: 'list', items: [item] });
            }
        } else {
            const last = blocks[blocks.length - 1];
            if (last && last.type === 'paragraph') {
                last.lines.push(line);
            } else {
                blocks.push({ type: 'paragraph', lines: [line] });
            }
        }
    }

    return (
        <div className={className}>
            {blocks.map((block, idx) =>
                block.type === 'list' ? (
                    <ul key={idx} className="list-disc pl-5 space-y-0.5 my-1">
                        {block.items.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p key={idx} className="whitespace-pre-line my-1 first:mt-0 last:mb-0">
                        {block.lines.join('\n')}
                    </p>
                )
            )}
        </div>
    );
};

export default FormattedText;
