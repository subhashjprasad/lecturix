import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://api.cartesia.ai/voices/clone/clip"

api_key = os.environ["CARTESIA_API_KEY"]

with open('test.m4a', 'rb') as f:
    files = { "clip": f }
    payload = { "enhance": "true" }
    headers = {
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": api_key
    }

    # Make the first POST request
    response = requests.post(url, data=payload, files=files, headers=headers)

    # Log the status and content of the first response
    print(f"First request status code: {response.status_code}")
    print(f"First request content: {response.text}")

    try:
        # Extract the JSON response
        response_json = response.json()
        print(response_json)
        embedding = response_json.get("embedding")
        
        if embedding:
            
            import requests

            url = "https://api.cartesia.ai/tts/bytes"

            payload = {
                "model_id": "sonic-english",
                "transcript": "The quick brown fox jumps over the lazy dog.",
                "voice": {
                    "mode": "embedding",
                    "embedding": embedding
                },
                "output_format": {
                    "container": "wav",
                    "encoding": "pcm_f32le",
                    "sample_rate": 44100
                }
            }
            headers = {
                "Cartesia-Version": "2024-06-10",
                "X-API-Key": api_key,
                "Content-Type": "application/json"
            }

            response = requests.post(url, json=payload, headers=headers)

            if response.status_code == 200:
                with open('output.wav', 'wb') as audio_file:
                    audio_file.write(response.content)
                print("WAV file saved as 'output.wav'")
            else:
                print(f"Error: {response.status_code} - {response.text}")

        else:
            print("No embedding found in the first response")

    except requests.exceptions.JSONDecodeError:
        # Handle JSON decode errors
        print("First response content is not valid JSON:")
        print(response.text)