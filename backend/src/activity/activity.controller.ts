import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { Student } from '../student/student.entity';
import { Activity } from './activity.entity';
import { ActivityService } from './activity.service';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('activities')
@Controller('activities')
export class ActivityController {
  /**
   * Creates a controller that exposes activity-related endpoints for the current student. It wires the controller to the underlying activity service used to perform operations.
   *
   * The controller uses this service to delegate all business logic and data access for activity resources.
   *
   * Args:
   *   activityService: Service responsible for managing activities and handling persistence.
   *
   * Returns:
   *   A new instance of the ActivityController with its dependencies initialized.
   */
  /**
   * Creates a controller that exposes activity-related endpoints for the current student. It wires the controller to the underlying activity service used to perform operations.
   *
   * The controller uses this service to delegate all business logic and data access for activity resources.
   *
   * Args:
   *   activityService: Service responsible for managing activities and handling persistence.
   *
   * Returns:
   *   A new instance of the ActivityController with its dependencies initialized.
   */
  constructor(private readonly activityService: ActivityService) {}

  /**
   * Converts an activity entity into a response DTO for API consumers. It removes fields that should not be exposed, such as the student identifier.
   *
   * This method ensures that the API only returns the relevant activity data in a safe and consistent shape.
   *
   * Args:
   *   param0: The activity entity to convert, including a student identifier and other activity fields.
   *
   * Returns:
   *   The activity data formatted as an ActivityResponseDto without the student identifier.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private toDto({ studentId: _studentId, ...rest }: Activity): ActivityResponseDto {
    return rest;
  }

  /**
   * Haalt alle activiteiten op die gekoppeld zijn aan de ingelogde student. De activiteiten worden teruggegeven in een vorm die geschikt is voor API-consumptie.
   *
   * Deze methode zorgt ervoor dat een student alleen zijn eigen activiteiten kan opvragen en dat de ruwe entiteiten worden omgezet naar response DTO's.
   *
   * Args:
   *   student: De momenteel ingelogde student waarvoor de activiteiten moeten worden opgehaald.
   *
   * Returns:
   *   Een lijst met ActivityResponseDto-objecten die de activiteiten van de student representeren.
   */
  @Get()
  @ApiOperation({ summary: 'Alle activiteiten van de ingelogde student' })
  @ApiOkResponse({ type: [ActivityResponseDto] })
  async findAll(@CurrentStudent() student: Student): Promise<ActivityResponseDto[]> {
    const activities = await this.activityService.findAll(student.id);
    return activities.map((a) => this.toDto(a));
  }

  /**
   * Haalt één specifieke activiteit op die gekoppeld is aan de ingelogde student. De gevonden activiteit wordt teruggegeven in een vorm die geschikt is voor API-consumptie.
   *
   * Deze methode zorgt ervoor dat een student alleen activiteiten kan opvragen die aan hem zijn gekoppeld en zet de entiteit om naar een response DTO.
   *
   * Args:
   *   id: Het id van de activiteit die moet worden opgehaald.
   *   student: De momenteel ingelogde student waarvoor de activiteit moet worden opgehaald.
   *
   * Returns:
   *   Een ActivityResponseDto die de opgevraagde activiteit van de student representeert.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Één activiteit ophalen' })
  @ApiOkResponse({ type: ActivityResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.toDto(await this.activityService.findOne(id, student.id));
  }

  /**
   * Maakt een nieuwe activiteit aan voor de ingelogde student. De aangemaakte activiteit wordt teruggegeven in een vorm die geschikt is voor API-consumptie.
   *
   * Deze methode koppelt de nieuwe activiteit aan de huidige student en zet de opgeslagen entiteit om naar een response DTO.
   *
   * Args:
   *   dto: De gegevens van de activiteit die moet worden aangemaakt.
   *   student: De momenteel ingelogde student aan wie de nieuwe activiteit wordt gekoppeld.
   *
   * Returns:
   *   Een ActivityResponseDto die de nieuw aangemaakte activiteit van de student representeert.
   */
  @Post()
  @ApiOperation({ summary: 'Nieuwe activiteit aanmaken' })
  @ApiOkResponse({ type: ActivityResponseDto })
  async create(
    @Body() dto: CreateActivityDto,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.toDto(await this.activityService.create(student.id, dto));
  }

  /**
   * Werkt een bestaande activiteit van de ingelogde student bij met nieuwe gegevens. De bijgewerkte activiteit wordt teruggegeven in een vorm die geschikt is voor API-consumptie.
   *
   * Deze methode zorgt ervoor dat alleen activiteiten van de huidige student worden aangepast en zet de bijgewerkte entiteit om naar een response DTO.
   *
   * Args:
   *   id: Het id van de activiteit die moet worden bijgewerkt.
   *   dto: De bijgewerkte gegevens voor de activiteit.
   *   student: De momenteel ingelogde student wiens activiteit wordt bijgewerkt.
   *
   * Returns:
   *   Een ActivityResponseDto die de bijgewerkte activiteit van de student representeert.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Activiteit bijwerken' })
  @ApiOkResponse({ type: ActivityResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.toDto(await this.activityService.update(id, student.id, dto));
  }

  /**
   * Verwijdert een bestaande activiteit van de ingelogde student. De verwijderde activiteit wordt niet teruggegeven in de response.
   *
   * Deze methode zorgt ervoor dat alleen activiteiten van de huidige student worden verwijderd en geeft een lege response met de juiste HTTP-status terug.
   *
   * Args:
   *   id: Het id van de activiteit die moet worden verwijderd.
   *   student: De momenteel ingelogde student wiens activiteit wordt verwijderd.
   *
   * Returns:
   *   Een promise die voltooid wordt zodra de activiteit succesvol is verwijderd.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activiteit verwijderen' })
  /**
   * Verwijdert een bestaande activiteit van de ingelogde student. De verwijderde activiteit wordt niet teruggegeven in de response.
   *
   * Deze methode zorgt ervoor dat alleen activiteiten van de huidige student worden verwijderd en geeft een lege response met de juiste HTTP-status terug.
   *
   * Args:
   *   id: Het id van de activiteit die moet worden verwijderd.
   *   student: De momenteel ingelogde student wiens activiteit wordt verwijderd.
   *
   * Returns:
   *   Een promise die voltooid wordt zodra de activiteit succesvol is verwijderd.
   */
  remove(@Param('id') id: string, @CurrentStudent() student: Student): Promise<void> {
    return this.activityService.remove(id, student.id);
  }
}
