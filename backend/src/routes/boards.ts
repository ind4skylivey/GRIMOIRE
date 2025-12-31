import { Router } from 'express';
import { z } from 'zod';
import { authGuard } from '../middleware/auth';
import { Board } from '../models/Board';
import { List } from '../models/List';
import { Card } from '../models/Card';
import { notFound, unauthorized } from '../utils/errors';
import { validateBody } from '../middleware/validate';

const router = Router();

const boardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const boardUpdateSchema = boardSchema.partial();

const listSchema = z.object({
  title: z.string().min(1),
  position: z.number().optional(),
});

const listUpdateSchema = listSchema.partial();

const cardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  position: z.number().optional(),
});

const cardUpdateSchema = cardSchema.partial();

router.use(authGuard);

// Boards
router.get('/', async (req, res) => {
  if (!req.user) throw unauthorized();
  const boards = await Board.find({ owner: req.user.id }).lean();
  return res.json({ boards });
});

router.post('/', validateBody(boardSchema), async (req, res) => {
  if (!req.user) throw unauthorized();
  const board = await Board.create({ ...req.body, owner: req.user.id });
  return res.status(201).json({ board });
});

router.get('/:boardId', async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id }).lean();
  if (!board) return next(notFound('Board not found'));
  return res.json({ board });
});

router.patch('/:boardId', validateBody(boardUpdateSchema), async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOneAndUpdate(
    { _id: req.params.boardId, owner: req.user.id },
    req.body,
    { new: true }
  ).lean();
  if (!board) return next(notFound('Board not found'));
  return res.json({ board });
});

router.delete('/:boardId', async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const deleted = await Board.findOneAndDelete({ _id: req.params.boardId, owner: req.user.id });
  if (!deleted) return next(notFound('Board not found'));
  await List.deleteMany({ board: req.params.boardId });
  await Card.deleteMany({ board: req.params.boardId });
  return res.status(204).send();
});

// Lists
router.get('/:boardId/lists', async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));
  const lists = await List.find({ board: board.id }).sort({ position: 1, createdAt: 1 }).lean();
  return res.json({ lists });
});

router.post('/:boardId/lists', validateBody(listSchema), async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));

  const list = await List.create({ ...req.body, board: board.id });
  return res.status(201).json({ list });
});

router.patch('/:boardId/lists/:listId', validateBody(listUpdateSchema), async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));

  const list = await List.findOneAndUpdate(
    { _id: req.params.listId, board: board.id },
    req.body,
    { new: true }
  ).lean();
  if (!list) return next(notFound('List not found'));
  return res.json({ list });
});

router.delete('/:boardId/lists/:listId', async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));

  const deleted = await List.findOneAndDelete({ _id: req.params.listId, board: board.id });
  if (!deleted) return next(notFound('List not found'));
  await Card.deleteMany({ list: req.params.listId });
  return res.status(204).send();
});

// Cards under lists
router.get('/:boardId/lists/:listId/cards', async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));
  const list = await List.findOne({ _id: req.params.listId, board: board.id });
  if (!list) return next(notFound('List not found'));

  const cards = await Card.find({ board: board.id, list: list.id }).sort({ position: 1, createdAt: 1 }).lean();
  return res.json({ cards });
});

router.post('/:boardId/lists/:listId/cards', validateBody(cardSchema), async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));
  const list = await List.findOne({ _id: req.params.listId, board: board.id });
  if (!list) return next(notFound('List not found'));

  const card = await Card.create({ ...req.body, board: board.id, list: list.id });
  return res.status(201).json({ card });
});

router.patch('/:boardId/lists/:listId/cards/:cardId', validateBody(cardUpdateSchema), async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));
  const list = await List.findOne({ _id: req.params.listId, board: board.id });
  if (!list) return next(notFound('List not found'));

  const card = await Card.findOneAndUpdate(
    { _id: req.params.cardId, board: board.id, list: list.id },
    req.body,
    { new: true }
  ).lean();
  if (!card) return next(notFound('Card not found'));
  return res.json({ card });
});

router.delete('/:boardId/lists/:listId/cards/:cardId', async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));
  const list = await List.findOne({ _id: req.params.listId, board: board.id });
  if (!list) return next(notFound('List not found'));

  const deleted = await Card.findOneAndDelete({ _id: req.params.cardId, board: board.id, list: list.id });
  if (!deleted) return next(notFound('Card not found'));
  return res.status(204).send();
});

export default router;
