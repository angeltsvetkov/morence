export const safeToDate = (dateField: any): Date => {
    if (dateField instanceof Date) {
        return dateField;
    }
    if (dateField && typeof dateField.toDate === 'function') {
        return dateField.toDate();
    }
    if (typeof dateField === 'string') {
        return new Date(dateField);
    }
    return new Date();
}; 