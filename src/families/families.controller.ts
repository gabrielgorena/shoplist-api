import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator.js';
import { FamiliesService } from './families.service.js';
import { CreateFamilyDto } from './dto/create-family.dto.js';
import { JoinFamilyDto } from './dto/join-family.dto.js';

@Controller('families')
@UseGuards(AuthGuard)
export class FamiliesController {
  constructor(private readonly families: FamiliesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFamilyDto) {
    return this.families.createFamily(user.id, dto.name);
  }

  @Post('join')
  join(@CurrentUser() user: AuthUser, @Body() dto: JoinFamilyDto) {
    return this.families.joinFamily(user.id, dto.code);
  }

  @Get('me')
  getMyFamily(@CurrentUser() user: AuthUser) {
    return this.families.getMyFamily(user.id);
  }

  @Get('members')
  getMembers(@CurrentUser() user: AuthUser) {
    return this.families.getMembers(user.id);
  }
}
