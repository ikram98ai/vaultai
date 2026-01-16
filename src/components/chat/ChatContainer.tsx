import { useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { Message } from '../../components/chat/Message';
import { ChatInput } from '../../components/chat/ChatInput';

export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isSending } = useChatStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container" id="chatContainer">
      <div className="chat-messages" id="chatMessages">
        {messages.map((msg, index) => (
          <Message 
            key={`${msg.timestamp}-${index}`} 
            message={msg}
            isLast={index === messages.length - 1}
          />
        ))}
        
        {/* Typing indicator when sending */}
        {isSending && (
          <div className="message message-assistant">
            <div className="message-avatar">
              <svg width="24" height="24" viewBox="0 0 28 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.0009 30.2925C11.7548 30.16 10.3919 29.1757 9.65372 28.5889C4.3284 24.3678 1.48276 19.8564 0.50477 14.0894C0.182979 12.1839 0.0441675 10.2847 0.0189291 7.50845L0 5.67866L0.157741 5.40735C0.384887 5.00984 0.675129 4.87734 1.94967 4.57448C5.12341 3.82363 8.22775 2.46075 11.6665 0.315481C12.1649 0 12.1713 0 12.7076 0H13.2502L13.9443 0.447984C16.0075 1.773 18.3673 2.93397 20.6892 3.76053C21.1751 3.93089 21.6105 4.10756 21.6546 4.14542C21.6988 4.18328 21.7366 4.33471 21.7366 4.47983C21.7366 4.75115 21.7303 4.75746 20.9479 5.43889C20.0709 6.18974 19.9384 6.27176 19.5409 6.27807C18.9036 6.28438 15.7867 4.87103 13.5278 3.55863C13.1177 3.31886 12.7391 3.12326 12.695 3.12326C12.6445 3.12326 12.2091 3.35672 11.7296 3.63434C9.35086 5.02877 6.54308 6.2276 3.91197 6.97844C3.35672 7.13618 2.97814 7.2813 2.8835 7.36964L2.72576 7.50845L2.76992 8.80192C2.97183 15.3261 4.43566 19.3138 8.10786 23.3077C8.70728 23.9639 9.98182 25.1565 10.8147 25.8379C11.5718 26.4689 12.6003 27.226 12.695 27.226C12.8022 27.226 13.7991 26.4752 14.8276 25.6234C15.8182 24.7968 17.5849 23.0238 18.2853 22.1468C20.4179 19.4967 21.6925 16.5817 22.2414 13.124C22.3928 12.165 22.2856 12.3479 23.7116 10.6002C24.7274 9.35086 24.7463 9.33824 25.005 9.31931C25.2006 9.30669 25.2827 9.32562 25.3079 9.39503C25.3584 9.52122 25.2385 11.3636 25.106 12.4615C24.557 17.2 23.0995 20.7587 20.2981 24.1974C19.5788 25.0744 17.6796 26.9736 16.6511 27.8381C15.8056 28.551 14.468 29.5669 13.7045 30.0906L13.2754 30.3808H12.7265C12.3732 30.3808 12.1145 30.3493 12.0009 30.2925Z"
                  fill="#FFBA08"
                />
              </svg>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput />
    </div>
  );
}
