import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message as MessageType } from '../../types';
import { useChatStore } from '../../stores/chatStore';
import { MoreHorizontal, Trash2, Check, Copy, FileText, ThumbsUp, ThumbsDown, RotateCw } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
}

export function Message({ message }: MessageProps) {
  const { deleteMessage } = useChatStore();
  const [showActions, setShowActions] = useState(false);

  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  // Copy message content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  };

  const ActionMenu = () => (
    <div className="relative">
        <button 
            className="bg-transparent border-none p-1.5 rounded-md cursor-pointer text-text-muted hover:bg-white/5 hover:text-text-secondary transition-all" 
            title="More options"
            onClick={() => setShowActions(!showActions)}
        >
            <MoreHorizontal size={16} />
        </button>
        {showActions && (
            <div className="absolute top-full right-0 bg-bg-secondary border border-white/10 rounded-lg shadow-lg min-w-40 z-1000 mt-1 animate-fadeIn">
                <button 
                    className="flex items-center gap-2 w-full px-3 py-2 bg-transparent border-none text-text-primary text-left cursor-pointer text-sm hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg" 
                    onClick={() => { 
                        if (message.timestamp) {
                            deleteMessage(message.timestamp); 
                        }
                        setShowActions(false); 
                    }}
                >
                    <Trash2 size={16} className="opacity-70" />
                    Delete Message
                </button>
            </div>
        )}
    </div>
  );

  if (isUser) {
    return (
      <div className="flex items-start gap-2 justify-end relative group mb-1" id={`message-${message.timestamp || Date.now()}`}>
        <div className="flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
           <button 
             className={`bg-transparent border-none p-1.5 rounded-md cursor-pointer transition-all flex items-center justify-center ${copied ? 'text-green-400' : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'}`}
             title={copied ? "Copied!" : "Copy message"} 
             onClick={handleCopy}
           >
             {copied ? (
               <Check size={16} />
             ) : (
               <Copy size={16} />
             )}
           </button>
           <ActionMenu />
        </div>
        <div className="max-w-[85%] min-w-0 overflow-hidden p-4 rounded-xl text-base leading-6 wrap-break-word bg-[#242628] border border-[#303233] text-[#B5B5B5] rounded-br-md relative">
          <div className="whitespace-pre-wrap">{message.content}</div>
          {message.promptRef && (
            <div className="mt-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-text-muted">
                    <FileText size={12} />
                    {message.promptRef.title || 'Untitled Prompt'}
                </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="group mb-1">
      <div className="flex items-start gap-2 justify-start relative" id={`message-${message.timestamp || Date.now()}`}>
        <div className="max-w-[85%] min-w-0 overflow-x-auto p-5 rounded-xl text-base leading-6 wrap-break-word bg-bg-secondary border border-border text-[#B5B5B5] rounded-bl-md markdown-content">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = !match;
                
                return !inline && match ? (
                  <div className="my-4 rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] border-b border-border">
                      <span className="text-xs text-text-muted font-medium">{match[1]}</span>
                      <button 
                        className="text-xs text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer transition-colors"
                        onClick={() => navigator.clipboard.writeText(String(children))}
                      >
                        Copy
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={oneDark as any}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={`${className} bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-text-primary`} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div className="flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
           <button 
             className={`bg-transparent border-none p-1.5 rounded-md cursor-pointer transition-all flex items-center justify-center ${copied ? 'text-green-400' : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'}`}
             title={copied ? "Copied!" : "Copy message"} 
             onClick={handleCopy}
           >
             {copied ? (
               <Check size={16} />
             ) : (
               <Copy size={16} />
             )}
           </button>
           <ActionMenu />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1 ml-1 text-[11px] text-text-muted opacity-70 mb-3">
        <span>{formatTime(message.timestamp)}</span>
        {message.model && <span>{message.model}</span>}
        {message.sources && <span className="text-xs">{message.sources}</span>}
        {message.generationTime && <span>{message.generationTime.toFixed(1)}s</span>}
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button className="p-1 bg-transparent border-none text-text-muted cursor-pointer rounded hover:bg-white/5 hover:text-text-primary" title="Good response">
                <ThumbsUp size={14} />
            </button>
            <button className="p-1 bg-transparent border-none text-text-muted cursor-pointer rounded hover:bg-white/5 hover:text-text-primary" title="Poor response">
                <ThumbsDown size={14} />
            </button>
            <button className="p-1 bg-transparent border-none text-text-muted cursor-pointer rounded hover:bg-white/5 hover:text-text-primary" title="Regenerate response">
                <RotateCw size={14} />
            </button>
        </div>
      </div>
    </div>
  );
}
