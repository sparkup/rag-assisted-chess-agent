"""Service module to interact with the Lichess opening explorer API.

This service provides functionality to fetch chess move evaluations from Lichess
based on a given FEN (Forsyth-Edwards Notation) string representing the board state.
"""

import requests

LICHESS_API_URL = "https://explorer.lichess.ovh/lichess"

def get_lichess_eval(fen: str):
    """
    Fetches move evaluations from the Lichess opening explorer for a given board state.

    Parameters:
        fen (str): A FEN string representing the current chess board position.

    Returns:
        list of dict: A list of moves with evaluation data. Each move dictionary contains:
            - 'uci': The move in UCI notation.
            - 'san': The move in Standard Algebraic Notation.
            - 'white': Number of wins for White after this move.
            - 'draws': Number of draws after this move.
            - 'black': Number of wins for Black after this move.

    Behavior:
        Sends a GET request to the Lichess opening explorer API with the FEN parameter.
        If the request is successful, returns the list of moves with their statistics.
        If the request fails or an exception occurs, returns an empty list.
    """
    try:
        # Send a GET request to the Lichess API with the provided FEN string
        response = requests.get(LICHESS_API_URL, params={"fen": fen}, timeout=5)
        response.raise_for_status()
        data = response.json()

        # Extract move information from the response data
        moves = [
            {
                "uci": move["uci"],
                "san": move["san"],
                "white": move["white"],
                "draws": move["draws"],
                "black": move["black"]
            }
            for move in data.get("moves", [])
        ]
        return moves
    except requests.RequestException:
        # Return an empty list if the request fails
        return []