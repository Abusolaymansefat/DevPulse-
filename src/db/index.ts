import { Pool } from "pg";
import config from "../config";


export const pool = new Pool({

      connectionString: config.database_url,
});

export const initDB = async () => {
      try {
            await pool.query(`
                   CREATE TABLE IF NOT EXISTS users (

                  id SERIAL PRIMARY KEY,
                  name VARCHAR(100) NOT NULL,
                  email VARCHAR(150) UNIQUE NOT NULL,
                  password TEXT NOT NULL,
                  role VARCHAR(20) NOT NULL DEFAULT 'contributor',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                  );

                  CREATE TABLE IF NOT EXISTS issues (
                  id SERIAL PRIMARY KEY,
                  title VARCHAR(150) NOT NULL,
                  description TEXT NOT NULL,
                  type VARCHAR(30) NOT NULL,
                  status VARCHAR(30) DEFAULT 'open',
                  reporter_id INT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                  );
                  
                  `);
            console.log("Database connected");
      }
      catch (error) {
            console.log(error);
      }
}