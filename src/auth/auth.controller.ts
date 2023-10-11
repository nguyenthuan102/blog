import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterUserDTO } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDTO } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService:AuthService){}

    @Post('register')
    register(@Body() registerUserDTO:RegisterUserDTO):Promise<User> {
        return this.authService.register(registerUserDTO);
    }

    @Post('login')
    @UsePipes(ValidationPipe)
    login(@Body() loginUserDTO:LoginUserDTO):Promise<any> {
        return this.authService.login(loginUserDTO);
    }

    @Post('refresh-token')
    refreshToken(@Body() {refreshToken}):Promise<any> {
        return this.authService.refreshToken(refreshToken);
    }
}
