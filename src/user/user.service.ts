import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Like, Repository, UpdateResult } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/update-user.dto';
import { FilterUserDTO } from './dto/filter-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository:Repository<User>){}
    async findAll(query:FilterUserDTO):Promise<any> {
        const items_per_page = Number(query.items_per_page) || 10;
        const page = Number(query.page) || 1;
        const skip = (page - 1)*items_per_page;
        const keyword = query.search || "";
        const [res, total] = await this.userRepository.findAndCount({
            where: [
                {firstName:Like('%' + keyword + '%')},
                {lastName:Like('%' + keyword + '%')},
                {email:Like('%' + keyword + '%')},
            ],
            order: {createdAt:"DESC"},
            take: items_per_page,
            skip: skip,
            select:['id','firstName','lastName','email','status','createdAt','updatedAt']
        })
        const lastPage = Math.ceil(total/items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page -1 < 1 ? null : page - 1;
        return {
            data: res,
            total,
            currentPage: page,
            nextPage,
            prevPage,
            lastPage
        }
    }

    async findOne(id:number):Promise<User> {
        return await this.userRepository.findOneBy({id});
    }

    async createUser(createUserDTO:CreateUserDTO):Promise<User> {
        const hashPassWord = await bcrypt.hash(createUserDTO.password,10);
        return await this.userRepository.save(createUserDTO);
    }

    async update(id:number, updateUserDTO: UpdateUserDTO):Promise<UpdateResult> {
        return await this.userRepository.update(id,updateUserDTO);
    }

    async delete(id: number):Promise<DeleteResult> {
        return await this.userRepository.delete(id);
    }
}
