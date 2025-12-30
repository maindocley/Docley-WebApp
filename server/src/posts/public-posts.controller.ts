import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';

/**
 * Public controller for blog posts - no authentication required
 * Visitors can view published posts
 */
@Controller('posts')
export class PublicPostsController {
    constructor(private readonly postsService: PostsService) { }

    /**
     * GET /posts - Returns all published posts for public viewing
     */
    @Get()
    async findAllPublished() {
        return this.postsService.findPublished();
    }

    /**
     * GET /posts/:slug - Returns a single published post by slug
     */
    @Get(':slug')
    async findBySlug(@Param('slug') slug: string) {
        const post = await this.postsService.findBySlug(slug);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }
}
