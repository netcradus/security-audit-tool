import sqlite3
import json

from datetime import (
    datetime,
    timezone
)

DB_NAME = "scan_history.db"


# =====================================
# DATABASE CONNECTION
# =====================================

def get_connection():

    return sqlite3.connect(DB_NAME)


# =====================================
# INIT DATABASE
# =====================================

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

        started_at TEXT,

        completed_at TEXT,

        duration_seconds REAL
    )
    """)

    cursor.execute("PRAGMA table_info(scans)")
    existing_columns = {
        row[1]
        for row in cursor.fetchall()
    }

    required_columns = {
        "scan_id": "TEXT PRIMARY KEY",
        "target": "TEXT",
        "status": "TEXT",
        "results": "TEXT",
        "report": "TEXT",
        "error": "TEXT",
        "started_at": "TEXT",
        "completed_at": "TEXT",
        "duration_seconds": "REAL"
    }

    for column, column_type in required_columns.items():
        if column not in existing_columns:
            cursor.execute(
                f"ALTER TABLE scans ADD COLUMN {column} {column_type}"
            )

    conn.commit()

    conn.close()


# =====================================
# CREATE SCAN
# =====================================

def create_scan(scan_id, target):

    conn = get_connection()

    cursor = conn.cursor()

    started_at = datetime.now(
        timezone.utc
    ).isoformat()

    cursor.execute("""
    INSERT INTO scans (

        scan_id,
        target,
        status,
        started_at

    )
    VALUES (?, ?, ?, ?)
    """, (
        scan_id,
        target,
        "running",
        started_at
    ))

    conn.commit()

    conn.close()


# =====================================
# UPDATE SCAN
# =====================================

def update_scan(
    scan_id,
    status,
    results=None,
    report=None,
    error=None
):

    conn = get_connection()

    cursor = conn.cursor()

    # =====================================
    # FETCH START TIME
    # =====================================

    cursor.execute("""
    SELECT started_at
    FROM scans
    WHERE scan_id = ?
    """, (scan_id,))

    row = cursor.fetchone()

    started_at = row[0] if row else None

    completed_at = datetime.now(
        timezone.utc
    ).isoformat()

    duration_seconds = None

    # =====================================
    # CALCULATE DURATION
    # =====================================

    if started_at:

        start_time = datetime.fromisoformat(
            started_at
        )

        end_time = datetime.fromisoformat(
            completed_at
        )

        duration_seconds = (
            end_time - start_time
        ).total_seconds()

    # =====================================
    # UPDATE DATABASE
    # =====================================

    cursor.execute("""
    UPDATE scans
    SET

        status = ?,

        results = ?,

        report = ?,

        error = ?,

        completed_at = ?,

        duration_seconds = ?

    WHERE scan_id = ?
    """, (
        status,
        json.dumps(results) if results else None,
        report,
        error,
        completed_at,
        duration_seconds,
        scan_id
    ))

    conn.commit()

    conn.close()


# =====================================
# GET SINGLE SCAN
# =====================================

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

        "started_at": row[6],

        "completed_at": row[7],

        "duration_seconds": row[8]
    }


# =====================================
# GET ALL SCANS
# =====================================

def get_all_scans():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM scans
    ORDER BY started_at DESC
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

            "started_at": row[6],

            "completed_at": row[7],

            "duration_seconds": row[8]
        }

    return history
