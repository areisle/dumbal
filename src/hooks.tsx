import React, {
    useCallback, useState,
} from 'react';

export const useBoolean = (initialState: boolean) => {
    const [value, setValue] = useState(initialState);

    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);

    return [value, setTrue, setFalse] as [boolean, () => void, () => void];
};
