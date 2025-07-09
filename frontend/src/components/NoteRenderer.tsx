import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/tokyo-night-dark.css";

interface NoteRendererProps {
  content: string;
  isEditing?: boolean;
}

const NoteRenderer: React.FC<NoteRendererProps> = ({
  content,
  isEditing = false,
}) => {
  if (isEditing) return null;

  // Кастомные компоненты для красивого рендеринга
  const components = {
    // Заголовки
    h1: ({ children, ...props }: any) => (
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-6 mt-8 first:mt-0 border-b-2 border-purple-500/30 pb-2"
        {...props}
      >
        {children}
      </motion.h1>
    ),

    h2: ({ children, ...props }: any) => (
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-cyan-400 mb-4 mt-6"
        {...props}
      >
        {children}
      </motion.h2>
    ),

    h3: ({ children, ...props }: any) => (
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold text-purple-300 mb-3 mt-4"
        {...props}
      >
        {children}
      </motion.h3>
    ),

    // Параграфы
    p: ({ children, ...props }: any) => (
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-100 leading-relaxed mb-4 text-lg"
        {...props}
      >
        {children}
      </motion.p>
    ),

    // Списки
    ul: ({ children, ...props }: any) => (
      <motion.ul
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="list-none space-y-2 mb-4 pl-4"
        {...props}
      >
        {children}
      </motion.ul>
    ),

    ol: ({ children, ...props }: any) => (
      <motion.ol
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="list-decimal list-inside space-y-2 mb-4 pl-4 text-gray-100"
        {...props}
      >
        {children}
      </motion.ol>
    ),

    li: ({ children, ...props }: any) => (
      <li className="text-gray-100 leading-relaxed relative pl-6" {...props}>
        <span className="absolute left-0 top-0 text-cyan-400 font-bold">•</span>
        {children}
      </li>
    ),

    // Цитаты
    blockquote: ({ children, ...props }: any) => (
      <motion.blockquote
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="border-l-4 border-cyan-400 pl-6 py-2 my-6 bg-gradient-to-r from-cyan-400/10 to-transparent italic text-gray-300 rounded-r-lg"
        {...props}
      >
        {children}
      </motion.blockquote>
    ),

    // Код
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");

      if (!inline) {
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-6"
          >
            <pre className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-4 overflow-x-auto backdrop-blur-sm">
              <code
                className={`language-${match?.[1] || "text"} text-sm`}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </code>
            </pre>
          </motion.div>
        );
      }

      return (
        <code
          className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30 text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Ссылки
    a: ({ children, href, ...props }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/50 hover:decoration-cyan-300 transition-colors duration-300"
        {...props}
      >
        {children}
      </a>
    ),

    // Горизонтальная линия
    hr: ({ ...props }) => (
      <motion.hr
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        className="border-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent my-8"
        {...props}
      />
    ),

    // Таблицы
    table: ({ children, ...props }: any) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto my-6"
      >
        <table
          className="min-w-full border border-purple-500/30 rounded-lg overflow-hidden"
          {...props}
        >
          {children}
        </table>
      </motion.div>
    ),

    thead: ({ children, ...props }: any) => (
      <thead className="bg-purple-500/20" {...props}>
        {children}
      </thead>
    ),

    th: ({ children, ...props }: any) => (
      <th
        className="px-4 py-3 text-left text-sm font-semibold text-purple-300 border-b border-purple-500/30"
        {...props}
      >
        {children}
      </th>
    ),

    td: ({ children, ...props }: any) => (
      <td
        className="px-4 py-3 text-sm text-gray-100 border-b border-purple-500/20"
        {...props}
      >
        {children}
      </td>
    ),

    // Жирный и курсивный текст
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold text-white" {...props}>
        {children}
      </strong>
    ),

    em: ({ children, ...props }: any) => (
      <em className="italic text-gray-300" {...props}>
        {children}
      </em>
    ),

    // Зачеркнутый текст
    del: ({ children, ...props }: any) => (
      <del className="line-through text-gray-400" {...props}>
        {children}
      </del>
    ),

    // Чекбоксы
    input: ({ type, checked, ...props }: any) => {
      if (type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={checked}
            disabled
            className="mr-2 text-cyan-400 bg-transparent border-cyan-400 rounded focus:ring-cyan-400"
            {...props}
          />
        );
      }
      return <input {...props} />;
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="note-markdown-content"
    >
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};

export default NoteRenderer;
