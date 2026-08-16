import asyncio
import sys
sys.path.insert(0, '.')

async def test_eda():
    from app.utils.database import connect_db, get_db, close_db
    from app.services.eda_service import generate_eda
    from bson import ObjectId
    
    await connect_db()
    db = await get_db()
    
    # Get latest dataset
    dataset = await db.datasets.find_one(sort=[('created_at', -1)])
    if dataset:
        dataset_id = str(dataset['_id'])
        print(f'Testing EDA for: {dataset.get("filename")}')
        
        eda = await generate_eda(dataset_id, db)
        
        print(f'\n=== Summary ===')
        for key, value in eda['summary'].items():
            print(f'  {key}: {value}')
        
        print(f'\n=== Numerical Analysis ===')
        for num in eda['numerical_analysis']:
            print(f'  {num["column"]} ({num["semantic_type"]})')
        
        print(f'\n=== Categorical Analysis ===')
        for cat in eda['categorical_analysis']:
            print(f'  {cat["column"]} ({cat["unique_count"]} unique)')
        
        print(f'\n=== Identifier Summary ===')
        for id_info in eda['identifier_summary']:
            print(f'  {id_info["column"]}')
        
        print(f'\n=== Correlation ===')
        if eda['correlation_analysis'].get('strong_correlations'):
            for corr in eda['correlation_analysis']['strong_correlations']:
                print(f'  {corr["col1"]} ↔ {corr["col2"]}: {corr["correlation"]:.3f}')
        else:
            print('  No strong correlations')
        
        print(f'\n=== Outliers ===')
        for out in eda['outlier_analysis']:
            print(f'  {out["column"]}: {out["outlier_count"]} outliers')
        
        print(f'\n=== Time Analysis ===')
        if eda['time_analysis']:
            print(f'  {eda["time_analysis"]["column"]}')
        else:
            print('  No datetime columns')
    
    await close_db()

asyncio.run(test_eda())