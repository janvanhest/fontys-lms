import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

export const SEED_ACTIVITIES: Omit<Activity, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>[] = [
  {
    portflowId: 7178,
    title: 'Context helder krijgen',
    description: 'Analyseer en beschrijf de projectcontext.',
    position: 1,
    type: 'opdracht',
    status: 'afgerond',
    deadline: '2026-03-07',
    competencyLabel: 'Software - Analyseren - Niveau 2',
  },
  {
    portflowId: 7179,
    title: 'Probleem helder krijgen',
    description: 'Formuleer een heldere probleemstelling.',
    position: 2,
    type: 'opdracht',
    status: 'afgerond',
    deadline: '2026-03-11',
    competencyLabel: 'Software - Analyseren - Niveau 2',
  },
  {
    portflowId: 7193,
    title: 'Oorzaak en Context',
    description: 'Onderzoek de oorzaken achter het probleem.',
    position: 3,
    type: 'opdracht',
    status: 'afgerond',
    deadline: '2026-03-13',
    competencyLabel: 'Software - Analyseren - Niveau 2',
  },
  {
    portflowId: 7202,
    title: 'Opzetten vragenlijst',
    description: 'Ontwerp een vragenlijst voor stakeholders.',
    position: 4,
    type: 'opdracht',
    status: 'bezig',
    deadline: '2026-05-21',
    competencyLabel: 'Software - Adviseren - Niveau 2',
  },
  {
    portflowId: 7209,
    title: 'Stakeholderanalyse',
    description: 'Identificeer en analyseer alle stakeholders.',
    position: 5,
    type: 'opdracht',
    status: 'open',
    deadline: '2026-05-23',
    competencyLabel: 'Software - Adviseren - Niveau 2',
  },
  {
    portflowId: 7219,
    title: 'Domeinmodellen',
    description: null,
    position: 6,
    type: 'opdracht',
    status: 'open',
    deadline: '2026-05-26',
    competencyLabel: 'Software - Ontwerpen - Niveau 2',
  },
  {
    portflowId: 7237,
    title: 'Risico Tabel',
    description: null,
    position: 7,
    type: 'opdracht',
    status: 'open',
    deadline: '2026-05-28',
    competencyLabel: 'Software - Ontwerpen - Niveau 2',
  },
  {
    portflowId: 7238,
    title: 'Brainstorm',
    description: null,
    position: 8,
    type: 'workshop',
    status: 'open',
    deadline: '2026-06-04',
    competencyLabel: null,
  },
  {
    portflowId: 7239,
    title: 'Scenariovergelijkingstabel',
    description: null,
    position: 9,
    type: 'opdracht',
    status: 'open',
    deadline: '2026-06-11',
    competencyLabel: 'Software - Ontwerpen - Niveau 3',
  },
  {
    portflowId: 7180,
    title: 'Persoonlijk ontwikkelplan',
    description: 'Schrijf een persoonlijk ontwikkelplan voor dit semester.',
    position: 10,
    type: 'eigen activiteit',
    status: 'open',
    deadline: '2026-06-18',
    competencyLabel: null,
  },
];

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly repo: Repository<Activity>,
  ) {}

  /**
   * Retrieves all activities that belong to a specific student, ordered in a consistent and meaningful way. It returns the full list of activities so they can be displayed, filtered, or processed further.
   *
   * The method filters on the given student id and sorts primarily by deadline, then by position, and finally by creation date.
   *
   * Args:
   *   studentId: The identifier of the student whose activities should be retrieved.
   *
   * Returns:
   *   A promise that resolves to an array of Activity entities owned by the specified student.
   */
  findAll(studentId: string): Promise<Activity[]> {
    return this.repo
      .createQueryBuilder('activity')
      .where('activity.studentId = :studentId', { studentId })
      .orderBy('activity.deadline', 'ASC', 'NULLS LAST')
      .addOrderBy('activity.position', 'ASC')
      .addOrderBy('activity.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Retrieves a single activity that belongs to a specific student. It ensures that only activities owned by the given student can be accessed.
   *
   * If no matching activity is found, this method signals that the requested resource does not exist.
   *
   * Args:
   *   id: The identifier of the activity to look up.
   *   studentId: The identifier of the student who must own the activity.
   *
   * Returns:
   *   A promise that resolves to the Activity entity matching the given id and student.
   *
   * Raises:
   *   NotFoundException: If no activity exists with the given id for the specified student.
   */
  async findOne(id: string, studentId: string): Promise<Activity> {
    const activity = await this.repo.findOne({ where: { id, studentId } });
    if (!activity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }
    return activity;
  }

  /**
   * Creates a new activity for a given student based on the provided data. It ensures sensible defaults for optional fields before persisting the activity.
   *
   * The method returns the fully saved activity entity, which can then be used elsewhere in the application.
   *
   * Args:
   *   studentId: The identifier of the student who will own the new activity.
   *   dto: The data describing the activity to be created.
   *
   * Returns:
   *   A promise that resolves to the newly created Activity entity.
   */
  create(studentId: string, dto: CreateActivityDto): Promise<Activity> {
    const activity = this.repo.create({
      ...dto,
      studentId,
      position: dto.position ?? 0,
      status: dto.status ?? 'open',
    });
    return this.repo.save(activity);
  }

  /**
   * Updates an existing activity for a specific student with new data. It returns the persisted activity after the changes have been applied.
   *
   * This method guarantees that only activities owned by the given student are modified before saving the merged result.
   *
   * Args:
   *   id: The identifier of the activity to update.
   *   studentId: The identifier of the student who must own the activity.
   *   dto: The data containing the updated activity fields.
   *
   * Returns:
   *   A promise that resolves to the updated Activity entity.
   */
  async update(id: string, studentId: string, dto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id, studentId);
    return this.repo.save({ ...activity, ...dto });
  }

  /**
   * Removes an activity that belongs to a specific student. It performs the deletion without returning the removed entity.
   *
   * This method first verifies that the activity exists and is owned by the given student before deleting it from the repository.
   *
   * Args:
   *   id: The identifier of the activity to remove.
   *   studentId: The identifier of the student who must own the activity.
   *
   * Returns:
   *   A promise that resolves when the activity has been successfully deleted.
   */
  async remove(id: string, studentId: string): Promise<void> {
    await this.findOne(id, studentId);
    await this.repo.delete(id);
  }

  /**
   * Seeds a student's activities with a predefined set of example activities. It replaces any existing activities for that student with the seed data.
   *
   * This method is intended for non-production environments to quickly initialize or reset a student's activity list.
   *
   * Args:
   *   studentId: The identifier of the student whose activities should be seeded.
   *
   * Returns:
   *   A promise that resolves to the list of newly created Activity entities.
   *
   * Raises:
   *   Error: If the method is called while the application is running in a production environment.
   */
  async seed(studentId: string): Promise<Activity[]> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ActivityService.seed() is not allowed in production');
    }
    await this.repo.delete({ studentId });
    const activities = SEED_ACTIVITIES.map((data) => this.repo.create({ ...data, studentId }));
    return this.repo.save(activities);
  }
}
