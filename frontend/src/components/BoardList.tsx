import React, { useEffect, useMemo, useState } from 'react';
import {
  Board,
  Card,
  List,
  createBoard,
  createCard,
  createList,
  deleteBoard,
  deleteCard,
  deleteList,
  listBoards,
  listCards,
  listLists,
  updateBoard,
  updateCard,
  updateList,
} from '../api/boards';
import ErrorBanner from './ErrorBanner';
import { getErrorMessage } from '../api/client';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ErrorState = string | null;

function SortableCard({
  card,
  onDelete,
  onStatusChange,
}: {
  card: Card;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card._id, data: { listId: card.list } });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    border: '1px solid #eee',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    background: '#fff',
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{card.title}</strong>
        <button onClick={onDelete}>🗑️</button>
      </div>
      <p>{card.description}</p>
      <div>
        Status:
        {['todo', 'doing', 'done'].map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            disabled={card.status === status}
            style={{ marginLeft: '0.25rem' }}
          >
            {status}
          </button>
        ))}
      </div>
    </li>
  );
}

const BoardList: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<string, Card[]>>({});
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDesc, setBoardDesc] = useState('');
  const [listTitle, setListTitle] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [error, setError] = useState<ErrorState>(null);
  const [loading, setLoading] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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

  const loadListsAndCards = async (boardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLists = await listLists(boardId);
      setLists(fetchedLists);
      const cardMap: Record<string, Card[]> = {};
      for (const lst of fetchedLists) {
        const cards = await listCards(boardId, lst._id);
        cardMap[lst._id] = cards;
      }
      setCardsByList(cardMap);
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
      void loadListsAndCards(selectedBoard._id);
    } else {
      setLists([]);
      setCardsByList({});
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

  const handleCreateCard = async (e: React.FormEvent, listId: string) => {
    e.preventDefault();
    if (!selectedBoard) return;
    try {
      const card = await createCard(selectedBoard._id, listId, cardTitle, cardDesc);
      setCardsByList((prev) => ({ ...prev, [listId]: [...(prev[listId] ?? []), card] }));
      setCardTitle('');
      setCardDesc('');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoard) return;
    try {
      const list = await createList(selectedBoard._id, listTitle);
      setLists((prev) => [...prev, list]);
      setCardsByList((prev) => ({ ...prev, [list._id]: [] }));
      setListTitle('');
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
        setLists([]);
        setCardsByList({});
      }
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!selectedBoard) return;
    try {
      await deleteList(selectedBoard._id, listId);
      setLists((prev) => prev.filter((l) => l._id !== listId));
      setCardsByList((prev) => {
        const copy = { ...prev };
        delete copy[listId];
        return copy;
      });
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleDeleteCard = async (listId: string, id: string) => {
    if (!selectedBoard) return;
    try {
      await deleteCard(selectedBoard._id, listId, id);
      setCardsByList((prev) => ({
        ...prev,
        [listId]: (prev[listId] ?? []).filter((c) => c._id !== id),
      }));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleUpdateCardStatus = async (listId: string, id: string, status: string) => {
    if (!selectedBoard) return;
    try {
      const updated = await updateCard(selectedBoard._id, listId, id, { status });
      setCardsByList((prev) => ({
        ...prev,
        [listId]: (prev[listId] ?? []).map((c) => (c._id === id ? updated : c)),
      }));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const cardsFlat = useMemo(() => Object.values(cardsByList).flat(), [cardsByList]);

  const findCardLocation = (cardId: string) => {
    for (const listId of Object.keys(cardsByList)) {
      const idx = (cardsByList[listId] ?? []).findIndex((c) => c._id === cardId);
      if (idx !== -1) return { listId, index: idx };
    }
    return null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCardId(null);
    const { active, over } = event;
    if (!selectedBoard || !over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeLoc = findCardLocation(activeId);
    if (!activeLoc) return;

    // over could be card or list
    let targetListId = over.data.current?.listId as string | undefined;
    if (!targetListId) {
      // if over a card, derive list from that card
      const overLoc = findCardLocation(overId);
      if (overLoc) targetListId = overLoc.listId;
    }
    if (!targetListId) return;

    const sourceListId = activeLoc.listId;
    const sourceCards = cardsByList[sourceListId] ?? [];
    const targetCards = cardsByList[targetListId] ?? [];

    let newTargetCards = targetCards;
    let targetIndex = targetCards.findIndex((c) => c._id === overId);
    if (targetIndex === -1) targetIndex = targetCards.length;

    let movingCard: Card | undefined;
    if (sourceListId === targetListId) {
      newTargetCards = arrayMove(targetCards, activeLoc.index, targetIndex);
      movingCard = newTargetCards[targetIndex];
    } else {
      const card = sourceCards[activeLoc.index];
      movingCard = { ...card, list: targetListId };
      const without = sourceCards.filter((c) => c._id !== activeId);
      const inserted = [...targetCards.slice(0, targetIndex), movingCard, ...targetCards.slice(targetIndex)];
      setCardsByList((prev) => ({
        ...prev,
        [sourceListId]: without,
        [targetListId]: inserted,
      }));
    }

    if (!movingCard) return;

    const newPosition = targetIndex;
    try {
      const updated = await updateCard(selectedBoard._id, sourceListId, activeId, {
        list: targetListId,
        position: newPosition,
      });
      setCardsByList((prev) => ({
        ...prev,
        [sourceListId]: prev[sourceListId]?.filter((c) => c._id !== activeId) ?? [],
        [targetListId]: (prev[targetListId] ?? []).map((c) => (c._id === activeId ? updated : c)),
      }));
    } catch (e) {
      setError(getErrorMessage(e));
      // on failure, reload lists/cards to resync
      if (selectedBoard) void loadListsAndCards(selectedBoard._id);
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
        <h3>{selectedBoard ? `Spell Schools for ${selectedBoard.title}` : 'Select a board'}</h3>
        {selectedBoard ? (
          <DndContext
            sensors={sensors}
            onDragStart={({ active }) => setActiveCardId(String(active.id))}
            onDragEnd={handleDragEnd}
          >
            <form onSubmit={handleCreateList} style={{ marginBottom: '1rem' }}>
              <input
                placeholder="New Spell School title"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                required
                style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
              />
              <button type="submit" disabled={loading}>
                Add spell school
              </button>
            </form>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {lists.map((list) => (
                <div key={list._id} style={{ border: '1px solid #ddd', padding: '0.75rem', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{list.title}</strong>
                    <button onClick={() => handleDeleteList(list._id)}>🗑️</button>
                  </div>
                  <form onSubmit={(e) => handleCreateCard(e, list._id)} style={{ marginTop: '0.5rem' }}>
                    <input
                      placeholder="Spell title"
                      value={cardTitle}
                      onChange={(e) => setCardTitle(e.target.value)}
                      required
                      style={{ width: '100%', marginBottom: '0.25rem', padding: '0.5rem' }}
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={cardDesc}
                      onChange={(e) => setCardDesc(e.target.value)}
                      style={{ width: '100%', marginBottom: '0.25rem', padding: '0.5rem' }}
                    />
                    <button type="submit" disabled={loading}>
                      Add spell
                    </button>
                  </form>
                  <SortableContext items={(cardsByList[list._id] ?? []).map((c) => c._id)} strategy={rectSortingStrategy}>
                    <ul>
                      {(cardsByList[list._id] ?? []).map((c) => (
                        <SortableCard
                          key={c._id}
                          card={c}
                          onDelete={() => handleDeleteCard(list._id, c._id)}
                          onStatusChange={(status) => handleUpdateCardStatus(list._id, c._id, status)}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeCardId
                ? (() => {
                    const card = cardsFlat.find((c) => c._id === activeCardId);
                    return card ? (
                      <div style={{ padding: '0.5rem', border: '1px solid #eee', background: '#fff', width: 220 }}>
                        <strong>{card.title}</strong>
                        <p style={{ margin: 0 }}>{card.description}</p>
                      </div>
                    ) : null;
                  })()
                : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <p>Select or create a board to manage spell schools and spells.</p>
        )}
      </div>
    </div>
  );
};

export default BoardList;
