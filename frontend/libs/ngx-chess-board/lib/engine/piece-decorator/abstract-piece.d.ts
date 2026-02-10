import { Point } from '../../models/pieces/point';
export interface AbstractPiece {
    getPossibleMoves(): Point[];
    getPossibleCaptures(): Point[];
}
//# sourceMappingURL=abstract-piece.d.ts.map