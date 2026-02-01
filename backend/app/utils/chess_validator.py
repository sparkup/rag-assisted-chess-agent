import chess

def validate_fen(fen: str) -> bool:
    try:
        chess.Board(fen)
        return True
    except ValueError:
        return False