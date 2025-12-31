import { Router } from 'express';
import { z } from 'zod';
import { authGuard } from '../middleware/auth';
import { Board } from '../models/Board';
import { Card } from '../models/Card';
import { badRequest, notFound, unauthorized } from '../utils/errors';
import { validateBody } from '../middleware/validate';

const router = Router();

const boardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const boardUpdateSchema = boardSchema.partial();

const cardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  position: z.number().optional(),
});

const cardUpdateSchema = cardSchema.partial();

router.use(authGuard);

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
  await Card.deleteMany({ board: req.params.boardId });
  return res.status(204).send();
});

router.get('/:boardId/cards', async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));
  const cards = await Card.find({ board: board.id }).sort({ position: 1, createdAt: 1 }).lean();
  return res.json({ cards });
});

router.post('/:boardId/cards', validateBody(cardSchema), async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));

  const card = await Card.create({ ...req.body, board: board.id });
  return res.status(201).json({ card });
});

router.patch('/:boardId/cards/:cardId', validateBody(cardUpdateSchema), async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));

  const card = await Card.findOneAndUpdate(
    { _id: req.params.cardId, board: board.id },
    req.body,
    { new: true }
  ).lean();
  if (!card) return next(notFound('Card not found'));
  return res.json({ card });
});

router.delete('/:boardId/cards/:cardId', async (req, res, next) => {
  if (!req.user) return next(unauthorized());
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user.id });
  if (!board) return next(notFound('Board not found'));

  const deleted = await Card.findOneAndDelete({ _id: req.params.cardId, board: board.id });
  if (!deleted) return next(notFound('Card not found'));
  return res.status(204).send();
});

export default router;
