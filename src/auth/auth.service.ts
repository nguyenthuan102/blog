import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDTO } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository:Repository<User>,
        private jwtService:JwtService
    ){}

    async register(registerUserDTO:RegisterUserDTO):Promise<User> {
        const hashPassWord = await this.hashPassWord(registerUserDTO.password);
        return await this.userRepository.save({...registerUserDTO,refreshToken:"refresh_token_string",password:hashPassWord});
    }

    async login(loginUserDTO:LoginUserDTO):Promise<any> {
        const user = await this.userRepository.findOne(
            {
                where:{email:loginUserDTO.email}
            }
        )
        if(!user) {
            throw new HttpException("Email is not exist",HttpStatus.UNAUTHORIZED);
        }
        const checkPass = bcrypt.compareSync(loginUserDTO.password,user.password);

        if(!checkPass) {
            throw new HttpException('Password is not correct',HttpStatus.UNAUTHORIZED);
        }
        // generate access token and refresh token
         const payload = {id:user.id, email:user.email};
         return this.generateToken(payload);
    }

    private async hashPassWord(password: string):Promise<string> {
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hash = await bcrypt.hash(password,salt);
        return hash;
    }

    private async generateToken(payload: {id:number,email:string}) {
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload,{
            secret:'123456',
            expiresIn:'1h'
        });
        await this.userRepository.update(
            {email: payload.email},
            {refreshToken:refreshToken}
        )
        return {accessToken,refreshToken};
    }
}
