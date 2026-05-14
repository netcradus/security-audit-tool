import sqlite3
import json
from datetime import datetime

DB_NAME = "scan_history.db"


def get_connection():

    return sqlite3.connect(DB_NAME)


def init_db():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (

        scan_id TEXT PRIMARY KEY,
        target TEXT,
        status TEXT,
        results TEXT,
        report TEXT,
        error TEXT,
        created_at TEXT
    )
    """)

    conn.commit()

    conn.close()


def create_scan(scan_id, target):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO scans (
        scan_id,
        target,
        status,
        created_at
    )
    VALUES (?, ?, ?, ?)
    """, (
        scan_id,
        target,
        "running",
        datetime.now().isoformat()
    ))

    conn.commit()

    conn.close()


def update_scan(
    scan_id,
    status,
    results=None,
    report=None,
    error=None
):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    UPDATE scans
    SET
        status = ?,
        results = ?,
        report = ?,
        error = ?
    WHERE scan_id = ?
    """, (
        status,
        json.dumps(results) if results else None,
        report,
        error,
        scan_id
    ))

    conn.commit()

    conn.close()


def get_scan(scan_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM scans
    WHERE scan_id = ?
    """, (scan_id,))

    row = cursor.fetchone()

    conn.close()

    if not row:
        return None

    return {
        "scan_id": row[0],
        "target": row[1],
        "status": row[2],
        "results": json.loads(row[3]) if row[3] else {},
        "report": row[4],
        "error": row[5],
        "created_at": row[6]
    }


def get_all_scans():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM scans
    ORDER BY created_at DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    history = {}

    for row in rows:

        history[row[0]] = {
            "target": row[1],
            "status": row[2],
            "results": json.loads(row[3]) if row[3] else {},
            "report": row[4],
            "error": row[5],
            "created_at": row[6]
        }

    return history