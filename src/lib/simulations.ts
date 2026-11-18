// Pure deterministic simulation engines derived directly from sifr-salahy's public repositories.

export type ChurnContract = 'month-to-month' | 'one-year' | 'two-year';

export interface ChurnInput {
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  contract: ChurnContract;
}

export interface ChurnContribution {
  label: string;
  delta: number;
}

export interface ChurnPrediction {
  probability: number;
  percent: number;
  riskTier: 'HIGH' | 'MEDIUM' | 'LOW';
  logit: number;
  contributions: ChurnContribution[];
}

// Exact weights from sifr-salahy/churn_analytics_engine/model_weights.json
export const CHURN_MODEL_WEIGHTS = {
  intercept: -0.85,
  tenure: -0.045,
  monthlyCharges: 0.018,
  totalCharges: -0.00015,
  contract_month_to_month: 1.45,
  contract_one_year: 0.05,
  contract_two_year: -1.25,
} as const;

// Exact inference logic & thresholds from src/inference.py and api/churn.py
export function predictChurn(input: ChurnInput): ChurnPrediction {
  const contractWeight =
    input.contract === 'month-to-month'
      ? CHURN_MODEL_WEIGHTS.contract_month_to_month
      : input.contract === 'one-year'
        ? CHURN_MODEL_WEIGHTS.contract_one_year
        : CHURN_MODEL_WEIGHTS.contract_two_year;

  const tenureDelta = CHURN_MODEL_WEIGHTS.tenure * input.tenure;
  const monthlyDelta = CHURN_MODEL_WEIGHTS.monthlyCharges * input.monthlyCharges;
  const totalDelta = CHURN_MODEL_WEIGHTS.totalCharges * input.totalCharges;

  const logit =
    CHURN_MODEL_WEIGHTS.intercept +
    tenureDelta +
    monthlyDelta +
    totalDelta +
    contractWeight;

  const probability = 1.0 / (1.0 + Math.exp(-logit));
  const percent = Math.round(probability * 1000) / 10;
  let riskTier: ChurnPrediction['riskTier'] = 'LOW';
  if (probability > 0.65) {
    riskTier = 'HIGH';
  } else if (probability > 0.35) {
    riskTier = 'MEDIUM';
  }

  return {
    probability,
    percent,
    riskTier,
    logit,
    contributions: [
      { label: 'intercept', delta: CHURN_MODEL_WEIGHTS.intercept },
      { label: 'tenure', delta: tenureDelta },
      { label: 'monthlyCharges', delta: monthlyDelta },
      { label: 'totalCharges', delta: totalDelta },
      { label: `contract_${input.contract}`, delta: contractWeight },
    ],
  };
}

// Malloc Free-List Allocator Simulator mirroring sifr-salahy/malloc_allocator/src/malloc.h & malloc.c
// typedef struct header_t { size_t size; unsigned int is_free; struct header_t *next; } header_t; -> 24 bytes on x86_64
export const MALLOC_HEADER_SIZE = 24;

export interface HeapBlock {
  id: number;
  headerOffset: number;
  payloadOffset: number;
  size: number; // payload size in bytes
  free: boolean;
  zeroed?: boolean;
  label?: string;
}

export interface HeapState {
  brkOffset: number;
  nextId: number;
  blocks: HeapBlock[];
  lastOp: string;
}

export function createHeap(initialPayloadBytes = 0): HeapState {
  if (initialPayloadBytes <= 0) {
    return {
      brkOffset: 0,
      nextId: 1,
      blocks: [],
      lastOp: 'heap initialized (head = NULL, tail = NULL, brk = 0x1000)',
    };
  }
  return {
    brkOffset: MALLOC_HEADER_SIZE + initialPayloadBytes,
    nextId: 2,
    blocks: [
      {
        id: 1,
        headerOffset: 0,
        payloadOffset: MALLOC_HEADER_SIZE,
        size: initialPayloadBytes,
        free: true,
      },
    ],
    lastOp: `sbrk(${MALLOC_HEADER_SIZE + initialPayloadBytes}) -> header 0x1000`,
  };
}

function fmtAddr(offset: number): string {
  return `0x${(0x1000 + offset).toString(16).padStart(4, '0')}`;
}

export function mallocBlock(
  heap: HeapState,
  requestedBytes: number,
  label?: string,
  zeroed = false
): HeapState {
  if (requestedBytes <= 0) {
    return { ...heap, lastOp: 'my_malloc(0) -> NULL' };
  }

  // Exact get_free_block(size) first-fit traversal from src/malloc.c
  const freeIdx = heap.blocks.findIndex((b) => b.free && b.size >= requestedBytes);
  if (freeIdx !== -1) {
    const target = heap.blocks[freeIdx];
    const nextBlocks = heap.blocks.map((b, idx) =>
      idx === freeIdx
        ? {
            ...b,
            free: false,
            zeroed,
            label: label ?? `ptr_${heap.nextId}`,
          }
        : b
    );
    return {
      ...heap,
      nextId: heap.nextId + 1,
      blocks: nextBlocks,
      lastOp: `reused free block header@${fmtAddr(target.headerOffset)} (size=${target.size}B) -> payload ${fmtAddr(target.payloadOffset)}`,
    };
  }

  // sbrk(sizeof(header_t) + size)
  const totalSize = MALLOC_HEADER_SIZE + requestedBytes;
  const headerOffset = heap.brkOffset;
  const payloadOffset = headerOffset + MALLOC_HEADER_SIZE;
  const allocId = heap.nextId;

  const newBlock: HeapBlock = {
    id: allocId,
    headerOffset,
    payloadOffset,
    size: requestedBytes,
    free: false,
    zeroed,
    label: label ?? `ptr_${allocId}`,
  };

  return {
    brkOffset: heap.brkOffset + totalSize,
    nextId: allocId + 1,
    blocks: [...heap.blocks, newBlock],
    lastOp: `sbrk(${MALLOC_HEADER_SIZE}B header + ${requestedBytes}B = ${totalSize}B) -> payload ${fmtAddr(payloadOffset)}`,
  };
}

export function callocBlock(heap: HeapState, count: number, size: number, label?: string): HeapState {
  const total = count * size;
  const next = mallocBlock(heap, total, label ?? `cal_${heap.nextId}`, true);
  return {
    ...next,
    lastOp: `my_calloc(${count}, ${size}) -> memset(${total}B, 0)`,
  };
}

export function reallocBlock(heap: HeapState, blockId: number, newSize: number): HeapState {
  const blk = heap.blocks.find((b) => b.id === blockId && !b.free);
  if (!blk) return heap;
  if (newSize <= 0) return freeBlock(heap, blockId);
  if (blk.size >= newSize) {
    return {
      ...heap,
      lastOp: `my_realloc(${fmtAddr(blk.payloadOffset)}, ${newSize}) -> in-place (${blk.size}B >= ${newSize}B)`,
    };
  }
  const afterAlloc = mallocBlock(heap, newSize, blk.label ?? `re_${blockId}`);
  const afterFree = freeBlock(afterAlloc, blockId);
  return {
    ...afterFree,
    lastOp: `my_realloc(${fmtAddr(blk.payloadOffset)}, ${newSize}) -> memcpy(${blk.size}B) + my_free(old)`,
  };
}

export function freeBlock(heap: HeapState, blockId: number): HeapState {
  const idx = heap.blocks.findIndex((b) => b.id === blockId && !b.free);
  if (idx === -1) return heap;

  const freed = heap.blocks[idx];
  const marked = heap.blocks.map((b, i) =>
    i === idx ? { ...b, free: true, label: undefined, zeroed: false } : { ...b }
  );

  // Exact single-pass adjacent coalescing from src/malloc.c:
  // if (curr->is_free && curr->next->is_free) { curr->size += sizeof(header_t) + curr->next->size; curr->next = curr->next->next; }
  const coalesced: HeapBlock[] = [];
  let coalescedHeaders = 0;
  for (let i = 0; i < marked.length; i++) {
    const curr = marked[i];
    const prev = coalesced[coalesced.length - 1];
    if (prev && prev.free && curr.free) {
      prev.size += MALLOC_HEADER_SIZE + curr.size;
      coalescedHeaders++;
    } else {
      coalesced.push(curr);
    }
  }

  return {
    ...heap,
    blocks: coalesced,
    lastOp:
      coalescedHeaders > 0
        ? `my_free(${fmtAddr(freed.payloadOffset)}) -> coalesced +${coalescedHeaders} header_t (${MALLOC_HEADER_SIZE}B each)`
        : `my_free(${fmtAddr(freed.payloadOffset)}) -> marked FREE (${freed.size}B)`,
  };
}

// Mirrors print_heap() from src/malloc.c
export function formatHeapDump(heap: HeapState): string[] {
  if (heap.blocks.length === 0) return ['(empty heap: head == NULL)'];
  return heap.blocks.map(
    (b) =>
      `[${b.free ? 'FREE' : 'USED'}] size=${b.size} bytes | addr=${fmtAddr(b.headerOffset)}${
        b.label ? ` (${b.label})` : ''
      }`
  );
}

// Redis Clone Command Evaluator mirroring sifr-salahy/redis_clone (main.go + internal/store.go + api/redis/index.go)
export function executeRedisCommand(
  store: Record<string, string>,
  rawInput: string
): { nextStore: Record<string, string>; output: string; isError: boolean } {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { nextStore: store, output: '', isError: false };
  }

  const tokens = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  const cmd = (tokens[0] ?? '').toUpperCase();
  const stripQuotes = (s: string) =>
    s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;

  if (cmd === 'PING') {
    const arg = tokens[1] ? stripQuotes(tokens[1]) : 'PONG';
    return { nextStore: store, output: arg, isError: false };
  }

  if (cmd === 'SET') {
    if (tokens.length < 3) {
      return {
        nextStore: store,
        output: "(error) ERR wrong number of arguments for 'set' command",
        isError: true,
      };
    }
    const key = stripQuotes(tokens[1]);
    const val = stripQuotes(tokens.slice(2).join(' '));
    return {
      nextStore: { ...store, [key]: val },
      output: 'OK',
      isError: false,
    };
  }

  if (cmd === 'GET') {
    if (tokens.length !== 2) {
      return {
        nextStore: store,
        output: "(error) ERR wrong number of arguments for 'get' command",
        isError: true,
      };
    }
    const key = stripQuotes(tokens[1]);
    if (Object.prototype.hasOwnProperty.call(store, key)) {
      return { nextStore: store, output: `"${store[key]}"`, isError: false };
    }
    return { nextStore: store, output: '(nil)', isError: false };
  }

  if (cmd === 'DEL') {
    if (tokens.length !== 2) {
      return {
        nextStore: store,
        output: "(error) ERR wrong number of arguments for 'del' command",
        isError: true,
      };
    }
    const next = { ...store };
    const k = stripQuotes(tokens[1]);
    delete next[k];
    // Matches main.go fmt.Println("OK")
    return { nextStore: next, output: 'OK', isError: false };
  }

  if (cmd === 'KEYS') {
    const keys = Object.keys(store);
    if (keys.length === 0) {
      return { nextStore: store, output: '(empty array)', isError: false };
    }
    return {
      nextStore: store,
      output: keys.map((k, i) => `${i + 1}) "${k}"`).join('\n'),
      isError: false,
    };
  }

  if (cmd === 'DBSIZE') {
    return {
      nextStore: store,
      output: `(integer) ${Object.keys(store).length}`,
      isError: false,
    };
  }

  if (cmd === 'FLUSH') {
    return { nextStore: {}, output: 'OK', isError: false };
  }

  return {
    nextStore: store,
    output: `(error) ERR unknown command '${tokens[0]}'`,
    isError: true,
  };
}

// Verrev Capability Token, Deterministic Identity & Kademlia XOR helpers (verrev-p2p + verrev-capability + verrev-identity)
export function computeXorDistanceHex(hexA: string, hexB: string): { distanceHex: string; leadingZeroBits: number } {
  const cleanA = hexA.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '').padStart(8, '0').slice(-8);
  const cleanB = hexB.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '').padStart(8, '0').slice(-8);
  const a = parseInt(cleanA, 16) >>> 0;
  const b = parseInt(cleanB, 16) >>> 0;
  const xor = (a ^ b) >>> 0;
  const leadingZeroBits = xor === 0 ? 32 : Math.clz32(xor);
  return {
    distanceHex: `0x${xor.toString(16).padStart(8, '0')}`,
    leadingZeroBits,
  };
}

export type CapabilityRight = 'READ' | 'WRITE' | 'EXEC' | 'DELEGATE';

export function evaluateCapabilityCheck(
  grantedRights: CapabilityRight[],
  requestedRight: CapabilityRight,
  revoked: boolean
): { allowed: boolean; reason: string } {
  if (revoked) {
    return { allowed: false, reason: 'CapabilityError::Revoked (token invalidated by parent)' };
  }
  if (!grantedRights.includes(requestedRight)) {
    return {
      allowed: false,
      reason: `CapabilityError::InsufficientRights (missing ${requestedRight})`,
    };
  }
  return {
    allowed: true,
    reason: `check_access(${requestedRight}) -> Ok(())`,
  };
}
