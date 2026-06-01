import sqlite3
db = r'D:\AI workspace\codex+deepseek+speckit\backend\xiaoyang.db'
conn = sqlite3.connect(db)
conn.commit()
conn.close()
print('Seed complete (no default rules)')
