import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { FilterUserDTO } from './dto/filter-user.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

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
}
