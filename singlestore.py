import singlestoredb as s2
from vidgen2 import video_to_blob
import json
conn = s2.connect("purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab")

with conn.cursor() as cur:
    # Commit table creation
    cur.execute('SELECT video_id, name, description, video_data, transcript FROM Videos WHERE video_id=%s;', (1,))
    
    # Fetch the video record
    video_record = cur.fetchone()

    if video_record:
        video_id, name, description, video_data, transcript = video_record

        # Save the video data back to a file
        video_file_path = f'{name}1.mp4'
        with open(video_file_path, 'wb') as video_file:
            video_file.write(video_data)

        print(f'Video "{name}" has been saved to {video_file_path}')
        print(f'Description: {description}')
        print(f'Transcript: {transcript}')
    else:
        print("Video not found")

    conn.commit()