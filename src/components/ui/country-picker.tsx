import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { COUNTRIES, POPULAR_COUNTRIES, getCountryByCode, type Country } from '../../utils/countries';

interface CountryPickerProps {
    value?: string; // Country code
    onChange: (countryCode: string) => void;
    placeholder?: string;
    language?: 'en' | 'bg';
    className?: string;
}

const CountryPicker: React.FC<CountryPickerProps> = ({
    value,
    onChange,
    placeholder = 'Select a country...',
    language = 'en',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedCountry = useMemo(() => {
        return value ? getCountryByCode(value) : null;
    }, [value]);

    // Filter and sort countries
    const filteredCountries = useMemo(() => {
        let filtered = COUNTRIES;

        // Apply search filter
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = COUNTRIES.filter(country => 
                country.name[language].toLowerCase().includes(lowerSearchTerm) ||
                country.name.en.toLowerCase().includes(lowerSearchTerm) ||
                country.name.bg.toLowerCase().includes(lowerSearchTerm) ||
                country.code.toLowerCase().includes(lowerSearchTerm)
            );
        }

        // Sort with popular countries first
        const popular = filtered.filter(country => POPULAR_COUNTRIES.includes(country.code));
        const others = filtered.filter(country => !POPULAR_COUNTRIES.includes(country.code));
        
        const sortedPopular = popular.sort((a, b) => a.name[language].localeCompare(b.name[language]));
        const sortedOthers = others.sort((a, b) => a.name[language].localeCompare(b.name[language]));
        
        return [...sortedPopular, ...sortedOthers];
    }, [searchTerm, language]);

    // Handle clicks outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleCountrySelect = (country: Country) => {
        onChange(country.code);
        setIsOpen(false);
        setSearchTerm('');
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
                }`}
            >
                <div className="flex items-center flex-1 min-w-0">
                    {selectedCountry ? (
                        <div className="flex items-center space-x-2">
                            <span className="text-xl">{selectedCountry.flag}</span>
                            <span className="text-sm text-gray-900 truncate">
                                {selectedCountry.name[language]}
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-500 text-sm">{placeholder}</span>
                    )}
                </div>
                
                <div className="flex items-center space-x-1">
                    {selectedCountry && (
                        <div
                            onClick={clearSelection}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            role="button"
                            aria-label="Clear selection"
                        >
                            <X className="w-3 h-3 text-gray-400" />
                        </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={language === 'bg' ? 'Търсене на страна...' : 'Search country...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Countries List */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                            <>
                                {/* Popular Countries Section */}
                                {!searchTerm && (
                                    <>
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                                            {language === 'bg' ? 'Популярни' : 'Popular'}
                                        </div>
                                        {filteredCountries
                                            .filter(country => POPULAR_COUNTRIES.includes(country.code))
                                            .slice(0, 10)
                                            .map((country) => (
                                                <CountryOption
                                                    key={`popular-${country.code}`}
                                                    country={country}
                                                    language={language}
                                                    isSelected={country.code === value}
                                                    onClick={() => handleCountrySelect(country)}
                                                />
                                            ))
                                        }
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                                            {language === 'bg' ? 'Всички страни' : 'All Countries'}
                                        </div>
                                    </>
                                )}

                                {/* All Countries */}
                                {filteredCountries
                                    .filter(country => searchTerm || !POPULAR_COUNTRIES.includes(country.code))
                                    .map((country) => (
                                        <CountryOption
                                            key={country.code}
                                            country={country}
                                            language={language}
                                            isSelected={country.code === value}
                                            onClick={() => handleCountrySelect(country)}
                                        />
                                    ))
                                }
                            </>
                        ) : (
                            <div className="px-3 py-8 text-center text-gray-500 text-sm">
                                {language === 'bg' ? 'Няма намерени страни' : 'No countries found'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Country Option Component
interface CountryOptionProps {
    country: Country;
    language: 'en' | 'bg';
    isSelected: boolean;
    onClick: () => void;
}

const CountryOption: React.FC<CountryOptionProps> = ({ country, language, isSelected, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
            }`}
        >
            <span className="text-xl">{country.flag}</span>
            <span className="text-sm truncate">{country.name[language]}</span>
            {isSelected && (
                <div className="ml-auto">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
            )}
        </button>
    );
};

export default CountryPicker; 