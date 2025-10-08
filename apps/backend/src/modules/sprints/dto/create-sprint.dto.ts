// src/sprints/dto/create-sprint.dto.ts
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { SprintStatus } from '@sprint-manager/db/generated/client/index.js';

export class CreateSprintDto {
  @IsString()
  name!: string;

  @IsString()
  projectId!: string;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
