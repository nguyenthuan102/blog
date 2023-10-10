import { User } from 'src/user/entities/user.entity';
import {DataSourceOptions, DataSource} from 'typeorm';

export const dataSourceOption:DataSourceOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 33061,
    username: 'root',
    password: 'root',
    database: 'blog-nestjs',
    entities: ['dist/**/*.entity{.js,.ts}'],
    migrations: ['dist/db/migrations/*{.ts,.js}'],
    synchronize: false,
}

const dataSource = new DataSource(dataSourceOption);
export default dataSource;