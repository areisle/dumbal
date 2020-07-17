import { SUIT } from '../types';
import { isValidSelection, removeCards } from '../utilities';

it('should allow pairs', () => {
    const cards = [
        { suit: SUIT.HEARTS, number: 3 },
        { suit: SUIT.DIAMONDS, number: 3 },
    ];

    expect(isValidSelection(cards)).toEqual(true);
});

it('should allow 3 of a kind', () => {
    const cards = [
        { suit: SUIT.HEARTS, number: 3 },
        { suit: SUIT.DIAMONDS, number: 3 },
        { suit: SUIT.CLUBS, number: 3 },
    ];

    expect(isValidSelection(cards)).toEqual(true);
});

it('should allow 4 of a kind', () => {
    const cards = [
        { suit: SUIT.HEARTS, number: 3 },
        { suit: SUIT.DIAMONDS, number: 3 },
        { suit: SUIT.CLUBS, number: 3 },
        { suit: SUIT.SPADES, number: 3 },
    ];

    expect(isValidSelection(cards)).toEqual(true);
});

it('should allow runs', () => {
    const cards = [
        { suit: SUIT.HEARTS, number: 3 },
        { suit: SUIT.DIAMONDS, number: 4 },
        { suit: SUIT.CLUBS, number: 5 },
    ];

    expect(isValidSelection(cards)).toEqual(true);
});

it('should not allow runs of less than 3', () => {
    const cards = [
        { suit: SUIT.HEARTS, number: 3 },
        { suit: SUIT.DIAMONDS, number: 4 },
    ];

    expect(isValidSelection(cards)).toEqual(false);
});

it('should allow runs to wrap', () => {
    const cards = [
        { suit: SUIT.HEARTS, number: 1 },
        { suit: SUIT.DIAMONDS, number: 2 },
        { suit: SUIT.DIAMONDS, number: 13 },
    ];

    expect(isValidSelection(cards)).toEqual(true);
});

it('should fail if cards are not a run of pairs etc.', () => {
    const cards = [
        { suit: SUIT.HEARTS, number: 1 },
        { suit: SUIT.DIAMONDS, number: 2 },
        { suit: SUIT.DIAMONDS, number: 4 },
        { suit: SUIT.DIAMONDS, number: 5 },
    ];

    expect(isValidSelection(cards)).toEqual(false);
});

describe('remove cards', () => {
    it('should remove mathcing cards', () => {
        const cards = [{ number: 1, suit: SUIT.CLUBS }, { number: 1, suit: SUIT.DIAMONDS }];
        const remove = [{ number: 1, suit: SUIT.CLUBS }];
        expect(removeCards(cards, remove)).toEqual([{ number: 1, suit: SUIT.DIAMONDS }]);
    });
});
