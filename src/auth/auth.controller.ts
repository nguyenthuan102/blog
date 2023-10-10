import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDTO } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {

    constructor(private authService:AuthService){}

    @Post('register')
    register(@Body() registerUserDTO:RegisterUserDTO):Promise<User> {
        return this.authService.register(registerUserDTO);
    }

}
