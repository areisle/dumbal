import React, { useCallback, useEffect, useState } from 'react';

function useWindowSize() {
    const getSize = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let size = 'small';
        if (width > 800 && height > 800) {
            size = 'large';
        } else if (width > 600 && height > 600) {
            size = 'medium';
        }

        return {
            width,
            height,
            size,
        };
    }, []);

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect(() => {
        function handleResize() {
            setWindowSize(getSize());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [getSize]);

    return windowSize;
}

export {
    useWindowSize,
};
