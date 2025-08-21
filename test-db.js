const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing database connection...');
  
  // Test MYSQL_URL if available
  const mysqlUrl = process.env.MYSQL_URL;
  
  if (mysqlUrl) {
    console.log('Using MYSQL_URL:', mysqlUrl.replace(/:([^:@]+)@/, ':****@'));
    try {
      const connection = await mysql.createConnection(mysqlUrl);
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ MYSQL_URL connection successful:', rows);
      await connection.end();
      return;
    } catch (error) {
      console.error('❌ MYSQL_URL connection failed:', error.message);
    }
  }
  
  // Test individual variables
  console.log('Testing individual DB variables...');
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
  
  console.log('Config:', {
    ...config,
    password: config.password ? '****' : 'undefined'
  });
  
  try {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Individual vars connection successful:', rows);
    await connection.end();
  } catch (error) {
    console.error('❌ Individual vars connection failed:', error.message);
  }
}

testConnection().catch(console.error);
