import sqlite3

connection = sqlite3.connect('database.db')


with open('schema.sql') as f:
    connection.executescript(f.read())

cur = connection.cursor()

cur.execute("INSERT INTO locations (title, lat1, lat2, lon1, lon2, category) VALUES (?, ?, ?, ?, ?, ?)",
            ('Some place 1', 1.2, 1.3, 1.4, 1.5, 'hotel')
            )

cur.execute("INSERT INTO locations (title, lat1, lat2, lon1, lon2, category) VALUES (?, ?, ?, ?, ?, ?)",
            ('Some place 2', 1.2, 1.3, 1.4, 1.5, 'cafe')
            )

connection.commit()
connection.close()