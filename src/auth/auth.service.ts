import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDTO } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository:Repository<User>,
        private jwtService:JwtService,
        private configService:ConfigService
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

    async refreshToken(refreshToken:string):Promise<any> {
        try {
            const verify = await this.jwtService.verifyAsync(refreshToken,{
                secret:this.configService.get<string>('SECRET')
            });
            const checkExistToken = await this.userRepository.findOneBy({email:verify.email.refreshToken});
            if(checkExistToken){
                return this.generateToken({id:verify.id,email:verify.email})
            } else {
                throw new HttpException('Refresh token is not valid',HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            throw new HttpException('Refresh token is not valid',HttpStatus.BAD_REQUEST);
        }
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
            secret:this.configService.get<string>('SECRET'),
            expiresIn:this.configService.get<string>('EXP_IN_REFRESH_TOKEN')
        });
        await this.userRepository.update(
            {email: payload.email},
            {refreshToken:refreshToken}
        )
        return {accessToken,refreshToken};
    }
}
