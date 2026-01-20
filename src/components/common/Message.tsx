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

export function Message({ message, isLast }: MessageProps) {
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
    <div className="message-actions">
        <button 
            className="message-action-btn" 
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
            <div className="message-action-menu" style={{ display: 'block', opacity: 1, pointerEvents: 'auto', transform: 'translateY(0)' }}>
                <button 
                    className="message-action-item" 
                    onClick={() => { 
                        if (message.timestamp) {
                            deleteMessage(message.timestamp); 
                        }
                        setShowActions(false); 
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <div className={`message user`} id={`message-${message.timestamp || Date.now()}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', justifyContent: 'flex-end', position: 'relative' }}>
        <div className="user-message-actions-wrapper" style={{ display: 'flex', alignItems: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
           <button 
             className={`copy-message-btn ${copied ? 'copied' : ''}`} 
             title={copied ? "Copied!" : "Copy message"} 
             onClick={handleCopy}
             style={{ position: 'static', opacity: 1, display: 'flex' }}
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
        <div className="message-content" style={{ position: 'relative' }}>
          <div className="message-text">{message.content}</div>
          {message.promptRef && (
            <div className="message-prompt-ref">
                <span className="prompt-reference-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {message.promptRef.title || 'Untitled Prompt'}
                </span>
            </div>
          )}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
            .message.user:hover .user-message-actions-wrapper {
                opacity: 1 !important;
            }
            .message.user .message-actions {
                position: static;
                opacity: 1;
            }
        ` }} />
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="message-wrapper">
      <div className={`message assistant`} id={`message-${message.timestamp || Date.now()}`}>
        <button 
          className={`copy-message-btn ${copied ? 'copied' : ''}`} 
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

        <div className="message-content markdown-content">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = !match;
                
                return !inline && match ? (
                  <div className="code-block-wrapper">
                    <div className="code-block-header">
                      <span className="code-language">{match[1]}</span>
                      <button 
                        className="copy-code-btn"
                        onClick={() => navigator.clipboard.writeText(String(children))}
                      >
                        Copy
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={oneDark as { [key: string]: React.CSSProperties }}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      <div className="message-metadata-external">
        <span className="metadata-timestamp">{formatTime(message.timestamp)}</span>
        {message.model && <span className="metadata-model">{message.model}</span>}
        {message.generationTime && <span className="metadata-generation-time">{message.generationTime.toFixed(1)}s</span>}
        
        <div className="message-actions-inline">
            <button className="action-btn thumbs-up" title="Good response">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 22V11m0 0L4 11a2 2 0 00-2 2v6a2 2 0 002 2h3m0-10l3.5-7a2 2 0 012-1h.5a1.5 1.5 0 011.5 1.5V8h5a2 2 0 012 2v1a2 2 0 01-.3 1l-3.5 7a2 2 0 01-1.8 1H7"/>
                </svg>
            </button>
            <button className="action-btn thumbs-down" title="Poor response">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 2v11m0 0l3 0a2 2 0 012 2v-6a2 2 0 00-2-2h-3m0 10l-3.5 7a2 2 0 01-2 1h-.5a1.5 1.5 0 01-1.5-1.5V16h-5a2 2 0 01-2-2v-1a2 2 0 01.3-1l3.5-7a2 2 0 011.8-1H17"/>
                </svg>
            </button>
            <button className="action-btn regenerate" title="Regenerate response">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
}
