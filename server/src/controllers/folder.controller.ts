import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import Folder from '../models/Folder';
import { AuthRequest } from '../types';
import { NotFoundError, ForbiddenError } from '../utils/AppError';

class FolderController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const { name, parentFolder, color } = req.body;
    const folder = await Folder.create({
      user: req.user!._id,
      name,
      parentFolder,
      color,
    });
    res.status(201).json({ success: true, data: folder });
  });

  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const folders = await Folder.find({ user: req.user!._id }).populate('parentFolder');
    res.json({ success: true, data: folders });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const folder = await Folder.findById(req.params.id);
    if (!folder) throw new NotFoundError('Folder not found');
    if (folder.user.toString() !== req.user!._id.toString()) throw new ForbiddenError('Not authorized');

    const { name, parentFolder, color } = req.body;
    folder.name = name || folder.name;
    folder.parentFolder = parentFolder !== undefined ? parentFolder : folder.parentFolder;
    folder.color = color || folder.color;

    await folder.save();
    res.json({ success: true, data: folder });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    const folder = await Folder.findById(req.params.id);
    if (!folder) throw new NotFoundError('Folder not found');
    if (folder.user.toString() !== req.user!._id.toString()) throw new ForbiddenError('Not authorized');

    await Folder.findByIdAndDelete(req.params.id);
    // Note: Would need to handle cascading deletes or removing references from workouts, 
    // but for simplicity we just delete the folder itself.
    res.json({ success: true, message: 'Folder deleted' });
  });
}

export default new FolderController();
