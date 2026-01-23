import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message as MessageType } from '../../types';
import { useChatStore } from '../../stores/chatStore';

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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
                <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
            </svg>
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
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                        <path d="M4 5L4 13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13V5M2 5H14M6 5V3C6 2.44772 6.44772 2 7 2H9C9.55228 2 10 2.44772 10 3V5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
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
               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             ) : (
               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M10.5 2H4.5C3.67157 2 3 2.67157 3 3.5V10.5C3 11.3284 3.67157 12 4.5 12H10.5C11.3284 12 12 11.3284 12 10.5V3.5C12 2.67157 11.3284 2 10.5 2Z" stroke="currentColor" strokeWidth="1.5"/>
                   <path d="M5 12V13.5C5 14.3284 5.67157 15 6.5 15H12.5C13.3284 15 14 14.3284 14 13.5V6.5C14 5.67157 13.3284 5 12.5 5H12" stroke="currentColor" strokeWidth="1.5"/>
               </svg>
             )}
           </button>
           <ActionMenu />
        </div>
        <div className="max-w-[85%] min-w-0 overflow-hidden p-4 rounded-xl text-base leading-6 wrap-break-word bg-[#242628] border border-[#303233] text-[#B5B5B5] rounded-br-md relative">
          <div className="whitespace-pre-wrap">{message.content}</div>
          {message.promptRef && (
            <div className="mt-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
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
               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             ) : (
               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M10.5 2H4.5C3.67157 2 3 2.67157 3 3.5V10.5C3 11.3284 3.67157 12 4.5 12H10.5C11.3284 12 12 11.3284 12 10.5V3.5C12 2.67157 11.3284 2 10.5 2Z" stroke="currentColor" strokeWidth="1.5"/>
                   <path d="M5 12V13.5C5 14.3284 5.67157 15 6.5 15H12.5C13.3284 15 14 14.3284 14 13.5V6.5C14 5.67157 13.3284 5 12.5 5H12" stroke="currentColor" strokeWidth="1.5"/>
               </svg>
             )}
           </button>
           <ActionMenu />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1 ml-1 text-[11px] text-text-muted opacity-70 mb-3">
        <span>{formatTime(message.timestamp)}</span>
        {message.model && <span>{message.model}</span>}
        {message.generationTime && <span>{message.generationTime.toFixed(1)}s</span>}
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button className="p-1 bg-transparent border-none text-text-muted cursor-pointer rounded hover:bg-white/5 hover:text-text-primary" title="Good response">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 22V11m0 0L4 11a2 2 0 00-2 2v6a2 2 0 002 2h3m0-10l3.5-7a2 2 0 012-1h.5a1.5 1.5 0 011.5 1.5V8h5a2 2 0 012 2v1a2 2 0 01-.3 1l-3.5 7a2 2 0 01-1.8 1H7"/>
                </svg>
            </button>
            <button className="p-1 bg-transparent border-none text-text-muted cursor-pointer rounded hover:bg-white/5 hover:text-text-primary" title="Poor response">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 2v11m0 0l3 0a2 2 0 012 2v-6a2 2 0 00-2-2h-3m0 10l-3.5 7a2 2 0 01-2 1h-.5a1.5 1.5 0 01-1.5-1.5V16h-5a2 2 0 01-2-2v-1a2 2 0 01.3-1l3.5-7a2 2 0 011.8-1H17"/>
                </svg>
            </button>
            <button className="p-1 bg-transparent border-none text-text-muted cursor-pointer rounded hover:bg-white/5 hover:text-text-primary" title="Regenerate response">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
}
