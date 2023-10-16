import { Category } from "src/category/entities/category.entity";

export class UpdatePostDTO {
    title: string;

    description: string;

    thumbnail: string;

    status: number;

    category: Category;
}