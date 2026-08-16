import asyncio
import sys
from datetime import datetime

sys.path.insert(0, '.')

async def migrate():
    from app.utils.database import connect_db, get_db, close_db

    await connect_db()
    db = await get_db()

    # Find all issues without status field
    issues = await db.data_quality_issues.find({
        "status": {"$exists": False}
    }).to_list(None)

    print(f"Found {len(issues)} issues without status field")

    if issues:
        result = await db.data_quality_issues.update_many(
            {"status": {"$exists": False}},
            {
                "$set": {
                    "status": "active",
                    "created_at": datetime.utcnow()
                }
            }
        )

        print(f"Updated {result.modified_count} issues")

    await close_db()
    print("Migration complete")

asyncio.run(migrate())
