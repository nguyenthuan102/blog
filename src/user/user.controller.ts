import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { FilterUserDTO } from './dto/filter-user.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helpers/config';
import { extname } from 'path';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private userService:UserService){}

    @UseGuards(AuthGuard)
    @ApiQuery({name:'page'})
    @ApiQuery({name:'items_per_page'})
    @ApiQuery({name:'search'})
    @Get()
    findAll(@Query() query: FilterUserDTO): Promise<User[]> {
        return this.userService.findAll(query);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    findOne(@Param('id') id:string):Promise<User> {
        return this.userService.findOne(Number(id));
    }

    @UseGuards(AuthGuard)
    @Post()
    createUser(@Body() createUserDTO:CreateUserDTO):Promise<User> {
        return this.userService.createUser(createUserDTO);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    update(@Param('id') id:string, @Body() updateUserDTO:UpdateUserDTO) {
        return this.userService.update(Number(id),updateUserDTO);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    delete(@Param('id') id:string) {
        return this.userService.delete(Number(id));
    }

    @Post('upload-avatar')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('avatar', {
        storage:storageConfig('avatar'),
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
    }))
    uploadAvatar(@Req() req:any, @UploadedFile() file:Express.Multer.File) {
        if(req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }
        if(!file){
            throw new BadRequestException('File is required');
        }
        this.userService.updateAvatar(req.user_data.id,file.destination+'/'+file.fieldname);
    }
}
