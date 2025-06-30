import React from "react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface NoteRendererProps {
  content: string;
  isEditing?: boolean;
}

const NoteRenderer: React.FC<NoteRendererProps> = ({
  content,
  isEditing = false,
}) => {
  if (isEditing) return null;

  const renderContent = (text: string) => {
    // Сначала находим и обрабатываем код-блоки
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Добавляем текст до код-блока
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText.trim()) {
          parts.push({ type: "text", content: beforeText });
        }
      }

      // Добавляем код-блок
      const language = match[1] || "text";
      const code = match[2];
      parts.push({ type: "code", content: code, language });

      lastIndex = match.index + match[0].length;
    }

    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({ type: "text", content: remainingText });
      }
    }

    // Если нет код-блоков, обрабатываем как обычный текст
    if (parts.length === 0) {
      parts.push({ type: "text", content: text });
    }

    return parts.map((part, partIndex) => {
      if (part.type === "code") {
        return (
          <motion.div
            key={partIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: partIndex * 0.1 }}
            className="my-6 rounded-lg overflow-hidden border border-gray-700 shadow-lg"
          >
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex space-x-2 mr-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-mono text-gray-400 uppercase tracking-wide">
                  {part.language === "text" ? "Code" : part.language}
                </span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(part.content)}
                className="text-xs text-gray-500 hover:text-neon-green transition-colors px-2 py-1 rounded hover:bg-gray-700"
                title="Копировать код"
              >
                Copy
              </button>
            </div>
            <SyntaxHighlighter
              language={part.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1rem",
                backgroundColor: "#0f172a",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
              showLineNumbers={true}
              lineNumberStyle={{
                color: "#64748b",
                paddingRight: "1em",
                minWidth: "2em",
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {part.content}
            </SyntaxHighlighter>
          </motion.div>
        );
      }

      // Обрабатываем обычный текст
      const paragraphs = part.content.split("\n\n");

      return paragraphs.map((paragraph, index) => {
        const globalIndex = partIndex * 1000 + index; // Уникальный ключ

        if (paragraph.startsWith("# ")) {
          return (
            <motion.h1
              key={globalIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-3xl font-bold text-neon-green mb-6 mt-8 first:mt-0"
            >
              {paragraph.substring(2)}
            </motion.h1>
          );
        }

        if (paragraph.startsWith("## ")) {
          return (
            <motion.h2
              key={globalIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-2xl font-bold text-neon-blue mb-4 mt-6"
            >
              {paragraph.substring(3)}
            </motion.h2>
          );
        }

        if (paragraph.startsWith("### ")) {
          return (
            <motion.h3
              key={globalIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-xl font-semibold text-purple-400 mb-3 mt-4"
            >
              {paragraph.substring(4)}
            </motion.h3>
          );
        }

        if (paragraph.startsWith("---")) {
          return (
            <motion.hr
              key={globalIndex}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: index * 0.1 }}
              className="border-t border-gray-600 my-8"
            />
          );
        }

        if (paragraph.startsWith("> ")) {
          return (
            <motion.blockquote
              key={globalIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-l-4 border-neon-green pl-4 py-2 bg-gray-800/30 rounded-r-lg my-4 italic text-gray-300"
            >
              {paragraph.substring(2)}
            </motion.blockquote>
          );
        }

        if (paragraph.match(/^\d+\./)) {
          return (
            <motion.div
              key={globalIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4 text-white"
            >
              {paragraph.split("\n").map((line, lineIndex) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                if (line.match(/^\d+\./)) {
                  return (
                    <div
                      key={lineIndex}
                      className="font-semibold text-lg mb-2 text-neon-blue"
                    >
                      {trimmed}
                    </div>
                  );
                } else if (line.match(/^\s*-/)) {
                  return (
                    <div key={lineIndex} className="ml-6 mb-1 leading-relaxed">
                      <span className="text-neon-green mr-2">•</span>
                      {trimmed.replace(/^-\s*/, "")}
                    </div>
                  );
                } else if (trimmed) {
                  return (
                    <div key={lineIndex} className="ml-4 mb-1 leading-relaxed">
                      {trimmed}
                    </div>
                  );
                }
                return null;
              })}
            </motion.div>
          );
        }

        if (paragraph.match(/^[\*\-]/)) {
          const items = paragraph
            .split("\n")
            .filter((line) => line.match(/^[\*\-]/));
          return (
            <motion.ul
              key={globalIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="list-disc list-inside space-y-2 mb-4 text-white"
            >
              {items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item.replace(/^[\*\-]\s*/, "")}
                </li>
              ))}
            </motion.ul>
          );
        }

        // Обычный параграф с поддержкой inline форматирования
        const formatInline = (text: string) => {
          // Жирный текст **text**
          text = text.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-bold text-white">$1</strong>'
          );

          // Курсив *text*
          text = text.replace(
            /\*(.*?)\*/g,
            '<em class="italic text-gray-300">$1</em>'
          );

          // Инлайн код `code`
          text = text.replace(
            /`(.*?)`/g,
            '<code class="bg-gray-800 text-neon-green px-2 py-1 rounded border border-gray-700 text-sm font-mono shadow-sm">$1</code>'
          );

          // Ссылки [text](url)
          text = text.replace(
            /\[(.*?)\]\((.*?)\)/g,
            '<a href="$2" class="text-neon-blue hover:text-neon-green transition-colors underline" target="_blank" rel="noopener noreferrer">$1</a>'
          );

          return text;
        };

        if (paragraph.trim()) {
          return (
            <motion.p
              key={globalIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-white leading-relaxed mb-4 text-lg"
              dangerouslySetInnerHTML={{ __html: formatInline(paragraph) }}
            />
          );
        }

        return null;
      });
    });
  };

  return <div className="note-content-rendered">{renderContent(content)}</div>;
};

export default NoteRenderer;
