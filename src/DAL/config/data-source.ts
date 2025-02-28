import { DataSource } from "typeorm";
import { appConfig } from "../../consts"; 

export const AppDataSource = new DataSource({
  type: "mysql",
  host: appConfig.LOCALHOST,
  port: Number(appConfig.MY_SQL_PORT),
  username: appConfig.MY_SQL_USERNAME,
  password: appConfig.MY_SQL_PASSWORD,
  database: appConfig.MY_SQL_DATABASE,
  entities: ['src/DAL/models/**/*.ts'],
  subscribers: [],
  migrations: [],
  logging: false,
  synchronize: true,
});

