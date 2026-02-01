import {
    Component,
    AfterViewInit,
    ViewChild,
    ElementRef,
    OnDestroy,
} from "@angular/core";
import { Chess } from "chess.js";

@Component({
    selector: "app-home-chess",
    templateUrl: "./play.component.html",
    styleUrls: ["./play.component.scss"],
})
// Play view allows users to interactively play chess, load positions, and explore moves.
export class PlayComponent implements AfterViewInit, OnDestroy {
    fen: string | null = null;
    boardSize = 400;

    @ViewChild("board") board!: unknown;
    @ViewChild("boardWrapper") boardWrapper!: ElementRef<HTMLDivElement>;

    private resizeObserver?: ResizeObserver;

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
    }

    // Flip the board orientation.
    flip() {
        if (this.board) {
            (this.board as any).reverse();
        }
    }

    // Load the FEN position into the game and board if fen is valid.
    loadFen() {
        if (this.fen) {
            this.game.load(this.fen);
            if (this.board) {
                (this.board as any).setFEN(this.fen);
            }
        }
    }

    private game = new Chess();
}
