import React from "react";
import { motion } from "framer-motion";

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
    // Разбиваем контент на абзацы
    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, index) => {
      // Проверяем различные форматы
      if (paragraph.startsWith("# ")) {
        return (
          <motion.h1
            key={index}
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
            key={index}
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
            key={index}
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
            key={index}
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
            key={index}
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
        const items = paragraph
          .split("\n")
          .filter((line) => line.match(/^\d+\./));
        return (
          <motion.ol
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="list-decimal list-inside space-y-2 mb-4 text-gray-200"
          >
            {items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item.replace(/^\d+\.\s*/, "")}
              </li>
            ))}
          </motion.ol>
        );
      }

      if (paragraph.match(/^[\*\-]/)) {
        const items = paragraph
          .split("\n")
          .filter((line) => line.match(/^[\*\-]/));
        return (
          <motion.ul
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="list-disc list-inside space-y-2 mb-4 text-gray-200"
          >
            {items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item.replace(/^[\*\-]\s*/, "")}
              </li>
            ))}
          </motion.ul>
        );
      }

      if (paragraph.startsWith("```")) {
        const codeContent = paragraph
          .replace(/```[\w]*\n?/, "")
          .replace(/```$/, "");
        return (
          <motion.pre
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 my-4 overflow-x-auto"
          >
            <code className="text-green-400 text-sm font-mono">
              {codeContent}
            </code>
          </motion.pre>
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
          '<code class="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
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
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-gray-200 leading-relaxed mb-4 text-lg"
            dangerouslySetInnerHTML={{ __html: formatInline(paragraph) }}
          />
        );
      }

      return null;
    });
  };

  return <div className="note-content-rendered">{renderContent(content)}</div>;
};

export default NoteRenderer;
