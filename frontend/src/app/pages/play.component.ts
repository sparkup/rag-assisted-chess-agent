import {
    Component,
    AfterViewInit,
    ViewChild,
    ElementRef,
    OnDestroy,
} from "@angular/core";
import { Chess } from "chess.js";
import { MoveChange } from "ngx-chess-board";
import { environment } from "../../environments/environment";

@Component({
    selector: "app-home-chess",
    templateUrl: "./play.component.html",
    styleUrls: ["./play.component.scss"],
})
// Play view allows users to interactively play chess, load positions, and explore moves.
export class PlayComponent implements AfterViewInit, OnDestroy {
    fen: string | null = null;
    boardSize = 400;
    skillLevel = 10;
    isThinking = false;
    playerColor: "white" | "black" = "white";
    skillLevels = Array.from({ length: 21 }, (_, i) => i);
    private skipNextClear = false;
    isReversed = false;
    lastMoveSquares: { from: string; to: string } | null = null;

    @ViewChild("board") board!: unknown;
    @ViewChild("boardWrapper") boardWrapper!: ElementRef<HTMLDivElement>;

    private resizeObserver?: ResizeObserver;
    private readonly base = environment.apiBaseUrl;
    private game = new Chess();
    private lastFen: string | null = null;

    ngAfterViewInit() {
        // Responsive board sizing: adjust board size based on container width.
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;

                // Reserve some breathing room so the board never touches the panel edges.
                const size = Math.floor(width - 32);

                // Clamp to reasonable bounds for usability.
                this.boardSize = Math.max(240, Math.min(size, 520));
            }
        });

        this.resizeObserver.observe(this.boardWrapper.nativeElement);

        // Load the initial position if fen is set.
        if (this.fen !== null && this.board) {
            (this.board as any).setFEN(this.fen);
        }
        this.lastFen = this.game.fen();
    }

    ngOnDestroy() {
        this.resizeObserver?.disconnect();
    }

    // Reset the game and board to the starting position.
    reset() {
        this.game.reset();
        if (this.board) {
            (this.board as any).reset();
        }
        this.lastFen = this.game.fen();
        this.lastMoveSquares = null;
    }

    // Flip the board orientation.
    flip() {
        if (this.board) {
            (this.board as any).reverse();
        }
        this.isReversed = !this.isReversed;
    }

    // Load the FEN position into the game and board if fen is valid.
    loadFen() {
        if (this.fen) {
            this.game.load(this.fen);
            if (this.board) {
                (this.board as any).setFEN(this.fen);
            }
            this.lastFen = this.game.fen();
            this.lastMoveSquares = null;
            this.maybeTriggerAiMove(this.fen);
        }
    }

    onMoveChange(change: MoveChange) {
        if (!change?.fen) {
            return;
        }
        this.skipNextClear = true;
        if (this.lastFen && change.fen !== this.lastFen) {
            this.lastMoveSquares = this.computeMoveFromFen(
                this.lastFen,
                change.fen,
            );
        }
        this.game.load(change.fen);
        this.lastFen = change.fen;
        this.maybeTriggerAiMove(change.fen);
    }

    clearSelection() {
        if (this.skipNextClear) {
            this.skipNextClear = false;
            return;
        }
        const currentFen =
            this.board && (this.board as any).getFEN
                ? (this.board as any).getFEN()
                : null;
        if (!currentFen) {
            return;
        }
        this.game.load(currentFen);
        (this.board as any).setFEN(currentFen);
    }

    getSquareStyle(square: string) {
        const tile = this.boardSize / 8;
        const file = square.charCodeAt(0) - "a".charCodeAt(0);
        const rank = parseInt(square[1], 10);
        if (Number.isNaN(file) || Number.isNaN(rank)) {
            return {};
        }
        const col = this.isReversed ? 7 - file : file;
        const row = this.isReversed ? rank - 1 : 8 - rank;
        return {
            width: `${tile}px`,
            height: `${tile}px`,
            left: `${col * tile}px`,
            top: `${row * tile}px`,
        };
    }

    private computeMoveFromFen(prevFen: string, nextFen: string) {
        try {
            const prev = new Chess(prevFen);
            const moves = prev.moves({ verbose: true }) as Array<{
                from: string;
                to: string;
                promotion?: string;
            }>;
            for (const move of moves) {
                const test = new Chess(prevFen);
                test.move(move);
                if (test.fen() === nextFen) {
                    return { from: move.from, to: move.to };
                }
            }
        } catch {
            return null;
        }
        return null;
    }

    private maybeTriggerAiMove(fen: string) {
        if (this.isThinking) {
            return;
        }
        const sideToMove = fen.split(" ")[1];
        const aiSide = this.playerColor === "white" ? "b" : "w";
        if (sideToMove !== aiSide) {
            return;
        }
        void this.requestAiMove(fen);
    }

    private async requestAiMove(fen: string) {
        this.isThinking = true;
        try {
            const res = await fetch(
                `${this.base}/best-move/${encodeURIComponent(
                    fen,
                )}?skill=${this.skillLevel}`,
            );
            const data = await res.json();
            if (!data?.best_move) {
                return;
            }
            this.applyUciMove(data.best_move);
        } finally {
            this.isThinking = false;
        }
    }

    private applyUciMove(uci: string) {
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const promotion = uci.length > 4 ? uci[4] : undefined;
        this.game.move({ from, to, promotion });
        if (this.board) {
            (this.board as any).move(uci);
        }
    }
}
