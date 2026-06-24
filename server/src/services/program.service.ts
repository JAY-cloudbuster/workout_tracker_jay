import Program, { IProgram } from '../models/Program';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { CreateProgramInput, UpdateProgramInput } from '../validators/workout.validator';
import { PaginatedResult } from '../types';

class ProgramService {
  /**
   * Create a new program
   */
  async createProgram(userId: string, input: CreateProgramInput): Promise<IProgram> {
    // Deactivate other active programs if this one is active
    await Program.updateMany(
      { user: userId, isActive: true },
      { isActive: false }
    );

    const program = await Program.create({
      ...input,
      user: userId,
      startDate: input.startDate ? new Date(input.startDate) : new Date(),
      isActive: true,
    });

    return program;
  }

  /**
   * Get all programs for a user
   */
  async getPrograms(
    userId: string,
    page: number = 1,
    limit: number = 20,
    sort: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedResult<IProgram>> {
    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };

    const [programs, total] = await Promise.all([
      Program.find({ user: userId }).sort(sortObj).skip(skip).limit(limit),
      Program.countDocuments({ user: userId }),
    ]);

    return {
      data: programs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get single program
   */
  async getProgram(userId: string, programId: string): Promise<IProgram> {
    const program = await Program.findById(programId)
      .populate('mesocycles.microcycles.days.exercises.exercise');

    if (!program) {
      throw new NotFoundError('Program not found');
    }

    if (program.user.toString() !== userId && !program.isPublic) {
      throw new ForbiddenError('Not authorized to view this program');
    }

    return program;
  }

  /**
   * Get active program
   */
  async getActiveProgram(userId: string): Promise<IProgram | null> {
    return Program.findOne({ user: userId, isActive: true })
      .populate('mesocycles.microcycles.days.exercises.exercise');
  }

  /**
   * Update a program
   */
  async updateProgram(
    userId: string,
    programId: string,
    input: UpdateProgramInput
  ): Promise<IProgram> {
    const program = await Program.findById(programId);

    if (!program) {
      throw new NotFoundError('Program not found');
    }

    if (program.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized to modify this program');
    }

    Object.assign(program, input);
    await program.save();
    return program;
  }

  /**
   * Delete a program
   */
  async deleteProgram(userId: string, programId: string): Promise<void> {
    const program = await Program.findById(programId);

    if (!program) {
      throw new NotFoundError('Program not found');
    }

    if (program.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized to delete this program');
    }

    await Program.findByIdAndDelete(programId);
  }

  /**
   * Activate a program
   */
  async activateProgram(userId: string, programId: string): Promise<IProgram> {
    const program = await Program.findById(programId);

    if (!program) {
      throw new NotFoundError('Program not found');
    }

    if (program.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized');
    }

    // Deactivate all other programs
    await Program.updateMany(
      { user: userId, isActive: true },
      { isActive: false }
    );

    program.isActive = true;
    program.startDate = new Date();
    program.currentWeek = 1;
    program.currentDay = 1;
    await program.save();

    return program;
  }

  /**
   * Advance program to next day/week
   */
  async advanceProgram(userId: string, programId: string): Promise<IProgram> {
    const program = await Program.findById(programId);

    if (!program) {
      throw new NotFoundError('Program not found');
    }

    if (program.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized');
    }

    program.currentDay++;
    if (program.currentDay > program.daysPerWeek) {
      program.currentDay = 1;
      program.currentWeek++;
    }

    await program.save();
    return program;
  }
}

export default new ProgramService();
