"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  CalendarDays,
  Check,
  Eye,
  Megaphone,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { AnnouncementItem, NetworkFilter, NetworkTone } from "../data/network";
import { networkFilterLabels, networkFilters } from "../data/network";
import { formatAzDate, isExpired } from "../lib/date";
import { EmptyState } from "./ui/Primitives";
import { useAuth } from "./AuthProvider";

type AnnouncementsBoardProps = {
  items: readonly AnnouncementItem[];
  activeFilter: NetworkFilter;
  onFilterChange: (filter: NetworkFilter) => void;
  reducedMotion: boolean;
};

const tones: Record<NetworkTone, { marker: string; date: string; initials: string }> = {
  lime: { marker: "bg-[#44766c]", date: "bg-[#d3e8bf] text-[#16423c]", initials: "bg-[#d3e8bf]" },
  lilac: { marker: "bg-[#7c6fc5]", date: "bg-[#ebe8ff] text-[#514394]", initials: "bg-[#ebe8ff]" },
  blue: { marker: "bg-[#4b8ca1]", date: "bg-[#caeaf1] text-[#16423c]", initials: "bg-[#caeaf1]" },
  coral: { marker: "bg-[#c8795d]", date: "bg-[#fee7df] text-[#8c452e]", initials: "bg-[#fee7df]" },
  mint: { marker: "bg-[#3f8d7f]", date: "bg-[#d7f1eb] text-[#176c5f]", initials: "bg-[#d7f1eb]" },
  gold: { marker: "bg-[#b38b24]", date: "bg-[#f8edc7] text-[#72580a]", initials: "bg-[#f8edc7]" },
};

export function AnnouncementsBoard({ items, activeFilter, onFilterChange, reducedMotion }: AnnouncementsBoardProps) {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set());
  const [compactLimit, setCompactLimit] = useState(4);
  const filtered = items.filter((item) => activeFilter === "all" || item.category === activeFilter);
  const active = filtered.filter((item) => !isExpired(item.expiresAt));
  const archived = filtered.filter((item) => isExpired(item.expiresAt));
  const priority = active.filter((item) => item.priority).slice(0, 3);
  const rest = active.filter((item) => !priority.some((priorityItem) => priorityItem.id === item.id));

  function toggle(setter: typeof setReadIds, id: string) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <section className="announcements-board" aria-labelledby="announcements-title">
      <header className="announcements-board-heading">
        <div><span><Megaphone size={14} aria-hidden="true" /> Universitet şəbəkəsi</span><h2 id="announcements-title">Vacib elanlar</h2></div>
      </header>

      <div className="announcement-filter-bar">
        <span aria-hidden="true"><SlidersHorizontal size={15} /></span>
        <div className="announcement-filters" role="group" aria-label="Elanları kateqoriyaya görə süzgəcdən keçir">
          {networkFilters.map((filter) => {
            const selected = activeFilter === filter;
            return <button key={filter} type="button" aria-pressed={selected} onClick={() => onFilterChange(filter)}>{selected && <motion.i layoutId="active-network-filter" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" />}<span>{networkFilterLabels[filter]}</span></button>;
          })}
        </div>
        <span className="announcement-count">{active.length} aktiv</span>
      </div>

      <p className="sr-only" role="status" aria-live="polite">{networkFilterLabels[activeFilter]} kateqoriyasında {active.length} aktiv elan göstərilir.</p>

      {active.length === 0 ? (
        <EmptyState title="Bu kateqoriyada aktiv elan yoxdur" description="Müddəti bitmiş məlumatlara aşağıdakı arxivdən baxa bilərsən." />
      ) : (
        <>
          {priority.length > 0 && <div className="announcement-priority-grid"><AnimatePresence mode="popLayout">{priority.map((item, index) => <AnnouncementCard key={item.id} item={item} index={index} reducedMotion={reducedMotion} read={readIds.has(item.id)} bookmarked={bookmarkedIds.has(item.id)} onRead={() => toggle(setReadIds, item.id)} onBookmark={() => toggle(setBookmarkedIds, item.id)} />)}</AnimatePresence></div>}
          {rest.length > 0 && <section className="announcement-compact-section" aria-labelledby="other-announcements-title"><h3 id="other-announcements-title">Digər elanlar</h3><div className="announcement-compact-list">{rest.slice(0, compactLimit).map((item) => <AnnouncementCompact key={item.id} item={item} read={readIds.has(item.id)} bookmarked={bookmarkedIds.has(item.id)} onRead={() => toggle(setReadIds, item.id)} onBookmark={() => toggle(setBookmarkedIds, item.id)} />)}</div>{compactLimit < rest.length && <button type="button" className="announcement-load-more" onClick={() => setCompactLimit((current) => current + 4)}>Daha çox elan göstər</button>}</section>}
        </>
      )}

      {archived.length > 0 && <details className="announcement-archive"><summary>Arxiv <span>{archived.length}</span></summary><div>{archived.map((item) => <AnnouncementCompact key={item.id} item={item} archived read bookmarked={false} onRead={() => undefined} onBookmark={() => undefined} />)}</div></details>}
    </section>
  );
}

function AnnouncementCard({ item, index, reducedMotion, read, bookmarked, onRead, onBookmark }: { item: AnnouncementItem; index: number; reducedMotion: boolean; read: boolean; bookmarked: boolean; onRead: () => void; onBookmark: () => void }) {
  const tone = tones[item.tone];
  return <motion.article layout className={`announcement-card${read ? " is-read" : ""}`} initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}><i className={tone.marker} aria-hidden="true" />{item.imageUrl ? <div className="announcement-card-image" style={{ backgroundImage: `url("${item.imageUrl}")` }} role="img" aria-label={`${item.title} üçün elan şəkli`} /> : null}<div className="announcement-card-meta"><span className={tone.date}><CalendarDays size={12} aria-hidden="true" />{formatAzDate(item.startsAt)}</span>{!read && <b>Yeni</b>}</div><h3>{item.title}</h3><p>{item.summary}</p><AnnouncementEngagement item={item}/><footer><span className={tone.initials}>{item.sourceInitials}</span><span>{item.source}</span><AnnouncementActions read={read} bookmarked={bookmarked} onRead={onRead} onBookmark={onBookmark} /></footer></motion.article>;
}

function AnnouncementCompact({ item, archived = false, read, bookmarked, onRead, onBookmark }: { item: AnnouncementItem; archived?: boolean; read: boolean; bookmarked: boolean; onRead: () => void; onBookmark: () => void }) {
  return <article className={`announcement-compact${archived || read ? " is-muted" : ""}`}>{item.imageUrl ? <span className="announcement-compact-image" style={{ backgroundImage: `url("${item.imageUrl}")` }} aria-hidden="true" /> : null}<div><span>{networkFilterLabels[item.category]}</span>{archived && <b>Arxivdə</b>}<h4>{item.title}</h4><p>{item.summary}</p><AnnouncementEngagement item={item}/></div><time dateTime={item.startsAt}>{formatAzDate(item.startsAt)}</time>{!archived && <AnnouncementActions read={read} bookmarked={bookmarked} onRead={onRead} onBookmark={onBookmark} />}</article>;
}

const reactionOptions=["👍","❤️","😂","😮","😢","👏","🎉","🤔","👎","🙏"] as const;
type AnnouncementReactionPerson={userId:string;name:string;avatarUrl:string|null;emoji:string;reactedAt:string};
type AnnouncementReactionState={reactions:Record<string,number>;myReaction:string|null;people:AnnouncementReactionPerson[]};
function AnnouncementEngagement({item}:{item:AnnouncementItem}){
  const {user}=useAuth();const [views,setViews]=useState(item.viewCount??0);const [selected,setSelected]=useState(item.myReaction??null);const [counts,setCounts]=useState<Record<string,number>>(item.reactions??{});const [open,setOpen]=useState(false);const [people,setPeople]=useState<AnnouncementReactionPerson[]>([]);const [detailsOpen,setDetailsOpen]=useState(false);const [detailsFilter,setDetailsFilter]=useState<string|null>(null);const [detailsBusy,setDetailsBusy]=useState(false);const [detailsError,setDetailsError]=useState("");
  useEffect(()=>{if(!user)return;void fetch(`/api/network/announcements/${encodeURIComponent(item.id)}/view`,{method:"POST"}).then(async(response)=>{if(response.ok){const payload=await response.json() as {data:{viewCount:number}};setViews(payload.data.viewCount);}});},[item.id,user]);
  useEffect(()=>{if(!user)return;const controller=new AbortController();void fetch(`/api/network/announcements/${encodeURIComponent(item.id)}/reactions`,{signal:controller.signal,cache:"no-store"}).then(async(response)=>{if(!response.ok)return;const payload=await response.json() as {data:AnnouncementReactionState};setCounts(payload.data.reactions);setSelected(payload.data.myReaction);setPeople(payload.data.people);}).catch(()=>undefined);return()=>controller.abort();},[item.id,user]);
  async function loadDetails(filter:string|null){if(!user)return;setDetailsFilter(filter);setDetailsOpen(true);setDetailsBusy(true);setDetailsError("");try{const response=await fetch(`/api/network/announcements/${encodeURIComponent(item.id)}/reactions`,{cache:"no-store"});const payload=await response.json() as {data?:AnnouncementReactionState;error?:{message?:string}};if(!response.ok||!payload.data)throw new Error(payload.error?.message??"Reaksiyalar yüklənmədi.");setCounts(payload.data.reactions);setSelected(payload.data.myReaction);setPeople(payload.data.people);}catch(error){setDetailsError(error instanceof Error?error.message:"Reaksiyalar yüklənmədi.");}finally{setDetailsBusy(false);}}
  async function react(emoji:string){if(!user)return;const next=selected===emoji?null:emoji;const previous=selected;const previousCounts=counts;setSelected(next);setCounts((current)=>{const value={...current};if(previous)value[previous]=Math.max(0,(value[previous]??1)-1);if(next)value[next]=(value[next]??0)+1;return value});setOpen(false);try{const response=await fetch(`/api/network/announcements/${encodeURIComponent(item.id)}/reaction`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({emoji:next})});const payload=await response.json() as {data?:AnnouncementReactionState;error?:{message?:string}};if(!response.ok||!payload.data)throw new Error(payload.error?.message??"Reaksiya yadda saxlanmadı.");setSelected(payload.data.myReaction);setCounts(payload.data.reactions);setPeople(payload.data.people);}catch{setSelected(previous);setCounts(previousCounts);}}
  const visiblePeople=detailsFilter?people.filter((person)=>person.emoji===detailsFilter):people;
  return <><div className="announcement-engagement"><span><Eye size={13}/>{views} baxış</span><div className="announcement-reaction-summary">{Object.entries(counts).filter(([,count])=>count>0).slice(0,4).map(([emoji,count])=><button key={emoji} type="button" className={selected===emoji?"is-selected":""} onClick={()=>void loadDetails(emoji)} disabled={!user} aria-label={`${emoji} reaksiyasını bildirən ${count} nəfəri göstər`}>{emoji} <b>{count}</b></button>)}</div><div className="announcement-reaction-picker"><button type="button" onClick={()=>setOpen((value)=>!value)} disabled={!user} title={user?"Reaksiya bildir":"Reaksiya üçün daxil ol"}>☺+</button>{open?<div>{reactionOptions.map((emoji)=><button key={emoji} type="button" onClick={()=>void react(emoji)} aria-label={`${emoji} reaksiyası`}>{emoji}</button>)}</div>:null}</div></div>{detailsOpen&&typeof document!=="undefined"?createPortal(<div className="announcement-reaction-details-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setDetailsOpen(false);}}><section className="announcement-reaction-details" role="dialog" aria-modal="true" aria-label="Elan reaksiyaları"><header><div><small>REAKSİYALAR</small><h3>{people.length} nəfər</h3></div><button type="button" onClick={()=>setDetailsOpen(false)} aria-label="Bağla"><X size={18}/></button></header><nav aria-label="Reaksiyaya görə süzgəc"><button type="button" className={detailsFilter===null?"is-active":""} onClick={()=>setDetailsFilter(null)}>Hamısı <b>{people.length}</b></button>{Object.entries(counts).filter(([,count])=>count>0).map(([emoji,count])=><button key={emoji} type="button" className={detailsFilter===emoji?"is-active":""} onClick={()=>setDetailsFilter(emoji)}>{emoji} <b>{count}</b></button>)}</nav><div className="announcement-reaction-people">{detailsBusy?<p>Yüklənir…</p>:detailsError?<p role="alert">{detailsError}</p>:visiblePeople.length?visiblePeople.map((person)=><div key={person.userId}><span className="announcement-reactor-avatar" style={person.avatarUrl?{backgroundImage:`url("${person.avatarUrl}")`}:undefined}>{person.avatarUrl?null:person.name.split(/\s+/).slice(0,2).map((part)=>part[0]?.toLocaleUpperCase("az")).join("")}</span><strong>{person.name}</strong><i>{person.emoji}</i></div>):<p>Bu reaksiyanı bildirən yoxdur.</p>}</div></section></div>,document.body):null}</>;
}

function AnnouncementActions({ read, bookmarked, onRead, onBookmark }: { read: boolean; bookmarked: boolean; onRead: () => void; onBookmark: () => void }) {
  return <div className="announcement-actions"><button type="button" onClick={onRead} aria-pressed={read} aria-label={read ? "Oxunmamış kimi işarələ" : "Oxunmuş kimi işarələ"}><Check size={15} aria-hidden="true" /></button><button type="button" onClick={onBookmark} aria-pressed={bookmarked} aria-label={bookmarked ? "Yadda saxlananlardan çıxar" : "Yadda saxla"}><Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} aria-hidden="true" /></button></div>;
}
