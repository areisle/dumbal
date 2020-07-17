/* eslint-disable max-classes-per-file */
class NotEnoughPlayers extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, NotEnoughPlayers.prototype);
    }
}

class NotYourTurn extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, NotYourTurn.prototype);
    }
}

class NotEmpty extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, NotEmpty.prototype);
    }
}

class NotFound extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, NotFound.prototype);
    }
}

class Forbidden extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, Forbidden.prototype);
    }
}

class BadTiming extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, BadTiming.prototype);
    }
}

export {
    NotEnoughPlayers,
    NotYourTurn,
    NotEmpty,
    Forbidden,
    NotFound,
    BadTiming,
};
