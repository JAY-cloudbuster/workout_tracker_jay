import { Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../types';
import Workout from '../models/Workout';

class ExportController {
  exportCSV = catchAsync(async (req: AuthRequest, res: Response) => {
    // Fetch all completed workouts for the user
    const workouts = await Workout.find({ user: req.user!._id, isCompleted: true })
      .populate('exercises.exercise', 'name')
      .sort({ date: -1 });

    let csvContent = 'Workout Name,Date,Duration (min),Location,Tags,Exercise Order,Exercise Name,Set Number,Weight,Reps,RPE,Rest Time,Type\n';

    workouts.forEach((workout) => {
      const wDate = workout.date.toISOString().split('T')[0];
      const wName = `"${workout.name.replace(/"/g, '""')}"`;
      const wLoc = workout.location ? `"${workout.location.replace(/"/g, '""')}"` : '';
      const wTags = `"${workout.tags.join(', ')}"`;

      workout.exercises.forEach((ex) => {
        const exName = ex.exercise ? `"${(ex.exercise as any).name.replace(/"/g, '""')}"` : 'Unknown';
        const exOrder = ex.order;

        ex.sets.forEach((set) => {
          csvContent += `${wName},${wDate},${workout.duration || ''},${wLoc},${wTags},${exOrder},${exName},${set.setNumber},${set.weight},${set.reps},${set.rpe || ''},${set.restTime || ''},${set.setType}\n`;
        });
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="workouts_export.csv"');
    res.status(200).send(csvContent);
  });
}

export default new ExportController();
