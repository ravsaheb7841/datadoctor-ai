import asyncio
import sys

sys.path.insert(0, ".")

async def test_chat():
    from app.utils.database import connect_db, get_db, close_db
    from app.services.ai_service import process_chat_query

    await connect_db()
    db = await get_db()

    dataset = await db.datasets.find_one(
        sort=[("created_at", -1)]
    )

    if dataset:
        dataset_id = str(dataset["_id"])

        print(f"Dataset: {dataset.get('filename')}")

        questions = [
            "hi",
            "who are you",
            "how many rows",
            "what is the average of Unit_Price",
            "which column has highest value",
            "what is the dataset name",
            "are there missing values",
        ]

        for q in questions:
            print(f"\n--- {q} ---")

            try:
                response = await process_chat_query(
                    dataset_id,
                    q,
                    db
                )

                print(
                    f"Source: {response.get('source', 'unknown')}"
                )

                print(
                    f"Answer: "
                    f"{response.get('answer', 'NO ANSWER')[:200]}"
                )

            except Exception as e:
                print(f"ERROR: {type(e).__name__}: {e}")

    else:
        print("No dataset found in MongoDB.")

    await close_db()


asyncio.run(test_chat())
