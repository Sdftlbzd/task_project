import 'dotenv/config'

export const appConfig = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    VALIDITY_MINUTE_MAIL: 5,
    CREATE_PASS_URL: process.env.CREATE_PASS_URL,
    VERIFY_URL: process.env.VERIFY_URL,  
    MY_SQL_PORT: process.env.MY_SQL_PORT,
    LOCALHOST: process.env.LOCALHOST,
    MY_SQL_USERNAME: process.env.MY_SQL_USERNAME,
    MY_SQL_PASSWORD: process.env.MY_SQL_PASSWORD,
    MY_SQL_DATABASE:process.env.MY_SQL_DATABASE 
  };
  