from stockfish import Stockfish


def evaluate_with_stockfish(fen: str):
    """
    Evaluate a chess position using the Stockfish engine.

    This function initializes a Stockfish engine instance, loads the given
    FEN position, and returns a static evaluation of the position
    (centipawn score or mate information).

    Parameters
    ----------
    fen : str
        A valid FEN (Forsyth-Edwards Notation) string representing
        the chess position to evaluate.

    Returns
    -------
    dict
        A dictionary returned by Stockfish containing the evaluation,
        typically including:
        - type: "cp" (centipawns) or "mate"
        - value: numerical evaluation score

    Notes
    -----
    The Stockfish binary path must be available inside the runtime
    environment (e.g. Docker container). Adjust the path if needed
    depending on your image or host system.
    """

    # Initialize the Stockfish engine
    stockfish = Stockfish(path="/usr/games/stockfish")

    # Load the position from the provided FEN string
    stockfish.set_fen_position(fen)

    # Return the engine's evaluation of the position
    return stockfish.get_evaluation()


def best_move_with_stockfish(fen: str, skill_level: int | None = None):
    """
    Return Stockfish's best move for a given FEN position.

    Parameters
    ----------
    fen : str
        A valid FEN (Forsyth-Edwards Notation) string representing
        the chess position to analyze.
    skill_level : int | None
        Optional Stockfish skill level (0-20). When provided, the engine
        will play closer to human strength.
    """
    stockfish = Stockfish(path="/usr/games/stockfish")

    if skill_level is not None:
        # Stockfish expects 0-20
        safe_level = max(0, min(int(skill_level), 20))
        stockfish.set_skill_level(safe_level)

    stockfish.set_fen_position(fen)
    return stockfish.get_best_move()
