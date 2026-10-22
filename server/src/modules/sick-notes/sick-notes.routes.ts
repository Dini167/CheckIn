import { Router } from 'express';
import multer from 'multer';
import { rules } from '../../config/rules';
import { requireAuth, requireRole } from '../../common/auth';
import * as controller from './sick-notes.controller';

// Files are kept in memory and saved into the database (free hosts wipe their disks on restart).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: rules.sickNoteMaxBytes, files: 1, fields: 5 },
});

export const sickNotesRouter = Router();

sickNotesRouter.use(requireAuth);
sickNotesRouter.post('/', upload.single('file'), controller.create);
sickNotesRouter.get('/mine', controller.mine);
sickNotesRouter.get('/team', requireRole('TEAM_LEADER'), controller.team);
sickNotesRouter.get('/:id/file', controller.file);
sickNotesRouter.patch('/:id/review', requireRole('TEAM_LEADER'), controller.review);
