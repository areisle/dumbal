import React from 'react';

const DialogDecorator = (storyFn:any) => (
    <div
        style={{
            position: 'relative',
            height: 568,
        }}
    >
        {storyFn()}
    </div>
);

const dialogDecoratorArgs = {
    disablePortal: true,
    disableEnforceFocus: true,
    disableScrollLock: true,
    disableAutoFocus: true,
};

const FullSize = (storyFn: any) => (
    <div style={{
        position: 'fixed', width: '100vw', height: '100vh', top: 0, left: 0,
    }}
    >
        {storyFn()}
    </div>
);

const Constrained = (width: number, height: number) => (storyFn: any) => (
    <div
        style={{
            width,
            height,
            outline: '1px dashed lightgrey',
        }}
    >
        {storyFn()}
    </div>
);

export {
    DialogDecorator,
    dialogDecoratorArgs,
    FullSize,
    Constrained,
};
