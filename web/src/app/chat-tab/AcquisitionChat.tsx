"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AttachmentCard } from "../chat/components/AttachmentCard";
import { ComposerAttachments } from "../chat/components/ComposerAttachments";
import { copyReplyText } from "../chat/reply-actions";
import type { LocalAttachment } from "../chat/types";
import { ReviewChat, type ReviewControls } from "../review/ReviewChat";
import { AcquisitionChatComposer } from "./ChatTabComposer";
import { Bubble, chatTabThemeStyle } from "./ConversationBubble";
import { ChatTabScrollBottom } from "./ChatTabScrollBottom";
import { useChatTabScroll } from "./use-chat-tab-scroll";
import chatStyles from "./chat-tab.module.scss";
import { acquisitionQuestion } from "./acquisition-question";
import { getAcquisitionScenario } from "./acquisition-scenarios";
import { advanceDemo, advanceDemoInBackground, advanceDemoReauthorization, initialDemoState, mockQuota, type DeliveredCustomer } from "./acquisition-demo";
import styles from "./AcquisitionChat.module.scss";

const acquisitionTheme = {
  ...chatTabThemeStyle,
  "--chat-user-message-background": "#cbe2fc",
  "--chat-assistant-message-background": "#eeeef0",
};

const openingMessage = "你好，我是 Soker，专门帮你找客户。跟我说说你做什么业务、想找哪类客户，我去看看谁最近在问价、比方案，值得你跟进。";

const menuIcons = {
  history: <><circle cx="9" cy="8" r="2.75" /><path d="M3.5 19v-1.5a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4V19M15.5 5.5a2.75 2.75 0 0 1 0 5.4M17.5 13.7a4 4 0 0 1 3 3.8V19" /></>,
  account: <><circle cx="12" cy="7.5" r="3" /><path d="M5.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1" /></>,
  notifications: <><path d="M18 8a6 6 0 0 0-12 0c0 5-1.5 6.5-2 8h16c-.5-1.5-2-3-2-8Z" /><path d="M10 20h4" /></>,
  billing: <><path d="M6 4h12v16l-3-1.6-3 1.6-3-1.6L6 20V4ZM9 8h6M9 11.5h6M9 15h4" /></>,
  business: <><path d="M12 5H6a2 2 0 0 0-2 2v12h6a2 2 0 0 1 2 1 2 2 0 0 1 2-1h6V7a2 2 0 0 0-2-2h-6Zm0 0v15M7 9h2m-2 4h2m6-4h2m-2 4h2" /></>,
  douyin: <><path d="M12 15V4c1 3 2.8 4.4 5.5 4.8" /><ellipse cx="8.5" cy="16" rx="3.5" ry="3" /></>,
  wechat: <><path d="M13.5 15.4c-.8.4-1.8.6-2.8.6-.7 0-1.4-.1-2-.3L6 17l.7-2.3A5.1 5.1 0 0 1 4 10.5C4 7.5 7 5 10.7 5s6.7 2.5 6.7 5.5v.2" /><path d="M20 17.5c.6-.6 1-1.4 1-2.3 0-2.3-2.2-4-5-4s-5 1.7-5 4 2.2 4 5 4c.5 0 1-.1 1.4-.2l2.5 1.2-.6-1.9.7-.8Z" /><path d="M8.2 10h.1m4.5 0h.1m1.4 5h.1m3.1 0h.1" strokeWidth="2.2" /></>,
};

function AccountMenuItem({ item, label, onSelect }: {
  item: keyof typeof menuIcons;
  label: string;
  onSelect: () => void;
}) {
  return <button type="button" className={styles.menuItem} onClick={onSelect}>
    <span className={styles.menuIconTile} data-icon={item} aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
        {menuIcons[item]}
      </svg>
    </span>
    <span>{label}</span>
  </button>;
}

const examples = [
  { label: "找最近准备装修的业主", brief: "我是做家装销售的，平时客户大多是熟人介绍，最近想多找几个准备装修的业主。" },
  { label: "找深圳正在咨询公司注销的人", brief: "我在深圳做企业财税服务，想找近期正在咨询公司注销代办的人" },
  { label: "找准备翻新厨房和卫生间的业主", brief: "我在上海做厨卫翻新，想找近期准备做局部改造的业主" },
];

const stages = [
  "整理客户画像和查找方向",
  "查找相关公开作品和直播",
  "核对原话、发布时间和服务范围",
  "排除重复及需求不明确的人",
];

const accountQuestion = "这个抖音号是用来参考受众，还是要去它的评论里找人？";
const optionalQuestion = "有店铺资料或想参考的抖音号，可以随时发给我。";
const hasAccount = /(?:抖音号[：:\s]*|@)[a-z0-9_.\-]+|douyin\.com\/[^\s]+|(?:这个|该|这几个|指定)账号/i;
const hasPurpose = /参考|对标|去.{0,25}(?:下面|评论|直播|找)|只.{0,12}(?:找|看)|(?:评论|直播).{0,10}找/;

type Turn = {
  id: number;
  text: string;
  stage: number;
  paused: boolean;
  replaced?: boolean;
  retried?: boolean;
  thinkingUntil?: number;
  question?: string;
  answered?: boolean;
  consultation?: boolean;
};
type Entry = { id: number; text: string; attachments?: LocalAttachment[]; reply?: string } | Turn;

type DemoMessage = ReturnType<typeof advanceDemo> & { text?: string; attachments?: LocalAttachment[] };

const maxAttachmentBytes = 10 * 1024 * 1024;
const maxAttachmentTotalBytes = 40 * 1024 * 1024;
const maxAttachmentCount = 10;
const attachmentAccept = "image/*,.pdf,.doc,.docx,.pages,.rtf,.txt,.md,.xls,.xlsx,.numbers,.csv,.ppt,.pptx,.key";
const attachmentsReceived = "收到附件了。你可以跟我说说，哪些信息想让我重点参考。";

function nativeAttachmentFiles(records: unknown): File[] {
  if (!Array.isArray(records)) return [];
  return records.slice(0, maxAttachmentCount).map(record => {
    if (!record || typeof record.name !== "string" || !record.name.trim() || typeof record.base64 !== "string"
      || record.base64.length > Math.ceil(maxAttachmentBytes / 3) * 4) {
      throw new Error("Invalid attachment payload");
    }
    const data = atob(record.base64);
    return new File([Uint8Array.from(data, character => character.charCodeAt(0))], record.name, {
      type: typeof record.type === "string" ? record.type : "",
    });
  });
}

function SentAttachments({ attachments }: { attachments: LocalAttachment[] }) {
  return <div className={styles.sentAttachments} role="group" aria-label="消息附件">
    {attachments.map(attachment => <AttachmentCard key={attachment.id} attachment={attachment} />)}
  </div>;
}

function buildDemoConversation(): DemoMessage[] {
  const turns: DemoMessage[] = [];
  let state = { ...initialDemoState, quota: mockQuota + 1 };
  const append = (turn: ReturnType<typeof advanceDemo> | null, text?: string) => {
    if (!turn) return;
    turns.push({ ...turn, text });
    state = turn.state;
  };
  const send = (text: string) => append(advanceDemo(state, text), text);

  send(examples[0].brief);
  append(advanceDemoInBackground(state));
  send("就上海浦东，太远跑不过来。");
  send("手头没有客户的抖音主页。");
  send("手头暂时没有服务介绍。");
  send("留电话还是微信还没想好。");
  append(advanceDemoInBackground(state));
  send("不太合适。");
  send("我主要跟毛坯新房的整装单，厨卫小修不接，预算至少20万。");
  send("没错，是的");
  send("浦东首次上门量房免费。");
  append(advanceDemoInBackground(state));
  send("浦东先不找了，改找上海闵行，预算还是至少20万。");
  append(advanceDemoInBackground(state));
  append(advanceDemoInBackground(state));
  append(advanceDemoInBackground(state));
  return turns;
}

function postDeliveryMessage(name: string, value: unknown) {
  (window as Window & {
    webkit?: { messageHandlers?: Record<string, { postMessage(value: unknown): void }> };
  }).webkit?.messageHandlers?.[name]?.postMessage(value);
}

function CustomerDeliveryCard({ customer, embedded, preview }: {
  customer: DeliveredCustomer;
  embedded: boolean;
  preview: boolean;

}) {
  const [copyStatus, setCopyStatus] = useState("");
  const contact = customer.contact.replace(/（(?:模拟，)?已同意联系）$/, "");
  const contactType = contact.match(/^(微信|手机号|电话)\s*·\s*/);
  const contactValue = contact.slice(contactType?.[0].length ?? 0).trim();

  async function copyContact() {
    try {
      await copyReplyText(contactValue);
      setCopyStatus("已复制");
    } catch {
      setCopyStatus("复制失败，重试");
    }
  }

  useEffect(() => {
    if (embedded && !preview) postDeliveryMessage("sokerAcquisitionDelivery", customer);
  }, [customer, embedded, preview]);

  return <section className={styles.customerDelivery} aria-label="客户卡片">
    <div className={styles.deliveryIdentity}>
      <img src={`/chat/customer-avatars/${customer.avatar || "ENTCustomerAvatar1"}.png`} width={40} height={40} alt="" />
      <h2>{customer.name}</h2>
    </div>
    <p>{customer.need}</p>
    {contactValue && <div className={styles.deliveryContact}>
      {contactType && <span>{contactType[1]}</span>}
      <strong>{contactValue}</strong>
      <button type="button" onClick={() => void copyContact()} aria-live="polite">{copyStatus || "复制"}</button>
    </div>}
    <dl className={styles.deliveryDetails}>
      <dt>来源</dt><dd>{customer.source}</dd>
    </dl>
  </section>;
}

function ProspectReview({ review, question }: {
  review: NonNullable<DemoMessage["review"]>;
  question: string;
}) {
  const { accounts, works, liveMessages, comments } = review.counts;
  const report = `截至目前，我查了 ${accounts} 个账号，看了 ${works} 条作品、${liveMessages} 条直播弹幕和 ${comments} 条作品评论。`;
  const finding = review.refined
    ? "我按你补充的条件重新筛了一遍，这位更符合你说的要求。"
    : "其中有一位意向比较明确，先给你看看。";

  return <div className={styles.prospectReview}>
    <Bubble text={report + finding} locale="zh" onOpenLink={() => {}} />
    <section className={`${styles.customerDelivery} ${styles.prospectCard}`} aria-label="待确认的潜客">
      <div className={styles.deliveryIdentity}>
        <img src={`/chat/customer-avatars/${review.avatar || "ENTCustomerAvatar1"}.png`} width={40} height={40} alt="" />
        <div>
          <h2>{review.name}</h2>
          <div className={styles.deliveryProgress}>高意向潜客 · 待确认</div>
        </div>
      </div>
      <div className={styles.prospectProfile}>
        <h3>潜客画像</h3>
        <p>{review.profile}</p>
      </div>
      <figure className={styles.prospectEvidence}>
        <h3>原话</h3>
        <blockquote>「{review.quote}」</blockquote>
        <figcaption>{review.source}</figcaption>
      </figure>
      <div>
        <h3>为什么值得跟进</h3>
        <p>{review.rationale}</p>
      </div>
    </section>
    {question && <Bubble text={question} locale="zh" onOpenLink={() => {}} />}
  </div>;
}

export function AcquisitionChat({ embedded = false, demo = true }: { embedded?: boolean; demo?: boolean }) {
  const [mode, setMode] = useState<"acquisition" | "review">(() =>
    demo && new URLSearchParams(window.location.search).get("mode") === "review" ? "review" : "acquisition");
  const reviewing = mode === "review";
  const [reviewVisited, setReviewVisited] = useState(reviewing);
  const reviewControls = useRef<ReviewControls>(null);
  const drafts = useRef<Partial<Record<typeof mode, { text: string; attachments: LocalAttachment[] }>>>({});
  const [serviceMessage, setServiceMessage] = useState(false);
  const [panel, setPanel] = useState<"history" | "business" | "call" | "menu" | "wechat" | null>(null);
  const [savedCustomers, setSavedCustomers] = useState<DeliveredCustomer[]>([]);
  const openingReviewFriends = useRef(false);
  const panelRef = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentTrayHeight, setAttachmentTrayHeight] = useState(0);
  const attachmentTrayRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<LocalAttachment[]>([]);
  const attachmentUrls = useRef(new Set<string>());
  const attachmentId = useRef(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [demoTurns, setDemoTurns] = useState<DemoMessage[]>([]);
  const [previewTurns] = useState(() => demo && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") !== "0" ? buildDemoConversation() : []);
  const [demoPhase, setDemoPhase] = useState(0);
  const demoState = useRef(initialDemoState);
  const demoPending = useRef(false);
  const [revision, setRevision] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const { content, state: scrollState, toBottom } = useChatTabScroll(mode, scroller);
  const sendRef = useRef<(text: string) => boolean | void>(() => {});
  const bridge = () => (window as Window & {
    webkit?: { messageHandlers?: Record<string, { postMessage: (value: unknown) => void }> };
  }).webkit?.messageHandlers;
  const handleReviewSheet = useCallback((open: boolean) => {
    if (embedded) bridge()?.sokerAccountMenu?.postMessage(open ? "open" : "close");
  }, [embedded]);

  useEffect(() => {
    if (!embedded) return;
    const submit = (event: Event) => {
      const text = (event as CustomEvent<unknown>).detail;
      if (typeof text === "string" && sendRef.current(text) === false) event.preventDefault();
    };
    const receiveHistory = (event: Event) => {
      const records = (event as CustomEvent<DeliveredCustomer[]>).detail;
      if (Array.isArray(records)) setSavedCustomers(records);
    };
    const receiveAttachments = (event: Event) => {
      try {
        stageAttachments(nativeAttachmentFiles((event as CustomEvent<unknown>).detail));
      } catch {
        setAttachmentError("附件读取失败，请重新选择。");
      }
    };
    const receiveAttachmentError = (event: Event) => {
      const message = (event as CustomEvent<unknown>).detail;
      if (typeof message === "string") setAttachmentError(message);
    };
    window.addEventListener("soker-acquisition-history", receiveHistory);
    window.addEventListener("soker-acquisition-submit", submit);
    window.addEventListener("soker-acquisition-attachments", receiveAttachments);
    window.addEventListener("soker-acquisition-attachment-error", receiveAttachmentError);
    bridge()?.sokerChatMode?.postMessage(mode);
    bridge()?.sokerAcquisitionReady?.postMessage(true);
    return () => {
      window.removeEventListener("soker-acquisition-submit", submit);
      window.removeEventListener("soker-acquisition-history", receiveHistory);
      window.removeEventListener("soker-acquisition-attachments", receiveAttachments);
      window.removeEventListener("soker-acquisition-attachment-error", receiveAttachmentError);
    };
  }, [embedded]);
  useEffect(() => {
    const urls = attachmentUrls.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);
  useEffect(() => {
    if (embedded) bridge()?.sokerAcquisitionAttachmentCount?.postMessage(attachments.length);
  }, [attachments.length, embedded]);
  useEffect(() => {
    const tray = attachmentTrayRef.current;
    if (!tray) return;
    const update = () => setAttachmentTrayHeight(tray.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(tray);
    return () => observer.disconnect();
  }, [embedded]);
  const nextId = useRef(0);
  const consultationShown = useRef(false);

  useEffect(() => {
    if (!entries.some(entry => "stage" in entry && !entry.paused && !entry.replaced && entry.stage >= 0 && entry.stage < stages.length)) return;
    const timer = window.setInterval(() => {
      setEntries(current => current.map(entry =>
        "stage" in entry && !entry.paused && !entry.replaced && entry.stage >= 0 && entry.stage < stages.length
          ? { ...entry, stage: entry.stage + 1 }
          : entry,
      ));
    }, 1150);
    return () => window.clearInterval(timer);
  }, [entries]);

  const nextThinkingDeadline = entries.flatMap(entry => "stage" in entry && entry.thinkingUntil !== undefined ? [entry.thinkingUntil] : [])[0];
  useEffect(() => {
    if (nextThinkingDeadline === undefined) return;
    const timer = window.setTimeout(() => {
      setEntries(current => current.map(entry => {
        if (!("thinkingUntil" in entry) || entry.thinkingUntil !== nextThinkingDeadline) return entry;
        const question = acquisitionQuestion(entry.text);
        const accountPending = !question && hasAccount.test(entry.text) && !hasPurpose.test(entry.text);
        return {
          ...entry,
          thinkingUntil: undefined,
          stage: question ? -1 : 0,
          question: question ?? (accountPending ? accountQuestion : undefined),
        };
      }));
    }, Math.max(0, nextThinkingDeadline - Date.now()));
    return () => window.clearTimeout(timer);
  }, [nextThinkingDeadline]);

  const firstSearchId = entries.find(entry => "stage" in entry && entry.stage >= 0)?.id;
  useEffect(() => {
    if (firstSearchId !== undefined) consultationShown.current = true;
  }, [firstSearchId]);

  function updateTurn(id: number, change: (turn: Turn) => Turn) {
    setEntries(current => current.map(entry => entry.id === id && "stage" in entry ? change(entry) : entry));
  }

  const lastDemoTurn = demoTurns.at(-1);
  const latestAuthorization = [...demoTurns].reverse().find(turn => turn.authorization);
  const demoBusy = !!lastDemoTurn && demoPhase < lastDemoTurn.activity.length;

  useEffect(() => {
    if (!lastDemoTurn || !demoBusy) {
      demoPending.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      if (demoPhase + 1 === lastDemoTurn.activity.length) demoPending.current = false;
      setDemoPhase(demoPhase + 1);
    }, 1050);
    return () => window.clearTimeout(timer);
  }, [demoBusy, demoPhase, lastDemoTurn]);

  useEffect(() => {
    if (!demo || demoBusy || !lastDemoTurn) return;
    const timer = window.setTimeout(() => {
      if (demoPending.current) return;
      const turn = advanceDemoInBackground(demoState.current);
      if (!turn) return;
      demoState.current = turn.state;
      demoPending.current = turn.activity.length > 0;
      setDemoPhase(0);
      setDemoTurns(turns => [...turns, turn]);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [demo, demoBusy, lastDemoTurn]);

  function reauthorize(action: Parameters<typeof advanceDemoReauthorization>[1]) {
    if (demoPending.current) return;
    const turn = advanceDemoReauthorization(demoState.current, action);
    if (!turn) return;
    demoState.current = turn.state;
    demoPending.current = turn.activity.length > 0;
    setDemoPhase(0);
    setDemoTurns(turns => [...turns, turn]);
    requestAnimationFrame(toBottom);
  }

  function replaceAttachments(next: LocalAttachment[]) {
    attachmentsRef.current = next;
    setAttachments(next);
  }

  function stageAttachments(files: File[]) {
    if (!files.length) return;
    const next = [...attachmentsRef.current];
    let size = next.reduce((sum, item) => sum + (item.file?.size ?? 0), 0);
    let error = "";
    for (const file of files) {
      if (file.size > maxAttachmentBytes) {
        error = "单个附件不能超过 10 MB。";
        continue;
      }
      if (next.length >= maxAttachmentCount || size + file.size > maxAttachmentTotalBytes) {
        error = "一条消息最多添加 10 个附件，合计不能超过 40 MB。";
        break;
      }
      const kind = file.type.startsWith("image/") ? "image" : "text";
      const previewUrl = kind === "image" ? URL.createObjectURL(file) : undefined;
      if (previewUrl) attachmentUrls.current.add(previewUrl);
      next.push({ id: String(++attachmentId.current), file, name: file.name, kind, previewUrl, uploadStatus: "success" });
      size += file.size;
    }
    replaceAttachments(next);
    setAttachmentError(error);
  }

  function removeAttachment(id: string) {
    const url = attachmentsRef.current.find(item => item.id === id)?.previewUrl;
    if (url) {
      URL.revokeObjectURL(url);
      attachmentUrls.current.delete(url);
    }
    replaceAttachments(attachmentsRef.current.filter(item => item.id !== id));
    setAttachmentError("");
  }

  function sendDemo(text: string, sentAttachments: LocalAttachment[] = []) {
    if (demoPending.current) {
      if (sentAttachments.length) setAttachmentError("Soker 正在处理上一条消息，稍后再发送附件。");
      return;
    }
    const turn = text ? advanceDemo(demoState.current, text) : {
      state: demoState.current,
      activity: [],
      reply: attachmentsReceived,
    };
    demoState.current = turn.state;
    demoPending.current = true;
    setDemoPhase(0);
    setDemoTurns(turns => [...turns, { ...turn, text, attachments: sentAttachments }]);
    replaceAttachments([]);
    setAttachmentError("");
    setValue("");
    requestAnimationFrame(toBottom);
  }

  function send(raw = value) {
    const text = raw.trim();
    if (reviewing) {
      const sent = reviewControls.current?.send(text) ?? false;
      if (sent) setValue("");
      return sent;
    }
    const sentAttachments = attachmentsRef.current;
    if (!text && !sentAttachments.length) return;
    if (demo) return sendDemo(text, sentAttachments);
    if (!text) {
      const id = ++nextId.current * 2;
      setEntries(current => [...current, { id, text, attachments: sentAttachments, reply: attachmentsReceived }]);
      replaceAttachments([]);
      setAttachmentError("");
      requestAnimationFrame(toBottom);
      return;
    }
    const pending = [...entries].reverse().find(entry => "stage" in entry && entry.question && !entry.answered);
    const active = [...entries].reverse().find(entry => "stage" in entry && !entry.replaced && entry.stage >= 0 && entry.stage < stages.length);
    const previous = entries.find(entry => entry.id === revision) ?? pending ?? active;
    const id = ++nextId.current;
    const requirement = previous ? `${previous.text}；补充：${text}` : text;
    const visibleMessage = { id: id * 2, text, attachments: sentAttachments };
    const reply: Turn = {
      id: id * 2 + 1, text: requirement, stage: -1, paused: false,
      thinkingUntil: Date.now() + 1000,
      consultation: !consultationShown.current && !hasAccount.test(requirement) && !/https?:\/\//.test(requirement),
    };
    setEntries(current => [
      ...current.map(entry => {
        if (entry.id !== previous?.id || !("stage" in entry)) return entry;
        if (entry.question && entry.stage < 0) return { ...entry, answered: true };
        return { ...entry, answered: true, replaced: entry.stage < stages.length };
      }),
      visibleMessage,
      reply,
    ]);
    setValue("");
    replaceAttachments([]);
    setAttachmentError("");
    setRevision(null);
    requestAnimationFrame(toBottom);
  }

  function revise(id: number) {
    setRevision(id);
    prefill("");
  }

  useEffect(() => { sendRef.current = send; });

  function prefill(text: string) {
    if (embedded) {
      bridge()?.sokerAcquisitionInput?.postMessage(text);
    } else {
      setValue(text);
      inputRef.current?.focus();
    }
  }

  const preview = previewTurns.length > 0 && demoTurns.length === 0;
  const displayedTurns = preview ? previewTurns : demoTurns;
  const isEmpty = demo ? displayedTurns.length === 0 : entries.length === 0;

  const workTurn = displayedTurns.at(-1);
  const workPhase = workTurn?.state.phase;
  const workStep = demoBusy ? workTurn?.activity[demoPhase] : undefined;
  const searching = !!workTurn && (
    (workPhase !== "intake" && workPhase !== "done") ||
    (!!workTurn.state.pendingSearchReply && workTurn.state.preferenceAsked)
  );
  const workTone = workStep || searching ? "active" : "done";
  const workStatus = workStep
    ? workTurn?.delivery ? "正在整理客户卡片"
      : workPhase === "contact_pending" ? "正在跟进潜客"
      : searching ? "正在找潜客" : "正在处理需求"
    : workPhase === "done" ? "套餐额度已用完，获客已暂停"
      : workPhase === "reauthorization" ? "持续找客户 · 待恢复抖音登录"
      : searching ? "正在找客户" : null;

  const composerStatus = !reviewing && workStatus && (
    <span className={styles.workStatus} data-tone={workTone} role="status">
      <span className={styles.workIndicator} aria-hidden="true"><i /><i /><i /></span>
      <span>{workStatus}</span>
    </span>
  );

  const current = workTurn?.state;
  const brief = current?.brief;
  const businessDetails = brief ? [
    ["业务", brief.trade === "renovation" ? "家装服务" : brief.trade === "cancellation" ? "公司注销代办" : ""],
    ["当前找人范围", [brief.city, ...brief.areas].filter(Boolean).join(" · ")],
    ["目标客户", brief.project === "new" ? "刚交房、准备装修的新房业主" : brief.project === "used" ? "准备翻新老房的业主" : brief.project === "partial" ? "有局部改造需求的业主" : ""],
    ["预算", brief.budget ? brief.budget[1] === Infinity ? `${brief.budget[0]} 万起` : `${brief.budget.join("–")} 万` : ""],
    ["留资偏好", current?.leadPreference === "phone" ? "手机号优先" : current?.leadPreference === "wechat" ? "微信优先" : current?.leadPreference === "either" ? "手机号或微信均可" : ""],
    ["已确认的业务规则", current?.measurementPolicy],
    ["参考资料", current?.businessSources?.map(source => source.url).join("\n")],
  ].filter(([, value]) => value) : [];
  const recentCustomers = displayedTurns.flatMap((turn, index) =>
    turn.delivery && !(demoBusy && index === displayedTurns.length - 1) ? [turn.delivery] : []);
  const history = [...new Map([...savedCustomers, ...recentCustomers].map(customer => [customer.id, customer])).values()];

  function switchMode(next: typeof mode) {
    if (next === mode) return;
    drafts.current[mode] = { text: value, attachments: attachmentsRef.current };
    const draft = drafts.current[next];
    setValue(draft?.text ?? "");
    replaceAttachments(draft?.attachments ?? []);
    setAttachmentError("");
    if (next === "review") setReviewVisited(true);
    setMode(next);
    bridge()?.sokerChatMode?.postMessage(next);
  }

  function openPanel(next: NonNullable<typeof panel>) {
    setPanel(next);
    if (panelRef.current && !panelRef.current.open) {
      panelRef.current.showModal();
      bridge()?.sokerAccountMenu?.postMessage("open");
    }
    if (next === "history") bridge()?.sokerAcquisitionHistory?.postMessage(true);
  }

  return <main className={embedded ? `${chatStyles.page} ${styles.embeddedSurface}` : chatStyles.page}
    style={{ ...acquisitionTheme, "--acquisition-attachment-tray-height": `${attachmentTrayHeight}px` } as CSSProperties}
    data-soker-chat-surface={embedded ? "embedded-ready" : undefined}>
    {demo && <>
      <dialog ref={panelRef} className={styles.contextPanel} data-panel={panel ?? undefined} data-drawer={panel === "menu" || panel === "history" || panel === "wechat"} aria-labelledby="acquisition-panel-title" onClose={() => { if (!panelRef.current?.open) {
          setPanel(null);
          if (openingReviewFriends.current) {
            openingReviewFriends.current = false;
            reviewControls.current?.openFriends();
            return;
          }
          bridge()?.sokerAccountMenu?.postMessage("close");
        } }}
        onClick={event => { if (event.target === event.currentTarget) panelRef.current?.close(); }}>
        <div className={styles.contextPanelBody}>
          <header>
            {(panel === "history" || panel === "wechat" || panel === "business") && <button type="button" aria-label="返回菜单" onClick={() => openPanel("menu")}>‹</button>}
            <h2 id="acquisition-panel-title" className={panel === "menu" ? styles.menuBrand : undefined}>
              {panel === "menu" ? <>
                <img className={styles.menuAppLogo} src="/chat/soker-app-icon.svg" width={32} height={32} alt="" />
                Soker
              </>
                : panel === "history" ? "客户列表" : panel === "wechat" ? "微信授权管理" : panel === "call" ? "与 Soker 通话" : "业务理解"}
            </h2>
            <button type="button" className={panel === "menu" ? styles.menuClose : undefined}
              aria-label={panel === "menu" ? "收起菜单" : "关闭"} onClick={() => panelRef.current?.close()}>
              {panel === "menu" ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M9 5v14m7-10-3 3 3 3" />
              </svg> : "×"}
            </button>
          </header>
          {panel === "menu" && serviceMessage && <p role="status">此功能需要 Soker App 的企业服务。</p>}
          {panel === "menu" && <nav className={styles.accountMenu} aria-label="账户与客户">
            <section aria-labelledby="acquisition-menu-work">
              <h3 id="acquisition-menu-work" className={styles.menuSectionLabel}>工作台</h3>
              <div className={styles.menuGroup}>
                {reviewing && <AccountMenuItem item="history" label="微信朋友" onSelect={() => {
                  openingReviewFriends.current = true;
                  panelRef.current?.close();
                }} />}
                <AccountMenuItem item="history" label="客户列表" onSelect={() => openPanel("history")} />
                <AccountMenuItem item="business" label="业务理解" onSelect={() => openPanel("business")} />
              </div>
            </section>
            <section aria-labelledby="acquisition-menu-account">
              <h3 id="acquisition-menu-account" className={styles.menuSectionLabel}>账户</h3>
              <div className={styles.menuGroup}>
              <AccountMenuItem item="account" label="账户信息" onSelect={() => embedded ? bridge()?.sokerAccountMenu?.postMessage("account") : setServiceMessage(true)} />
              <AccountMenuItem item="billing" label="账单" onSelect={() => embedded ? bridge()?.sokerAccountMenu?.postMessage("billing") : setServiceMessage(true)} />
              </div>
            </section>
            <section aria-labelledby="acquisition-menu-authorizations">
              <h3 id="acquisition-menu-authorizations" className={styles.menuSectionLabel}>授权管理</h3>
              <div className={styles.menuGroup}>
                <AccountMenuItem item="douyin" label="抖音授权管理" onSelect={() => embedded ? bridge()?.sokerAccountMenu?.postMessage("douyin") : setServiceMessage(true)} />
                <AccountMenuItem item="wechat" label="微信授权管理" onSelect={() => openPanel("wechat")} />
              </div>
            </section>
            {embedded && <section aria-labelledby="acquisition-menu-settings">
              <h3 id="acquisition-menu-settings" className={styles.menuSectionLabel}>设置</h3>
              <div className={styles.menuGroup}>
                <AccountMenuItem item="notifications" label="通知设置"
                  onSelect={() => bridge()?.sokerAccountMenu?.postMessage("notificationSettings")} />
              </div>
            </section>}
          </nav>}
          {panel === "call" && <p>语音通话暂未开放。</p>}
          {panel === "wechat" && <div className={styles.accountMenu}>
            <p>微信授权登录暂未开放。</p>
            <button type="button" disabled>授权登录微信</button>
          </div>}
          {panel === "history" && (history.length ? history.map(customer =>
            <CustomerDeliveryCard key={customer.id} customer={customer} embedded={embedded} preview />
          ) : <p>交付的客户会出现在这里。</p>)}
          {panel === "business" && (businessDetails.length ? <dl>{businessDetails.map(([label, value]) =>
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          )}</dl> : <p>告诉 Soker 你做什么生意、想找谁，这里会整理已确认的信息。</p>)}
        </div>
      </dialog>
    </>}
    {demo && <div className={styles.workToolbar}>
      <button type="button" className={styles.menuShortcut} aria-label="打开菜单" aria-haspopup="dialog" onClick={() => openPanel("menu")}>
        <span className={styles.menuIcon} aria-hidden="true" />
      </button>
      <div className={styles.modeSelector} data-mode={mode} role="group" aria-label="对话模式">
        <button type="button" aria-pressed={!reviewing} onClick={() => switchMode("acquisition")}>
          <span>获客</span>

        </button>
        <button type="button" aria-pressed={reviewing} onClick={() => switchMode("review")}>盘客</button>
      </div>
      <button type="button" className={styles.callShortcut} aria-label="与 Soker 通话" aria-haspopup="dialog" onClick={() => openPanel("call")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8.6 3.8 11 8.2 8.8 10a12.8 12.8 0 0 0 5.2 5.2l1.8-2.2 4.4 2.4c.5.3.7.8.6 1.3-.4 2.1-1.9 3.7-4 3.3C10.4 18.8 5.2 13.6 4 7.2c-.4-2.1 1.2-3.6 3.3-4 .5-.1 1 .1 1.3.6Z" />
        </svg>
      </button>
    </div>}
    {reviewVisited && <div className={styles.reviewSurface} hidden={!reviewing}>
      <ReviewChat controls={reviewControls} onSheetChange={handleReviewSheet} />
    </div>}
    <div hidden={reviewing} className={isEmpty ? `${chatStyles.timeline} ${styles.emptyTimeline}` : `${chatStyles.timeline} ${styles.activeTimeline}`} ref={scroller} tabIndex={0} aria-label="获客对话">
      <div className={chatStyles.timelineContent} ref={content}>
      {isEmpty && <section className={styles.starter}>
        <span className={styles.starterMark} aria-hidden="true" />
        <h1>{demo ? openingMessage : "你想找什么样的客户？"}</h1>
        <div className={styles.starterExamples}>
          {examples.map(({ label, brief }) =>
            <button key={label} type="button" onClick={() => prefill(brief)}>{label}</button>)}
        </div>
      </section>}
      {demo && !isEmpty && <div>
        <article className={styles.reply}>
          <Bubble text={openingMessage} locale="zh" onOpenLink={() => {}} />
        </article>
      </div>}
      {demo && displayedTurns.map((turn, index) => {
        const pending = index === demoTurns.length - 1 && demoBusy;
        return <div key={index} data-chat-tab-item={index}>
          {!!turn.attachments?.length && <SentAttachments attachments={turn.attachments} />}
          {turn.text && <div className={chatStyles.message}><Bubble text={turn.text} locale="zh" user onOpenLink={() => {}} /></div>}
          {(pending || turn.reply || turn.delivery || turn.review || turn.authorization) && <article className={styles.reply}>
            {pending ? <div className={chatStyles.activity} role="status">
              <span className={chatStyles.activityDot} aria-hidden="true" />
              <span>{turn.state.pendingSearchReply || turn.activity.some(step => step.includes("查近期需求"))
                ? "正在找潜客" : "Soker 正在处理"}</span>
            </div> : <>
              {turn.delivery ? <div className={styles.deliveryHandoff}>
                <Bubble text={`拿到「${turn.delivery.name}」的联系方式了，你可以直接跟进。`} locale="zh" onOpenLink={() => {}} />
                <CustomerDeliveryCard customer={turn.delivery} embedded={embedded} preview={preview} />
              </div>
                : turn.review ? <ProspectReview review={turn.review} question={turn.reply} />
                : <Bubble text={turn.reply} locale="zh" onOpenLink={() => {}} />}
              {(turn.authorization === "qr" || turn.authorization === "verification") &&
                <section className={styles.reauthorization} aria-label="抖音登录">
                  {turn.authorization === "qr" ? <>
                    <strong>重新登录抖音</strong>
                    <QRCodeSVG value="soker-demo:reauthorization" size={114} marginSize={2} aria-label="抖音登录二维码" />
                    {lastDemoTurn?.state.phase === "reauthorization" && turn === latestAuthorization && !demoBusy && <div className={styles.reauthorizationActions}>
                      <button type="button" onClick={() => reauthorize("scan")}>扫码完成</button>
                      <button type="button" onClick={() => reauthorize("scan_requires_verification")}>需要手机验证</button>
                    </div>}
                  </> : <>
                    <strong>在抖音完成手机验证</strong>
                    {lastDemoTurn?.state.phase === "reauthorization" && turn === latestAuthorization && !demoBusy && <div className={styles.reauthorizationActions}>
                      <button type="button" onClick={() => reauthorize("verified")}>验证完成</button>
                    </div>}
                  </>}
                </section>}
              {turn.state.pendingSearchReply && turn.state.preferenceAsked &&
                index === demoTurns.length - 1 &&
                <div className={chatStyles.activity} role="status">
                  <span className={chatStyles.activityDot} aria-hidden="true" />
                  <span>正在找潜客</span>
                </div>}
            </>}
          </article>}
        </div>;
      })}
      {entries.map(entry => {
        if (!("stage" in entry)) return <div key={entry.id} data-chat-tab-item={entry.id}>
          {!!entry.attachments?.length && <SentAttachments attachments={entry.attachments} />}
          {entry.text && <div className={chatStyles.message}><Bubble text={entry.text} locale="zh" user onOpenLink={() => {}} /></div>}
          {entry.reply && <article className={styles.reply}><Bubble text={entry.reply} locale="zh" onOpenLink={() => {}} /></article>}
        </div>;
        const working = !entry.replaced && entry.stage >= 0 && entry.stage < stages.length;
        const scenario = entry.stage === stages.length ? getAcquisitionScenario(entry.text) : null;
        return <article className={styles.reply} key={entry.id} data-chat-tab-item={entry.id}>
          {entry.thinkingUntil !== undefined && <div className={chatStyles.activity} role="status">
            <span className={chatStyles.activityDot} aria-hidden="true" />
            <span>正在理解你的需求…</span>
          </div>}
          {entry.question && <Bubble text={entry.question} locale="zh" onOpenLink={() => {}} />}
          {entry.id === firstSearchId && entry.consultation &&
            <p className={styles.consultation}>{optionalQuestion}</p>}
          {entry.stage >= 0 && <details className={styles.searchTrace}>
            <summary>
              {working && !entry.paused && <span className={chatStyles.activityDot} aria-hidden="true" />}
              <span role="status">{entry.replaced ? "已按新条件重新查找" : working ? entry.paused ? "查找已暂停" : stages[entry.stage] : "已完成本轮查找"}</span>
            </summary>
            <ol>{stages.slice(0, entry.stage + 1).map(stage => <li key={stage}>{stage}</li>)}</ol>
            {working && <button type="button" onClick={() => updateTurn(entry.id, turn => ({ ...turn, paused: !turn.paused }))}>
              {entry.paused ? "继续查找" : "暂停查找"}
            </button>}
          </details>}
          {scenario && <div className={styles.results}>
            {entry.question === accountQuestion && !entry.answered &&
              <p className={styles.consultation}>你发来的账号用途还没确认，本轮先查了其他来源。</p>}
            <p>{entry.retried ? "已复查可读来源，本轮没有新增符合条件的人。" : scenario.message}</p>
            {scenario.leads.map(lead => <details className={styles.evidence} key={lead.name}>
              <summary><strong>{lead.name}</strong><span>{lead.signal}</span></summary>
              <blockquote>“{lead.quote}”</blockquote>
              <p>{lead.source} · {lead.time}</p>
            </details>)}
            {scenario.kind === "partial" && !entry.retried && <button className={styles.followUp} type="button" onClick={() => updateTurn(entry.id, turn => ({ ...turn, stage: 1, paused: false, retried: true }))}>再查一轮</button>}
            <button className={styles.followUp} type="button" onClick={() => revise(entry.id)}>补充条件再找</button>
          </div>}
        </article>;
      })}
      </div>
    </div>
    <footer className={embedded ? styles.embeddedFooter : styles.footer} hidden={embedded && reviewing}>
      {!reviewing && <ChatTabScrollBottom state={scrollState} locale="zh" onClick={toBottom} />}
      {!reviewing && revision !== null && <div className={styles.revision}>补充上一轮找人需求 <button type="button" onClick={() => setRevision(null)}>取消</button></div>}
      {embedded ? <div ref={attachmentTrayRef} className={styles.embeddedAttachmentTray} data-has-attachments={attachments.length > 0}>
        <ComposerAttachments attachments={attachments} onRemove={removeAttachment} />
        {attachmentError && <p className={styles.attachmentError} role="status">{attachmentError}</p>}
        {composerStatus}
      </div> : <>
        {composerStatus}
        <input ref={pickerRef} type="file" accept={attachmentAccept} multiple hidden onChange={event => {
          stageAttachments(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }} />
        {attachmentError && <p className={styles.attachmentError} role="status">{attachmentError}</p>}
        <AcquisitionChatComposer placeholder={reviewing ? "问问今天该跟进谁" : undefined} inputRef={inputRef} value={value} onChange={setValue} onSend={() => send()}
          attachments={attachments} onOpenAttachments={reviewing ? undefined : () => pickerRef.current?.click()} onRemoveAttachment={removeAttachment} />
      </>}
    </footer>
  </main>;
}

export default AcquisitionChat;
