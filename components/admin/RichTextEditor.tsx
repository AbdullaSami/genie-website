'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Edit3,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write content here...', label }: Props) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !isUpdatingRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  function exec(command: string, value: string | undefined = undefined) {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleInput();
    }
  }

  function handleInput() {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  }

  function addLink() {
    const url = prompt('Enter URL (e.g. https://example.com):');
    if (url) {
      exec('createLink', url);
    }
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-600">{label}</label>}
      <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:border-[#4F46E5] transition-colors">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => exec('formatBlock', '<h2>')}
              title="Heading 2"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('formatBlock', '<h3>')}
              title="Heading 3"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('formatBlock', '<p>')}
              title="Paragraph"
              className="px-2 py-1 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md font-mono"
            >
              P
            </button>

            <div className="w-[1px] h-4 bg-slate-50 mx-1" />

            <button
              type="button"
              onClick={() => exec('bold')}
              title="Bold"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('italic')}
              title="Italic"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('underline')}
              title="Underline"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Underline className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-slate-50 mx-1" />

            <button
              type="button"
              onClick={() => exec('insertUnorderedList')}
              title="Bullet List"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('insertOrderedList')}
              title="Numbered List"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('formatBlock', '<blockquote>')}
              title="Quote"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-slate-50 mx-1" />

            <button
              type="button"
              onClick={() => exec('justifyLeft')}
              title="Align Left"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyCenter')}
              title="Align Center"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyRight')}
              title="Align Right"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <AlignRight className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-slate-50 mx-1" />

            <button
              type="button"
              onClick={addLink}
              title="Insert Link"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTab(tab === 'edit' ? 'preview' : 'edit')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-lg transition-colors ${
                tab === 'preview'
                  ? 'bg-[#4F46E5] text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab === 'edit' ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {tab === 'edit' ? 'Preview' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {tab === 'edit' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            data-placeholder={placeholder}
            className="p-4 min-h-[160px] max-h-[400px] overflow-y-auto text-sm text-slate-600 leading-relaxed outline-none focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:my-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:my-2 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-2 [&>blockquote]:border-l-2 [&>blockquote]:border-[#4F46E5] [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:my-2 [&>a]:text-[#4F46E5] [&>a]:underline"
          />
        ) : (
          <div
            className="p-4 min-h-[160px] max-h-[400px] overflow-y-auto text-sm text-slate-600 leading-relaxed bg-slate-50 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:my-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:my-2 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-2 [&>blockquote]:border-l-2 [&>blockquote]:border-[#4F46E5] [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:my-2 [&>a]:text-[#4F46E5] [&>a]:underline"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-slate-500 italic">Nothing to preview</p>' }}
          />
        )}
      </div>
    </div>
  );
}
