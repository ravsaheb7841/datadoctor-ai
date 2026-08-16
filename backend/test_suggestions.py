import asyncio
import sys

sys.path.insert(0, '.')


async def test():
    from app.utils.database import connect_db, get_db, close_db
    from app.services.suggestion_service import get_dataset_suggestions

    await connect_db()
    db = await get_db()

    try:
        # Get latest dataset
        dataset = await db.datasets.find_one(
            sort=[('created_at', -1)]
        )

        if dataset:
            dataset_id = str(dataset['_id'])

            print(
                f"Testing suggestions for: "
                f"{dataset.get('filename')}"
            )

            print(
                f"Dataset ID: {dataset_id}"
            )

            suggestions = await get_dataset_suggestions(
                dataset_id,
                db
            )

            print(
                f'\nSource: '
                f'{suggestions.get("source", "unknown")}'
            )

            print('\nColumn Suggestions:')

            if suggestions.get('column_suggestions'):
                for col_sugg in suggestions['column_suggestions']:

                    print(
                        f'\n📊 Column: '
                        f'{col_sugg["column"]}'
                    )

                    for sugg in col_sugg['suggestions']:
                        print(
                            f'  [{sugg["priority"]}] '
                            f'{sugg["operation"]} - '
                            f'{sugg["method"]}'
                        )

                        print(
                            f'  Reason: '
                            f'{sugg["reason"]}'
                        )

            if suggestions.get('suggestions'):
                print('\nAI Suggestions:')
                print(suggestions['suggestions'])

        else:
            print('❌ No dataset found in database.')

    finally:
        await close_db()


asyncio.run(test())
