import './Main.scss';

import { Button } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, {
    useCallback, useEffect,
    useMemo,
    useReducer, useState,
} from 'react';

import { PlayerAvatar } from '../components/Avatar';
import { Footer } from '../components/Footer';
import { GameBoard } from '../components/GameBoard';
import { GameCompleteDialog } from '../components/GameCompleteDialog';
import { Header } from '../components/Header';
import { JoinGameDialog } from '../components/JoinGameDialog';
import { Menu } from '../components/Menu';
import { PlayerDeck } from '../components/PlayerDeck';
import { RoundCompleteDialog } from '../components/RoundCompleteDialog';
import { StartGameDialog } from '../components/StartGameDialog';
import { useBoolean } from '../hooks';
import {
    Card, GAME_STAGE, PlayerId,
    USER_EVENTS,
} from '../types';
import {
    getCardName,
    getCardsTotal, getOverallWinner,
    getPlayerNumber, getPreviousPlayer, getRoundWinners,
} from '../utilities';
import { gameReducer, initialState, logger } from './reducer';
import { useSocket } from './useSocket';

enum DIALOG_TYPE {
    START_GAME = 1,
    JOIN_GAME,
    GAME_COMPLETE,
    ROUND_COMPLETE,
    DREW_CARD,
}

function Main() {
    const [state, dispatch] = useReducer(logger(gameReducer), initialState);

    const { enqueueSnackbar } = useSnackbar();

    const {
        activePlayer,
        cards,
        gameId,
        discard,
        playerId,
        players,
        ready,
        roundNumber,
        stage,
        scores,
        roundEndedBy,
        out,
        cardCounts,
    } = state;

    const [scoreboardOpen, openScoreboard, closeScoreboard] = useBoolean(false);
    const [deckOpen, openPlayerDeck, closePlayerDeck] = useBoolean(false);
    const [discardOpen, openDiscard, closeDiscard] = useBoolean(false);

    const socket = useSocket(gameId, playerId, dispatch);

    const winners = useMemo(() => getRoundWinners(players, roundNumber, scores), [players, roundNumber, scores]);

    const gameWinner = useMemo(() => getOverallWinner(players, scores), [players, scores]);

    const pickableDiscard = useMemo(() => {
        if (!players.length) {
            return [];
        }
        return discard[getPreviousPlayer(players, playerId)] ?? [];
    }, [discard, playerId, players]);

    const allPlayersIn = useCallback(() => {
        socket?.emitForGame(USER_EVENTS.START_GAME);
    }, [socket]);

    const joinGame = useCallback((username: PlayerId) => {
        socket?.emitForGame(USER_EVENTS.JOIN_GAME, username);
    }, [socket]);

    const rejoinGame = useCallback(() => {
        socket?.emitForPlayer(USER_EVENTS.REJOIN_GAME);
    }, [socket]);

    const [currentDialog, setCurrentDialog] = useState<DIALOG_TYPE | null>(null);

    useEffect(() => {
        if (!gameId) {
            setCurrentDialog(DIALOG_TYPE.START_GAME);
        } else if (!playerId) {
            setCurrentDialog(DIALOG_TYPE.JOIN_GAME);
        } else if (
            stage === GAME_STAGE.BETWEEN_ROUNDS
        ) {
            setCurrentDialog(DIALOG_TYPE.ROUND_COMPLETE);
        } else if (stage === GAME_STAGE.COMPLETE) {
            setCurrentDialog(DIALOG_TYPE.GAME_COMPLETE);
        } else {
            setCurrentDialog(null);
        }
    }, [gameId, playerId, stage]);

    const cardsTotal = useMemo(() => getCardsTotal(cards), [cards]);

    const handleStartGame = useCallback((nextGameId = '') => {
        if (!nextGameId) {
            socket?.emit(USER_EVENTS.CREATE_GAME);
        } else {
            dispatch({
                type: USER_EVENTS.CREATE_GAME,
                payload: nextGameId,
            });
        }
        setCurrentDialog(null);
    }, [socket]);

    const handleJoinGame = useCallback((username: string) => {
        joinGame(username);
        setCurrentDialog(null);
    }, [joinGame]);

    const handlePlayCards = useCallback((cardsToPlay: Card[]) => {
        socket?.emitForPlayer(USER_EVENTS.PLAY_CARDS, cardsToPlay);
    }, [socket]);

    const handleDrawCard = useCallback(() => {
        socket?.emitForPlayer(USER_EVENTS.PICK_CARD_FROM_DECK, (card) => {
            enqueueSnackbar(`you drew a ${getCardName(card)}`);
        });
    }, [enqueueSnackbar, socket]);

    const handlePickFromDiscard = useCallback(([card]: Card[]) => {
        socket?.emitForPlayer(USER_EVENTS.PICK_CARD_FROM_DISCARD, card);
    }, [socket]);

    const handleEndRound = useCallback(() => {
        socket?.emitForPlayer(USER_EVENTS.END_ROUND);
    }, [socket]);

    const handleReady = useCallback(() => {
        socket?.emitForPlayer(USER_EVENTS.READY_FOR_NEXT_ROUND);
    }, [socket]);

    return (
        <div
            className='main'
        >
            <PlayerAvatar
                className='main__avatar'
                player={getPlayerNumber(players, playerId)}
            />
            <Header
                onScoreBoardOpen={openScoreboard}
                roundNumber={roundNumber}
                stage={stage}
            >
                {(
                    stage === GAME_STAGE.PICKING_CARD
                    && activePlayer === playerId
                ) && (
                    <Button
                        color='primary'
                        onClick={handleDrawCard}
                        variant='contained'
                    >
                        Draw From Deck
                    </Button>
                )}
                {(
                    activePlayer === playerId
                    && stage === GAME_STAGE.PLAYING_CARDS
                    && cardsTotal <= 5
                ) && (
                    <Button
                        color='primary'
                        onClick={handleEndRound}
                        variant='contained'
                    >
                        End Round
                    </Button>
                )}
            </Header>
            <div className='game-board-wrapper'>
                <GameBoard
                    activePlayer={activePlayer}
                    cardCounts={cardCounts}
                    discard={discard}
                    onOpenPickFromDiscardDialog={openDiscard}
                    out={out}
                    playerId={playerId}
                    players={players}
                    ready={ready}
                    roundEndedBy={roundEndedBy}
                    stage={stage}
                    winners={winners}
                />
            </div>
            <Footer
                disabled={players.length < 2}
                gameId={gameId}
                onAllPlayersIn={allPlayersIn}
                onReady={handleReady}
                showAllInButton={(
                    stage === GAME_STAGE.SETTING_UP
                    && playerId === players[0]
                )}
                showReadyButton={Boolean(
                    stage === GAME_STAGE.BETWEEN_ROUNDS
                    && playerId && !ready[playerId],
                )}
            />
            {/* your hand */}
            <PlayerDeck
                actionLabel='Play'
                allowSelectMultiple={true}
                cards={cards}
                onClose={closePlayerDeck}
                onOpen={openPlayerDeck}
                onPickCards={handlePlayCards}
                open={deckOpen}
                showPickAction={(
                    activePlayer === playerId
                    && stage === GAME_STAGE.PLAYING_CARDS
                )}
                visibleWhenClosed={true}
            />
            {/* discard */}
            <PlayerDeck
                actionLabel='Pick'
                allowSelectMultiple={false}
                cards={pickableDiscard}
                onClose={closeDiscard}
                onPickCards={handlePickFromDiscard}
                open={discardOpen}
                showPickAction={(
                    activePlayer === playerId
                    && stage === GAME_STAGE.PICKING_CARD
                )}
                visibleWhenClosed={false}
            />
            <Menu
                onClose={closeScoreboard}
                onRefreshData={rejoinGame}
                open={scoreboardOpen}
                players={players}
                roundNumber={roundNumber}
                scores={scores}
                stage={stage}
            />
            <JoinGameDialog
                onJoin={handleJoinGame}
                open={currentDialog === DIALOG_TYPE.JOIN_GAME}
            />
            <StartGameDialog
                onStart={handleStartGame}
                open={currentDialog === DIALOG_TYPE.START_GAME}
            />
            <RoundCompleteDialog
                onClose={() => setCurrentDialog(null)}
                open={currentDialog === DIALOG_TYPE.ROUND_COMPLETE}
                players={players}
                roundEndedBy={roundEndedBy}
                roundNumber={roundNumber ?? 0}
                scores={scores}
                winners={winners}
            />
            <GameCompleteDialog
                onClose={() => setCurrentDialog(null)}
                open={currentDialog === DIALOG_TYPE.GAME_COMPLETE}
                players={players}
                winnerId={gameWinner}
            />
        </div>
    );
}

export {
    Main,
};
