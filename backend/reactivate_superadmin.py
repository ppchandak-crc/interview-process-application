import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('d:/interview-process-application/backend/.env')

conn = psycopg2.connect(os.environ['DATABASE_URL'])
cur = conn.cursor()
cur.execute("UPDATE users SET is_active = true WHERE user_id = 'superadmin'")
conn.commit()
print(f'Rows updated: {cur.rowcount}')
cur.close()
conn.close()
