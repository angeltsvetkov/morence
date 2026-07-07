import React, { useEffect, useState } from 'react';
import { Bus, MapPin } from 'lucide-react';
import { BusLine, BusTrackerData, TimetableDay } from '../../types';

interface Props {
    busTracker: BusTrackerData;
    lang: 'bg' | 'en';
    slug?: string;
}

/** Resolve lines from data — handles both new multi-line and legacy flat structure */
function resolveLines(data: BusTrackerData): BusLine[] {
    if (data.lines && data.lines.length > 0) return data.lines;
    if (data.stops && data.stops.length > 0) {
        return [{
            id: 'legacy',
            myStopIndex: data.myStopIndex ?? 0,
            stops: data.stops,
            trips: data.trips ?? [],
            travelTimes: data.travelTimes ?? [],
        }];
    }
    return [];
}

function timeToMins(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function nowMins(): number {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
}

function todayKey(): TimetableDay {
    return (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as TimetableDay[])[new Date().getDay()];
}

interface BusState {
    myStopTime: string;
    minutesUntil: number;
    tripTimes: (string | null)[];
    fromStopIdx: number | null;
    toStopIdx: number | null;
    segmentProgress: number | null;
}

function computeState(line: BusLine, now: number, today: TimetableDay): BusState | null {
    const { stops, trips, myStopIndex } = line;
    if (!stops.length || myStopIndex < 0 || myStopIndex >= stops.length) return null;

    const todayTrips = trips.filter(t =>
        t.days.includes(today) &&
        t.times[myStopIndex] !== null &&
        t.times[myStopIndex] !== undefined &&
        t.times[myStopIndex] !== ''
    );
    if (!todayTrips.length) return null;

    // A trip is "running" if the current time is within its first–last served stop window
    const validTimes = (times: (string | null)[]) =>
        times.filter((t): t is string => Boolean(t)).map(timeToMins);

    const running = todayTrips
        .filter(t => {
            const mv = validTimes(t.times);
            return mv.length > 0 && mv[0] <= now && now <= mv[mv.length - 1];
        })
        .sort((a, b) => timeToMins(a.times[myStopIndex]!) - timeToMins(b.times[myStopIndex]!))[0];

    const next = todayTrips
        .filter(t => timeToMins(t.times[myStopIndex]!) > now)
        .sort((a, b) => timeToMins(a.times[myStopIndex]!) - timeToMins(b.times[myStopIndex]!))[0];

    const trip = running ?? next;
    if (!trip) return null;

    const myStopTime = trip.times[myStopIndex]!;
    const minutesUntil = timeToMins(myStopTime) - now;

    // Bus position: last stop whose time has passed vs next upcoming
    let fromStopIdx: number | null = null;
    let toStopIdx: number | null = null;
    for (let i = stops.length - 1; i >= 0; i--) {
        if (trip.times[i] && timeToMins(trip.times[i]!) <= now) { fromStopIdx = i; break; }
    }
    for (let i = 0; i < stops.length; i++) {
        if (trip.times[i] && timeToMins(trip.times[i]!) > now) { toStopIdx = i; break; }
    }

    let segmentProgress: number | null = null;
    if (fromStopIdx !== null && toStopIdx !== null) {
        const a = timeToMins(trip.times[fromStopIdx]!);
        const b = timeToMins(trip.times[toStopIdx]!);
        if (b > a) segmentProgress = Math.min(100, Math.max(0, Math.round(((now - a) / (b - a)) * 100)));
    }

    return { myStopTime, minutesUntil, tripTimes: trip.times, fromStopIdx, toStopIdx, segmentProgress };
}

const n = (name: { bg: string; en: string } | null | undefined, lang: 'bg' | 'en') =>
    name ? (name[lang] || name.bg || name.en || '') : '';

// ─────────────────────────────────────────────────────────────────────────────
// BusLineCard: renders a single bus line
// ─────────────────────────────────────────────────────────────────────────────
interface LineCardProps {
    line: BusLine;
    now: number;
    today: TimetableDay;
    lang: 'bg' | 'en';
    slug?: string;
}

const BusLineCard: React.FC<LineCardProps> = ({ line, now, today, lang, slug }) => {
    const state = computeState(line, now, today);
    if (!state) return null;

    const { myStopTime, minutesUntil, tripTimes, fromStopIdx, toStopIdx, segmentProgress } = state;
    const { stops, myStopIndex } = line;
    const myStop = stops[myStopIndex];
    const isArriving = minutesUntil <= 2 && minutesUntil >= 0;
    const isRunning = fromStopIdx !== null && toStopIdx !== null;

    const minutesLabel = isArriving
        ? (lang === 'bg' ? 'Пристига' : 'Arriving')
        : minutesUntil < 0
            ? (lang === 'bg' ? `преди ${Math.abs(minutesUntil)} мин` : `${Math.abs(minutesUntil)} min ago`)
            : minutesUntil <= 60
                ? (lang === 'bg' ? `след ${minutesUntil} мин` : `in ${minutesUntil} min`)
                : myStopTime;

    // Only stops served by this trip
    const visibleStops = stops
        .map((stop, idx) => ({ stop, idx, time: tripTimes[idx] ?? null }))
        .filter(x => Boolean(x.time));

    return (
        <section className="px-4 pt-2 pb-2">
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-amber-100/80">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />

                <div className="relative px-4 py-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {isRunning ? (
                                <span className="relative flex-shrink-0">
                                    <span className="absolute inline-flex w-2 h-2 rounded-full bg-amber-400 opacity-75 animate-ping" />
                                    <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-500" />
                                </span>
                            ) : (
                                <span className="w-2 h-2 rounded-full bg-amber-300 flex-shrink-0" />
                            )}
                            <div>
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider leading-none">
                                    {isRunning
                                        ? (lang === 'bg' ? 'В движение' : 'En route')
                                        : (lang === 'bg' ? 'Следващ автобус' : 'Next bus')
                                    }
                                    {line.name && (
                                        <span className="ml-1.5 font-normal normal-case text-amber-500/80">
                                            · {n(line.name, lang)}
                                        </span>
                                    )}
                                </p>
                                <p className="text-[11px] text-amber-800/70 font-medium mt-0.5">
                                    {n(myStop?.name, lang)} · {minutesLabel}
                                </p>
                            </div>
                        </div>

                        {myStop?.mapsUrl ? (
                            <a
                                href={myStop.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all shadow-sm shadow-amber-200"
                            >
                                <MapPin size={12} />
                                {lang === 'bg' ? 'Към спирката' : 'To the stop'}
                            </a>
                        ) : null}
                    </div>

                    {/* Horizontal metro route */}
                    <div className="overflow-x-auto -mx-1 px-1 pb-0.5">
                        <div style={{ minWidth: `${visibleStops.length * 64}px` }}>

                            {/* ── Row 1: dots + track ── */}
                            <div className="flex items-center" style={{ height: '20px' }}>
                                {visibleStops.map(({ stop, idx, time }, lineIdx) => {
                                    const isLast = lineIdx === visibleStops.length - 1;
                                    const nextEntry = !isLast ? visibleStops[lineIdx + 1] : null;
                                    const isPassed = !!time && timeToMins(time) <= now;
                                    const isMyStop = idx === myStopIndex;
                                    const isActiveSeg = !isLast && idx === fromStopIdx;
                                    const isPassedSeg = !isLast && !!nextEntry?.time && timeToMins(nextEntry.time) <= now;

                                    const dotCls = isMyStop
                                        ? isArriving
                                            ? 'w-4 h-4 rounded-full bg-green-400 ring-2 ring-white shadow animate-pulse'
                                            : 'w-4 h-4 rounded-full bg-amber-500 ring-2 ring-white shadow'
                                        : isPassed
                                            ? 'w-3 h-3 rounded-full bg-amber-400'
                                            : idx === toStopIdx
                                                ? 'w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-50'
                                                : 'w-3 h-3 rounded-full border-2 border-amber-200 bg-white';

                                    return (
                                        <React.Fragment key={stop.id}>
                                            {/* Dot */}
                                            <div className="flex-shrink-0 w-14 flex justify-center items-center">
                                                <div className={dotCls} />
                                            </div>

                                            {/* Track segment */}
                                            {!isLast && (
                                                <div className="relative flex-1 min-w-3" style={{ height: '20px' }}>
                                                    {/* Base track */}
                                                    <div className={`absolute top-[9px] left-0 right-0 h-0.5 rounded-full ${isPassedSeg ? 'bg-amber-300' : 'bg-amber-100'}`} />
                                                    {/* Progress fill */}
                                                    {isActiveSeg && segmentProgress !== null && (
                                                        <div
                                                            className="absolute top-[9px] left-0 h-0.5 rounded-full bg-amber-400"
                                                            style={{ width: `${segmentProgress}%` }}
                                                        />
                                                    )}
                                                    {/* Bus icon */}
                                                    {isActiveSeg && segmentProgress !== null && (
                                                        <div
                                                            className="absolute top-0 z-10"
                                                            style={{
                                                                left: `${segmentProgress}%`,
                                                                transform: 'translateX(-50%)',
                                                            }}
                                                        >
                                                            <div className="bg-amber-500 text-white rounded-full p-[3px] shadow-md ring-2 ring-white">
                                                                <Bus size={10} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* ── Row 2: labels ── */}
                            <div className="flex mt-2">
                                {visibleStops.map(({ stop, idx, time }, lineIdx) => {
                                    const isLast = lineIdx === visibleStops.length - 1;
                                    const isPassed = !!time && timeToMins(time) <= now;
                                    const isMyStop = idx === myStopIndex;

                                    const nameCls = isMyStop
                                        ? 'font-bold text-amber-900'
                                        : isPassed ? 'text-gray-400' : 'text-gray-700';
                                    const timeCls = isMyStop
                                        ? 'font-bold text-amber-700'
                                        : isPassed ? 'text-gray-300' : 'text-gray-500';

                                    return (
                                        <React.Fragment key={stop.id}>
                                            <div className="flex-shrink-0 w-14 flex flex-col items-center">
                                                {stop.mapsUrl ? (
                                                    <a
                                                        href={stop.mapsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`text-[10px] text-center leading-tight line-clamp-2 underline underline-offset-1 decoration-amber-300 ${nameCls}`}
                                                    >
                                                        {n(stop.name, lang)}
                                                    </a>
                                                ) : (
                                                    <p className={`text-[10px] text-center leading-tight line-clamp-2 ${nameCls}`}>
                                                        {n(stop.name, lang)}
                                                    </p>
                                                )}
                                                {isMyStop && (
                                                    <span className="mt-0.5 text-[8px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded-full leading-none">
                                                        {lang === 'bg' ? 'Вие' : 'You'}
                                                    </span>
                                                )}
                                                <p className={`text-[9px] font-mono mt-0.5 ${timeCls}`}>{time}</p>
                                            </div>
                                            {!isLast && <div className="flex-1 min-w-3" />}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// BusTrackerCard: multi-line wrapper — shows only the active/next line
// ─────────────────────────────────────────────────────────────────────────────
const BusTrackerCard: React.FC<Props> = ({ busTracker, lang, slug }) => {
    const [now, setNow] = useState(nowMins);
    const [today, setToday] = useState(todayKey);

    useEffect(() => {
        const id = setInterval(() => { setNow(nowMins()); setToday(todayKey()); }, 30_000);
        return () => clearInterval(id);
    }, []);

    if (!busTracker.enabled) return null;

    const lines = resolveLines(busTracker);
    if (!lines.length) return null;

    // Compute state for every line, pair with line
    const withState = lines
        .map(line => ({ line, state: computeState(line, now, today) }))
        .filter(x => x.state !== null) as { line: BusLine; state: NonNullable<ReturnType<typeof computeState>> }[];

    if (!withState.length) return null;

    // Prefer a line where the bus is currently en route (fromStopIdx set)
    const running = withState.find(x => x.state.fromStopIdx !== null && x.state.toStopIdx !== null);
    // Otherwise pick the line with the soonest upcoming arrival at "my stop"
    const best = running ?? withState.sort((a, b) => a.state.minutesUntil - b.state.minutesUntil)[0];

    return <BusLineCard line={best.line} now={now} today={today} lang={lang} slug={slug} />;
};

export default BusTrackerCard;
