from fastapi import APIRouter, HTTPException
from urllib.parse import unquote
import chess
from app.services.lichess_service import get_lichess_eval
from app.services.stockfish_service import evaluate_with_stockfish, best_move_with_stockfish
from app.services.youtube_service import search_youtube_videos
from app.utils.chess_validator import validate_fen

"""
This module defines the chess API router with endpoints for retrieving legal moves
and evaluating chess positions based on FEN strings.

Endpoints:
- GET /api/v1/moves/{fen:path}: Returns legal moves for the given FEN and Lichess evaluation data.
- GET /api/v1/evaluate/{fen:path}: Returns Stockfish evaluation of the given FEN position.
"""

router = APIRouter(prefix="/api/v1", tags=["Chess"])

@router.get("/moves/{fen:path}")
async def get_legal_moves(fen: str):
    """
    Retrieve all legal moves for a given chess position in FEN notation.

    Parameters:
    - fen (str): The FEN string representing the chess position. It is URL-decoded and validated.

    Validation:
    - Raises HTTP 400 if the FEN string is invalid.

    Returns:
    - dict: Contains "legal_moves" (list of SAN moves) and "lichess_eval" (evaluation data from Lichess).
    """
    fen = unquote(fen)
    if not validate_fen(fen):
        raise HTTPException(status_code=400, detail="Invalid FEN string")
    board = chess.Board(fen)
    legal_moves = [board.san(move) for move in board.legal_moves]
    lichess_data = get_lichess_eval(fen)
    return {"legal_moves": legal_moves, "lichess_eval": lichess_data}

@router.get("/evaluate/{fen:path}")
async def evaluate_position(fen: str):
    """
    Evaluate a chess position using Stockfish engine based on the given FEN string.

    Parameters:
    - fen (str): The FEN string representing the chess position. It is URL-decoded and validated.

    Validation:
    - Raises HTTP 400 if the FEN string is invalid.

    Returns:
    - dict: Contains "evaluation" with Stockfish's analysis of the position.
    """
    fen = unquote(fen)
    if not validate_fen(fen):
        raise HTTPException(status_code=400, detail="Invalid FEN string")
    evaluation = evaluate_with_stockfish(fen)
    return {"evaluation": evaluation}


@router.get("/best-move/{fen:path}")
async def best_move(fen: str, skill: int | None = None):
    """
    Get the best move for a given chess position using Stockfish.

    Parameters:
    - fen (str): The FEN string representing the chess position. It is URL-decoded and validated.
    - skill (int | None): Optional Stockfish skill level (0-20).
    """
    fen = unquote(fen)
    if not validate_fen(fen):
        raise HTTPException(status_code=400, detail="Invalid FEN string")
    move = best_move_with_stockfish(fen, skill_level=skill)
    return {"best_move": move, "skill": skill}
