import React, { useRef, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Bus, Upload, Download, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import { BusStop, BusTrip, BusTrackerData, TimetableDay } from '../../../types';

const ALL_DAYS: TimetableDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL: Record<TimetableDay, string> = { mon: 'Пон', tue: 'Вт', wed: 'Ср', thu: 'Чет', fri: 'Пет', sat: 'Съб', sun: 'Нед' };

const DEFAULT_TRACKER: BusTrackerData = { enabled: true, myStopIndex: 0, stops: [], trips: [], travelTimes: [] };

interface Props {
    data: BusTrackerData;
    setData: (d: BusTrackerData) => void;
}

function newId() { return `bs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

/** Add `mins` minutes to a "HH:MM" string, returns "HH:MM" */
function addMins(time: string, mins: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Compute all stop times from a start time + travelTimes array */
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

const ApartmentBusTrackerTab: React.FC<Props> = ({ data, setData }) => {
    const tracker = data ?? DEFAULT_TRACKER;
    const { enabled, myStopIndex, stops, trips } = tracker;
    const travelTimes: number[] = tracker.travelTimes ?? [];

    const set = (partial: Partial<BusTrackerData>) => setData({ ...tracker, ...partial });

    const travelTimesComplete = stops.length > 1 && travelTimes.length >= stops.length - 1 &&
        travelTimes.slice(0, stops.length - 1).every(t => t > 0);

    // ── Stop editing state ──────────────────────────────────────────────────
    const [editStopId, setEditStopId] = useState<string | null>(null);
    const [stopForm, setStopForm] = useState({ bg: '', en: '' });
    const [addingStop, setAddingStop] = useState(false);
    const [newStopForm, setNewStopForm] = useState({ bg: '', en: '' });

    const saveEditStop = () => {
        if (!stopForm.bg && !stopForm.en) return;
        set({ stops: stops.map(s => s.id === editStopId ? { ...s, name: { bg: stopForm.bg, en: stopForm.en } } : s) });
        setEditStopId(null);
    };

    const deleteStop = (idx: number) => {
        const newStops = stops.filter((_, i) => i !== idx);
        const newTrips = trips.map(t => ({ ...t, times: t.times.filter((_, i) => i !== idx) }));
        const newTravelTimes = travelTimes.filter((_, i) => i !== idx && i !== idx - 1 + (idx === 0 ? 0 : 0));
        // Remove the interval before this stop (idx-1 → idx) or after (idx → idx+1)
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
        const newStop: BusStop = { id: newId(), name: { bg: newStopForm.bg, en: newStopForm.en || newStopForm.bg } };
        const newTrips = trips.map(t => ({ ...t, times: [...t.times, null] }));
        const newTravelTimes = [...travelTimes, 0];
        set({ stops: [...stops, newStop], trips: newTrips, travelTimes: newTravelTimes });
        setNewStopForm({ bg: '', en: '' });
        setAddingStop(false);
    };

    const updateTravelTime = (idx: number, value: string) => {
        const mins = parseInt(value, 10);
        const updated = [...travelTimes];
        while (updated.length < stops.length - 1) updated.push(0);
        updated[idx] = isNaN(mins) ? 0 : Math.max(0, mins);
        set({ travelTimes: updated });
    };

    // ── Trip editing ────────────────────────────────────────────────────────
    const addTrip = () => {
        const trip: BusTrip = { id: newId(), days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], times: stops.map(() => null) };
        set({ trips: [...trips, trip] });
    };

    const deleteTrip = (id: string) => set({ trips: trips.filter(t => t.id !== id) });

    const updateTripTime = (tripId: string, stopIdx: number, value: string) => {
        set({
            trips: trips.map(t => t.id === tripId
                ? { ...t, times: t.times.map((tm, i) => i === stopIdx ? (value || null) : tm) }
                : t
            )
        });
    };

    /** Set start time and auto-fill the rest */
    const setTripStart = (tripId: string, startTime: string) => {
        if (!startTime) {
            set({ trips: trips.map(t => t.id === tripId ? { ...t, times: stops.map(() => null) } : t) });
            return;
        }
        if (travelTimesComplete) {
            const times = computeTimes(startTime, travelTimes, stops.length);
            set({ trips: trips.map(t => t.id === tripId ? { ...t, times } : t) });
        } else {
            // Set only the first stop time
            set({
                trips: trips.map(t => t.id === tripId
                    ? { ...t, times: t.times.map((tm, i) => i === 0 ? startTime : tm) }
                    : t
                )
            });
        }
    };

    const toggleTripDay = (tripId: string, day: TimetableDay) => {
        set({
            trips: trips.map(t => t.id === tripId
                ? { ...t, days: t.days.includes(day) ? t.days.filter(d => d !== day) : [...t.days, day] }
                : t
            )
        });
    };

    // ── CSV import / export ─────────────────────────────────────────────────
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
        <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
            {/* Enable toggle */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => set({ enabled: !enabled })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        enabled
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}
                >
                    {enabled ? <ToggleRight size={18} className="text-amber-500" /> : <ToggleLeft size={18} />}
                    {enabled ? 'Bus Tracker включен' : 'Bus Tracker изключен'}
                </button>
                <Bus size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500">Показва се в брошурата за гости</span>
            </div>

            {enabled && (
                <>
                    {/* ── Stops + travel times ───────────────────────────────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Bus size={14} className="text-amber-500" /> Спирки и времена между тях
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setAddingStop(true); setNewStopForm({ bg: '', en: '' }); }}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Plus size={13} /> Добави спирка
                            </button>
                        </div>

                        <div className="space-y-1">
                            {stops.map((stop, idx) => (
                                <React.Fragment key={stop.id}>
                                    {/* Stop row */}
                                    <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${idx === myStopIndex ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                                        {/* My stop radio */}
                                        <button
                                            type="button"
                                            title="Маркирай като моя спирка"
                                            onClick={() => set({ myStopIndex: idx })}
                                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                                                idx === myStopIndex ? 'border-amber-500 bg-amber-400' : 'border-gray-300 hover:border-amber-300'
                                            }`}
                                        />

                                        {editStopId === stop.id ? (
                                            <>
                                                <input
                                                    className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0"
                                                    placeholder="Наименование (BG)"
                                                    value={stopForm.bg}
                                                    onChange={e => setStopForm(f => ({ ...f, bg: e.target.value }))}
                                                />
                                                <input
                                                    className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0"
                                                    placeholder="Name (EN)"
                                                    value={stopForm.en}
                                                    onChange={e => setStopForm(f => ({ ...f, en: e.target.value }))}
                                                />
                                                <button type="button" onClick={saveEditStop} className="text-green-600 hover:text-green-800 flex-shrink-0"><Check size={14} /></button>
                                                <button type="button" onClick={() => setEditStopId(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-800 truncate">{stop.name.bg || stop.name.en}</p>
                                                    {stop.name.en && stop.name.en !== stop.name.bg && (
                                                        <p className="text-[10px] text-gray-400 truncate">{stop.name.en}</p>
                                                    )}
                                                </div>
                                                {idx === myStopIndex && (
                                                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded flex-shrink-0">Моята</span>
                                                )}
                                                <button type="button" onClick={() => { setEditStopId(stop.id); setStopForm({ bg: stop.name.bg, en: stop.name.en }); }} className="text-gray-400 hover:text-blue-500 flex-shrink-0"><Pencil size={13} /></button>
                                                <button type="button" onClick={() => deleteStop(idx)} className="text-gray-400 hover:text-red-500 flex-shrink-0"><Trash2 size={13} /></button>
                                            </>
                                        )}
                                    </div>

                                    {/* Travel time connector (between this stop and the next) */}
                                    {idx < stops.length - 1 && (
                                        <div className="flex items-center gap-2 pl-5 py-0.5">
                                            <div className="w-px h-5 bg-gray-200 ml-1.5" />
                                            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
                                                <span className="text-[10px] text-gray-400">↓</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={999}
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
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50">
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                        <input
                                            autoFocus
                                            className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0"
                                            placeholder="Наименование (BG)"
                                            value={newStopForm.bg}
                                            onChange={e => setNewStopForm(f => ({ ...f, bg: e.target.value }))}
                                            onKeyDown={e => e.key === 'Enter' && addStop()}
                                        />
                                        <input
                                            className="flex-1 text-xs border border-blue-200 rounded px-2 py-1 min-w-0"
                                            placeholder="Name (EN)"
                                            value={newStopForm.en}
                                            onChange={e => setNewStopForm(f => ({ ...f, en: e.target.value }))}
                                            onKeyDown={e => e.key === 'Enter' && addStop()}
                                        />
                                        <button type="button" onClick={addStop} className="text-green-600 hover:text-green-800 flex-shrink-0"><Check size={14} /></button>
                                        <button type="button" onClick={() => setAddingStop(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>
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

                    {/* ── Schedule ──────────────────────────────────────────────────── */}
                    {stops.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700">Разписание</h3>
                                    {travelTimesComplete && (
                                        <p className="text-[10px] text-gray-400 mt-0.5">Задай час на тръгване → останалите спирки се изчисляват автоматично</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={addTrip}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <Plus size={13} /> Добави курс
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="text-xs w-full min-w-max border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-3 py-2 text-left text-gray-500 font-medium whitespace-nowrap">Дни</th>
                                            {/* Start-time shortcut column */}
                                            <th className="px-3 py-2 text-center text-blue-500 font-medium whitespace-nowrap">
                                                {travelTimesComplete ? (
                                                    <span className="flex items-center gap-1 justify-center"><Zap size={10} /> Тръгване</span>
                                                ) : 'Старт'}
                                            </th>
                                            {stops.map((s, i) => (
                                                <th key={s.id} className={`px-3 py-2 text-center font-medium whitespace-nowrap ${i === myStopIndex ? 'text-amber-600' : 'text-gray-400'}`}>
                                                    {s.name.bg || s.name.en}
                                                    {i === myStopIndex && <span className="ml-1 text-[9px] text-amber-500">★</span>}
                                                </th>
                                            ))}
                                            <th className="px-2 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trips.map(trip => (
                                            <tr key={trip.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                                                {/* Days */}
                                                <td className="px-3 py-1.5">
                                                    <div className="flex flex-wrap gap-0.5">
                                                        {ALL_DAYS.map(day => (
                                                            <button
                                                                key={day}
                                                                type="button"
                                                                onClick={() => toggleTripDay(trip.id, day)}
                                                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                                                    trip.days.includes(day)
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-gray-100 text-gray-400'
                                                                }`}
                                                            >
                                                                {DAY_LABEL[day]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                {/* Start-time shortcut */}
                                                <td className="px-2 py-1.5 bg-blue-50/40">
                                                    <input
                                                        type="time"
                                                        className="w-[5.5rem] text-xs text-center border border-blue-200 rounded px-1 py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                                                        value={trip.times[0] || ''}
                                                        onChange={e => setTripStart(trip.id, e.target.value)}
                                                    />
                                                </td>
                                                {/* Individual stop times */}
                                                {stops.map((s, i) => (
                                                    <td key={s.id} className={`px-2 py-1.5 ${i === myStopIndex ? 'bg-amber-50/50' : ''}`}>
                                                        <input
                                                            type="time"
                                                            className={`w-[5.5rem] text-xs text-center border rounded px-1 py-0.5 font-mono focus:outline-none focus:ring-1 ${
                                                                trip.times[i]
                                                                    ? i === myStopIndex
                                                                        ? 'border-amber-300 focus:ring-amber-200'
                                                                        : 'border-gray-200 focus:ring-blue-200'
                                                                    : 'border-dashed border-gray-200 text-gray-300'
                                                            }`}
                                                            value={trip.times[i] || ''}
                                                            onChange={e => updateTripTime(trip.id, i, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                                {/* Delete */}
                                                <td className="px-2 py-1.5">
                                                    <button type="button" onClick={() => deleteTrip(trip.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {trips.length === 0 && (
                                            <tr>
                                                <td colSpan={stops.length + 3} className="px-3 py-4 text-center text-gray-400">
                                                    Няма курсове. Добави ръчно или импортирай CSV.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── CSV import / export ────────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                        <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Импорт / Експорт CSV</p>
                            <p className="text-[10px] text-gray-400 leading-snug max-w-xs">
                                Ред 1: имена на спирки (БГ|EN). Следващи редове: [дни-]времена.<br />
                                Пример: <span className="font-mono">Морец|Morence,Несебър|Nesebar</span>
                            </p>
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                <Upload size={13} /> Импорт CSV
                            </button>
                            {stops.length > 0 && (
                                <button
                                    type="button"
                                    onClick={exportCsv}
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Download size={13} /> Експорт CSV
                                </button>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                    </div>
                </>
            )}
        </div>
    );
};

export default ApartmentBusTrackerTab;
