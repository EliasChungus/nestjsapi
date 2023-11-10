import {
  Controller,
  Request,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { PostService } from './post.service';
import { User as UserModel, Post as PostModel } from '@prisma/client';
import {LocalAuthGuard} from "./auth/local-auth.guard";
import {AuthService} from "./auth/auth.service";
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import { Public } from './auth/constants';

@Controller()
export class AppController {
  constructor(
      private readonly userService: UserService,
      private readonly postService: PostService,
      private authService: AuthService
  ) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('post/:id') //fetch a single post by its id
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Public() // a public endpoint
  @Get('feed') //Fetch all published posts
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered-posts/:searchString') //Filter posts by title or content
  async getFilteredPosts(
      @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Post('post') //create a new post
  async createDraft(
      @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData;
    return this.postService.createPost({
      title, //required, the title of the post
      content, //optional, the content of the post
      author: {
        connect: { email: authorEmail }, //required, the email of the user that creates the post
      },
    });
  }

  @Post('user') //create a new user
  async signupUser(
      @Body() userData: {
        name?: string; //the name of the user
        email: string //required the email adress of the user
      },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Put('publish/:id') //publish a post by its id
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id') //delete a post by its id
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}