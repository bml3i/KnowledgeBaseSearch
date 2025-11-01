const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function createPoolFromEnv() {
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  if (process.env.DB_SSL_MODE === 'require') {
    config.ssl = {
      require: true,
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    };
  }

  return new Pool(config);
}

async function initializeDatabase() {
  const pool = createPoolFromEnv();
  try {
    console.log('Initializing database...');
    
    // 检查数据库表是否已存在
    const tableExists = await checkIfTableExists(pool, 'kb_records');
    
    if (!tableExists) {
      // 如果表不存在，则创建表结构和初始数据
      console.log('Tables do not exist. Creating database structure...');
      
      // 读取SQL文件
      const sqlFilePath = path.join(__dirname, 'init.sql');
      const sql = fs.readFileSync(sqlFilePath, 'utf8');
      
      // 执行SQL
      await pool.query(sql);
      
      console.log('Database initialized successfully');
    } else {
      console.log('Database tables already exist. Skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 检查表是否存在
async function checkIfTableExists(pool, tableName) {
  try {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [tableName]
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };