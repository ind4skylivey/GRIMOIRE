import React, { useEffect, useState } from 'react';
import {
  Board,
  Card,
  createBoard,
  createCard,
  deleteBoard,
  deleteCard,
  listBoards,
  listCards,
  updateBoard,
  updateCard,
} from '../api/boards';
import ErrorBanner from './ErrorBanner';
import { getErrorMessage } from '../api/client';

type ErrorState = string | null;

const BoardList: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDesc, setBoardDesc] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [error, setError] = useState<ErrorState>(null);
  const [loading, setLoading] = useState(false);

  const loadBoards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBoards();
      setBoards(data);
      if (data.length) {
        setSelectedBoard(data[0]);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async (boardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCards(boardId);
      setCards(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      void loadCards(selectedBoard._id);
    } else {
      setCards([]);
    }
  }, [selectedBoard]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const board = await createBoard(boardTitle, boardDesc);
      setBoards((prev) => [...prev, board]);
      setBoardTitle('');
      setBoardDesc('');
      setSelectedBoard(board);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoard) return;
    try {
      const card = await createCard(selectedBoard._id, cardTitle, cardDesc);
      setCards((prev) => [...prev, card]);
      setCardTitle('');
      setCardDesc('');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleDeleteBoard = async (id: string) => {
    try {
      await deleteBoard(id);
      setBoards((prev) => prev.filter((b) => b._id !== id));
      if (selectedBoard?._id === id) {
        setSelectedBoard(null);
        setCards([]);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!selectedBoard) return;
    try {
      await deleteCard(selectedBoard._id, id);
      setCards((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleUpdateCardStatus = async (id: string, status: string) => {
    if (!selectedBoard) return;
    try {
      const updated = await updateCard(selectedBoard._id, id, { status });
      setCards((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
      <div>
        <h3>Boards</h3>
        <ErrorBanner message={error} />
        <ul>
          {boards.map((b) => (
            <li key={b._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => setSelectedBoard(b)}>{b.title}</button>
              <button onClick={() => handleDeleteBoard(b._id)} aria-label={`Delete ${b.title}`}>🗑️</button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleCreateBoard} style={{ marginTop: '1rem' }}>
          <input
            placeholder="Board title"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <textarea
            placeholder="Description (optional)"
            value={boardDesc}
            onChange={(e) => setBoardDesc(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <button type="submit" disabled={loading}>
            Create board
          </button>
        </form>
      </div>
      <div>
        <h3>Cards {selectedBoard ? `for ${selectedBoard.title}` : ''}</h3>
        {selectedBoard ? (
          <>
            <form onSubmit={handleCreateCard} style={{ marginBottom: '1rem' }}>
              <input
                placeholder="Card title"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                required
                style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
              />
              <textarea
                placeholder="Description (optional)"
                value={cardDesc}
                onChange={(e) => setCardDesc(e.target.value)}
                style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
              />
              <button type="submit" disabled={loading}>
                Add card
              </button>
            </form>
            <ul>
              {cards.map((c) => (
                <li key={c._id} style={{ border: '1px solid #ddd', padding: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{c.title}</strong>
                    <button onClick={() => handleDeleteCard(c._id)}>🗑️</button>
                  </div>
                  <p>{c.description}</p>
                  <div>
                    Status:
                    {['todo', 'doing', 'done'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateCardStatus(c._id, status)}
                        disabled={c.status === status}
                        style={{ marginLeft: '0.25rem' }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Select or create a board to manage cards.</p>
        )}
      </div>
    </div>
  );
};

export default BoardList;
