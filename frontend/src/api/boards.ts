import { client } from './client';

export type Board = { _id: string; title: string; description?: string };
export type Card = { _id: string; title: string; description?: string; status: string; position: number };

export async function listBoards(): Promise<Board[]> {
  const res = await client.get<{ boards: Board[] }>('/api/v1/boards');
  return res.data.boards;
}

export async function createBoard(title: string, description?: string): Promise<Board> {
  const res = await client.post<{ board: Board }>('/api/v1/boards', { title, description });
  return res.data.board;
}

export async function updateBoard(id: string, data: Partial<Pick<Board, 'title' | 'description'>>): Promise<Board> {
  const res = await client.patch<{ board: Board }>(`/api/v1/boards/${id}`, data);
  return res.data.board;
}

export async function deleteBoard(id: string): Promise<void> {
  await client.delete(`/api/v1/boards/${id}`);
}

export async function listCards(boardId: string): Promise<Card[]> {
  const res = await client.get<{ cards: Card[] }>(`/api/v1/boards/${boardId}/cards`);
  return res.data.cards;
}

export async function createCard(boardId: string, title: string, description?: string): Promise<Card> {
  const res = await client.post<{ card: Card }>(`/api/v1/boards/${boardId}/cards`, { title, description });
  return res.data.card;
}

export async function updateCard(
  boardId: string,
  cardId: string,
  data: Partial<Pick<Card, 'title' | 'description' | 'status' | 'position'>>
): Promise<Card> {
  const res = await client.patch<{ card: Card }>(`/api/v1/boards/${boardId}/cards/${cardId}`, data);
  return res.data.card;
}

export async function deleteCard(boardId: string, cardId: string): Promise<void> {
  await client.delete(`/api/v1/boards/${boardId}/cards/${cardId}`);
}
