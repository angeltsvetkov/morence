import React, { useEffect, useState } from 'react';
import { Bus } from 'lucide-react';
import { BusTrackerData, TimetableDay } from '../../types';

interface Props {
    busTracker: BusTrackerData;
    lang: 'bg' | 'en';
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
    prevStop: { bg: string; en: string } | null;
    prevTime: string | null;
    nextStop: { bg: string; en: string } | null;
    nextTime: string | null;
    busFrom: { bg: string; en: string } | null;
    busTo: { bg: string; en: string } | null;
}

function computeState(tracker: BusTrackerData, now: number, today: TimetableDay): BusState | null {
    if (!tracker.enabled) return null;
    const { stops, trips, myStopIndex } = tracker;
    if (!stops.length || myStopIndex < 0 || myStopIndex >= stops.length) return null;

    const todayTrips = trips.filter(t =>
        t.days.includes(today) &&
        t.times[myStopIndex] !== null &&
        t.times[myStopIndex] !== undefined &&
        t.times[myStopIndex] !== ''
    );
    if (!todayTrips.length) return null;

    // Next trip arriving at myStop
    const next = todayTrips
        .filter(t => timeToMins(t.times[myStopIndex]!) > now)
        .sort((a, b) => timeToMins(a.times[myStopIndex]!) - timeToMins(b.times[myStopIndex]!))[0];
    if (!next) return null;

    const myStopTime = next.times[myStopIndex]!;
    const minutesUntil = timeToMins(myStopTime) - now;

    // Adjacent stops in this trip
    let prevIdx = -1;
    for (let i = myStopIndex - 1; i >= 0; i--) {
        if (next.times[i]) { prevIdx = i; break; }
    }
    let nextIdx = -1;
    for (let i = myStopIndex + 1; i < stops.length; i++) {
        if (next.times[i]) { nextIdx = i; break; }
    }

    // Current bus position in this trip
    const passed = stops
        .map((s, i) => ({ name: s.name, t: next.times[i] }))
        .filter(x => x.t && timeToMins(x.t) <= now);
    const upcoming = stops
        .map((s, i) => ({ name: s.name, t: next.times[i] }))
        .filter(x => x.t && timeToMins(x.t) > now);

    return {
        myStopTime,
        minutesUntil,
        prevStop: prevIdx >= 0 ? stops[prevIdx].name : null,
        prevTime: prevIdx >= 0 ? next.times[prevIdx] : null,
        nextStop: nextIdx >= 0 ? stops[nextIdx].name : null,
        nextTime: nextIdx >= 0 ? next.times[nextIdx] : null,
        busFrom: passed.length > 0 ? passed[passed.length - 1].name : null,
        busTo: upcoming.length > 0 ? upcoming[0].name : null,
    };
}

const n = (name: { bg: string; en: string } | null | undefined, lang: 'bg' | 'en') =>
    name ? (name[lang] || name.bg || name.en || '') : '';

const BusTrackerCard: React.FC<Props> = ({ busTracker, lang }) => {
    const [now, setNow] = useState(nowMins);
    const [today, setToday] = useState(todayKey);

    useEffect(() => {
        const id = setInterval(() => { setNow(nowMins()); setToday(todayKey()); }, 30_000);
        return () => clearInterval(id);
    }, []);

    const state = computeState(busTracker, now, today);
    if (!state) return null;

    const { myStopTime, minutesUntil, prevStop, prevTime, nextStop, nextTime, busFrom, busTo } = state;
    const myStop = busTracker.stops[busTracker.myStopIndex];
    const isArriving = minutesUntil <= 2;
    const isEnRoute = busFrom !== null && busTo !== null;

    const arrivalBadge = isArriving
        ? (lang === 'bg' ? 'Пристига' : 'Arriving')
        : minutesUntil <= 60
            ? (lang === 'bg' ? `след ${minutesUntil} мин` : `in ${minutesUntil} min`)
            : myStopTime;

    return (
        <section className="px-4 pt-2 pb-1">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-amber-100/80">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-4 py-2.5 flex items-center gap-2 border-b border-amber-100/60">
                    <Bus size={15} className="text-amber-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-amber-800 flex-1 truncate">
                        {lang === 'bg' ? 'Автобус' : 'Bus'} · {n(myStop?.name, lang)}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 transition-all ${
                        isArriving ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {arrivalBadge}
                    </span>
                </div>

                {/* Route strip */}
                <div className="bg-white px-4 py-3 space-y-2.5">
                    {/* Previous stop */}
                    {prevStop && (
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                            <span className="flex-1 text-xs text-gray-500 truncate">{n(prevStop, lang)}</span>
                            {prevTime && <span className="text-[10px] text-gray-400 font-mono">{prevTime}</span>}
                        </div>
                    )}

                    {/* Bus en-route indicator */}
                    {isEnRoute && (
                        <div className="flex items-center gap-3 pl-[7px]">
                            <Bus size={13} className="text-amber-500 flex-shrink-0 animate-bounce" style={{ animationDuration: '2s' }} />
                            <span className="text-xs text-amber-600">
                                {n(busFrom, lang)} → {n(busTo, lang)}
                            </span>
                        </div>
                    )}

                    {/* My stop (highlighted) */}
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-offset-1 shadow-sm ${
                            isArriving ? 'bg-green-400 ring-green-300 animate-pulse' : 'bg-amber-400 ring-amber-300'
                        }`} />
                        <span className="flex-1 text-sm font-semibold text-gray-900 truncate">{n(myStop?.name, lang)}</span>
                        <span className="text-xs font-mono font-bold text-amber-700 flex-shrink-0">{myStopTime}</span>
                    </div>

                    {/* Next stop */}
                    {nextStop && (
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                            <span className="flex-1 text-xs text-gray-500 truncate">{n(nextStop, lang)}</span>
                            {nextTime && <span className="text-[10px] text-gray-400 font-mono">{nextTime}</span>}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BusTrackerCard;
