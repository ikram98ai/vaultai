import { useRef, useEffect, useState, useLayoutEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
  usePortal?: boolean;
}

export function Dropdown({
  trigger,
  children,
  isOpen: controlledIsOpen,
  onOpenChange,
  align = "right",
  className = "",
  menuClassName = "",
  usePortal = false,
}: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [verticalAlign, setVerticalAlign] = useState<'top' | 'bottom'>('bottom');
  const [portalPosition, setPortalPosition] = useState<{ top: number; left: number } | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const show = isControlled ? controlledIsOpen : internalIsOpen;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !show;
    if (isControlled) {
      onOpenChange?.(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (show && menuRef.current && triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        const gap = 8; // standard gap

        let isTop = false;
        // Smart vertical positioning
        if (spaceBelow < menuRect.height + gap && spaceAbove > menuRect.height + gap) {
          isTop = true;
          setVerticalAlign('top');
        } else {
          setVerticalAlign('bottom');
        }

        if (usePortal) {
          let top = isTop 
            ? triggerRect.top - menuRect.height - gap 
            : triggerRect.bottom + gap;
          
          let left = align === 'right'
            ? triggerRect.right - menuRect.width
            : triggerRect.left;

          // Prevent going off-screen horizontally
          if (left < 10) left = 10;
          if (left + menuRect.width > window.innerWidth - 10) left = window.innerWidth - menuRect.width - 10;

          setPortalPosition({ top, left });
        }
      }
    };

    updatePosition();
    
    if (show && usePortal) {
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [show, usePortal, align]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        if (isControlled) {
          onOpenChange?.(false);
        } else {
          setInternalIsOpen(false);
        }
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, isControlled, onOpenChange, usePortal]);

  const handleMenuClick = () => {
    // Close dropdown when a menu item is clicked, unless it's a specific interaction
    // that should keep it open (can be extended later)
    if (!isControlled) {
      setInternalIsOpen(false);
    } else {
      onOpenChange?.(false);
    }
  };

  const renderMenu = () => {
    if (!show) return null;

    // Increased z-index to ensure it shows above sidebars (usually z-1000)
    const baseClasses = `bg-bg-secondary border border-border rounded-lg shadow-lg z-9999 ${menuClassName}`;
    
    if (usePortal) {
      const style: React.CSSProperties = {
        position: 'fixed',
        top: portalPosition ? portalPosition.top : -9999, // Hide until measured
        left: portalPosition ? portalPosition.left : -9999,
        width: 'max-content', 
        maxWidth: '90vw'
      };
      
      return createPortal(
        <div
          ref={menuRef}
          style={style}
          className={baseClasses}
          onClick={handleMenuClick}
        >
          {children}
        </div>,
        document.body
      );
    }

    const positionClasses = verticalAlign === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
    
    return (
      <div
        ref={menuRef}
        className={`absolute ${positionClasses} ${align === "right" ? "right-0" : "left-0"} ${baseClasses}`}
        onClick={handleMenuClick}
      >
        {children}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={triggerRef} onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>
      {renderMenu()}
    </div>
  );
}
