import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreatePostDTO } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helpers/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { extname } from 'path';
import { PostService } from './post.service';
import { FilterPostDTO } from './dto/filter-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { UpdatePostDTO } from './dto/update-post.dto';

@Controller('posts')
@ApiTags('Posts')
@ApiBearerAuth()
export class PostController {
    constructor(private postService:PostService){}
    @Post()
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('thumbnail', {
        storage:storageConfig('post'),
        fileFilter:(req, file, cb) => {
            const ext = extname(file.originalname);
            const allowedExtArr = ['jpg','png','jpeg'];
            if(!allowedExtArr.includes(ext)) {
                req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`;
                cb(null,false);
            } else {
                const fileSize = parseInt(req.headers['content-length']);
                if(fileSize > 1024 * 1024 * 5){
                    req.fileValidationError = 'File size is too large. Accepted file size is less than 5 MB';
                    cb(null,false);
                } else {
                    cb(null,true);
                }
            }
        }
    },))
    @UseGuards(AuthGuard)
    create(@Req() req:any, @Body() createPostDTO:CreatePostDTO, @UploadedFile() file:Express.Multer.File) {
        if(req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }
        if(!file){
            throw new BadRequestException('File is required');
        }
        return this.postService.create(req['user_data'].id,{...createPostDTO,thumbnail:file.destination+'/'+file.filename});
    }

    @Get()
    @UseGuards(AuthGuard)
    findAll(@Query() query:FilterPostDTO):Promise<any> {
        return this.postService.findAll(query);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    findDetail(@Param('id') id: string):Promise<PostEntity> {
        return this.postService.findDetail(Number(id));
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('thumbnail', {
        storage:storageConfig('post'),
        fileFilter:(req, file, cb) => {
            const ext = extname(file.originalname);
            const allowedExtArr = ['jpg','png','jpeg'];
            if(!allowedExtArr.includes(ext)) {
                req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`;
                cb(null,false);
            } else {
                const fileSize = parseInt(req.headers['content-length']);
                if(fileSize > 1024 * 1024 * 5){
                    req.fileValidationError = 'File size is too large. Accepted file size is less than 5 MB';
                    cb(null,false);
                } else {
                    cb(null,true);
                }
            }
        }
    },))
    @UseGuards(AuthGuard)
    update(@Param('id') id:string,@Req() req:any,@Body() updatePostDTO:UpdatePostDTO,@UploadedFile() file:Express.Multer.File){
        if(req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }
        if(file){
            updatePostDTO.thumbnail = file.destination+'/'+file.filename;
        }
        return this.postService.update(Number(id),updatePostDTO);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    delete(@Param('id') id:string){
        return this.postService.delete(Number(id));
    }

}
