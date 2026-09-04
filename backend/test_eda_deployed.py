import httpx
import asyncio
import time

API_URL = "https://datadoctor-ai.onrender.com"


async def test_eda_error():
    async with httpx.AsyncClient(timeout=60.0) as client:

        # Register test user
        email = f"edatest_{time.time()}@datadoctor.ai"

        reg_resp = await client.post(
            f"{API_URL}/api/auth/register",
            json={
                "name": "EDA Test",
                "email": email,
                "password": "Test@123456",
                "confirm_password": "Test@123456"
            }
        )

        print(f"Register: {reg_resp.status_code}")

        token = None

        if reg_resp.status_code == 200:
            token = reg_resp.json().get("token")
            print("New test user registered")
        else:
            print(f"Register response: {reg_resp.text[:300]}")

            # Try existing test user
            login_resp = await client.post(
                f"{API_URL}/api/auth/login",
                json={
                    "email": "edatest@datadoctor.ai",
                    "password": "Test@123456"
                }
            )

            print(f"Login: {login_resp.status_code}")

            if login_resp.status_code == 200:
                token = login_resp.json().get("token")

        if not token:
            print("ERROR: No token available")
            return

        print(f"Token obtained: {token[:20]}...")

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Create demo dataset
        demo_resp = await client.post(
            f"{API_URL}/api/datasets/demo",
            headers=headers
        )

        print(f"\nDemo dataset: {demo_resp.status_code}")
        print(f"Demo response: {demo_resp.text[:500]}")

        if demo_resp.status_code != 200:
            print("\nERROR: Demo dataset creation failed")
            return

        demo_data = demo_resp.json()
        dataset_id = demo_data.get("_id")

        print(f"\nDataset ID: {dataset_id}")

        if not dataset_id:
            print("ERROR: Dataset ID not found")
            return

        # Test EDA endpoint
        eda_resp = await client.get(
            f"{API_URL}/api/datasets/{dataset_id}/eda",
            headers=headers
        )

        print("\n==============================")
        print(f"EDA STATUS: {eda_resp.status_code}")
        print("==============================")
        print("EDA RESPONSE:")
        print(eda_resp.text[:2000])

        if eda_resp.status_code == 200:
            print("\nSUCCESS: EDA endpoint is working!")
        else:
            print("\nFAILED: EDA endpoint returned an error.")


asyncio.run(test_eda_error())
