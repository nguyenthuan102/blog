import { Injectable } from '@nestjs/common';
import { RegisterUserDTO } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository:Repository<User>
    ){}

    async register(registerUserDTO:RegisterUserDTO):Promise<User> {
        const hashPassWord = await this.hashPassWord(registerUserDTO.password);
        return await this.userRepository.save({...registerUserDTO,refreshToken:"refresh_token_string",password:hashPassWord});
    }

    private async hashPassWord(password: string):Promise<string> {
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hash = await bcrypt.hash(password,salt);
        return hash;
    }
}
