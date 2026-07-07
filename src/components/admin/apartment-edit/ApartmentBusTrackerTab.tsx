import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Bus, Upload, Download, ToggleLeft, ToggleRight, Zap, MapPin, GripVertical } from 'lucide-react';
import { BusLine, BusStop, BusTrip, BusTrackerData, TimetableDay } from '../../../types';

const ALL_DAYS: TimetableDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL: Record<TimetableDay, string> = { mon: 'Пон', tue: 'Вт', wed: 'Ср', thu: 'Чет', fri: 'Пет', sat: 'Съб', sun: 'Нед' };

interface Props {
    data: BusTrackerData;
    setData: (d: BusTrackerData) => void;
}

function newId() { return `bs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

function addMins(time: string, mins: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function computeTimes(startTime: string, travelTimes: number[], stopCount: number): (string | null)[] {
    const times: (string | null)[] = [startTime];
    for (let i = 0; i < stopCount - 1; i++) {
        const interval = travelTimes[i];
        if (!interval || interval <= 0) {
            times.push(null);
        } else {
            const prev = times[i];
            times.push(prev ? addMins(prev, interval) : null);
        }
    }
    return times;
}

/** Migrate legacy BusTrackerData (flat fields) to lines array */
function ensureLines(data: BusTrackerData): BusLine[] {
    if (data.lines && data.lines.length > 0) return data.lines;
    // Migrate from legacy flat structure
    if (data.stops && data.stops.length > 0) {
        return [{
            id: newId(),
            myStopIndex: data.myStopIndex ?? 0,
            stops: data.stops,
            trips: data.trips ?? [],
            travelTimes: data.travelTimes ?? [],
        }];
    }
    return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// BusLineEditor: edits a single BusLine
// ─────────────────────────────────────────────────────────────────────────────
interface LineEditorProps {
    line: BusLine;
    onChange: (l: BusLine) => void;
}

const BusLineEditor: React.FC<LineEditorProps> = ({ line, onChange }) => {
    const { myStopIndex, stops, trips } = line;
    const travelTimes: number[] = (line.travelTimes ?? []).map(t => {
        const v = Number(t);
        return Number.isFinite(v) ? Math.max(0, v) : 0;
    });

    const set = (partial: Partial<BusLine>) => onChange({ ...line, ...partial });

    const travelTimesComplete = stops.length > 1 &&
        travelTimes.length >= stops.length - 1 &&
        travelTimes.slice(0, stops.length - 1).every(t => t > 0);

    // ── Drag reorder ─────────────────────────────────────────────────────────
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

    const reorderStops = (fromIdx: number, toIdx: number) => {
        if (fromIdx === toIdx) return;
        const newStops = [...stops];
        const [moved] = newStops.splice(fromIdx, 1);
        newStops.splice(toIdx, 0, moved);
        const newTrips = trips.map(trip => {
            const newTimes = [...trip.times];
            const [movedTime] = newTimes.splice(fromIdx, 1);
            newTimes.splice(toIdx, 0, movedTime);
            return { ...trip, times: newTimes };
        });
        const newTravelTimes = new Array(Math.max(0, newStops.length - 1)).fill(0);
        let newMyStopIndex = myStopIndex;
        if (myStopIndex === fromIdx) newMyStopIndex = toIdx;
        else if (fromIdx < toIdx) { if (myStopIndex > fromIdx && myStopIndex <= toIdx) newMyStopIndex = myStopIndex - 1; }
        else { if (myStopIndex >= toIdx && myStopIndex < fromIdx) newMyStopIndex = myStopIndex + 1; }
        set({ stops: newStops, trips: newTrips, travelTimes: newTravelTimes, myStopIndex: newMyStopIndex });
    };

    // ── Stop editing ─────────────────────────────────────────────────────────
    const [editStopId, setEditStopId] = useState<string | null>(null);
    const [stopForm, setStopForm] = useState({ bg: '', en: '', mapsUrl: '' });
    const [addingStop, setAddingStop] = useState(false);
    const [newStopForm, setNewStopForm] = useState({ bg: '', en: '', mapsUrl: '' });

    const saveEditStop = () => {
        if (!stopForm.bg && !stopForm.en) return;
        set({ stops: stops.map(s => s.id === editStopId ? { ...s, name: { bg: stopForm.bg, en: stopForm.en }, mapsUrl: stopForm.mapsUrl || undefined } : s) });
        setEditStopId(null);
    };

    const deleteStop = (idx: number) => {
        const newStops = stops.filter((_, i) => i !== idx);
        const newTrips = trips.map(t => ({ ...t, times: t.times.filter((_, i) => i !== idx) }));
        const spliced = [...travelTimes];
        if (idx > 0) spliced.splice(idx - 1, 1);
        else if (spliced.length > 0) spliced.splice(0, 1);
        let newMyStopIndex = myStopIndex;
        if (idx === myStopIndex) newMyStopIndex = 0;
        else if (idx < myStopIndex) newMyStopIndex = Math.max(0, myStopIndex - 1);
        set({ stops: newStops, trips: newTrips, myStopIndex: newMyStopIndex, travelTimes: spliced });
    };

    const addStop = () => {
        if (!newStopForm.bg && !newStopForm.en) return;
        const newStop: BusStop = { id: newId(), name: { bg: newStopForm.bg, en: newStopForm.en || newStopForm.bg }, mapsUrl: newStopForm.mapsUrl || undefined };
        const newTrips = trips.map(t => ({ ...t, times: [...t.times, null] }));
        const newTravelTimes = [...travelTimes, 0];
        set({ stops: [...stops, newStop], trips: newTrips, travelTimes: newTravelTimes });
        setNewStopForm({ bg: '', en: '', mapsUrl: '' });
        setAddingStop(false);
    };

    const updateTravelTime = (idx: number, value: string) => {
        const mins = parseInt(value, 10);
        const updated = [...travelTimes];
        while (updated.length < stops.length - 1) updated.push(0);
        updated[idx] = isNaN(mins) ? 0 : Math.max(0, mins);
        set({ travelTimes: updated });
    };

    // ── Trips ────────────────────────────────────────────────────────────────
    const addTrip = () => {
        const trip: BusTrip = { id: newId(), days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], times: stops.map(() => null) };
        set({ trips: [...trips, trip] });
    };

    const deleteTrip = (id: string) => set({ trips: trips.filter(t => t.id !== id) });

    const buildTripTimesFromStart = (existingTimes: (string | null)[], startTime: string): (string | null)[] => {
        if (!startTime) return stops.map(() => null);
        if (travelTimesComplete) return computeTimes(startTime, travelTimes, stops.length);
        const normalized = [...existingTimes];
        while (normalized.length < stops.length) normalized.push(null);
        normalized[0] = startTime;
        return normalized.slice(0, stops.length);
    };

    const setTripStart = (tripId: string, startTime: string) => {
        set({ trips: trips.map(t => t.id === tripId ? { ...t, times: buildTripTimesFromStart(t.times, startTime) } : t) });
    };

    const updateTripTime = (tripId: string, stopIdx: number, value: string) => {
        set({
            trips: trips.map(t => t.id === tripId
                ? stopIdx === 0
                    ? { ...t, times: buildTripTimesFromStart(t.times, value) }
                    : { ...t, times: t.times.map((tm, i) => i === stopIdx ? (value || null) : tm) }
                : t
            )
        });
    };

    const toggleTripDay = (tripId: string, day: TimetableDay) => {
        set({ trips: trips.map(t => t.id === tripId ? { ...t, days: t.days.includes(day) ? t.days.filter(d => d !== day) : [...t.days, day] } : t) });
    };

    useEffect(() => {
        if (!travelTimesComplete || stops.length === 0) return;
        let changed = false;
        const recalculated = trips.map(trip => {
            const startTime = trip.times[0];
            if (!startTime) return trip;
            const nextTimes = computeTimes(startTime, travelTimes, stops.length);
            const isDifferent = trip.times.length !== nextTimes.length || nextTimes.some((time, idx) => time !== trip.times[idx]);
            if (!isDifferent) return trip;
            changed = true;
            return { ...trip, times: nextTimes };
        });
        if (changed) set({ trips: recalculated });
    }, [travelTimesComplete, JSON.stringify(travelTimes), stops.length]);

    // ── CSV ──────────────────────────────────────────────────────────────────
    const fileInputRef = useRef<HTMLInputElement>(null);

    const exportCsv = () => {
        const header = stops.map(s => `${s.name.bg}|${s.name.en}`).join(',');
        const rows = trips.map(t => `${t.days.join('-')},${t.times.map(tm => tm || '').join(',')}`);
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'bus-schedule.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const importCsv = (text: string) => {
        const lines = text.trim().split('\n').filter(l => l.trim());
        if (!lines.length) return;
        const headerCols = lines[0].split(',');
        const newStops: BusStop[] = headerCols.map(col => {
            const [bg, en] = col.split('|');
            return { id: newId(), name: { bg: bg.trim(), en: (en || bg).trim() } };
        });
        const newTrips: BusTrip[] = lines.slice(1).map(row => {
            const cols = row.split(',');
            let days: TimetableDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
            let times: (string | null)[] = cols.map(c => c.trim() || null);
            if (cols[0] && /^[a-z\-]+$/.test(cols[0].trim())) {
                days = cols[0].split('-') as TimetableDay[];
                times = cols.slice(1).map(c => c.trim() || null);
            }
            while (times.length < newStops.length) times.push(null);
            times = times.slice(0, newStops.length);
            return { id: newId(), days, times };
        });
        set({ stops: newStops, trips: newTrips, myStopIndex: 0, travelTimes: newStops.map(() => 0).slice(1) });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { if (ev.target?.result) importCsv(ev.target.result as string); };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="space-y-6">
            {/* ── Stops + travel times ─────────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Bus size={14} className="text-amber-500" /> Спирки и времена между тях
                    </h3>
                    <button
                        type="button"
                        onClick={() => { setAddingStop(true); setNewStopForm({ bg: '', en: '', mapsUrl: '' }); }}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <Plus size={13} /> Добави спирка
                    </button>
                </div>

                <div className="space-y-1">
                    {stops.map((stop, idx) => (
                        <React.Fragment key={stop.id}>
                            <div
                                draggable={editStopId !== stop.id}
                                onDragStart={() => setDragIdx(idx)}
                                onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
                                onDrop={() => { if (dragIdx !== null && dragOverIdx !== null) reorderStops(dragIdx, dragOverIdx); setDragIdx(null); setDragOverIdx(null); }}
                                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                                    dragOverIdx === idx && dragIdx !== idx ? 'border-blue-400 bg-blue-50' :
                                    dragIdx === idx ? 'opacity-50 border-dashed border-gray-300 bg-gray-50' :
                                    idx === myStopIndex ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-gray-50'
                                }`}
                            >
                                <span className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0" title="Преместване">
                                    <GripVertical size={14} />
                                </span>
                                <button
                                    type="button"
                                    title="Маркирай като моя спирка"
                                    onClick={() => set({ myStopIndex: idx })}
                                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${idx === myStopIndex ? 'border-amber-500 bg-amber-400' : 'border-gray-300 hover:border-amber-300'}`}
                                />
                                {editStopId === stop.id ? (
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <input className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0" placeholder="Наименование (BG)" value={stopForm.bg} onChange={e => setStopForm(f => ({ ...f, bg: e.target.value }))} />
                                            <input className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0" placeholder="Name (EN)" value={stopForm.en} onChange={e => setStopForm(f => ({ ...f, en: e.target.value }))} />
                                            <button type="button" onClick={saveEditStop} className="text-green-600 hover:text-green-800 flex-shrink-0"><Check size={14} /></button>
                                            <button type="button" onClick={() => setEditStopId(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={12} className="text-gray-400 flex-shrink-0 ml-0.5" />
                                            <input className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0" placeholder="Google Maps URL (по избор)" value={stopForm.mapsUrl} onChange={e => setStopForm(f => ({ ...f, mapsUrl: e.target.value }))} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 truncate">{stop.name.bg || stop.name.en}</p>
                                            {stop.name.en && stop.name.en !== stop.name.bg && <p className="text-[10px] text-gray-400 truncate">{stop.name.en}</p>}
                                            {stop.mapsUrl && (
                                                <a href={stop.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[10px] text-blue-500 hover:text-blue-700 truncate mt-0.5" onClick={e => e.stopPropagation()}>
                                                    <MapPin size={10} /> Google Maps
                                                </a>
                                            )}
                                        </div>
                                        {idx === myStopIndex && <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded flex-shrink-0">Моята</span>}
                                        <button type="button" onClick={() => { setEditStopId(stop.id); setStopForm({ bg: stop.name.bg, en: stop.name.en, mapsUrl: stop.mapsUrl || '' }); }} className="text-gray-400 hover:text-blue-500 flex-shrink-0"><Pencil size={13} /></button>
                                        <button type="button" onClick={() => deleteStop(idx)} className="text-gray-400 hover:text-red-500 flex-shrink-0"><Trash2 size={13} /></button>
                                    </>
                                )}
                            </div>
                            {idx < stops.length - 1 && (
                                <div className="flex items-center gap-2 pl-5 py-0.5">
                                    <div className="w-px h-5 bg-gray-200 ml-1.5" />
                                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
                                        <span className="text-[10px] text-gray-400">↓</span>
                                        <input
                                            type="number" min={0} max={999}
                                            className="w-10 text-[11px] text-center border-none outline-none font-mono text-gray-700 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            placeholder="0"
                                            value={travelTimes[idx] || ''}
                                            onChange={e => updateTravelTime(idx, e.target.value)}
                                        />
                                        <span className="text-[10px] text-gray-400">мин</span>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}

                    {addingStop && (
                        <>
                            {stops.length > 0 && (
                                <div className="flex items-center gap-2 pl-5 py-0.5">
                                    <div className="w-px h-5 bg-gray-200 ml-1.5" />
                                </div>
                            )}
                            <div className="flex items-start gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50">
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-1.5" />
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <input autoFocus className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0" placeholder="Наименование (BG)" value={newStopForm.bg} onChange={e => setNewStopForm(f => ({ ...f, bg: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addStop()} />
                                        <input className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0" placeholder="Name (EN)" value={newStopForm.en} onChange={e => setNewStopForm(f => ({ ...f, en: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addStop()} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={12} className="text-gray-400 flex-shrink-0 ml-0.5" />
                                        <input className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0" placeholder="Google Maps URL (по избор)" value={newStopForm.mapsUrl} onChange={e => setNewStopForm(f => ({ ...f, mapsUrl: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addStop()} />
                                    </div>
                                </div>
                                <button type="button" onClick={addStop} className="text-green-600 hover:text-green-800 flex-shrink-0 mt-1"><Check size={14} /></button>
                                <button type="button" onClick={() => setAddingStop(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-1"><X size={14} /></button>
                            </div>
                        </>
                    )}

                    {stops.length === 0 && !addingStop && (
                        <p className="text-xs text-gray-400 py-2">Добави спирки или импортирай от CSV</p>
                    )}
                </div>

                {stops.length > 1 && (
                    <p className={`mt-2 text-[10px] flex items-center gap-1 ${travelTimesComplete ? 'text-green-600' : 'text-amber-500'}`}>
                        {travelTimesComplete
                            ? <><Zap size={10} /> Автоматично изчисляване на часовете активно</>
                            : <><Zap size={10} /> Попълни времената между спирките за автоматично изчисляване</>
                        }
                    </p>
                )}
            </div>

            {/* ── Schedule ──────────────────────────────────────────────────────── */}
            {stops.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700">Разписание</h3>
                            {travelTimesComplete && <p className="text-[10px] text-gray-400 mt-0.5">Задай час на тръгване → останалите спирки се изчисляват автоматично</p>}
                        </div>
                        <button type="button" onClick={addTrip} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                            <Plus size={13} /> Добави курс
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="text-xs w-full min-w-max border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-gray-500 font-medium whitespace-nowrap">Дни</th>
                                    <th className="px-3 py-2 text-center text-blue-500 font-medium whitespace-nowrap">
                                        {travelTimesComplete ? <span className="flex items-center gap-1 justify-center"><Zap size={10} /> Тръгване</span> : 'Старт'}
                                    </th>
                                    {stops.map((s, i) => (
                                        <th key={s.id} className={`px-3 py-2 text-center font-medium whitespace-nowrap ${i === myStopIndex ? 'text-amber-600' : 'text-gray-400'}`}>
                                            {s.name.bg || s.name.en}{i === myStopIndex && <span className="ml-1 text-[9px] text-amber-500">★</span>}
                                        </th>
                                    ))}
                                    <th className="px-2 py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {trips.map(trip => (
                                    <tr key={trip.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-3 py-1.5">
                                            <div className="flex flex-wrap gap-0.5">
                                                {ALL_DAYS.map(day => (
                                                    <button key={day} type="button" onClick={() => toggleTripDay(trip.id, day)}
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${trip.days.includes(day) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        {DAY_LABEL[day]}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5 bg-blue-50/40">
                                            <input type="time" className="w-[5.5rem] text-xs text-center border border-blue-200 rounded px-1 py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                                                value={trip.times[0] || ''} onChange={e => setTripStart(trip.id, e.target.value)} />
                                        </td>
                                        {stops.map((s, i) => (
                                            <td key={s.id} className={`px-2 py-1.5 ${i === myStopIndex ? 'bg-amber-50/50' : ''}`}>
                                                <input type="time"
                                                    className={`w-[5.5rem] text-xs text-center border rounded px-1 py-0.5 font-mono focus:outline-none focus:ring-1 ${trip.times[i] ? i === myStopIndex ? 'border-amber-300 focus:ring-amber-200' : 'border-gray-200 focus:ring-blue-200' : 'border-dashed border-gray-200 text-gray-300'}`}
                                                    value={trip.times[i] || ''} onChange={e => updateTripTime(trip.id, i, e.target.value)} />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1.5">
                                            <button type="button" onClick={() => deleteTrip(trip.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {trips.length === 0 && (
                                    <tr><td colSpan={stops.length + 3} className="px-3 py-4 text-center text-gray-400">Няма курсове. Добави ръчно или импортирай CSV.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── CSV import / export ────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Импорт / Експорт CSV</p>
                    <p className="text-[10px] text-gray-400 leading-snug max-w-xs">
                        Ред 1: имена на спирки (БГ|EN). Следващи редове: [дни-]времена.<br />
                        Пример: <span className="font-mono">Морец|Morence,Несебър|Nesebar</span>
                    </p>
                </div>
                <div className="flex gap-2 ml-auto">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                        <Upload size={13} /> Импорт CSV
                    </button>
                    {stops.length > 0 && (
                        <button type="button" onClick={exportCsv} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                            <Download size={13} /> Експорт CSV
                        </button>
                    )}
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ApartmentBusTrackerTab: multi-line container
// ─────────────────────────────────────────────────────────────────────────────
const ApartmentBusTrackerTab: React.FC<Props> = ({ data, setData }) => {
    const tracker = data ?? { enabled: true, lines: [] };
    const { enabled } = tracker;
    const lines = ensureLines(tracker);

    const [activeLineIdx, setActiveLineIdx] = useState(0);

    const setTracker = (partial: Partial<BusTrackerData>) => setData({ ...tracker, ...partial });
    const setLines = (newLines: BusLine[]) => setTracker({ lines: newLines });

    const addLine = () => {
        const newLine: BusLine = { id: newId(), myStopIndex: 0, stops: [], trips: [], travelTimes: [], name: { bg: `Линия ${lines.length + 1}`, en: `Line ${lines.length + 1}` } };
        const newLines = [...lines, newLine];
        setLines(newLines);
        setActiveLineIdx(newLines.length - 1);
    };

    const deleteLine = (idx: number) => {
        const newLines = lines.filter((_, i) => i !== idx);
        setLines(newLines);
        setActiveLineIdx(Math.min(activeLineIdx, Math.max(0, newLines.length - 1)));
    };

    const updateLine = (idx: number, updated: BusLine) => {
        const newLines = [...lines];
        newLines[idx] = updated;
        setLines(newLines);
    };

    const activeLine = lines[activeLineIdx] ?? null;

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
            {/* ── Enable toggle ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setTracker({ enabled: !enabled })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${enabled ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                >
                    {enabled ? <ToggleRight size={18} className="text-amber-500" /> : <ToggleLeft size={18} />}
                    {enabled ? 'Bus Tracker включен' : 'Bus Tracker изключен'}
                </button>
                <Bus size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500">Показва се в брошурата за гости</span>
            </div>

            {enabled && (
                <>
                    {/* ── Line tabs ──────────────────────────────────────────────── */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-700">Линии</h3>
                            <button
                                type="button"
                                onClick={addLine}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium ml-auto"
                            >
                                <Plus size={13} /> Добави линия
                            </button>
                        </div>

                        {lines.length === 0 && (
                            <p className="text-xs text-gray-400 py-2">Няма линии. Добави линия за да започнеш.</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {lines.map((line, idx) => (
                                <div key={line.id}
                                    className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 cursor-pointer transition-all text-xs font-medium ${activeLineIdx === idx ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    onClick={() => setActiveLineIdx(idx)}>
                                    <Bus size={12} className={activeLineIdx === idx ? 'text-amber-500' : 'text-gray-400'} />
                                    <span>{line.name?.bg || `Линия ${idx + 1}`}</span>
                                    <span className="text-[10px] text-gray-400 font-normal">{line.stops.length > 0 ? `${line.stops.length} сп.` : ''}</span>
                                    {lines.length > 1 && (
                                        <button type="button" title="Изтрий линия" onClick={e => { e.stopPropagation(); deleteLine(idx); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Active line editor ─────────────────────────────────────── */}
                    {activeLine && (
                        <div className="border border-gray-100 rounded-2xl p-4 bg-white">
                            <div className="mb-4 pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bus size={14} className="text-amber-500 flex-shrink-0" />
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Наименование на линията</span>
                                    <span className="text-xs text-gray-400 ml-auto">{activeLine.stops.length} спирки · {activeLine.trips.length} курса</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                                        placeholder="Наименование (BG) — напр. Автобус 9"
                                        value={activeLine.name?.bg || ''}
                                        onChange={e => updateLine(activeLineIdx, { ...activeLine, name: { bg: e.target.value, en: activeLine.name?.en || '' } })}
                                    />
                                    <input
                                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                                        placeholder="Name (EN) — e.g. Bus 9"
                                        value={activeLine.name?.en || ''}
                                        onChange={e => updateLine(activeLineIdx, { ...activeLine, name: { bg: activeLine.name?.bg || '', en: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <BusLineEditor
                                key={activeLine.id}
                                line={activeLine}
                                onChange={updated => updateLine(activeLineIdx, updated)}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ApartmentBusTrackerTab;
