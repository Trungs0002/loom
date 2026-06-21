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

const NAVY = '#000b34';
const BLUE = '#3d57b6';

const BotBubble = ({ text }) => (
  <div className="flex justify-start">
    <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm bg-white border border-gray-100 shadow-sm"
         style={{ color: NAVY }}>
      {text}
    </div>
  </div>
);

const UserBubble = ({ text }) => (
  <div className="flex justify-end">
    <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-br-sm text-sm text-white"
         style={{ backgroundColor: NAVY }}>
      {text}
    </div>
  </div>
);

const OptionButton = ({ label, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150"
      style={{
        borderColor: BLUE,
        backgroundColor: hovered ? BLUE : 'transparent',
        color: hovered ? '#fff' : BLUE,
      }}
    >
      {label}
    </button>
  );
};

const ProductCard = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  const fmt = (p) => p.toLocaleString('vi-VN') + ' ₫';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 items-center shadow-sm">
      {!imgError && product.image && product.image !== '/placeholder-bag.png' ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-100"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
             style={{ backgroundColor: '#f0f2f8' }}>
          <span className="text-2xl">👜</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{product.category} · {product.color}</p>
        <p className="text-xs font-bold mt-1" style={{ color: NAVY }}>{fmt(product.price)}</p>
      </div>
      <Link
        to={product.id ? `/products/${product.id}` : '/products'}
        className="text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0 font-medium transition-opacity hover:opacity-80"
        style={{ backgroundColor: NAVY, color: '#fff' }}
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
  const bottomRef                   = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, results, loading]);

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
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 hover:scale-110"
        style={{ backgroundColor: NAVY }}
        aria-label="Mở tư vấn chọn túi"
      >
        {isOpen ? <XIcon /> : <ChatIcon />}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '540px', backgroundColor: '#fff' }}
        >
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
               style={{ backgroundColor: NAVY }}>
            <span className="text-white font-bold text-base tracking-wide"
                  style={{ fontFamily: '"Playfair Display", serif' }}>
              Tư vấn chọn túi 👜
            </span>
            <button onClick={() => setIsOpen(false)}
                    className="text-white opacity-60 hover:opacity-100 transition-opacity">
              <XIcon size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
               style={{ backgroundColor: '#f4f6fb' }}>
            {messages.map((msg, i) =>
              msg.from === 'bot'
                ? <BotBubble key={i} text={msg.text} />
                : <UserBubble key={i} text={msg.text} />
            )}

            {!loading && !results && !error && (
              <div className="flex flex-wrap gap-2 pt-1">
                {STEPS[step].options.map(opt => (
                  <OptionButton key={opt.label} label={opt.label} onClick={() => handleSelect(opt)} />
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-3">
                <div className="w-6 h-6 rounded-full border-2 animate-spin"
                     style={{ borderColor: `${BLUE} transparent transparent transparent` }} />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-xs text-center py-2">{error}</div>
            )}

            {results && (
              <div className="space-y-2 pt-1">
                <BotBubble text={`Đây là ${results.length} gợi ý cho bạn 🎉`} />
                {results.map((p, i) => <ProductCard key={i} product={p} />)}
                <button
                  onClick={handleReset}
                  className="w-full mt-1 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: NAVY, color: NAVY }}
                >
                  Tư vấn lại
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </>
  );
};

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const XIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default ChatWidget;
