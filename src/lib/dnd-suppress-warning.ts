// src/lib/dnd-suppress-warning.ts

// This is a workaround for a known issue in react-beautiful-dnd
// See: https://github.com/atlassian/react-beautiful-dnd/issues/2399#issuecomment-1175638194
export const suppressDndWarning = () => {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }
    const originalError = console.error;
    const error = (...args: any) => {
        if (args.length > 0 && typeof args[0] === 'string') {
            if (args[0].includes('Warning: findDOMNode is deprecated in StrictMode.')) {
                return;
            }
            if (args[0].startsWith('Warning: Connect(Droppable): Support for defaultProps will be removed from memo components')) {
                return;
            }
        }
        originalError(...args);
    };

    console.error = error;
};
