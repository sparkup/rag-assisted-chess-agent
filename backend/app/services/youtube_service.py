from googleapiclient.discovery import build
from fastapi import HTTPException
import os

def search_youtube_videos(query: str, max_results: int = 5):
    """
    Search for chess tutorial videos on YouTube related to the specified query.

    Parameters:
    - query (str): The search term for the chess opening (e.g., 'Italian Opening').
    - max_results (int): The maximum number of video results to return (default is 5).

    Returns:
    - List[dict]: A list of dictionaries containing video details such as title, video_id, url, embed_url, thumbnail, description, and channel.

    Raises:
    - HTTPException 500: If the YouTube API key is not configured or if there is an API error.
    - HTTPException 404: If no relevant videos are found for the given opening.
    """

    # API key loading and validation
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="YouTube API key not configured")

    try:
        # YouTube API client initialization
        youtube = build("youtube", "v3", developerKey=api_key)

        # API request construction and execution
        request = youtube.search().list(
            part="snippet",
            q=f"{query} chess opening tutorial",
            type="video",
            maxResults=max_results
        )
        response = request.execute()

        # Result parsing and filtering
        results = []
        for item in response.get("items", []):
            snippet = item["snippet"]
            title = snippet["title"]
            description = snippet["description"]

            # Filter relevant videos
            if "chess" not in title.lower() and "opening" not in description.lower():
                continue

            video_id = item["id"]["videoId"]
            results.append({
                "title": title,
                "video_id": video_id,
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "embed_url": f"https://www.youtube.com/embed/{video_id}",
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "description": description,
                "channel": snippet["channelTitle"],
            })

        if not results:
            raise HTTPException(status_code=404, detail="No relevant videos found for the given opening.")

        return results

    except Exception as e:
        # Error handling
        raise HTTPException(status_code=500, detail=f"YouTube API error: {str(e)}")