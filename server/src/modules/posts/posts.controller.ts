import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('admin/posts')
@UseGuards(AdminGuard) // All post management requires admin access
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  async create(@Body() postData: any, @Req() req: any) {
    // Add author_id from authenticated user
    return this.postsService.create({
      ...postData,
      author_id: req.user.id,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() postData: any) {
    return this.postsService.update(id, postData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}
