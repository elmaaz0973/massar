import { forwardRef, memo } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// نسمح بـ <details>/<summary> فقط (للإجابات القابلة للطي) وكل شيء آخر يُنظَّف.
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'details', 'summary'],
};

const components = {
  a: ({ href = '', children }) =>
    href.startsWith('/') && !href.startsWith('//')
      ? <Link to={href}>{children}</Link>
      : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  table: (props) => <div className="table-wrap"><table {...props} /></div>,
};

const Markdown = forwardRef(function Markdown({ children }, ref) {
  return (
    <div className="prose" ref={ref}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]} components={components}>
        {children || ''}
      </ReactMarkdown>
    </div>
  );
});

export default memo(Markdown);
