"""API router for YouTube-related endpoints, providing access to tutorial videos based on chess openings."""

from fastapi import APIRouter
from app.services.youtube_service import search_youtube_videos

# Router exposing YouTube-related endpoints
router = APIRouter(prefix="/api/v1", tags=["YouTube"])

@router.get("/videos/{opening}", tags=["YouTube"])
async def get_youtube_videos(opening: str, max_results: int = 5):
    """
    Retrieve relevant YouTube tutorial videos for a specified chess opening.

    Parameters:
    - opening (str): The name of the chess opening to search videos for.
    - max_results (int, optional): Maximum number of video results to return (default is 5).

    Returns:
    A JSON object containing:
    - 'query': The original opening string queried.
    - 'results': A list of video information dictionaries matching the search criteria.
    """
    # Delegate the video search logic to the search_youtube_videos service function
    videos = search_youtube_videos(opening, max_results)
    return {"query": opening, "results": videos}