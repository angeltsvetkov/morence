import React, { useRef, useState } from 'react';
import { TimetableEntry, TimetableDay } from '../../../types';
import { Plus, Trash2, Pencil, Check, X, Clock, Upload, Download, AlertCircle, MapPin } from 'lucide-react';

const ALL_DAYS: TimetableDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL_BG: Record<TimetableDay, string> = { mon: 'Пон', tue: 'Вт', wed: 'Ср', thu: 'Чет', fri: 'Пет', sat: 'Съб', sun: 'Нед' };
const DAY_LABEL_EN: Record<TimetableDay, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

const EMPTY_ENTRY = (): Omit<TimetableEntry, 'id'> => ({
    days: [],
    startTime: '',
    endTime: '',
    title: { bg: '', en: '' },
    location: { bg: '', en: '' },
    placeIds: [],
});

export interface PlaceOption {
    id: string;
    name: { bg: string; en: string };
    mapsUrl?: string;
}

interface Props {
    entries: TimetableEntry[];
    setEntries: (entries: TimetableEntry[]) => void;
    places?: PlaceOption[];
}

interface EntryFormProps {
    initial: Omit<TimetableEntry, 'id'>;
    onSave: (entry: Omit<TimetableEntry, 'id'>) => void;
    onCancel: () => void;
    saveLabel?: string;
    places?: PlaceOption[];
}

const EntryForm: React.FC<EntryFormProps> = ({ initial, onSave, onCancel, saveLabel = 'Запази', places = [] }) => {
    const [form, setForm] = useState(initial);

    const toggleDay = (day: TimetableDay) => {
        setForm(f => ({
            ...f,
            days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
        }));
    };

    const isValid = form.days.length > 0 && form.startTime && form.endTime && (form.title.bg || form.title.en);

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            {/* Days */}
            <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">Дни</p>
                <div className="flex flex-wrap gap-1.5">
                    {ALL_DAYS.map(day => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                form.days.includes(day)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {DAY_LABEL_BG[day]}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, days: [...ALL_DAYS] }))}
                        className="px-2.5 py-1 rounded-full text-xs text-blue-500 hover:text-blue-700"
                    >
                        Всеки ден
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm(f => ({
                            ...f,
                            days: (['mon', 'tue', 'wed', 'thu', 'fri'] as TimetableDay[]),
                        }))}
                        className="px-2.5 py-1 rounded-full text-xs text-blue-500 hover:text-blue-700"
                    >
                        Пон–Пет
                    </button>
                </div>
            </div>

            {/* Time */}
            <div className="flex gap-3">
                <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1">От</p>
                    <input
                        type="time"
                        value={form.startTime}
                        onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1">До</p>
                    <input
                        type="time"
                        value={form.endTime}
                        onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
            </div>

            {/* Title */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Заглавие (БГ)</p>
                    <input
                        type="text"
                        value={form.title.bg}
                        onChange={e => setForm(f => ({ ...f, title: { ...f.title, bg: e.target.value } }))}
                        placeholder="напр. Водна гимнастика"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Title (EN)</p>
                    <input
                        type="text"
                        value={form.title.en}
                        onChange={e => setForm(f => ({ ...f, title: { ...f.title, en: e.target.value } }))}
                        placeholder="e.g. Water Aerobics"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Място (БГ) <span className="text-gray-400">незадължително</span></p>
                    <input
                        type="text"
                        value={form.location?.bg ?? ''}
                        onChange={e => setForm(f => ({ ...f, location: { bg: e.target.value, en: f.location?.en ?? '' } }))}
                        placeholder="напр. Басейн"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Location (EN) <span className="text-gray-400">optional</span></p>
                    <input
                        type="text"
                        value={form.location?.en ?? ''}
                        onChange={e => setForm(f => ({ ...f, location: { bg: f.location?.bg ?? '', en: e.target.value } }))}
                        placeholder="e.g. Pool"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
            </div>

            {/* Linked places */}
            {places.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-gray-600 mb-1.5">
                        Свързани места <span className="text-gray-400">незадължително</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {places.map(p => {
                            const linked = (form.placeIds ?? []).includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setForm(f => ({
                                        ...f,
                                        placeIds: linked
                                            ? (f.placeIds ?? []).filter(id => id !== p.id)
                                            : [...(f.placeIds ?? []), p.id],
                                    }))}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                        linked
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <MapPin size={10} />
                                    {p.name.bg || p.name.en}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex gap-2 pt-1">
                <button
                    type="button"
                    onClick={() => isValid && onSave(form)}
                    disabled={!isValid}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Check size={14} /> {saveLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50"
                >
                    <X size={14} /> Откажи
                </button>
            </div>
        </div>
    );
};

const ApartmentTimetableTab: React.FC<Props> = ({ entries, setEntries, places = [] }) => {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [csvError, setCsvError] = useState<string | null>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    const addEntry = (data: Omit<TimetableEntry, 'id'>) => {
        const newEntry: TimetableEntry = { ...data, id: `tt_${Date.now()}` };
        setEntries([...entries, newEntry].sort(sortByTime));
        setAdding(false);
    };

    const updateEntry = (id: string, data: Omit<TimetableEntry, 'id'>) => {
        setEntries(entries.map(e => e.id === id ? { ...data, id } : e).sort(sortByTime));
        setEditingId(null);
    };

    const deleteEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    // ── CSV import ──────────────────────────────────────────────────────────
    const handleCsvImport = (file: File) => {
        setCsvError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = parseCsv(text);
                if (parsed.errors.length > 0) {
                    setCsvError(parsed.errors.join(' | '));
                }
                if (parsed.entries.length > 0) {
                    setEntries([...entries, ...parsed.entries].sort(sortByTime));
                } else if (parsed.errors.length === 0) {
                    setCsvError('Файлът е празен или няма валидни редове.');
                }
            } catch (err) {
                setCsvError('Неуспешно четене на файла.');
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const downloadTemplate = () => {
        const csv = [
            'days,startTime,endTime,titleBg,titleEn,locationBg,locationEn',
            'mon|tue|wed|thu|fri,10:00,10:30,Водна гимнастика,Water Aerobics,Басейн,Pool',
            'mon|tue|wed|thu|fri|sat|sun,12:00,12:30,Игри и танци,Games and Dancing,Шатра,Tent',
            'sat|sun,16:00,16:40,Воден волейбол,Water Volleyball,Басейн,Pool',
        ].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timetable-template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h3 className="text-base font-semibold text-gray-800">Програма / Schedule</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Брошурата ще показва текущата и следваща активност на гостите.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* CSV import */}
                    <button
                        onClick={() => csvInputRef.current?.click()}
                        className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
                        title="Импортирай CSV"
                    >
                        <Upload size={13} /> Импорт CSV
                    </button>
                    <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleCsvImport(f);
                            e.target.value = '';
                        }}
                    />
                    {/* Download template */}
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
                        title="Изтегли шаблон"
                    >
                        <Download size={13} /> Шаблон
                    </button>
                    {!adding && (
                        <button
                            onClick={() => setAdding(true)}
                            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                            <Plus size={14} /> Добави
                        </button>
                    )}
                </div>
            </div>

            {/* CSV format hint */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-600">CSV формат:</p>
                <p className="font-mono break-all">days, startTime, endTime, titleBg, titleEn, locationBg, locationEn</p>
                <p className="font-mono text-gray-400 break-all">mon|tue|wed, 10:00, 10:30, Водна гимнастика, Water Aerobics, Басейн, Pool</p>
                <p className="mt-1">Дни: <span className="font-mono">mon tue wed thu fri sat sun</span> — разделени с <span className="font-mono">|</span></p>
            </div>

            {csvError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Грешка при импорт:</p>
                        <p className="text-red-600 mt-0.5">{csvError}</p>
                    </div>
                    <button onClick={() => setCsvError(null)} className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"><X size={13} /></button>
                </div>
            )}

            {adding && (
                <EntryForm
                    initial={EMPTY_ENTRY()}
                    onSave={addEntry}
                    onCancel={() => setAdding(false)}
                    saveLabel="Добави"
                    places={places}
                />
            )}

            {entries.length === 0 && !adding && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <Clock size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Няма добавени дейности</p>
                    <p className="text-xs mt-1">Кликни „Добави" за да започнеш</p>
                </div>
            )}

            {entries.length > 0 && (
                <div className="space-y-2">
                    {entries.map(entry => (
                        editingId === entry.id ? (
                            <EntryForm
                                key={entry.id}
                                initial={{ days: entry.days, startTime: entry.startTime, endTime: entry.endTime, title: entry.title, location: entry.location, placeIds: entry.placeIds ?? [] }}
                                onSave={data => updateEntry(entry.id, data)}
                                onCancel={() => setEditingId(null)}
                                places={places}
                            />
                        ) : (
                            <div key={entry.id} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors">
                                {/* Time */}
                                <div className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-center flex-shrink-0 min-w-[80px]">
                                    {entry.startTime}<br />{entry.endTime}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                                        {entry.title.bg || entry.title.en}
                                        {entry.title.bg && entry.title.en && entry.title.bg !== entry.title.en && (
                                            <span className="text-gray-400 font-normal"> / {entry.title.en}</span>
                                        )}
                                    </p>
                                    {(entry.location?.bg || entry.location?.en) && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {entry.location.bg || entry.location.en}
                                            {entry.location.bg && entry.location.en && entry.location.bg !== entry.location.en && (
                                                <span> / {entry.location.en}</span>
                                            )}
                                        </p>
                                    )}
                                    {entry.placeIds && entry.placeIds.length > 0 && (
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {entry.placeIds.map(pid => {
                                                const p = places.find(pl => pl.id === pid);
                                                if (!p) return null;
                                                return (
                                                    <span key={pid} className="inline-flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                                                        <MapPin size={8} /> {p.name.bg || p.name.en}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="flex gap-1 mt-1.5 flex-wrap">
                                        {ALL_DAYS.filter(d => entry.days.includes(d)).map(d => (
                                            <span key={d} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                                                {DAY_LABEL_BG[d]}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => setEditingId(entry.id)}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={() => deleteEntry(entry.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

function sortByTime(a: TimetableEntry, b: TimetableEntry) {
    return a.startTime.localeCompare(b.startTime);
}

const VALID_DAYS = new Set<TimetableDay>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const TIME_RE = /^\d{1,2}:\d{2}$/;

function parseCsv(text: string): { entries: TimetableEntry[]; errors: string[] } {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const entries: TimetableEntry[] = [];
    const errors: string[] = [];

    // Skip header if present
    const startIdx = lines[0]?.toLowerCase().startsWith('days') ? 1 : 0;

    lines.slice(startIdx).forEach((line, i) => {
        const rowNum = startIdx + i + 1;
        // Split by comma, but respect quoted fields
        const cols = splitCsvRow(line);
        if (cols.length < 4) {
            errors.push(`Ред ${rowNum}: очаква се поне 4 колони.`);
            return;
        }

        const [daysRaw, startTime, endTime, titleBg, titleEn = '', locationBg = '', locationEn = ''] = cols.map(c => c.trim());

        const days = daysRaw.split('|').map(d => d.trim().toLowerCase()) as TimetableDay[];
        const invalidDays = days.filter(d => !VALID_DAYS.has(d));
        if (invalidDays.length > 0) {
            errors.push(`Ред ${rowNum}: невалидни дни: ${invalidDays.join(', ')}`);
            return;
        }
        if (days.length === 0) {
            errors.push(`Ред ${rowNum}: липсват дни.`);
            return;
        }
        if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
            errors.push(`Ред ${rowNum}: невалиден формат на час (очаква се HH:MM).`);
            return;
        }
        if (!titleBg && !titleEn) {
            errors.push(`Ред ${rowNum}: липсва заглавие.`);
            return;
        }

        entries.push({
            id: `tt_${Date.now()}_${rowNum}`,
            days,
            startTime: normalizeTime(startTime),
            endTime: normalizeTime(endTime),
            title: { bg: titleBg || '', en: titleEn || '' },
            ...(locationBg || locationEn ? { location: { bg: locationBg || '', en: locationEn || '' } } : {}),
        });
    });

    return { entries, errors };
}

function splitCsvRow(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
        else { current += ch; }
    }
    result.push(current);
    return result;
}

function normalizeTime(t: string): string {
    const [h, m] = t.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

export default ApartmentTimetableTab;
