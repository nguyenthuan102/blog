import { Controller, Get } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('categories')
@ApiTags('Category')
@ApiBearerAuth()
export class CategoryController {
    constructor(private categoryService:CategoryService){}

    @Get()
    findAll():Promise<Category[]>{
        return this.categoryService.findAll();
    }
}
