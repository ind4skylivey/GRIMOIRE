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
import toast from 'react-hot-toast';
import clsx from 'clsx';

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
      const fetchedLists = (await listLists(boardId)).sort((a, b) => a.position - b.position);
      setLists(fetchedLists);
      const cardMap: Record<string, Card[]> = {};
      for (const lst of fetchedLists) {
        const cards = (await listCards(boardId, lst._id)).sort((a, b) => a.position - b.position);
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

  const computePosition = (items: { position: number }[], targetIndex: number) => {
    const prev = items[targetIndex - 1]?.position;
    const next = items[targetIndex + 1]?.position;
    if (prev === undefined && next === undefined) return 1024;
    if (prev === undefined) return next! / 2;
    if (next === undefined) return prev + 1024;
    const mid = (prev + next) / 2;
    if (mid === prev || mid === next) return prev + 1024;
    return mid;
  };

  const handleListDragEnd = async (event: DragEndEvent) => {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;
    const oldIndex = lists.findIndex((l) => l._id === activeId);
    const newIndex = lists.findIndex((l) => l._id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newLists = arrayMove(lists, oldIndex, newIndex);
    setLists(newLists);

    const newPos = computePosition(newLists, newIndex);
    const prevState = lists;
    try {
      const updated = await updateList(selectedBoard!._id, activeId, { position: newPos });
      setLists((prev) => prev.map((l) => (l._id === updated._id ? { ...l, position: updated.position } : l)));
    } catch (e) {
      setError(getErrorMessage(e));
      setLists(prevState);
    }
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

    let targetIndex = targetCards.findIndex((c) => c._id === overId);
    if (targetIndex === -1) targetIndex = targetCards.length;

    const prevState = { lists: [...lists], cardsByList: JSON.parse(JSON.stringify(cardsByList)) as typeof cardsByList };

    let movingCard: Card | undefined;
    if (sourceListId === targetListId) {
      const reordered = arrayMove(targetCards, activeLoc.index, targetIndex);
      movingCard = reordered[targetIndex];
      setCardsByList((prev) => ({ ...prev, [targetListId]: reordered }));
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

    const currentListCards = targetListId === sourceListId ? (cardsByList[targetListId] ?? []) : (cardsByList[targetListId] ?? []);
    const reordered = [...(targetListId === sourceListId ? (cardsByList[targetListId] ?? []) : (cardsByList[targetListId] ?? []))];
    // ensure includes moving card in the sequence for position calc
    const sequence = (cardsByList[targetListId] ?? []).filter((c) => c._id !== movingCard._id);
    sequence.splice(targetIndex, 0, { ...movingCard });
    const newPosition = computePosition(sequence, targetIndex);

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
      toast.success('Spell moved');
    } catch (e) {
      setError(getErrorMessage(e));
      setLists(prevState.lists);
      setCardsByList(prevState.cardsByList);
      if (selectedBoard) void loadListsAndCards(selectedBoard._id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 text-[color:var(--text)]">
      <div className="card-surface p-4 lg:col-span-1">
        <h3 className="font-display text-xl text-primary">Grimoire Pages</h3>
        <ErrorBanner message={error} />
        <ul className="space-y-2 mt-3">
          {boards.map((b) => (
            <li key={b._id} className={clsx("flex items-center justify-between px-3 py-2 rounded-lg border border-primary/20", selectedBoard?._id === b._id && "bg-primary/10")}>
              <button className="text-left flex-1" onClick={() => setSelectedBoard(b)}>
                {b.title}
              </button>
              <button onClick={() => handleDeleteBoard(b._id)} aria-label={`Delete ${b.title}`}>🗑️</button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleCreateBoard} className="mt-4 space-y-2">
          <input
            className="w-full rounded-lg bg-surface border border-primary/30 px-3 py-2"
            placeholder="Board title"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full rounded-lg bg-surface border border-primary/30 px-3 py-2"
            placeholder="Description (optional)"
            value={boardDesc}
            onChange={(e) => setBoardDesc(e.target.value)}
          />
          <button type="submit" disabled={loading} className="glow-button w-full">
            Create board
          </button>
        </form>
      </div>
      <div className="lg:col-span-2 card-surface p-4">
        <h3 className="font-display text-xl text-primary">
          {selectedBoard ? `Spell Schools for ${selectedBoard.title}` : 'Select a board'}
        </h3>
        {selectedBoard ? (
          <DndContext
            sensors={sensors}
            onDragStart={({ active }) => setActiveCardId(String(active.id))}
            onDragEnd={(e) => {
              // detect if list drag (data type list) or card drag
              if (e.active?.data?.current?.type === 'list') {
                handleListDragEnd(e);
              } else {
                handleDragEnd(e);
              }
            }}
          >
            <form onSubmit={handleCreateList} className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-lg bg-surface border border-primary/30 px-3 py-2"
                placeholder="New Spell School title"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} className="glow-button">
                Add school
              </button>
            </form>

            <SortableContext items={lists.map((l) => l._id)} strategy={rectSortingStrategy}>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                {lists.map((list) => (
                  <SortableListColumn
                    key={list._id}
                    list={list}
                    sensors={sensors}
                    onDelete={() => handleDeleteList(list._id)}
                    onCreateCard={(e) => handleCreateCard(e, list._id)}
                    cardTitle={cardTitle}
                    setCardTitle={setCardTitle}
                    cardDesc={cardDesc}
                    setCardDesc={setCardDesc}
                    cards={cardsByList[list._id] ?? []}
                    onDeleteCard={(cardId) => handleDeleteCard(list._id, cardId)}
                    onStatusChange={(cardId, status) => handleUpdateCardStatus(list._id, cardId, status)}
                    setActiveCardId={setActiveCardId}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeCardId
                ? (() => {
                    const card = cardsFlat.find((c) => c._id === activeCardId);
                    return card ? (
                      <div className="card-surface px-3 py-2 w-56">
                        <strong>{card.title}</strong>
                        <p className="m-0 text-sm opacity-80">{card.description}</p>
                      </div>
                    ) : null;
                  })()
                : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <p className="mt-3 text-sm opacity-80">Select or create a board to manage spell schools and spells.</p>
        )}
      </div>
    </div>
  );
};

export default BoardList;

function SortableListColumn({
  list,
  cards,
  onDelete,
  onCreateCard,
  cardTitle,
  setCardTitle,
  cardDesc,
  setCardDesc,
  onDeleteCard,
  onStatusChange,
}: {
  list: List;
  cards: Card[];
  onDelete: () => void;
  onCreateCard: (e: React.FormEvent) => void;
  cardTitle: string;
  setCardTitle: (v: string) => void;
  cardDesc: string;
  setCardDesc: (v: string) => void;
  onDeleteCard: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: list._id,
    data: { type: 'list' },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-surface/70 border border-primary/20 rounded-xl p-3 shadow-lg">
      <div className="flex justify-between items-center">
        <strong className="font-display text-primary">{list.title}</strong>
        <button onClick={onDelete}>🗑️</button>
      </div>
      <form onSubmit={onCreateCard} className="mt-2 space-y-2">
        <input
          className="w-full rounded-lg bg-surface border border-primary/30 px-3 py-2 text-sm"
          placeholder="Spell title"
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full rounded-lg bg-surface border border-primary/30 px-3 py-2 text-sm"
          placeholder="Description (optional)"
          value={cardDesc}
          onChange={(e) => setCardDesc(e.target.value)}
        />
        <button type="submit" className="glow-button w-full">
          Add spell
        </button>
      </form>
      <SortableContext items={cards.map((c) => c._id)} strategy={rectSortingStrategy}>
        <ul className="mt-3 space-y-2">
          {cards.map((c) => (
            <SortableCard
              key={c._id}
              card={c}
              onDelete={() => onDeleteCard(c._id)}
              onStatusChange={(status) => onStatusChange(c._id, status)}
            />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}
