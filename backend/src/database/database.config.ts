import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Order, Item } from '../modules/orders/entities';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: 'kds.db',
  entities: [Order, Item],
  synchronize: true,
};
