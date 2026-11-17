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
      aria-label="Direct Signal Dispatch"
      className={compact ? 'border border-[#2d3038] bg-[#0a0d13] p-4 space-y-4' : 'py-10 border-t border-[#2d3038] space-y-6'}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.06em] text-[#eab444]">
            Direct Channel · Zero Intermediaries
          </p>
          <h2 className={compact ? 'mt-1 text-xl font-bold text-[#f3f7fe]' : 'mt-1.5 text-2xl sm:text-3xl font-bold text-[#f3f7fe]'}>
            Transmit Signal
          </h2>
        </div>

        <button
          type="button"
          onClick={handleCopyEmail}
          className="min-h-[40px] px-3.5 py-2 border border-[#2d3038] bg-[#04060b] hover:border-[#eab444] font-mobilis text-xs font-semibold text-[#f3f7fe] inline-flex items-center gap-2 cursor-pointer"
        >
          {copiedEmail ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#40e080]" aria-hidden="true" />
              <span>Copied {SIFR_DIRECT_EMAIL}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
              <span className="truncate max-w-[230px] sm:max-w-none">{SIFR_DIRECT_EMAIL}</span>
            </>
          )}
        </button>
      </div>

      <div className={`border border-[#2d3038] bg-[#0a0d13] ${compact ? 'p-4' : 'p-6 sm:p-8'} chamfer`}>
        <form onSubmit={handleDispatch} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#a6acb9]">Sender / Organization</span>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Ada Lovelace · Systems Lab"
                className="w-full min-h-[42px] px-3.5 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-[14px] font-medium text-[#f3f7fe] placeholder:text-[#656b78] outline-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#a6acb9]">Return Address</span>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full min-h-[42px] px-3.5 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-[14px] font-medium text-[#f3f7fe] placeholder:text-[#656b78] outline-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#a6acb9]">Transmission Scope</span>
              <select
                value={topic}
                onChange={(e) => {
                  haptics.trigger('detent');
                  setTopic(e.target.value as SignalTopic);
                }}
                className="w-full min-h-[42px] px-3.5 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-[14px] font-medium text-[#f3f7fe] outline-none"
              >
                {SIGNAL_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#a6acb9]">Brief / Engineering Inquiry</span>
            <textarea
              rows={compact ? 3 : 4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Outline the system architecture, kernel, ML compute, or founding engineering brief..."
              className="w-full p-3.5 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-[14px] font-medium text-[#f3f7fe] placeholder:text-[#656b78] outline-none resize-y"
            />
          </label>

          {error && (
            <div role="alert" className="border border-[#fc5855] bg-[#04060b] px-3.5 py-2 font-mobilis text-xs font-semibold text-[#fc5855]">
              {error}
            </div>
          )}

          {receipt && (
            <div className="border border-[#eab444] bg-[#04060b] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-mobilis text-xs font-bold text-[#40e080] inline-flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                  {receipt.deliveredVia === 'client' ? 'SIGNAL PACKAGED' : 'SIGNAL DELIVERED'} · {receipt.id} · {receipt.timestamp}
                </div>
                <p className="text-xs font-medium text-[#e4e8f1]">
                  {receipt.deliveredVia === 'resend'
                    ? 'Delivered directly to Mohamed Salahi\'s inbox via Resend. A local mail envelope is also attached.'
                    : receipt.deliveredVia === 'ledger'
                    ? 'Recorded in the server dispatch ledger. Click Open Mail Client to send immediately via your mail app.'
                    : 'Launch your local mail transport with the pre-formatted SIFR envelope, or copy the direct email above.'}
                </p>
              </div>
              <a
                href={receipt.mailto}
                onClick={() => haptics.trigger('confirm')}
                className="min-h-[38px] px-4 py-2 bg-[#eab444] text-[#04060b] text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                Open Mail Client <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="font-mobilis text-xs font-medium text-[#a6acb9]">
              Direct route to Mohamed Salahi (@mohamedsalahi)
            </span>
            <button
              type="submit"
              disabled={sending}
              className="min-h-[44px] px-6 py-2.5 bg-[#eab444] hover:bg-[#f2c15c] disabled:opacity-60 text-[#04060b] text-[14px] font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer chamfer-sm"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{sending ? 'Transmitting Signal...' : 'Transmit Signal'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
