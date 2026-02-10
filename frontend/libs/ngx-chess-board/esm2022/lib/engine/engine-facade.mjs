import { HistoryMove } from '../history-move-provider/history-move';
import { AbstractEngineFacade } from './abstract-engine-facade';
import { BoardLoader } from './board-state-provider/board-loader/board-loader';
import { BoardState } from './board-state-provider/board-state/board-state';
import { BoardStateProvider } from './board-state-provider/board-state/board-state-provider';
import { ClickUtils } from './click/click-utils';
import { Arrow } from './drawing-tools/shapes/arrow';
import { Circle } from './drawing-tools/shapes/circle';
import { Color } from '../models/pieces/color';
import { King } from '../models/pieces/king';
import { Pawn } from '../models/pieces/pawn';
import { Point } from '../models/pieces/point';
import { AvailableMoveDecorator } from './piece-decorator/available-move-decorator';
import { PiecePromotionResolver } from '../piece-promotion/piece-promotion-resolver';
import { MoveUtils } from '../utils/move-utils';
import { PieceFactory } from './utils/piece-factory';
export class EngineFacade extends AbstractEngineFacade {
    constructor(board, moveChange) {
        super(board);
        this._selected = false;
        this.moveChange = moveChange;
        this.boardLoader = new BoardLoader(this);
        this.boardLoader.addPieces();
        this.boardStateProvider = new BoardStateProvider();
    }
    reset() {
        this.boardStateProvider.clear();
        this.moveHistoryProvider.clear();
        this.boardLoader.addPieces();
        this.board.reset();
        this.coords.reset();
        this.drawProvider.clear();
        this.pgnProcessor.reset();
    }
    undo() {
        if (!this.boardStateProvider.isEmpty()) {
            const lastBoard = this.boardStateProvider.pop().board;
            if (this.board.reverted) {
                lastBoard.reverse();
            }
            this.board = lastBoard;
            this.board.possibleCaptures = [];
            this.board.possibleMoves = [];
            this.board.activePiece = null;
            this.moveHistoryProvider.pop();
            this.board.calculateFEN();
            this.pgnProcessor.removeLast();
        }
    }
    saveMoveClone() {
        const clone = this.board.clone();
        if (this.board.reverted) {
            clone.reverse();
        }
        this.moveStateProvider.addMove(new BoardState(clone));
    }
    move(coords) {
        if (coords) {
            const sourceIndexes = MoveUtils.translateCoordsToIndex(coords.substring(0, 2), this.board.reverted);
            const destIndexes = MoveUtils.translateCoordsToIndex(coords.substring(2, 4), this.board.reverted);
            const srcPiece = this.board.getPieceByPoint(sourceIndexes.yAxis, sourceIndexes.xAxis);
            if (srcPiece) {
                if ((this.board.currentWhitePlayer &&
                    srcPiece.color === Color.BLACK) ||
                    (!this.board.currentWhitePlayer &&
                        srcPiece.color === Color.WHITE)) {
                    return;
                }
                this.prepareActivePiece(srcPiece, srcPiece.point);
                if (this.board.isPointInPossibleMoves(new Point(destIndexes.yAxis, destIndexes.xAxis)) ||
                    this.board.isPointInPossibleCaptures(new Point(destIndexes.yAxis, destIndexes.xAxis))) {
                    this.saveClone();
                    this.movePiece(srcPiece, new Point(destIndexes.yAxis, destIndexes.xAxis), coords.length === 5 ? +coords.substring(4, 5) : 0);
                    this.board.lastMoveSrc = new Point(sourceIndexes.yAxis, sourceIndexes.xAxis);
                    this.board.lastMoveDest = new Point(destIndexes.yAxis, destIndexes.xAxis);
                    this.disableSelection();
                }
                else {
                    this.disableSelection();
                }
            }
        }
    }
    prepareActivePiece(pieceClicked, pointClicked) {
        this.board.activePiece = pieceClicked;
        this._selected = true;
        this.board.possibleCaptures = new AvailableMoveDecorator(pieceClicked, pointClicked, this.board.currentWhitePlayer ? Color.WHITE : Color.BLACK, this.board).getPossibleCaptures();
        this.board.possibleMoves = new AvailableMoveDecorator(pieceClicked, pointClicked, this.board.currentWhitePlayer ? Color.WHITE : Color.BLACK, this.board).getPossibleMoves();
    }
    onPieceClicked(pieceClicked, pointClicked) {
        if ((this.board.currentWhitePlayer && pieceClicked.color === Color.BLACK) ||
            (!this.board.currentWhitePlayer && pieceClicked.color === Color.WHITE)) {
            return;
        }
        this.prepareActivePiece(pieceClicked, pointClicked);
    }
    handleClickEvent(pointClicked, isMouseDown) {
        let moving = false;
        if (((this.board.isPointInPossibleMoves(pointClicked) ||
            this.board.isPointInPossibleCaptures(pointClicked)) || this.freeMode) && pointClicked.isInRange()) {
            this.saveClone();
            this.board.lastMoveSrc = new Point(this.board.activePiece.point.row, this.board.activePiece.point.col);
            this.board.lastMoveDest = pointClicked.clone();
            this.movePiece(this.board.activePiece, pointClicked);
            if (!this.board.activePiece.point.isEqual(this.board.lastMoveSrc)) {
                moving = true;
            }
        }
        if (isMouseDown || moving) {
            this.disableSelection();
        }
        this.disableSelection();
        const pieceClicked = this.board.getPieceByPoint(pointClicked.row, pointClicked.col);
        if (pieceClicked && !moving) {
            this.onFreeMode(pieceClicked);
            this.onPieceClicked(pieceClicked, pointClicked);
        }
    }
    onMouseDown(event, pointClicked, left, top) {
        this.moveDone = false;
        if (event.button !== 0) {
            this.drawPoint = ClickUtils.getDrawingPoint(this.heightAndWidth, this.colorStrategy, event.x, event.y, event.ctrlKey, event.altKey, event.shiftKey, left, top);
            return;
        }
        this.drawProvider.clear();
        if (this.board.activePiece &&
            pointClicked.isEqual(this.board.activePiece.point)) {
            this.disabling = true;
            return;
        }
        const pieceClicked = this.board.getPieceByPoint(pointClicked.row, pointClicked.col);
        if (this.freeMode) {
            if (pieceClicked) {
                if (event.ctrlKey) {
                    this.board.pieces = this.board.pieces.filter(e => e !== pieceClicked);
                    return;
                }
                this.board.currentWhitePlayer = (pieceClicked.color === Color.WHITE);
            }
        }
        if (this.isPieceDisabled(pieceClicked)) {
            return;
        }
        if (this._selected) {
            this.handleClickEvent(pointClicked, true);
        }
        else {
            if (pieceClicked) {
                this.onFreeMode(pieceClicked);
                this.onPieceClicked(pieceClicked, pointClicked);
            }
        }
    }
    onMouseUp(event, pointClicked, left, top) {
        this.moveDone = false;
        if (event.button !== 0 && !this.drawDisabled) {
            this.addDrawPoint(event.x, event.y, event.ctrlKey, event.altKey, event.shiftKey, left, top);
            return;
        }
        this.drawProvider.clear();
        if (this.dragDisabled) {
            return;
        }
        if (this.board.activePiece &&
            pointClicked.isEqual(this.board.activePiece.point) &&
            this.disabling) {
            this.disableSelection();
            this.disabling = false;
            return;
        }
        const pieceClicked = this.board.getPieceByPoint(pointClicked.row, pointClicked.col);
        if (this.isPieceDisabled(pieceClicked)) {
            return;
        }
        if (this._selected) {
            this.handleClickEvent(pointClicked, false);
            //   this.possibleMoves = activePiece.getPossibleMoves();
        }
    }
    saveClone() {
        const clone = this.board.clone();
        if (this.board.reverted) {
            clone.reverse();
        }
        this.boardStateProvider.addMove(new BoardState(clone));
    }
    movePiece(toMovePiece, newPoint, promotionIndex) {
        const destPiece = this.board.pieces.find((piece) => piece.point.col === newPoint.col &&
            piece.point.row === newPoint.row);
        this.pgnProcessor.process(this.board, toMovePiece, newPoint, destPiece);
        if (destPiece && toMovePiece.color !== destPiece.color) {
            this.board.pieces = this.board.pieces.filter((piece) => piece !== destPiece);
        }
        else {
            if (destPiece && toMovePiece.color === destPiece.color) {
                return;
            }
        }
        this.historyMoveCandidate = new HistoryMove(MoveUtils.format(toMovePiece.point, newPoint, this.board.reverted), toMovePiece.constant.name, toMovePiece.color === Color.WHITE ? 'white' : 'black', !!destPiece);
        this.moveHistoryProvider.addMove(this.historyMoveCandidate);
        if (toMovePiece instanceof King) {
            const squaresMoved = Math.abs(newPoint.col - toMovePiece.point.col);
            if (squaresMoved > 1) {
                if (newPoint.col < 3) {
                    const leftRook = this.board.getPieceByField(toMovePiece.point.row, 0);
                    if (!this.freeMode) {
                        leftRook.point.col = this.board.reverted ? 2 : 3;
                    }
                }
                else {
                    const rightRook = this.board.getPieceByField(toMovePiece.point.row, 7);
                    if (!this.freeMode) {
                        rightRook.point.col = this.board.reverted ? 4 : 5;
                    }
                }
            }
        }
        if (toMovePiece instanceof Pawn) {
            this.board.checkIfPawnTakesEnPassant(newPoint);
            this.board.checkIfPawnEnpassanted(toMovePiece, newPoint);
        }
        else {
            this.board.enPassantPoint = null;
            this.board.enPassantPiece = null;
        }
        toMovePiece.point = newPoint;
        this.increaseFullMoveCount();
        this.board.currentWhitePlayer = !this.board.currentWhitePlayer;
        if (!this.checkForPawnPromote(toMovePiece, promotionIndex)) {
            this.afterMoveActions();
        }
    }
    checkForPawnPromote(toPromotePiece, promotionIndex) {
        if (!(toPromotePiece instanceof Pawn)) {
            return;
        }
        if (toPromotePiece.point.row === 0 || toPromotePiece.point.row === 7) {
            this.board.pieces = this.board.pieces.filter((piece) => piece !== toPromotePiece);
            // When we make move manually, we pass promotion index already, so we don't need
            // to acquire it from promote dialog
            if (!promotionIndex) {
                this.openPromoteDialog(toPromotePiece);
            }
            else {
                PiecePromotionResolver.resolvePromotionChoice(this.board, toPromotePiece, promotionIndex);
                this.afterMoveActions(promotionIndex);
            }
            return true;
        }
    }
    afterMoveActions(promotionIndex) {
        this.checkIfPawnFirstMove(this.board.activePiece);
        this.checkIfRookMoved(this.board.activePiece);
        this.checkIfKingMoved(this.board.activePiece);
        this.board.blackKingChecked = this.board.isKingInCheck(Color.BLACK, this.board.pieces);
        this.board.whiteKingChecked = this.board.isKingInCheck(Color.WHITE, this.board.pieces);
        const check = this.board.blackKingChecked || this.board.whiteKingChecked;
        const checkmate = this.checkForPossibleMoves(Color.BLACK) ||
            this.checkForPossibleMoves(Color.WHITE);
        const stalemate = this.checkForPat(Color.BLACK) || this.checkForPat(Color.WHITE);
        this.historyMoveCandidate.setGameStates(check, stalemate, checkmate);
        this.pgnProcessor.processChecks(checkmate, check, stalemate);
        this.pgnProcessor.addPromotionChoice(promotionIndex);
        this.disabling = false;
        this.board.calculateFEN();
        const lastMove = this.moveHistoryProvider.getLastMove();
        if (lastMove && promotionIndex) {
            lastMove.move += promotionIndex;
        }
        this.moveChange.emit({
            ...lastMove,
            check,
            checkmate,
            stalemate,
            fen: this.board.fen,
            pgn: {
                pgn: this.pgnProcessor.getPGN()
            },
            freeMode: this.freeMode
        });
        this.moveDone = true;
    }
    checkForPat(color) {
        if (color === Color.WHITE && !this.board.whiteKingChecked) {
            return this.checkForPossibleMoves(color);
        }
        else {
            if (color === Color.BLACK && !this.board.blackKingChecked) {
                return this.checkForPossibleMoves(color);
            }
        }
    }
    openPromoteDialog(piece) {
        if (piece.color === this.board.activePiece.color) {
            this.modal.open((index) => {
                PiecePromotionResolver.resolvePromotionChoice(this.board, piece, index);
                this.afterMoveActions(index);
            });
        }
    }
    checkForPossibleMoves(color) {
        return !this.board.pieces
            .filter((piece) => piece.color === color)
            .some((piece) => piece
            .getPossibleMoves()
            .some((move) => !MoveUtils.willMoveCauseCheck(color, piece.point.row, piece.point.col, move.row, move.col, this.board)) ||
            piece
                .getPossibleCaptures()
                .some((capture) => !MoveUtils.willMoveCauseCheck(color, piece.point.row, piece.point.col, capture.row, capture.col, this.board)));
    }
    disableSelection() {
        this._selected = false;
        this.board.possibleCaptures = [];
        this.board.activePiece = null;
        this.board.possibleMoves = [];
    }
    /**
     * Processes logic to allow freeMode based logic processing
     */
    onFreeMode(pieceClicked) {
        if (!this.freeMode ||
            pieceClicked === undefined ||
            pieceClicked === null) {
            return;
        }
        // sets player as white in-case white pieces are selected, and vice-versa when black is selected
        this.board.currentWhitePlayer = pieceClicked.color === Color.WHITE;
    }
    isPieceDisabled(pieceClicked) {
        if (pieceClicked && pieceClicked.point) {
            const foundCapture = this.board.possibleCaptures.find((capture) => capture.col === pieceClicked.point.col &&
                capture.row === pieceClicked.point.row);
            if (foundCapture) {
                return false;
            }
        }
        return (pieceClicked &&
            ((this.lightDisabled && pieceClicked.color === Color.WHITE) ||
                (this.darkDisabled && pieceClicked.color === Color.BLACK)));
    }
    addDrawPoint(x, y, crtl, alt, shift, left, top) {
        const upPoint = ClickUtils.getDrawingPoint(this.heightAndWidth, this.colorStrategy, x, y, crtl, alt, shift, left, top);
        if (this.drawPoint.isEqual(upPoint)) {
            const circle = new Circle();
            circle.drawPoint = upPoint;
            if (!this.drawProvider.containsCircle(circle)) {
                this.drawProvider.addCircle(circle);
            }
            else {
                this.drawProvider.reomveCircle(circle);
            }
        }
        else {
            const arrow = new Arrow();
            arrow.start = this.drawPoint;
            arrow.end = upPoint;
            if (!this.drawProvider.containsArrow(arrow)) {
                this.drawProvider.addArrow(arrow);
            }
            else {
                this.drawProvider.removeArrow(arrow);
            }
        }
    }
    increaseFullMoveCount() {
        if (!this.board.currentWhitePlayer) {
            ++this.board.fullMoveCount;
        }
    }
    addPiece(pieceTypeInput, colorInput, coords) {
        if (this.freeMode && coords && pieceTypeInput > 0 && colorInput > 0) {
            let indexes = MoveUtils.translateCoordsToIndex(coords, this.board.reverted);
            let existing = this.board.getPieceByPoint(indexes.yAxis, indexes.xAxis);
            if (existing) {
                this.board.pieces = this.board.pieces.filter(e => e !== existing);
            }
            let createdPiece = PieceFactory.create(indexes, pieceTypeInput, colorInput, this.board);
            this.saveClone();
            this.board.pieces.push(createdPiece);
            this.afterMoveActions();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5naW5lLWZhY2FkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jaGVzcy1ib2FyZC9zcmMvbGliL2VuZ2luZS9lbmdpbmUtZmFjYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUVwRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVoRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDL0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQzVFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBRTdGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBSXZELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDN0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTdDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUUvQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUNwRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUNyRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFaEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRXJELE1BQU0sT0FBTyxZQUFhLFNBQVEsb0JBQW9CO0lBV2xELFlB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QWEsQ0FBQztTQUM5QjtJQUNMLENBQUM7SUFFRCxRQUFRLENBQ0osY0FBOEIsRUFDOUIsVUFBc0IsRUFDdEIsTUFBYztRQUVkLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLElBQUksY0FBYyxHQUFHLENBQUMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFO1lBQ2pFLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxzQkFBc0IsQ0FDMUMsTUFBTSxFQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUN0QixDQUFDO1lBQ0YsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQ3JDLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLEtBQUssQ0FDaEIsQ0FBQztZQUNGLElBQUksUUFBUSxFQUFFO2dCQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQzthQUNyRTtZQUNELElBQUksWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQ2xDLE9BQU8sRUFDUCxjQUFjLEVBQ2QsVUFBVSxFQUNWLElBQUksQ0FBQyxLQUFLLENBQ2IsQ0FBQztZQUNGLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDM0I7SUFDTCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEhpc3RvcnlNb3ZlIH0gZnJvbSAnLi4vaGlzdG9yeS1tb3ZlLXByb3ZpZGVyL2hpc3RvcnktbW92ZSc7XG5pbXBvcnQgeyBDb2xvcklucHV0LCBQaWVjZVR5cGVJbnB1dCB9IGZyb20gJy4uL3V0aWxzL2lucHV0cy9waWVjZS10eXBlLWlucHV0JztcbmltcG9ydCB7IEFic3RyYWN0RW5naW5lRmFjYWRlIH0gZnJvbSAnLi9hYnN0cmFjdC1lbmdpbmUtZmFjYWRlJztcblxuaW1wb3J0IHsgQm9hcmRMb2FkZXIgfSBmcm9tICcuL2JvYXJkLXN0YXRlLXByb3ZpZGVyL2JvYXJkLWxvYWRlci9ib2FyZC1sb2FkZXInO1xuaW1wb3J0IHsgQm9hcmRTdGF0ZSB9IGZyb20gJy4vYm9hcmQtc3RhdGUtcHJvdmlkZXIvYm9hcmQtc3RhdGUvYm9hcmQtc3RhdGUnO1xuaW1wb3J0IHsgQm9hcmRTdGF0ZVByb3ZpZGVyIH0gZnJvbSAnLi9ib2FyZC1zdGF0ZS1wcm92aWRlci9ib2FyZC1zdGF0ZS9ib2FyZC1zdGF0ZS1wcm92aWRlcic7XG5pbXBvcnQgeyBNb3ZlU3RhdGVQcm92aWRlciB9IGZyb20gJy4vYm9hcmQtc3RhdGUtcHJvdmlkZXIvYm9hcmQtc3RhdGUvbW92ZS1zdGF0ZS1wcm92aWRlcic7XG5pbXBvcnQgeyBDbGlja1V0aWxzIH0gZnJvbSAnLi9jbGljay9jbGljay11dGlscyc7XG5pbXBvcnQgeyBBcnJvdyB9IGZyb20gJy4vZHJhd2luZy10b29scy9zaGFwZXMvYXJyb3cnO1xuaW1wb3J0IHsgQ2lyY2xlIH0gZnJvbSAnLi9kcmF3aW5nLXRvb2xzL3NoYXBlcy9jaXJjbGUnO1xuaW1wb3J0IHsgRHJhd1BvaW50IH0gZnJvbSAnLi9kcmF3aW5nLXRvb2xzL2RyYXctcG9pbnQnO1xuaW1wb3J0IHsgRHJhd1Byb3ZpZGVyIH0gZnJvbSAnLi9kcmF3aW5nLXRvb2xzL2RyYXctcHJvdmlkZXInO1xuaW1wb3J0IHsgQm9hcmQgfSBmcm9tICcuLi9tb2RlbHMvYm9hcmQnO1xuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi9tb2RlbHMvcGllY2VzL2NvbG9yJztcbmltcG9ydCB7IEtpbmcgfSBmcm9tICcuLi9tb2RlbHMvcGllY2VzL2tpbmcnO1xuaW1wb3J0IHsgUGF3biB9IGZyb20gJy4uL21vZGVscy9waWVjZXMvcGF3bic7XG5pbXBvcnQgeyBQaWVjZSB9IGZyb20gJy4uL21vZGVscy9waWVjZXMvcGllY2UnO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuLi9tb2RlbHMvcGllY2VzL3BvaW50JztcbmltcG9ydCB7IERlZmF1bHRQZ25Qcm9jZXNzb3IgfSBmcm9tICcuL3Bnbi9kZWZhdWx0LXBnbi1wcm9jZXNzb3InO1xuaW1wb3J0IHsgQXZhaWxhYmxlTW92ZURlY29yYXRvciB9IGZyb20gJy4vcGllY2UtZGVjb3JhdG9yL2F2YWlsYWJsZS1tb3ZlLWRlY29yYXRvcic7XG5pbXBvcnQgeyBQaWVjZVByb21vdGlvblJlc29sdmVyIH0gZnJvbSAnLi4vcGllY2UtcHJvbW90aW9uL3BpZWNlLXByb21vdGlvbi1yZXNvbHZlcic7XG5pbXBvcnQgeyBNb3ZlVXRpbHMgfSBmcm9tICcuLi91dGlscy9tb3ZlLXV0aWxzJztcbmltcG9ydCB7IE1vdmVDaGFuZ2UgfSBmcm9tICcuL291dHB1dHMvbW92ZS1jaGFuZ2UvbW92ZS1jaGFuZ2UnO1xuaW1wb3J0IHsgUGllY2VGYWN0b3J5IH0gZnJvbSAnLi91dGlscy9waWVjZS1mYWN0b3J5JztcblxuZXhwb3J0IGNsYXNzIEVuZ2luZUZhY2FkZSBleHRlbmRzIEFic3RyYWN0RW5naW5lRmFjYWRlIHtcblxuICAgIF9zZWxlY3RlZCA9IGZhbHNlO1xuICAgIGRyYXdQb2ludDogRHJhd1BvaW50O1xuICAgIGRyYXdQcm92aWRlcjogRHJhd1Byb3ZpZGVyO1xuICAgIGJvYXJkU3RhdGVQcm92aWRlcjogQm9hcmRTdGF0ZVByb3ZpZGVyO1xuICAgIG1vdmVTdGF0ZVByb3ZpZGVyOiBNb3ZlU3RhdGVQcm92aWRlcjtcbiAgICBtb3ZlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8TW92ZUNoYW5nZT47XG5cbiAgICBwcml2YXRlIGhpc3RvcnlNb3ZlQ2FuZGlkYXRlOiBIaXN0b3J5TW92ZTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBib2FyZDogQm9hcmQsXG4gICAgICAgIG1vdmVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxNb3ZlQ2hhbmdlPlxuICAgICkge1xuICAgICAgICBzdXBlcihib2FyZCk7XG4gICAgICAgIHRoaXMubW92ZUNoYW5nZSA9IG1vdmVDaGFuZ2U7XG4gICAgICAgIHRoaXMuYm9hcmRMb2FkZXIgPSBuZXcgQm9hcmRMb2FkZXIodGhpcyk7XG4gICAgICAgIHRoaXMuYm9hcmRMb2FkZXIuYWRkUGllY2VzKCk7XG4gICAgICAgIHRoaXMuYm9hcmRTdGF0ZVByb3ZpZGVyID0gbmV3IEJvYXJkU3RhdGVQcm92aWRlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ib2FyZFN0YXRlUHJvdmlkZXIuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5tb3ZlSGlzdG9yeVByb3ZpZGVyLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuYm9hcmRMb2FkZXIuYWRkUGllY2VzKCk7XG4gICAgICAgIHRoaXMuYm9hcmQucmVzZXQoKTtcbiAgICAgICAgdGhpcy5jb29yZHMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5kcmF3UHJvdmlkZXIuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5wZ25Qcm9jZXNzb3IucmVzZXQoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdW5kbygpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvYXJkU3RhdGVQcm92aWRlci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RCb2FyZCA9IHRoaXMuYm9hcmRTdGF0ZVByb3ZpZGVyLnBvcCgpLmJvYXJkO1xuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQucmV2ZXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICBsYXN0Qm9hcmQucmV2ZXJzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ib2FyZCA9IGxhc3RCb2FyZDtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQucG9zc2libGVDYXB0dXJlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5wb3NzaWJsZU1vdmVzID0gW107XG4gICAgICAgICAgICB0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubW92ZUhpc3RvcnlQcm92aWRlci5wb3AoKTtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuY2FsY3VsYXRlRkVOKCk7XG4gICAgICAgICAgICB0aGlzLnBnblByb2Nlc3Nvci5yZW1vdmVMYXN0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzYXZlTW92ZUNsb25lKCkge1xuICAgICAgICBjb25zdCBjbG9uZSA9IHRoaXMuYm9hcmQuY2xvbmUoKTtcblxuICAgICAgICBpZiAodGhpcy5ib2FyZC5yZXZlcnRlZCkge1xuICAgICAgICAgICAgY2xvbmUucmV2ZXJzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubW92ZVN0YXRlUHJvdmlkZXIuYWRkTW92ZShuZXcgQm9hcmRTdGF0ZShjbG9uZSkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlKGNvb3Jkczogc3RyaW5nKSB7XG4gICAgICAgIGlmIChjb29yZHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUluZGV4ZXMgPSBNb3ZlVXRpbHMudHJhbnNsYXRlQ29vcmRzVG9JbmRleChcbiAgICAgICAgICAgICAgICBjb29yZHMuc3Vic3RyaW5nKDAsIDIpLFxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucmV2ZXJ0ZWRcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRlc3RJbmRleGVzID0gTW92ZVV0aWxzLnRyYW5zbGF0ZUNvb3Jkc1RvSW5kZXgoXG4gICAgICAgICAgICAgICAgY29vcmRzLnN1YnN0cmluZygyLCA0KSxcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnJldmVydGVkXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBzcmNQaWVjZSA9IHRoaXMuYm9hcmQuZ2V0UGllY2VCeVBvaW50KFxuICAgICAgICAgICAgICAgIHNvdXJjZUluZGV4ZXMueUF4aXMsXG4gICAgICAgICAgICAgICAgc291cmNlSW5kZXhlcy54QXhpc1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHNyY1BpZWNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAodGhpcy5ib2FyZC5jdXJyZW50V2hpdGVQbGF5ZXIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BpZWNlLmNvbG9yID09PSBDb2xvci5CTEFDSykgfHxcbiAgICAgICAgICAgICAgICAgICAgKCF0aGlzLmJvYXJkLmN1cnJlbnRXaGl0ZVBsYXllciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGllY2UuY29sb3IgPT09IENvbG9yLldISVRFKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlQWN0aXZlUGllY2Uoc3JjUGllY2UsIHNyY1BpZWNlLnBvaW50KTtcblxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5pc1BvaW50SW5Qb3NzaWJsZU1vdmVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBvaW50KGRlc3RJbmRleGVzLnlBeGlzLCBkZXN0SW5kZXhlcy54QXhpcylcbiAgICAgICAgICAgICAgICAgICAgKSB8fFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLmlzUG9pbnRJblBvc3NpYmxlQ2FwdHVyZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgUG9pbnQoZGVzdEluZGV4ZXMueUF4aXMsIGRlc3RJbmRleGVzLnhBeGlzKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUNsb25lKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVBpZWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGllY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgUG9pbnQoZGVzdEluZGV4ZXMueUF4aXMsIGRlc3RJbmRleGVzLnhBeGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy5sZW5ndGggPT09IDUgPyArY29vcmRzLnN1YnN0cmluZyg0LCA1KSA6IDBcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLmxhc3RNb3ZlU3JjID0gbmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlSW5kZXhlcy55QXhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUluZGV4ZXMueEF4aXNcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5sYXN0TW92ZURlc3QgPSBuZXcgUG9pbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0SW5kZXhlcy55QXhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RJbmRleGVzLnhBeGlzXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwcmVwYXJlQWN0aXZlUGllY2UocGllY2VDbGlja2VkOiBQaWVjZSwgcG9pbnRDbGlja2VkOiBQb2ludCkge1xuICAgICAgICB0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlID0gcGllY2VDbGlja2VkO1xuICAgICAgICB0aGlzLl9zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuYm9hcmQucG9zc2libGVDYXB0dXJlcyA9IG5ldyBBdmFpbGFibGVNb3ZlRGVjb3JhdG9yKFxuICAgICAgICAgICAgcGllY2VDbGlja2VkLFxuICAgICAgICAgICAgcG9pbnRDbGlja2VkLFxuICAgICAgICAgICAgdGhpcy5ib2FyZC5jdXJyZW50V2hpdGVQbGF5ZXIgPyBDb2xvci5XSElURSA6IENvbG9yLkJMQUNLLFxuICAgICAgICAgICAgdGhpcy5ib2FyZFxuICAgICAgICApLmdldFBvc3NpYmxlQ2FwdHVyZXMoKTtcbiAgICAgICAgdGhpcy5ib2FyZC5wb3NzaWJsZU1vdmVzID0gbmV3IEF2YWlsYWJsZU1vdmVEZWNvcmF0b3IoXG4gICAgICAgICAgICBwaWVjZUNsaWNrZWQsXG4gICAgICAgICAgICBwb2ludENsaWNrZWQsXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmN1cnJlbnRXaGl0ZVBsYXllciA/IENvbG9yLldISVRFIDogQ29sb3IuQkxBQ0ssXG4gICAgICAgICAgICB0aGlzLmJvYXJkXG4gICAgICAgICkuZ2V0UG9zc2libGVNb3ZlcygpO1xuICAgIH1cblxuICAgIG9uUGllY2VDbGlja2VkKHBpZWNlQ2xpY2tlZCwgcG9pbnRDbGlja2VkKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICh0aGlzLmJvYXJkLmN1cnJlbnRXaGl0ZVBsYXllciAmJiBwaWVjZUNsaWNrZWQuY29sb3IgPT09IENvbG9yLkJMQUNLKSB8fFxuICAgICAgICAgICAgKCF0aGlzLmJvYXJkLmN1cnJlbnRXaGl0ZVBsYXllciAmJiBwaWVjZUNsaWNrZWQuY29sb3IgPT09IENvbG9yLldISVRFKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJlcGFyZUFjdGl2ZVBpZWNlKHBpZWNlQ2xpY2tlZCwgcG9pbnRDbGlja2VkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaGFuZGxlQ2xpY2tFdmVudChwb2ludENsaWNrZWQ6IFBvaW50LCBpc01vdXNlRG93bjogYm9vbGVhbikge1xuICAgICAgICBsZXQgbW92aW5nID0gZmFsc2U7XG4gICAgICAgIGlmICgoKFxuICAgICAgICAgICAgdGhpcy5ib2FyZC5pc1BvaW50SW5Qb3NzaWJsZU1vdmVzKHBvaW50Q2xpY2tlZCkgfHxcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuaXNQb2ludEluUG9zc2libGVDYXB0dXJlcyhwb2ludENsaWNrZWQpXG4gICAgICAgICkgfHwgdGhpcy5mcmVlTW9kZSkgJiYgcG9pbnRDbGlja2VkLmlzSW5SYW5nZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmVDbG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5sYXN0TW92ZVNyYyA9IG5ldyBQb2ludChcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlLnBvaW50LnJvdyxcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlLnBvaW50LmNvbFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQubGFzdE1vdmVEZXN0ID0gcG9pbnRDbGlja2VkLmNsb25lKCk7XG4gICAgICAgICAgICB0aGlzLm1vdmVQaWVjZSh0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlLCBwb2ludENsaWNrZWQpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuYm9hcmQuYWN0aXZlUGllY2UucG9pbnQuaXNFcXVhbCh0aGlzLmJvYXJkLmxhc3RNb3ZlU3JjKSkge1xuICAgICAgICAgICAgICAgIG1vdmluZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNNb3VzZURvd24gfHwgbW92aW5nKSB7XG4gICAgICAgICAgICB0aGlzLmRpc2FibGVTZWxlY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpc2FibGVTZWxlY3Rpb24oKTtcbiAgICAgICAgY29uc3QgcGllY2VDbGlja2VkID0gdGhpcy5ib2FyZC5nZXRQaWVjZUJ5UG9pbnQoXG4gICAgICAgICAgICBwb2ludENsaWNrZWQucm93LFxuICAgICAgICAgICAgcG9pbnRDbGlja2VkLmNvbFxuICAgICAgICApO1xuICAgICAgICBpZiAocGllY2VDbGlja2VkICYmICFtb3ZpbmcpIHtcbiAgICAgICAgICAgIHRoaXMub25GcmVlTW9kZShwaWVjZUNsaWNrZWQpO1xuICAgICAgICAgICAgdGhpcy5vblBpZWNlQ2xpY2tlZChwaWVjZUNsaWNrZWQsIHBvaW50Q2xpY2tlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk1vdXNlRG93bihcbiAgICAgICAgZXZlbnQ6IE1vdXNlRXZlbnQsXG4gICAgICAgIHBvaW50Q2xpY2tlZDogUG9pbnQsXG4gICAgICAgIGxlZnQ/OiBudW1iZXIsXG4gICAgICAgIHRvcD86IG51bWJlclxuICAgICkge1xuICAgICAgICB0aGlzLm1vdmVEb25lID0gZmFsc2U7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1BvaW50ID0gQ2xpY2tVdGlscy5nZXREcmF3aW5nUG9pbnQoXG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHRBbmRXaWR0aCxcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yU3RyYXRlZ3ksXG4gICAgICAgICAgICAgICAgZXZlbnQueCxcbiAgICAgICAgICAgICAgICBldmVudC55LFxuICAgICAgICAgICAgICAgIGV2ZW50LmN0cmxLZXksXG4gICAgICAgICAgICAgICAgZXZlbnQuYWx0S2V5LFxuICAgICAgICAgICAgICAgIGV2ZW50LnNoaWZ0S2V5LFxuICAgICAgICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgICAgICAgdG9wXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmF3UHJvdmlkZXIuY2xlYXIoKTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlICYmXG4gICAgICAgICAgICBwb2ludENsaWNrZWQuaXNFcXVhbCh0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlLnBvaW50KVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBpZWNlQ2xpY2tlZCA9IHRoaXMuYm9hcmQuZ2V0UGllY2VCeVBvaW50KFxuICAgICAgICAgICAgcG9pbnRDbGlja2VkLnJvdyxcbiAgICAgICAgICAgIHBvaW50Q2xpY2tlZC5jb2xcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5mcmVlTW9kZSkge1xuICAgICAgICAgICAgaWYgKHBpZWNlQ2xpY2tlZCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucGllY2VzID0gdGhpcy5ib2FyZC5waWVjZXMuZmlsdGVyKGUgPT4gZSAhPT0gcGllY2VDbGlja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLmN1cnJlbnRXaGl0ZVBsYXllciA9IChwaWVjZUNsaWNrZWQuY29sb3IgPT09IENvbG9yLldISVRFKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzUGllY2VEaXNhYmxlZChwaWVjZUNsaWNrZWQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpY2tFdmVudChwb2ludENsaWNrZWQsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHBpZWNlQ2xpY2tlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMub25GcmVlTW9kZShwaWVjZUNsaWNrZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMub25QaWVjZUNsaWNrZWQocGllY2VDbGlja2VkLCBwb2ludENsaWNrZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Nb3VzZVVwKFxuICAgICAgICBldmVudDogTW91c2VFdmVudCxcbiAgICAgICAgcG9pbnRDbGlja2VkOiBQb2ludCxcbiAgICAgICAgbGVmdDogbnVtYmVyLFxuICAgICAgICB0b3A6IG51bWJlclxuICAgICkge1xuICAgICAgICB0aGlzLm1vdmVEb25lID0gZmFsc2U7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDAgJiYgIXRoaXMuZHJhd0Rpc2FibGVkKSB7XG4gICAgICAgICAgICB0aGlzLmFkZERyYXdQb2ludChcbiAgICAgICAgICAgICAgICBldmVudC54LFxuICAgICAgICAgICAgICAgIGV2ZW50LnksXG4gICAgICAgICAgICAgICAgZXZlbnQuY3RybEtleSxcbiAgICAgICAgICAgICAgICBldmVudC5hbHRLZXksXG4gICAgICAgICAgICAgICAgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICAgICAgbGVmdCwgdG9wXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmF3UHJvdmlkZXIuY2xlYXIoKTtcblxuICAgICAgICBpZiAodGhpcy5kcmFnRGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuYWN0aXZlUGllY2UgJiZcbiAgICAgICAgICAgIHBvaW50Q2xpY2tlZC5pc0VxdWFsKHRoaXMuYm9hcmQuYWN0aXZlUGllY2UucG9pbnQpICYmXG4gICAgICAgICAgICB0aGlzLmRpc2FibGluZ1xuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZVNlbGVjdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwaWVjZUNsaWNrZWQgPSB0aGlzLmJvYXJkLmdldFBpZWNlQnlQb2ludChcbiAgICAgICAgICAgIHBvaW50Q2xpY2tlZC5yb3csXG4gICAgICAgICAgICBwb2ludENsaWNrZWQuY29sXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNQaWVjZURpc2FibGVkKHBpZWNlQ2xpY2tlZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KHBvaW50Q2xpY2tlZCwgZmFsc2UpO1xuICAgICAgICAgICAgLy8gICB0aGlzLnBvc3NpYmxlTW92ZXMgPSBhY3RpdmVQaWVjZS5nZXRQb3NzaWJsZU1vdmVzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzYXZlQ2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNsb25lID0gdGhpcy5ib2FyZC5jbG9uZSgpO1xuXG4gICAgICAgIGlmICh0aGlzLmJvYXJkLnJldmVydGVkKSB7XG4gICAgICAgICAgICBjbG9uZS5yZXZlcnNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ib2FyZFN0YXRlUHJvdmlkZXIuYWRkTW92ZShuZXcgQm9hcmRTdGF0ZShjbG9uZSkpO1xuICAgIH1cblxuICAgIG1vdmVQaWVjZSh0b01vdmVQaWVjZTogUGllY2UsIG5ld1BvaW50OiBQb2ludCwgcHJvbW90aW9uSW5kZXg/OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZGVzdFBpZWNlID0gdGhpcy5ib2FyZC5waWVjZXMuZmluZChcbiAgICAgICAgICAgIChwaWVjZSkgPT5cbiAgICAgICAgICAgICAgICBwaWVjZS5wb2ludC5jb2wgPT09IG5ld1BvaW50LmNvbCAmJlxuICAgICAgICAgICAgICAgIHBpZWNlLnBvaW50LnJvdyA9PT0gbmV3UG9pbnQucm93XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5wZ25Qcm9jZXNzb3IucHJvY2VzcyhcbiAgICAgICAgICAgIHRoaXMuYm9hcmQsXG4gICAgICAgICAgICB0b01vdmVQaWVjZSxcbiAgICAgICAgICAgIG5ld1BvaW50LFxuICAgICAgICAgICAgZGVzdFBpZWNlXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGRlc3RQaWVjZSAmJiB0b01vdmVQaWVjZS5jb2xvciAhPT0gZGVzdFBpZWNlLmNvbG9yKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLnBpZWNlcyA9IHRoaXMuYm9hcmQucGllY2VzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAocGllY2UpID0+IHBpZWNlICE9PSBkZXN0UGllY2VcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGVzdFBpZWNlICYmIHRvTW92ZVBpZWNlLmNvbG9yID09PSBkZXN0UGllY2UuY29sb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhpc3RvcnlNb3ZlQ2FuZGlkYXRlID0gbmV3IEhpc3RvcnlNb3ZlKFxuICAgICAgICAgICAgTW92ZVV0aWxzLmZvcm1hdCh0b01vdmVQaWVjZS5wb2ludCwgbmV3UG9pbnQsIHRoaXMuYm9hcmQucmV2ZXJ0ZWQpLFxuICAgICAgICAgICAgdG9Nb3ZlUGllY2UuY29uc3RhbnQubmFtZSxcbiAgICAgICAgICAgIHRvTW92ZVBpZWNlLmNvbG9yID09PSBDb2xvci5XSElURSA/ICd3aGl0ZScgOiAnYmxhY2snLFxuICAgICAgICAgICAgISFkZXN0UGllY2VcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5tb3ZlSGlzdG9yeVByb3ZpZGVyLmFkZE1vdmUodGhpcy5oaXN0b3J5TW92ZUNhbmRpZGF0ZSk7XG5cbiAgICAgICAgaWYgKHRvTW92ZVBpZWNlIGluc3RhbmNlb2YgS2luZykge1xuICAgICAgICAgICAgY29uc3Qgc3F1YXJlc01vdmVkID0gTWF0aC5hYnMobmV3UG9pbnQuY29sIC0gdG9Nb3ZlUGllY2UucG9pbnQuY29sKTtcbiAgICAgICAgICAgIGlmIChzcXVhcmVzTW92ZWQgPiAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1BvaW50LmNvbCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdFJvb2sgPSB0aGlzLmJvYXJkLmdldFBpZWNlQnlGaWVsZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvTW92ZVBpZWNlLnBvaW50LnJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZyZWVNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0Um9vay5wb2ludC5jb2wgPSB0aGlzLmJvYXJkLnJldmVydGVkID8gMiA6IDM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodFJvb2sgPSB0aGlzLmJvYXJkLmdldFBpZWNlQnlGaWVsZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvTW92ZVBpZWNlLnBvaW50LnJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZyZWVNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodFJvb2sucG9pbnQuY29sID0gdGhpcy5ib2FyZC5yZXZlcnRlZCA/IDQgOiA1O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRvTW92ZVBpZWNlIGluc3RhbmNlb2YgUGF3bikge1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5jaGVja0lmUGF3blRha2VzRW5QYXNzYW50KG5ld1BvaW50KTtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuY2hlY2tJZlBhd25FbnBhc3NhbnRlZCh0b01vdmVQaWVjZSwgbmV3UG9pbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5lblBhc3NhbnRQb2ludCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLmVuUGFzc2FudFBpZWNlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvTW92ZVBpZWNlLnBvaW50ID0gbmV3UG9pbnQ7XG4gICAgICAgIHRoaXMuaW5jcmVhc2VGdWxsTW92ZUNvdW50KCk7XG4gICAgICAgIHRoaXMuYm9hcmQuY3VycmVudFdoaXRlUGxheWVyID0gIXRoaXMuYm9hcmQuY3VycmVudFdoaXRlUGxheWVyO1xuXG4gICAgICAgIGlmICghdGhpcy5jaGVja0ZvclBhd25Qcm9tb3RlKHRvTW92ZVBpZWNlLCBwcm9tb3Rpb25JbmRleCkpIHtcbiAgICAgICAgICAgIHRoaXMuYWZ0ZXJNb3ZlQWN0aW9ucygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tGb3JQYXduUHJvbW90ZSh0b1Byb21vdGVQaWVjZTogUGllY2UsIHByb21vdGlvbkluZGV4PzogbnVtYmVyKSB7XG4gICAgICAgIGlmICghKHRvUHJvbW90ZVBpZWNlIGluc3RhbmNlb2YgUGF3bikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b1Byb21vdGVQaWVjZS5wb2ludC5yb3cgPT09IDAgfHwgdG9Qcm9tb3RlUGllY2UucG9pbnQucm93ID09PSA3KSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLnBpZWNlcyA9IHRoaXMuYm9hcmQucGllY2VzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAocGllY2UpID0+IHBpZWNlICE9PSB0b1Byb21vdGVQaWVjZVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gV2hlbiB3ZSBtYWtlIG1vdmUgbWFudWFsbHksIHdlIHBhc3MgcHJvbW90aW9uIGluZGV4IGFscmVhZHksIHNvIHdlIGRvbid0IG5lZWRcbiAgICAgICAgICAgIC8vIHRvIGFjcXVpcmUgaXQgZnJvbSBwcm9tb3RlIGRpYWxvZ1xuICAgICAgICAgICAgaWYgKCFwcm9tb3Rpb25JbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlblByb21vdGVEaWFsb2codG9Qcm9tb3RlUGllY2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBQaWVjZVByb21vdGlvblJlc29sdmVyLnJlc29sdmVQcm9tb3Rpb25DaG9pY2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQsXG4gICAgICAgICAgICAgICAgICAgIHRvUHJvbW90ZVBpZWNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9tb3Rpb25JbmRleFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZnRlck1vdmVBY3Rpb25zKHByb21vdGlvbkluZGV4KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZnRlck1vdmVBY3Rpb25zKHByb21vdGlvbkluZGV4PzogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuY2hlY2tJZlBhd25GaXJzdE1vdmUodGhpcy5ib2FyZC5hY3RpdmVQaWVjZSk7XG4gICAgICAgIHRoaXMuY2hlY2tJZlJvb2tNb3ZlZCh0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlKTtcbiAgICAgICAgdGhpcy5jaGVja0lmS2luZ01vdmVkKHRoaXMuYm9hcmQuYWN0aXZlUGllY2UpO1xuXG4gICAgICAgIHRoaXMuYm9hcmQuYmxhY2tLaW5nQ2hlY2tlZCA9IHRoaXMuYm9hcmQuaXNLaW5nSW5DaGVjayhcbiAgICAgICAgICAgIENvbG9yLkJMQUNLLFxuICAgICAgICAgICAgdGhpcy5ib2FyZC5waWVjZXNcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5ib2FyZC53aGl0ZUtpbmdDaGVja2VkID0gdGhpcy5ib2FyZC5pc0tpbmdJbkNoZWNrKFxuICAgICAgICAgICAgQ29sb3IuV0hJVEUsXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnBpZWNlc1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBjaGVjayA9XG4gICAgICAgICAgICB0aGlzLmJvYXJkLmJsYWNrS2luZ0NoZWNrZWQgfHwgdGhpcy5ib2FyZC53aGl0ZUtpbmdDaGVja2VkO1xuICAgICAgICBjb25zdCBjaGVja21hdGUgPVxuICAgICAgICAgICAgdGhpcy5jaGVja0ZvclBvc3NpYmxlTW92ZXMoQ29sb3IuQkxBQ0spIHx8XG4gICAgICAgICAgICB0aGlzLmNoZWNrRm9yUG9zc2libGVNb3ZlcyhDb2xvci5XSElURSk7XG4gICAgICAgIGNvbnN0IHN0YWxlbWF0ZSA9XG4gICAgICAgICAgICB0aGlzLmNoZWNrRm9yUGF0KENvbG9yLkJMQUNLKSB8fCB0aGlzLmNoZWNrRm9yUGF0KENvbG9yLldISVRFKTtcblxuICAgICAgICB0aGlzLmhpc3RvcnlNb3ZlQ2FuZGlkYXRlLnNldEdhbWVTdGF0ZXMoY2hlY2ssIHN0YWxlbWF0ZSwgY2hlY2ttYXRlKTtcbiAgICAgICAgdGhpcy5wZ25Qcm9jZXNzb3IucHJvY2Vzc0NoZWNrcyhjaGVja21hdGUsIGNoZWNrLCBzdGFsZW1hdGUpO1xuICAgICAgICB0aGlzLnBnblByb2Nlc3Nvci5hZGRQcm9tb3Rpb25DaG9pY2UocHJvbW90aW9uSW5kZXgpO1xuXG4gICAgICAgIHRoaXMuZGlzYWJsaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYm9hcmQuY2FsY3VsYXRlRkVOKCk7XG5cbiAgICAgICAgY29uc3QgbGFzdE1vdmUgPSB0aGlzLm1vdmVIaXN0b3J5UHJvdmlkZXIuZ2V0TGFzdE1vdmUoKTtcbiAgICAgICAgaWYgKGxhc3RNb3ZlICYmIHByb21vdGlvbkluZGV4KSB7XG4gICAgICAgICAgICBsYXN0TW92ZS5tb3ZlICs9IHByb21vdGlvbkluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb3ZlQ2hhbmdlLmVtaXQoe1xuICAgICAgICAgICAgLi4ubGFzdE1vdmUsXG4gICAgICAgICAgICBjaGVjayxcbiAgICAgICAgICAgIGNoZWNrbWF0ZSxcbiAgICAgICAgICAgIHN0YWxlbWF0ZSxcbiAgICAgICAgICAgIGZlbjogdGhpcy5ib2FyZC5mZW4sXG4gICAgICAgICAgICBwZ246IHtcbiAgICAgICAgICAgICAgICBwZ246IHRoaXMucGduUHJvY2Vzc29yLmdldFBHTigpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnJlZU1vZGU6IHRoaXMuZnJlZU1vZGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlRG9uZSA9IHRydWU7XG4gICAgfVxuXG4gICAgY2hlY2tGb3JQYXQoY29sb3I6IENvbG9yKSB7XG4gICAgICAgIGlmIChjb2xvciA9PT0gQ29sb3IuV0hJVEUgJiYgIXRoaXMuYm9hcmQud2hpdGVLaW5nQ2hlY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tGb3JQb3NzaWJsZU1vdmVzKGNvbG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb2xvciA9PT0gQ29sb3IuQkxBQ0sgJiYgIXRoaXMuYm9hcmQuYmxhY2tLaW5nQ2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrRm9yUG9zc2libGVNb3Zlcyhjb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvcGVuUHJvbW90ZURpYWxvZyhwaWVjZTogUGllY2UpIHtcbiAgICAgICAgaWYgKHBpZWNlLmNvbG9yID09PSB0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlLmNvbG9yKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGFsLm9wZW4oKGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgUGllY2VQcm9tb3Rpb25SZXNvbHZlci5yZXNvbHZlUHJvbW90aW9uQ2hvaWNlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLFxuICAgICAgICAgICAgICAgICAgICBwaWVjZSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMuYWZ0ZXJNb3ZlQWN0aW9ucyhpbmRleCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRm9yUG9zc2libGVNb3Zlcyhjb2xvcjogQ29sb3IpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmJvYXJkLnBpZWNlc1xuICAgICAgICAgICAgLmZpbHRlcigocGllY2UpID0+IHBpZWNlLmNvbG9yID09PSBjb2xvcilcbiAgICAgICAgICAgIC5zb21lKFxuICAgICAgICAgICAgICAgIChwaWVjZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgcGllY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5nZXRQb3NzaWJsZU1vdmVzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zb21lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChtb3ZlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhTW92ZVV0aWxzLndpbGxNb3ZlQ2F1c2VDaGVjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGllY2UucG9pbnQucm93LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGllY2UucG9pbnQuY29sLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZS5yb3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlLmNvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSB8fFxuICAgICAgICAgICAgICAgICAgICBwaWVjZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmdldFBvc3NpYmxlQ2FwdHVyZXMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNvbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNhcHR1cmUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFNb3ZlVXRpbHMud2lsbE1vdmVDYXVzZUNoZWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaWVjZS5wb2ludC5yb3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaWVjZS5wb2ludC5jb2wsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXB0dXJlLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcHR1cmUuY29sLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIGRpc2FibGVTZWxlY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYm9hcmQucG9zc2libGVDYXB0dXJlcyA9IFtdO1xuICAgICAgICB0aGlzLmJvYXJkLmFjdGl2ZVBpZWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5ib2FyZC5wb3NzaWJsZU1vdmVzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2VzIGxvZ2ljIHRvIGFsbG93IGZyZWVNb2RlIGJhc2VkIGxvZ2ljIHByb2Nlc3NpbmdcbiAgICAgKi9cbiAgICBvbkZyZWVNb2RlKHBpZWNlQ2xpY2tlZCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhdGhpcy5mcmVlTW9kZSB8fFxuICAgICAgICAgICAgcGllY2VDbGlja2VkID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIHBpZWNlQ2xpY2tlZCA9PT0gbnVsbFxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXRzIHBsYXllciBhcyB3aGl0ZSBpbi1jYXNlIHdoaXRlIHBpZWNlcyBhcmUgc2VsZWN0ZWQsIGFuZCB2aWNlLXZlcnNhIHdoZW4gYmxhY2sgaXMgc2VsZWN0ZWRcbiAgICAgICAgdGhpcy5ib2FyZC5jdXJyZW50V2hpdGVQbGF5ZXIgPSBwaWVjZUNsaWNrZWQuY29sb3IgPT09IENvbG9yLldISVRFO1xuICAgIH1cblxuICAgIGlzUGllY2VEaXNhYmxlZChwaWVjZUNsaWNrZWQ6IFBpZWNlKSB7XG4gICAgICAgIGlmIChwaWVjZUNsaWNrZWQgJiYgcGllY2VDbGlja2VkLnBvaW50KSB7XG4gICAgICAgICAgICBjb25zdCBmb3VuZENhcHR1cmUgPSB0aGlzLmJvYXJkLnBvc3NpYmxlQ2FwdHVyZXMuZmluZChcbiAgICAgICAgICAgICAgICAoY2FwdHVyZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZS5jb2wgPT09IHBpZWNlQ2xpY2tlZC5wb2ludC5jb2wgJiZcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZS5yb3cgPT09IHBpZWNlQ2xpY2tlZC5wb2ludC5yb3dcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChmb3VuZENhcHR1cmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHBpZWNlQ2xpY2tlZCAmJlxuICAgICAgICAgICAgKCh0aGlzLmxpZ2h0RGlzYWJsZWQgJiYgcGllY2VDbGlja2VkLmNvbG9yID09PSBDb2xvci5XSElURSkgfHxcbiAgICAgICAgICAgICAgICAodGhpcy5kYXJrRGlzYWJsZWQgJiYgcGllY2VDbGlja2VkLmNvbG9yID09PSBDb2xvci5CTEFDSykpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgYWRkRHJhd1BvaW50KFxuICAgICAgICB4OiBudW1iZXIsXG4gICAgICAgIHk6IG51bWJlcixcbiAgICAgICAgY3J0bDogYm9vbGVhbixcbiAgICAgICAgYWx0OiBib29sZWFuLFxuICAgICAgICBzaGlmdDogYm9vbGVhbixcbiAgICAgICAgbGVmdDogbnVtYmVyLFxuICAgICAgICB0b3A6IG51bWJlclxuICAgICkge1xuICAgICAgICBjb25zdCB1cFBvaW50ID0gQ2xpY2tVdGlscy5nZXREcmF3aW5nUG9pbnQoXG4gICAgICAgICAgICB0aGlzLmhlaWdodEFuZFdpZHRoLFxuICAgICAgICAgICAgdGhpcy5jb2xvclN0cmF0ZWd5LFxuICAgICAgICAgICAgeCxcbiAgICAgICAgICAgIHksXG4gICAgICAgICAgICBjcnRsLFxuICAgICAgICAgICAgYWx0LFxuICAgICAgICAgICAgc2hpZnQsXG4gICAgICAgICAgICBsZWZ0LFxuICAgICAgICAgICAgdG9wXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHRoaXMuZHJhd1BvaW50LmlzRXF1YWwodXBQb2ludCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNpcmNsZSA9IG5ldyBDaXJjbGUoKTtcbiAgICAgICAgICAgIGNpcmNsZS5kcmF3UG9pbnQgPSB1cFBvaW50O1xuICAgICAgICAgICAgaWYgKCF0aGlzLmRyYXdQcm92aWRlci5jb250YWluc0NpcmNsZShjaXJjbGUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UHJvdmlkZXIuYWRkQ2lyY2xlKGNpcmNsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1Byb3ZpZGVyLnJlb212ZUNpcmNsZShjaXJjbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYXJyb3cgPSBuZXcgQXJyb3coKTtcbiAgICAgICAgICAgIGFycm93LnN0YXJ0ID0gdGhpcy5kcmF3UG9pbnQ7XG4gICAgICAgICAgICBhcnJvdy5lbmQgPSB1cFBvaW50O1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuZHJhd1Byb3ZpZGVyLmNvbnRhaW5zQXJyb3coYXJyb3cpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UHJvdmlkZXIuYWRkQXJyb3coYXJyb3cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQcm92aWRlci5yZW1vdmVBcnJvdyhhcnJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbmNyZWFzZUZ1bGxNb3ZlQ291bnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZC5jdXJyZW50V2hpdGVQbGF5ZXIpIHtcbiAgICAgICAgICAgICsrdGhpcy5ib2FyZC5mdWxsTW92ZUNvdW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkUGllY2UoXG4gICAgICAgIHBpZWNlVHlwZUlucHV0OiBQaWVjZVR5cGVJbnB1dCxcbiAgICAgICAgY29sb3JJbnB1dDogQ29sb3JJbnB1dCxcbiAgICAgICAgY29vcmRzOiBzdHJpbmdcbiAgICApIHtcbiAgICAgICAgaWYgKHRoaXMuZnJlZU1vZGUgJiYgY29vcmRzICYmIHBpZWNlVHlwZUlucHV0ID4gMCAmJiBjb2xvcklucHV0ID4gMCkge1xuICAgICAgICAgICAgbGV0IGluZGV4ZXMgPSBNb3ZlVXRpbHMudHJhbnNsYXRlQ29vcmRzVG9JbmRleChcbiAgICAgICAgICAgICAgICBjb29yZHMsXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5yZXZlcnRlZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBleGlzdGluZyA9IHRoaXMuYm9hcmQuZ2V0UGllY2VCeVBvaW50KFxuICAgICAgICAgICAgICAgIGluZGV4ZXMueUF4aXMsXG4gICAgICAgICAgICAgICAgaW5kZXhlcy54QXhpc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucGllY2VzID0gdGhpcy5ib2FyZC5waWVjZXMuZmlsdGVyKGUgPT4gZSAhPT0gZXhpc3RpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGNyZWF0ZWRQaWVjZSA9IFBpZWNlRmFjdG9yeS5jcmVhdGUoXG4gICAgICAgICAgICAgICAgaW5kZXhlcyxcbiAgICAgICAgICAgICAgICBwaWVjZVR5cGVJbnB1dCxcbiAgICAgICAgICAgICAgICBjb2xvcklucHV0LFxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnNhdmVDbG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5waWVjZXMucHVzaChjcmVhdGVkUGllY2UpO1xuICAgICAgICAgICAgdGhpcy5hZnRlck1vdmVBY3Rpb25zKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=