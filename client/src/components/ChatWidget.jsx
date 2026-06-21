import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../config';

const STEPS = [
  {
    question: 'Bạn muốn tầm giá nào?',
    key: 'price',
    options: [
      { label: 'Dưới 500k', value: 450000, price_min: 0,      price_max: 499999 },
      { label: '500k–650k', value: 575000, price_min: 500000, price_max: 650000 },
      { label: 'Trên 650k', value: 700000, price_min: 650001, price_max: Infinity },
    ],
  },
  {
    question: 'Bạn thích loại túi gì?',
    key: 'category',
    options: [
      { label: 'Túi xách', value: 'Handbag' },
      { label: 'Đeo chéo', value: 'Sling' },
      { label: 'Clutch',   value: 'Clutch' },
      { label: 'Tote',     value: 'Tote' },
    ],
  },
  {
    question: 'Màu yêu thích?',
    key: 'color',
    options: [
      { label: 'Xanh Navy', value: 'Blue' },
      { label: 'Đen',       value: 'Black' },
      { label: 'Be',        value: 'Beige' },
      { label: 'Đỏ',        value: 'Red' },
    ],
  },
];

const STYLE_INJECT = `
@keyframes chatFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-chat-bubble {
  animation: chatFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;

const BotBubble = ({ text }) => (
  <div className="flex flex-col items-start animate-chat-bubble">
    <span className="text-[9px] text-on-surface-variant font-label-caps tracking-widest uppercase mb-1 ml-1">Loom</span>
    <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-none text-sm bg-surface-container text-primary leading-relaxed font-body-md border border-outline-variant/10 shadow-none">
      {text}
    </div>
  </div>
);

const UserBubble = ({ text }) => (
  <div className="flex flex-col items-end animate-chat-bubble">
    <span className="text-[9px] text-on-surface-variant font-label-caps tracking-widest uppercase mb-1 mr-1">Bạn</span>
    <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-none text-sm text-white bg-primary leading-relaxed font-body-md shadow-none">
      {text}
    </div>
  </div>
);

const OptionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-1.5 rounded-full text-xs font-semibold font-label-caps tracking-widest uppercase border border-outline text-primary bg-white hover:bg-primary hover:text-white hover:border-primary active:scale-95 transition-all duration-200"
  >
    {label}
  </button>
);

const ProductCard = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  const fmt = (p) => p.toLocaleString('vi-VN') + ' ₫';

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-3.5 flex gap-3.5 items-center hover:border-outline transition-colors duration-300">
      {!imgError && product.image && product.image !== '/placeholder-bag.png' ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-14 h-14 object-cover rounded-xl flex-shrink-0 bg-surface-container-low border border-outline-variant/10"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center bg-surface-container-high border border-outline-variant/10">
          <span className="material-symbols-outlined text-primary text-[24px]">shopping_bag</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-headline-lg text-sm text-primary truncate leading-snug">{product.name}</p>
        <p className="text-[11px] text-on-surface-variant font-body-md mt-0.5">{product.category} · {product.color}</p>
        <p className="text-xs font-semibold text-primary mt-1">{fmt(product.price)}</p>
      </div>
      <Link
        to={product.id ? `/products/${product.id}` : '/products'}
        className="text-[10px] font-semibold font-label-caps tracking-widest uppercase border-b border-primary text-primary pb-0.5 hover:opacity-70 transition-opacity"
      >
        Xem
      </Link>
    </div>
  );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen]         = useState(false);
  const [step, setStep]             = useState(0);
  const [selections, setSelections] = useState({});
  const [messages, setMessages]     = useState([{ from: 'bot', text: STEPS[0].question }]);
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [showTeaser, setShowTeaser] = useState(true);
  const bottomRef                   = useRef(null);

  const teaserTimeoutRef            = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, results, loading]);

  useEffect(() => {
    return () => {
      if (teaserTimeoutRef.current) {
        clearTimeout(teaserTimeoutRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    if (teaserTimeoutRef.current) {
      clearTimeout(teaserTimeoutRef.current);
    }
    setIsOpen(prev => {
      const nextOpen = !prev;
      if (nextOpen) {
        setShowTeaser(false);
      } else {
        teaserTimeoutRef.current = setTimeout(() => {
          setIsOpen(currentOpen => {
            if (!currentOpen) {
              setShowTeaser(true);
            }
            return currentOpen;
          });
        }, 3000);
      }
      return nextOpen;
    });
  };

  const handleClose = () => {
    if (teaserTimeoutRef.current) {
      clearTimeout(teaserTimeoutRef.current);
    }
    setIsOpen(false);
    teaserTimeoutRef.current = setTimeout(() => {
      setIsOpen(currentOpen => {
        if (!currentOpen) {
          setShowTeaser(true);
        }
        return currentOpen;
      });
    }, 3000);
  };

  const handleSelect = async (opt) => {
    const key          = STEPS[step].key;
    const extra        = opt.price_min !== undefined ? { price_min: opt.price_min, price_max: opt.price_max } : {};
    const newSelections = { ...selections, [key]: opt.value, ...extra };
    const newMessages   = [...messages, { from: 'user', text: opt.label }];

    if (step < STEPS.length - 1) {
      setMessages([...newMessages, { from: 'bot', text: STEPS[step + 1].question }]);
      setSelections(newSelections);
      setStep(step + 1);
      return;
    }

    setMessages([...newMessages, { from: 'bot', text: '⏳ Đang tìm túi phù hợp...' }]);
    setSelections(newSelections);
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(`${API_BASE}/api/recommend`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(newSelections),
      });
      const data = await res.json();
      if (data.recommendations?.length) {
        setResults(data.recommendations);
      } else {
        setError('Không tìm được sản phẩm phù hợp. Thử lại nhé!');
      }
    } catch {
      setError('Không thể kết nối dịch vụ tư vấn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setSelections({});
    setResults(null);
    setError(null);
    setLoading(false);
    setMessages([{ from: 'bot', text: STEPS[0].question }]);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE_INJECT }} />

      {/* Teaser Dialog / Tooltip */}
      {showTeaser && !isOpen && (
        <div 
          className="fixed bottom-[32px] right-[92px] z-50 bg-white border border-outline-variant/30 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] max-w-[240px] animate-chat-bubble flex gap-2.5"
        >
          {/* Arrow pointing right */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-t border-r border-outline-variant/30 rotate-45"></div>
          
          <div className="flex-1 min-w-0 z-10">
            <p className="text-secondary font-semibold text-[10px] font-label-caps tracking-widest uppercase">Trợ lý ảo</p>
            <p className="text-primary/80 text-xs font-body-md mt-1 leading-normal">
              Bạn đang phân vân? Hãy để AI hỗ trợ chọn túi phù hợp nhé!
            </p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (teaserTimeoutRef.current) {
                clearTimeout(teaserTimeoutRef.current);
              }
              setShowTeaser(false);
            }}
            className="text-on-surface-variant/60 hover:text-primary transition-colors flex-shrink-0 z-10 self-start"
            aria-label="Đóng gợi ý"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 bg-primary text-white"
        aria-label="Mở tư vấn chọn túi"
      >
        <span className="material-symbols-outlined text-[24px]">
          {isOpen ? 'close' : 'chat'}
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[370px] h-[550px] max-h-[75vh] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden border border-outline-variant/30 animate-chat-bubble bg-surface"
        >
          {/* Header - Royal Blue background */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 bg-secondary border-b border-outline-variant/10 shadow-sm">
            <div className="flex flex-col">
              <span className="text-white font-headline-lg text-lg tracking-wide">
                Tư vấn chọn túi
              </span>
              <span className="text-[10px] text-white/85 font-label-caps tracking-widest uppercase mt-0.5">
                Loom Assistant
              </span>
            </div>
            <button 
              onClick={handleClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-surface no-scrollbar">
            {messages.map((msg, i) =>
              msg.from === 'bot'
                ? <BotBubble key={i} text={msg.text} />
                : <UserBubble key={i} text={msg.text} />
            )}

            {!loading && !results && !error && (
              <div className="flex flex-wrap gap-2 pt-2 justify-start animate-chat-bubble">
                {STEPS[step].options.map(opt => (
                  <OptionButton key={opt.label} label={opt.label} onClick={() => handleSelect(opt)} />
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start py-2 animate-chat-bubble">
                <div className="flex gap-1 items-center py-2">
                  <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-error text-xs font-semibold text-center bg-error-container/20 border border-error/15 rounded-xl py-2 px-3 animate-chat-bubble mx-auto max-w-[90%]">
                {error}
              </div>
            )}

            {results && (
              <div className="space-y-4 pt-2 animate-chat-bubble">
                <BotBubble text={`Đây là gợi ý các mẫu túi lý tưởng nhất cho bạn:`} />
                <div className="space-y-2 mt-2">
                  {results.map((p, i) => <ProductCard key={i} product={p} />)}
                </div>
                <div>
                  <button
                    onClick={handleReset}
                    className="w-full mt-2 py-2.5 rounded-full text-xs font-semibold font-label-caps tracking-widest uppercase border border-primary text-primary bg-white hover:bg-primary hover:text-white active:scale-95 transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    Tư vấn lại
                  </button>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

