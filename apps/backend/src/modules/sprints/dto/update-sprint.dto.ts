import { PartialType } from '@nestjs/mapped-types';
import { CreateSprintDto } from './create-sprint.dto.js';

export class UpdateSprintDto extends PartialType(CreateSprintDto) {}
