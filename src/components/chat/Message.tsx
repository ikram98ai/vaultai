import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Copy message content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message message-${message.role}`}>
      {/* Avatar */}
      <div className="message-avatar">
        {isUser ? (
          <div className="user-avatar">U</div>
        ) : (
          <svg width="24" height="24" viewBox="0 0 28 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.0009 30.2925C11.7548 30.16 10.3919 29.1757 9.65372 28.5889C4.3284 24.3678 1.48276 19.8564 0.50477 14.0894C0.182979 12.1839 0.0441675 10.2847 0.0189291 7.50845L0 5.67866L0.157741 5.40735C0.384887 5.00984 0.675129 4.87734 1.94967 4.57448C5.12341 3.82363 8.22775 2.46075 11.6665 0.315481C12.1649 0 12.1713 0 12.7076 0H13.2502L13.9443 0.447984C16.0075 1.773 18.3673 2.93397 20.6892 3.76053C21.1751 3.93089 21.6105 4.10756 21.6546 4.14542C21.6988 4.18328 21.7366 4.33471 21.7366 4.47983C21.7366 4.75115 21.7303 4.75746 20.9479 5.43889C20.0709 6.18974 19.9384 6.27176 19.5409 6.27807C18.9036 6.28438 15.7867 4.87103 13.5278 3.55863C13.1177 3.31886 12.7391 3.12326 12.695 3.12326C12.6445 3.12326 12.2091 3.35672 11.7296 3.63434C9.35086 5.02877 6.54308 6.2276 3.91197 6.97844C3.35672 7.13618 2.97814 7.2813 2.8835 7.36964L2.72576 7.50845L2.76992 8.80192C2.97183 15.3261 4.43566 19.3138 8.10786 23.3077C8.70728 23.9639 9.98182 25.1565 10.8147 25.8379C11.5718 26.4689 12.6003 27.226 12.695 27.226C12.8022 27.226 13.7991 26.4752 14.8276 25.6234C15.8182 24.7968 17.5849 23.0238 18.2853 22.1468C20.4179 19.4967 21.6925 16.5817 22.2414 13.124C22.3928 12.165 22.2856 12.3479 23.7116 10.6002C24.7274 9.35086 24.7463 9.33824 25.005 9.31931C25.2006 9.30669 25.2827 9.32562 25.3079 9.39503C25.3584 9.52122 25.2385 11.3636 25.106 12.4615C24.557 17.2 23.0995 20.7587 20.2981 24.1974C19.5788 25.0744 17.6796 26.9736 16.6511 27.8381C15.8056 28.551 14.468 29.5669 13.7045 30.0906L13.2754 30.3808H12.7265C12.3732 30.3808 12.1145 30.3493 12.0009 30.2925Z"
              fill="#FFBA08"
            />
            <path
              d="M12.2408 21.9702C12.1903 21.8881 11.7739 20.9543 11.3196 19.9006C9.48977 15.6353 8.68214 14.3544 7.44545 13.774C7.07319 13.6036 6.94068 13.5784 6.25924 13.5405L5.48947 13.5026L5.47054 13.2313C5.4453 12.8717 5.58411 12.6572 6.24032 12.0388C6.84604 11.4709 7.39498 11.1239 8.0007 10.9409C8.35404 10.8274 8.55595 10.8147 9.19953 10.8274C9.93145 10.8526 9.98823 10.8652 10.4425 11.0797C11.4331 11.5593 12.2218 12.4679 12.9727 13.9822L13.2882 14.6194L15.4461 12.4552C19.5852 8.30351 22.8662 5.38847 25.9326 3.12963C26.7403 2.53021 27.1252 2.35354 27.5227 2.37878L27.8255 2.39771V2.7826C27.8255 3.1107 27.794 3.21796 27.6047 3.52082C27.3586 3.91202 25.5919 6.14562 22.6643 9.77366C16.4682 17.4398 14.6447 19.7555 13.6604 21.2319C13.0736 22.109 13.0673 22.1153 12.6698 22.1153C12.3922 22.1153 12.3228 22.09 12.2408 21.9702Z"
              fill="#FFBA08"
            />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className="message-content">
        {isUser ? (
          <div className="message-text">{message.content}</div>
        ) : (
          <div className="message-text markdown-content">
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
        )}

        {/* Message Metadata */}
        <div className="message-metadata">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          
          {isAssistant && message.generationTime && (
            <span className="generation-time">
              {message.generationTime.toFixed(1)}s
            </span>
          )}
          
          {isAssistant && message.model && (
            <span className="message-model">{message.model}</span>
          )}

          {/* Action buttons */}
          <div className="message-actions">
            <button className="action-btn" onClick={handleCopy} title="Copy">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sources if available */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="message-sources">
            <div className="sources-header">Sources:</div>
            <div className="sources-list">
              {message.sources.map((source, idx) => (
                <div key={idx} className="source-item">
                  <span className="source-type">{source.type}</span>
                  <span className="source-title">{source.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
