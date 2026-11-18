import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Send, Terminal } from 'lucide-react';
import {
  SIGNAL_TOPICS,
  SIFR_DIRECT_EMAIL,
  buildSignalMailto,
  generateDispatchReceiptId,
  validateSignalPayload,
  type SignalTopic,
} from '../lib/signal';
import { haptics } from '../lib/haptics';

interface SignalDispatchSectionProps {
  compact?: boolean;
}

export function SignalDispatchSection({ compact = false }: SignalDispatchSectionProps) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [topic, setTopic] = useState<SignalTopic>(SIGNAL_TOPICS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<{
    id: string;
    mailto: string;
    timestamp: string;
    deliveredVia?: 'resend' | 'ledger' | 'client';
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    haptics.trigger('confirm');
    try {
      await navigator.clipboard.writeText(SIFR_DIRECT_EMAIL);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { senderName, senderEmail, topic, message };
    const check = validateSignalPayload(payload);
    if (!check.valid) {
      haptics.trigger('garble');
      setError(check.error ?? 'Invalid dispatch parameters.');
      return;
    }

    setError(null);
    setSending(true);
    const mailto = buildSignalMailto(payload);

    try {
      const res = await fetch('/api/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        id?: string;
        timestamp?: string;
        deliveredVia?: 'resend' | 'ledger';
        error?: string;
      };

      if (!res.ok || !json.ok || !json.id) {
        haptics.trigger('garble');
        setError(json.error ?? 'Signal rejected by dispatch gateway.');
        setSending(false);
        return;
      }

      haptics.trigger('snapZero');
      setReceipt({
        id: json.id,
        mailto,
        timestamp: json.timestamp ?? new Date().toISOString().slice(11, 19) + ' UTC',
        deliveredVia: json.deliveredVia ?? 'ledger',
      });
    } catch {
      const id = generateDispatchReceiptId(payload);
      haptics.trigger('snapZero');
      setReceipt({
        id,
        mailto,
        timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
        deliveredVia: 'client',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="dispatch"
      aria-label="Send a message"
      className={compact ? 'border border-[#2d3038] bg-[#0a0d13] p-4 sm:p-5 space-y-4' : 'py-10 border-t border-[#2d3038] space-y-6'}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mobilis text-xs text-[#eab444]">Direct email</p>
          <h3 className={compact ? 'mt-0.5 text-lg font-bold text-[#f3f7fe]' : 'mt-1 text-2xl font-bold text-[#f3f7fe]'}>
            Get in touch
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopyEmail}
          className="min-h-[38px] px-3 py-1.5 border border-[#2d3038] bg-[#04060b] hover:border-[#eab444] font-mobilis text-xs text-[#f3f7fe] inline-flex items-center gap-2 cursor-pointer"
        >
          {copiedEmail ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#40e080]" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
              <span className="truncate max-w-[210px] sm:max-w-none">{SIFR_DIRECT_EMAIL}</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleDispatch} className="space-y-3" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-[#a6acb9]">Name</span>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name"
              className="w-full min-h-[40px] px-3 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-sm text-[#f3f7fe] placeholder:text-[#656b78] outline-none"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-[#a6acb9]">Email</span>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full min-h-[40px] px-3 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-sm text-[#f3f7fe] placeholder:text-[#656b78] outline-none"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-[#a6acb9]">Topic</span>
            <select
              value={topic}
              onChange={(e) => {
                haptics.trigger('detent');
                setTopic(e.target.value as SignalTopic);
              }}
              className="w-full min-h-[40px] px-3 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-sm text-[#f3f7fe] outline-none"
            >
              {SIGNAL_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs text-[#a6acb9]">Message</span>
          <textarea
            rows={compact ? 2 : 4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a short note..."
            className="w-full p-3 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-sm text-[#f3f7fe] placeholder:text-[#656b78] outline-none resize-y"
          />
        </label>

        {error && (
          <div role="alert" className="border border-[#fc5855] bg-[#04060b] px-3 py-2 font-mobilis text-xs text-[#fc5855]">
            {error}
          </div>
        )}

        {receipt && (
          <div className="border border-[#eab444] bg-[#04060b] p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-mobilis text-xs font-bold text-[#40e080] inline-flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                {receipt.deliveredVia === 'client' ? 'READY' : 'SENT'} · {receipt.id} · {receipt.timestamp}
              </div>
              <p className="text-xs text-[#e4e8f1]">
                {receipt.deliveredVia === 'resend'
                  ? 'Delivered to Mohamed Salahi via Resend.'
                  : receipt.deliveredVia === 'ledger'
                    ? 'Recorded on the server. You can also send via your email client.'
                    : 'Open your email client below or copy the address above.'}
              </p>
            </div>
            <a
              href={receipt.mailto}
              onClick={() => haptics.trigger('confirm')}
              className="min-h-[36px] px-3.5 py-1.5 bg-[#eab444] text-[#04060b] text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              Open Mail <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={sending}
            className="min-h-[40px] px-5 py-2 bg-[#eab444] hover:bg-[#f2c15c] disabled:opacity-60 text-[#04060b] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{sending ? 'Sending...' : 'Send message'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
