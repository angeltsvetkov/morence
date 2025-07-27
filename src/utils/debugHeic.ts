/**
 * Debug utility for HEIC conversion issues
 */

export const debugHeicFile = async (file: File): Promise<{
    fileInfo: any;
    browserSupport: any;
    heic2anyAvailable: boolean;
}> => {
    const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
    };

    // Check browser support
    const browserSupport = {
        canvas: !!document.createElement('canvas').getContext,
        webp: await checkWebPSupport(),
        fileReader: typeof FileReader !== 'undefined',
        blob: typeof Blob !== 'undefined',
        url: typeof URL !== 'undefined',
        worker: typeof Worker !== 'undefined',
    };

    // Check if heic2any is available
    let heic2anyAvailable = false;
    try {
        const heic2any = await import('heic2any');
        heic2anyAvailable = typeof heic2any.default === 'function';
    } catch (error) {
        console.error('heic2any not available:', error);
    }

    return {
        fileInfo,
        browserSupport,
        heic2anyAvailable,
    };
};

const checkWebPSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
};

export const createHeicTestReport = async (file: File): Promise<string> => {
    const debug = await debugHeicFile(file);
    
    const report = `
=== HEIC Conversion Debug Report ===
File: ${debug.fileInfo.name}
Size: ${debug.fileInfo.sizeInMB} MB
Type: ${debug.fileInfo.type}
Modified: ${debug.fileInfo.lastModified}

Browser Support:
- Canvas: ${debug.browserSupport.canvas ? '✅' : '❌'}
- WebP: ${debug.browserSupport.webp ? '✅' : '❌'}
- FileReader: ${debug.browserSupport.fileReader ? '✅' : '❌'}
- Blob: ${debug.browserSupport.blob ? '✅' : '❌'}
- URL: ${debug.browserSupport.url ? '✅' : '❌'}
- Web Worker: ${debug.browserSupport.worker ? '✅' : '❌'}

heic2any Library: ${debug.heic2anyAvailable ? '✅' : '❌'}

Recommendations:
${debug.fileInfo.size > 10 * 1024 * 1024 ? '⚠️ Large file (>10MB) - may cause memory issues\n' : ''}
${!debug.browserSupport.canvas ? '❌ Canvas not supported - conversion will fail\n' : ''}
${!debug.heic2anyAvailable ? '❌ heic2any library not loaded\n' : ''}
${debug.fileInfo.type === '' ? '⚠️ No MIME type detected - may not be a valid HEIC file\n' : ''}
    `.trim();
    
    return report;
}; 