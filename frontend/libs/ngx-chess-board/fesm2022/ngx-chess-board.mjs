import * as i3 from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import * as i2 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { Injectable, Component, ViewChild, Input, EventEmitter, Output, HostListener, NgModule } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { cloneDeep } from 'lodash';

var Color;
(function (Color) {
    Color[Color["WHITE"] = 0] = "WHITE";
    Color[Color["BLACK"] = 1] = "BLACK";
})(Color || (Color = {}));

class Piece {
    constructor(point, color, constant, relValue, board) {
        this.checkPoints = [];
        this.color = color;
        this.constant = constant;
        this.point = point;
        this.relValue = relValue;
        this.board = board;
    }
}

class Point {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
    isEqual(that) {
        return that && this.row === that.row && this.col === that.col;
    }
    hasCoordsEqual(row, col) {
        return row && col && this.row === row && this.col === col;
    }
    isInRange() {
        return this.row >= 0 && this.row <= 7 && this.col >= 0 && this.col <= 7;
    }
    clone() {
        return new Point(this.row, this.col);
    }
}

class Rook extends Piece {
    constructor(point, color, constant, board) {
        super(point, color, constant, 5, board);
        this.isMovedAlready = false;
    }
    getPossibleMoves() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row + 1; i < 8; ++i) {
            // dol
            if (this.board.isFieldEmpty(i, col)) {
                possiblePoints.push(new Point(i, col));
            }
            else {
                break;
            }
        }
        for (let i = row - 1; i >= 0; --i) {
            // gora
            if (this.board.isFieldEmpty(i, col)) {
                possiblePoints.push(new Point(i, col));
            }
            else {
                break;
            }
        }
        for (let j = col - 1; j >= 0; --j) {
            // lewo
            if (this.board.isFieldEmpty(row, j)) {
                possiblePoints.push(new Point(row, j));
            }
            else {
                break;
            }
        }
        for (let j = col + 1; j < 8; ++j) {
            // prawo
            if (this.board.isFieldEmpty(row, j)) {
                possiblePoints.push(new Point(row, j));
            }
            else {
                break;
            }
        }
        return possiblePoints;
    }
    getPossibleCaptures() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row + 1; i < 8; ++i) {
            // dol
            if (this.board.isFieldTakenByEnemy(i, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, col));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, col)) {
                    break;
                }
            }
        }
        for (let i = row - 1; i >= 0; --i) {
            // gora
            if (this.board.isFieldTakenByEnemy(i, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, col));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, col)) {
                    break;
                }
            }
        }
        for (let j = col - 1; j >= 0; --j) {
            // lewo
            if (this.board.isFieldTakenByEnemy(row, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(row, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(row, j)) {
                    break;
                }
            }
        }
        for (let j = col + 1; j < 8; ++j) {
            // prawo
            if (this.board.isFieldTakenByEnemy(row, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(row, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(row, j)) {
                    break;
                }
            }
        }
        return possiblePoints;
    }
    getCoveredFields() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row + 1; i < 8; ++i) {
            // dol
            if (this.board.isFieldEmpty(i, col)) {
                possiblePoints.push(new Point(i, col));
            }
            else {
                if (!(this.board.getPieceByField instanceof King)) {
                    possiblePoints.push(new Point(i, col));
                    break;
                }
            }
        }
        for (let i = row - 1; i >= 0; --i) {
            // gora
            if (this.board.isFieldEmpty(i, col)) {
                possiblePoints.push(new Point(i, col));
            }
            else {
                if (!(this.board.getPieceByField instanceof King)) {
                    possiblePoints.push(new Point(i, col));
                    break;
                }
            }
        }
        for (let j = col - 1; j >= 0; --j) {
            // lewo
            if (this.board.isFieldEmpty(row, j)) {
                possiblePoints.push(new Point(row, j));
            }
            else {
                if (!(this.board.getPieceByField instanceof King)) {
                    possiblePoints.push(new Point(row, j));
                    break;
                }
            }
        }
        for (let j = col + 1; j < 8; ++j) {
            // prawo
            if (this.board.isFieldEmpty(row, j)) {
                possiblePoints.push(new Point(row, j));
            }
            else {
                if (!(this.board.getPieceByField instanceof King)) {
                    possiblePoints.push(new Point(row, j));
                    break;
                }
            }
        }
        return possiblePoints;
    }
}

class King extends Piece {
    constructor(point, color, constant, board) {
        super(point, color, constant, 0, board);
        this.castledAlready = false;
        this.shortCastled = false;
        this.longCastled = false;
        this.isCastling = false;
    }
    getPossibleMoves() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        // lewo
        if (this.board.isFieldEmpty(row, col - 1) &&
            !this.board.isFieldUnderAttack(row, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row, col - 1));
        }
        // prawo
        if (this.board.isFieldEmpty(row, col + 1) &&
            !this.board.isFieldUnderAttack(row, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row, col + 1));
        }
        // dol
        if (this.board.isFieldEmpty(row + 1, col) &&
            !this.board.isFieldUnderAttack(row + 1, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 1, col));
        }
        // gora
        if (this.board.isFieldEmpty(row - 1, col) &&
            !this.board.isFieldUnderAttack(row - 1, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 1, col));
        }
        // lewo gora
        if (this.board.isFieldEmpty(row - 1, col - 1) &&
            !this.board.isFieldUnderAttack(row - 1, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 1, col - 1));
        }
        // prawo gora
        if (this.board.isFieldEmpty(row - 1, col + 1) &&
            !this.board.isFieldUnderAttack(row - 1, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 1, col + 1));
        }
        // lewo dol
        if (this.board.isFieldEmpty(row + 1, col - 1) &&
            !this.board.isFieldUnderAttack(row + 1, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 1, col - 1));
        }
        // prawo dol
        if (this.board.isFieldEmpty(row + 1, col + 1) &&
            !this.board.isFieldUnderAttack(row + 1, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 1, col + 1));
        }
        if (!this.isMovedAlready) {
            let longCastlePossible = true;
            for (let i = col - 1; i > 0; --i) {
                if (!this.board.isFieldEmpty(row, i) ||
                    this.board.isFieldUnderAttack(row, i, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                    longCastlePossible = false;
                    break;
                }
            }
            if (longCastlePossible && !this.board.isKingInCheck(this.color, this.board.pieces) && this.board.getPieceByField(row, 0)) {
                const leftRook = this.board.getPieceByField(row, 0);
                if (leftRook instanceof Rook) {
                    if (!leftRook.isMovedAlready) {
                        possiblePoints.push(new Point(row, col - 2));
                    }
                }
            }
            let shortCastlePossible = true;
            for (let i = col + 1; i < 7; ++i) {
                if (!this.board.isFieldEmpty(row, i) ||
                    this.board.isFieldUnderAttack(row, i, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                    shortCastlePossible = false;
                    break;
                }
            }
            if (shortCastlePossible && !this.board.isKingInCheck(this.color, this.board.pieces) && this.board.getPieceByField(row, 7)) {
                const rightRook = this.board.getPieceByField(row, 7);
                if (rightRook instanceof Rook) {
                    if (!rightRook.isMovedAlready) {
                        possiblePoints.push(new Point(row, col + 2));
                    }
                }
            }
        }
        return possiblePoints;
    }
    getPossibleCaptures() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        // lewo
        if (this.board.isFieldTakenByEnemy(row, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE) &&
            !this.board.isFieldUnderAttack(row, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row, col - 1));
        }
        // prawo
        if (this.board.isFieldTakenByEnemy(row, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE) &&
            !this.board.isFieldUnderAttack(row, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row, col + 1));
        }
        // dol
        if (this.board.isFieldTakenByEnemy(row + 1, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE) &&
            !this.board.isFieldUnderAttack(row + 1, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 1, col));
        }
        // gora
        if (this.board.isFieldTakenByEnemy(row - 1, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE) &&
            !this.board.isFieldUnderAttack(row - 1, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 1, col));
        }
        // lewo gora
        if (this.board.isFieldTakenByEnemy(row - 1, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE) &&
            !this.board.isFieldUnderAttack(row - 1, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 1, col - 1));
        }
        // prawo gora
        if (this.board.isFieldTakenByEnemy(row - 1, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE) &&
            !this.board.isFieldUnderAttack(row - 1, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 1, col + 1));
        }
        // lewo dol
        if (this.board.isFieldTakenByEnemy(row + 1, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE) &&
            !this.board.isFieldUnderAttack(row + 1, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 1, col - 1));
        }
        // prawo dol
        if (this.board.isFieldTakenByEnemy(row + 1, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE) &&
            !this.board.isFieldUnderAttack(row + 1, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 1, col + 1));
        }
        return possiblePoints;
    }
    getCoveredFields() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        // lewo
        possiblePoints.push(new Point(row, col - 1));
        // prawo
        possiblePoints.push(new Point(row, col + 1));
        // dol
        possiblePoints.push(new Point(row + 1, col));
        // gora
        possiblePoints.push(new Point(row - 1, col));
        // lewo gora
        possiblePoints.push(new Point(row - 1, col - 1));
        // prawo gora
        possiblePoints.push(new Point(row - 1, col + 1));
        // lewo dol
        possiblePoints.push(new Point(row + 1, col - 1));
        // prawo dol
        possiblePoints.push(new Point(row + 1, col + 1));
        return possiblePoints;
    }
}

class Bishop extends Piece {
    constructor(point, color, constant, board) {
        super(point, color, constant, 3, board);
    }
    getPossibleMoves() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
            // lewa gorna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                break;
            }
        }
        for (let i = row - 1, j = col + 1; i >= 0 && j < 8; --i, ++j) {
            // prawa gorna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                break;
            }
        }
        for (let i = row + 1, j = col - 1; i < 8 && j >= 0; ++i, --j) {
            // lewa dolna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                break;
            }
        }
        for (let i = row + 1, j = col + 1; i < 8 && j < 8; ++i, ++j) {
            // prawa dolna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                break;
            }
        }
        return possiblePoints;
    }
    getPossibleCaptures() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
            // lewa gorna przekatna
            if (this.board.isFieldTakenByEnemy(i, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, j)) {
                    break;
                }
            }
        }
        for (let i = row - 1, j = col + 1; i >= 0 && j < 8; --i, ++j) {
            // prawa gorna przekatna
            if (this.board.isFieldTakenByEnemy(i, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, j)) {
                    break;
                }
            }
        }
        for (let i = row + 1, j = col - 1; i < 8 && j >= 0; ++i, --j) {
            // lewa dolna przekatna
            if (this.board.isFieldTakenByEnemy(i, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, j)) {
                    break;
                }
            }
        }
        for (let i = row + 1, j = col + 1; i < 8 && j < 8; ++i, ++j) {
            // prawa dolna przekatna
            if (this.board.isFieldTakenByEnemy(i, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, j)) {
                    break;
                }
            }
        }
        return possiblePoints;
    }
    getCoveredFields() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
            // lewa gorna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                if (!(this.board.getPieceByField(i, j) instanceof King)) {
                    possiblePoints.push(new Point(i, j));
                }
                break;
            }
        }
        for (let i = row - 1, j = col + 1; i >= 0 && j < 8; --i, ++j) {
            // prawa gorna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                if (!(this.board.getPieceByField(i, j) instanceof King)) {
                    possiblePoints.push(new Point(i, j));
                }
                break;
            }
        }
        for (let i = row + 1, j = col - 1; i < 8 && j >= 0; ++i, --j) {
            // lewa dolna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                if (!(this.board.getPieceByField(i, j) instanceof King)) {
                    possiblePoints.push(new Point(i, j));
                }
                break;
            }
        }
        for (let i = row + 1, j = col + 1; i < 8 && j < 8; ++i, ++j) {
            // prawa dolna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                if (!(this.board.getPieceByField(i, j) instanceof King)) {
                    possiblePoints.push(new Point(i, j));
                }
                break;
            }
        }
        return possiblePoints;
    }
}

class Knight extends Piece {
    constructor(point, color, constant, board) {
        super(point, color, constant, 3, board);
        this.isMovedAlready = false;
    }
    getPossibleMoves() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        // gora -> lewo
        if (this.board.isFieldEmpty(row - 2, col - 1)) {
            possiblePoints.push(new Point(row - 2, col - 1));
        }
        // gora -> prawo
        if (this.board.isFieldEmpty(row - 2, col + 1)) {
            possiblePoints.push(new Point(row - 2, col + 1));
        }
        // lewo -> gora
        if (this.board.isFieldEmpty(row - 1, col - 2)) {
            possiblePoints.push(new Point(row - 1, col - 2));
        }
        // prawo -> gora
        if (this.board.isFieldEmpty(row - 1, col + 2)) {
            possiblePoints.push(new Point(row - 1, col + 2));
        }
        // lewo -> dol
        if (this.board.isFieldEmpty(row + 1, col - 2)) {
            possiblePoints.push(new Point(row + 1, col - 2));
        }
        // prawo -> dol
        if (this.board.isFieldEmpty(row + 1, col + 2)) {
            possiblePoints.push(new Point(row + 1, col + 2));
        }
        // dol -> lewo
        if (this.board.isFieldEmpty(row + 2, col - 1)) {
            possiblePoints.push(new Point(row + 2, col - 1));
        }
        // dol -> prawo
        if (this.board.isFieldEmpty(row + 2, col + 1)) {
            possiblePoints.push(new Point(row + 2, col + 1));
        }
        return possiblePoints;
    }
    getPossibleCaptures() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        // gora -> lewo
        if (this.board.isFieldTakenByEnemy(row - 2, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 2, col - 1));
        }
        // gora -> prawo
        if (this.board.isFieldTakenByEnemy(row - 2, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 2, col + 1));
        }
        // lewo -> gora
        if (this.board.isFieldTakenByEnemy(row - 1, col - 2, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 1, col - 2));
        }
        // prawo -> gora
        if (this.board.isFieldTakenByEnemy(row - 1, col + 2, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row - 1, col + 2));
        }
        // lewo -> dol
        if (this.board.isFieldTakenByEnemy(row + 1, col - 2, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 1, col - 2));
        }
        // prawo -> dol
        if (this.board.isFieldTakenByEnemy(row + 1, col + 2, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 1, col + 2));
        }
        // dol -> lewo
        if (this.board.isFieldTakenByEnemy(row + 2, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 2, col - 1));
        }
        // dol -> prawo
        if (this.board.isFieldTakenByEnemy(row + 2, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            possiblePoints.push(new Point(row + 2, col + 1));
        }
        return possiblePoints;
    }
    getCoveredFields() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        // gora -> lewo
        possiblePoints.push(new Point(row - 2, col - 1));
        // gora -> prawo
        possiblePoints.push(new Point(row - 2, col + 1));
        // lewo -> gora
        possiblePoints.push(new Point(row - 1, col - 2));
        // prawo -> gora
        possiblePoints.push(new Point(row - 1, col + 2));
        // lewo -> dol
        possiblePoints.push(new Point(row + 1, col - 2));
        // prawo -> dol
        possiblePoints.push(new Point(row + 1, col + 2));
        // dol -> lewo
        possiblePoints.push(new Point(row + 2, col - 1));
        // dol -> prawo
        possiblePoints.push(new Point(row + 2, col + 1));
        return possiblePoints;
    }
}

class Pawn extends Piece {
    constructor(point, color, constant, board) {
        super(point, color, constant, 1, board);
        this.isMovedAlready = false;
    }
    getPossibleMoves() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        if ((!this.board.reverted && this.color === Color.WHITE) ||
            (this.board.reverted && this.color === Color.BLACK)) {
            if (this.board.isFieldEmpty(row - 1, col)) {
                possiblePoints.push(new Point(row - 1, col));
                if (!this.isMovedAlready &&
                    this.board.isFieldEmpty(row - 2, col)) {
                    possiblePoints.push(new Point(row - 2, col));
                }
            }
        }
        else {
            if (
            /*!board.isFieldTakenByEnemy(row + 1, col, Color.WHITE) &&*/ this.board.isFieldEmpty(row + 1, col)) {
                possiblePoints.push(new Point(row + 1, col));
                if (!this.isMovedAlready &&
                    this.board.isFieldEmpty(row + 2, col)) {
                    possiblePoints.push(new Point(row + 2, col));
                }
            }
        }
        return possiblePoints;
    }
    getPossibleCaptures() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        if ((!this.board.reverted && this.color === Color.WHITE) ||
            (this.board.reverted && this.color === Color.BLACK)) {
            if (this.board.isFieldTakenByEnemy(row - 1, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(row - 1, col - 1));
            }
            if (this.board.isFieldTakenByEnemy(row - 1, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(row - 1, col + 1));
            }
        }
        else {
            if (this.board.isFieldTakenByEnemy(row + 1, col - 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(row + 1, col - 1));
            }
            if (this.board.isFieldTakenByEnemy(row + 1, col + 1, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(row + 1, col + 1));
            }
        }
        if (this.board.enPassantPoint &&
            this.board.enPassantPiece.color ===
                (this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
            if (row === this.board.enPassantPiece.point.row &&
                Math.abs(this.board.enPassantPiece.point.col - col) === 1) {
                possiblePoints.push(this.board.enPassantPoint);
            }
        }
        return possiblePoints;
    }
    getCoveredFields() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        if ((!this.board.reverted && this.color === Color.WHITE) ||
            (this.board.reverted && this.color === Color.BLACK)) {
            possiblePoints.push(new Point(row - 1, col - 1));
            possiblePoints.push(new Point(row - 1, col + 1));
        }
        else {
            possiblePoints.push(new Point(row + 1, col - 1));
            possiblePoints.push(new Point(row + 1, col + 1));
        }
        return possiblePoints;
    }
}

class Queen extends Piece {
    constructor(point, color, constant, board) {
        super(point, color, constant, 9, board);
    }
    getPossibleMoves() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
            // lewa gorna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                break;
            }
        }
        for (let i = row - 1, j = col + 1; i >= 0 && j < 8; --i, ++j) {
            // prawa gorna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                break;
            }
        }
        for (let i = row + 1, j = col - 1; i < 8 && j >= 0; ++i, --j) {
            // lewa dolna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                break;
            }
        }
        for (let i = row + 1, j = col + 1; i < 8 && j < 8; ++i, ++j) {
            // prawa dolna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                break;
            }
        }
        for (let i = row + 1; i < 8; ++i) {
            // dol
            if (this.board.isFieldEmpty(i, col)) {
                possiblePoints.push(new Point(i, col));
            }
            else {
                break;
            }
        }
        for (let i = row - 1; i >= 0; --i) {
            // gora
            if (this.board.isFieldEmpty(i, col)) {
                possiblePoints.push(new Point(i, col));
            }
            else {
                break;
            }
        }
        for (let j = col - 1; j >= 0; --j) {
            // lewo
            if (this.board.isFieldEmpty(row, j)) {
                possiblePoints.push(new Point(row, j));
            }
            else {
                break;
            }
        }
        for (let j = col + 1; j < 8; ++j) {
            // prawo
            if (this.board.isFieldEmpty(row, j)) {
                possiblePoints.push(new Point(row, j));
            }
            else {
                break;
            }
        }
        return possiblePoints;
    }
    getPossibleCaptures() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
            // lewa gorna przekatna
            if (this.board.isFieldTakenByEnemy(i, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, j)) {
                    break;
                }
            }
        }
        for (let i = row - 1, j = col + 1; i >= 0 && j < 8; --i, ++j) {
            // prawa gorna przekatna
            if (this.board.isFieldTakenByEnemy(i, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, j)) {
                    break;
                }
            }
        }
        for (let i = row + 1, j = col - 1; i < 8 && j >= 0; ++i, --j) {
            // lewa dolna przekatna
            if (this.board.isFieldTakenByEnemy(i, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, j)) {
                    break;
                }
            }
        }
        for (let i = row + 1, j = col + 1; i < 8 && j < 8; ++i, ++j) {
            // prawa dolna przekatna
            if (this.board.isFieldTakenByEnemy(i, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, j)) {
                    break;
                }
            }
        }
        for (let i = row + 1; i < 8; ++i) {
            // dol
            if (this.board.isFieldTakenByEnemy(i, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, col));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, col)) {
                    break;
                }
            }
        }
        for (let i = row - 1; i >= 0; --i) {
            // gora
            if (this.board.isFieldTakenByEnemy(i, col, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(i, col));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(i, col)) {
                    break;
                }
            }
        }
        for (let j = col - 1; j >= 0; --j) {
            // lewo
            if (this.board.isFieldTakenByEnemy(row, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(row, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(row, j)) {
                    break;
                }
            }
        }
        for (let j = col + 1; j < 8; ++j) {
            // prawo
            if (this.board.isFieldTakenByEnemy(row, j, this.color === Color.WHITE ? Color.BLACK : Color.WHITE)) {
                possiblePoints.push(new Point(row, j));
                break;
            }
            else {
                if (!this.board.isFieldEmpty(row, j)) {
                    break;
                }
            }
        }
        return possiblePoints;
    }
    getCoveredFields() {
        const possiblePoints = [];
        const row = this.point.row;
        const col = this.point.col;
        for (let i = row + 1; i < 8; ++i) {
            // dol
            if (this.board.isFieldEmpty(i, col)) {
                possiblePoints.push(new Point(i, col));
            }
            else {
                if (!(this.board.getPieceByField(i, col) instanceof King)) {
                    possiblePoints.push(new Point(i, col));
                }
                break;
            }
        }
        for (let i = row - 1; i >= 0; --i) {
            // gora
            if (this.board.isFieldEmpty(i, col)) {
                possiblePoints.push(new Point(i, col));
            }
            else {
                if (!(this.board.getPieceByField(i, col) instanceof King)) {
                    possiblePoints.push(new Point(i, col));
                }
                break;
            }
        }
        for (let j = col - 1; j >= 0; --j) {
            // lewo
            if (this.board.isFieldEmpty(row, j)) {
                possiblePoints.push(new Point(row, j));
            }
            else {
                if (!(this.board.getPieceByField(row, j) instanceof King)) {
                    possiblePoints.push(new Point(row, j));
                }
                break;
            }
        }
        for (let j = col + 1; j < 8; ++j) {
            // prawo
            if (this.board.isFieldEmpty(row, j)) {
                possiblePoints.push(new Point(row, j));
            }
            else {
                if (!(this.board.getPieceByField(row, j) instanceof King)) {
                    possiblePoints.push(new Point(row, j));
                }
                break;
            }
        }
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
            // lewa gorna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                if (!(this.board.getPieceByField(i, j) instanceof King)) {
                    possiblePoints.push(new Point(i, j));
                }
                break;
            }
        }
        for (let i = row - 1, j = col + 1; i >= 0 && j < 8; --i, ++j) {
            // prawa gorna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                if (!(this.board.getPieceByField(i, j) instanceof King)) {
                    possiblePoints.push(new Point(i, j));
                }
                break;
            }
        }
        for (let i = row + 1, j = col - 1; i < 8 && j >= 0; ++i, --j) {
            // lewa dolna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                if (!(this.board.getPieceByField(i, j) instanceof King)) {
                    possiblePoints.push(new Point(i, j));
                }
                break;
            }
        }
        for (let i = row + 1, j = col + 1; i < 8 && j < 8; ++i, ++j) {
            // prawa dolna przekatna
            if (this.board.isFieldEmpty(i, j)) {
                possiblePoints.push(new Point(i, j));
            }
            else {
                if (!(this.board.getPieceByField(i, j) instanceof King)) {
                    possiblePoints.push(new Point(i, j));
                }
                break;
            }
        }
        return possiblePoints;
    }
}

const UnicodeConstants = {
    WHITE_KING: { name: 'King', icon: '&#x2654;' },
    WHITE_QUEEN: { name: 'Queen', icon: '&#x2655;' },
    WHITE_KNIGHT: { name: 'Knight', icon: '&#x2658' },
    WHITE_ROOK: { name: 'Rook', icon: '&#x2656' },
    WHITE_PAWN: { name: 'Pawn', icon: '&#x2659' },
    WHITE_BISHOP: { name: 'Bishop', icon: '&#x2657' },
    BLACK_KING: { name: 'King', icon: '&#x265A' },
    BLACK_QUEEN: { name: 'Queen', icon: '&#x265B' },
    BLACK_KNIGHT: { name: 'Knight', icon: '&#x265E' },
    BLACK_ROOK: { name: 'Rook', icon: '&#x265C' },
    BLACK_PAWN: { name: 'Pawn', icon: '&#x265F' },
    BLACK_BISHOP: { name: 'Bishop', icon: '&#x265D' },
};

class DefaultFenProcessor {
    process(notation, engineFacade) {
        let fen = notation;
        if (notation) {
            engineFacade.board.reverted = false;
            engineFacade.board.pieces = [];
            const split = fen.split('/');
            for (let i = 0; i < 8; ++i) {
                let pointer = 0;
                for (let j = 0; j < split[i].split(' ')[0].length; ++j) {
                    const chunk = split[i].charAt(j);
                    if (chunk.match(/[0-9]/)) {
                        pointer += Number(chunk);
                    }
                    else {
                        switch (chunk) {
                            case 'r':
                                engineFacade.board.pieces.push(new Rook(new Point(i, pointer), Color.BLACK, UnicodeConstants.BLACK_ROOK, engineFacade.board));
                                break;
                            case 'n':
                                engineFacade.board.pieces.push(new Knight(new Point(i, pointer), Color.BLACK, UnicodeConstants.BLACK_KNIGHT, engineFacade.board));
                                break;
                            case 'b':
                                engineFacade.board.pieces.push(new Bishop(new Point(i, pointer), Color.BLACK, UnicodeConstants.BLACK_BISHOP, engineFacade.board));
                                break;
                            case 'q':
                                engineFacade.board.pieces.push(new Queen(new Point(i, pointer), Color.BLACK, UnicodeConstants.BLACK_QUEEN, engineFacade.board));
                                break;
                            case 'k':
                                engineFacade.board.pieces.push(new King(new Point(i, pointer), Color.BLACK, UnicodeConstants.BLACK_KING, engineFacade.board));
                                break;
                            case 'p': {
                                const pawn = new Pawn(new Point(i, pointer), Color.BLACK, UnicodeConstants.BLACK_PAWN, engineFacade.board);
                                if ((pawn.color === Color.BLACK && pawn.point.row !== 1) ||
                                    (pawn.color === Color.WHITE && pawn.point.row !== 6)) {
                                    pawn.isMovedAlready = true;
                                }
                                engineFacade.board.pieces.push(pawn);
                                break;
                            }
                            case 'R':
                                engineFacade.board.pieces.push(new Rook(new Point(i, pointer), Color.WHITE, UnicodeConstants.WHITE_ROOK, engineFacade.board));
                                break;
                            case 'N':
                                engineFacade.board.pieces.push(new Knight(new Point(i, pointer), Color.WHITE, UnicodeConstants.WHITE_KNIGHT, engineFacade.board));
                                break;
                            case 'B':
                                engineFacade.board.pieces.push(new Bishop(new Point(i, pointer), Color.WHITE, UnicodeConstants.WHITE_BISHOP, engineFacade.board));
                                break;
                            case 'Q':
                                engineFacade.board.pieces.push(new Queen(new Point(i, pointer), Color.WHITE, UnicodeConstants.WHITE_QUEEN, engineFacade.board));
                                break;
                            case 'K':
                                engineFacade.board.pieces.push(new King(new Point(i, pointer), Color.WHITE, UnicodeConstants.WHITE_KING, engineFacade.board));
                                break;
                            case 'P': {
                                const pawn = new Pawn(new Point(i, pointer), Color.WHITE, UnicodeConstants.WHITE_PAWN, engineFacade.board);
                                if ((pawn.color === Color.BLACK && pawn.point.row !== 1) ||
                                    (pawn.color === Color.WHITE && pawn.point.row !== 6)) {
                                    pawn.isMovedAlready = true;
                                }
                                engineFacade.board.pieces.push(pawn);
                                break;
                            }
                        }
                        ++pointer;
                    }
                }
            }
            this.setCurrentPlayer(engineFacade.board, fen);
            this.setCastles(engineFacade.board, fen);
            this.setEnPassant(fen);
            this.setFullMoveCount(fen);
            engineFacade.board.fen = fen;
        }
        else {
            throw Error('Incorrect FEN provided');
        }
    }
    setCurrentPlayer(board, fen) {
        if (fen) {
            const split = fen.split(' ');
            board.currentWhitePlayer = split[1] === 'w';
        }
    }
    setCastles(board, fen) {
        if (fen) {
            const split = fen.split(' ');
            const castleChunk = split[2];
            if (!castleChunk.includes('K')) {
                this.setRookAlreadyMoved(board, Color.WHITE, 7);
            }
            if (!castleChunk.includes('Q')) {
                this.setRookAlreadyMoved(board, Color.WHITE, 0);
            }
            if (!castleChunk.includes('k')) {
                this.setRookAlreadyMoved(board, Color.BLACK, 7);
            }
            if (!castleChunk.includes('q')) {
                this.setRookAlreadyMoved(board, Color.BLACK, 0);
            }
        }
    }
    setFullMoveCount(fen) { }
    setEnPassant(fen) {
        if (fen) {
            const split = fen.split(' ');
            const enPassantPoint = split[3];
            if (enPassantPoint === '-') {
                return;
            }
            // if()
        }
    }
    setRookAlreadyMoved(board, color, col) {
        const rook = board.pieces.find((piece) => piece.color === color && piece instanceof Rook && piece.point.col === col);
        if (rook) {
            rook.isMovedAlready = true;
        }
    }
}

class MoveTranslation {
    constructor(xAxis, yAxis, reverted) {
        this._xAxis = xAxis;
        this._yAxis = yAxis;
        this._reverted = reverted;
    }
    get xAxis() {
        return this._xAxis;
    }
    set xAxis(value) {
        this._xAxis = value;
    }
    get yAxis() {
        return this._yAxis;
    }
    set yAxis(value) {
        this._yAxis = value;
    }
    get reverted() {
        return this._reverted;
    }
    set reverted(value) {
        this._reverted = value;
    }
}

class MoveUtils {
    static willMoveCauseCheck(currentColor, row, col, destRow, destCol, board) {
        const srcPiece = board.getPieceByField(row, col);
        const destPiece = board.getPieceByField(destRow, destCol);
        if (srcPiece) {
            srcPiece.point.row = destRow;
            srcPiece.point.col = destCol;
        }
        if (destPiece) {
            board.pieces = board.pieces.filter((piece) => piece !== destPiece);
        }
        const isBound = board.isKingInCheck(currentColor, board.pieces);
        if (srcPiece) {
            srcPiece.point.col = col;
            srcPiece.point.row = row;
        }
        if (destPiece) {
            board.pieces.push(destPiece);
        }
        return isBound;
    }
    static format(sourcePoint, destPoint, reverted) {
        if (reverted) {
            const sourceX = 104 - sourcePoint.col;
            const destX = 104 - destPoint.col;
            return (String.fromCharCode(sourceX) +
                (sourcePoint.row + 1) +
                String.fromCharCode(destX) +
                (destPoint.row + 1));
        }
        else {
            const incrementX = 97;
            return (String.fromCharCode(sourcePoint.col + incrementX) +
                (Math.abs(sourcePoint.row - 7) + 1) +
                String.fromCharCode(destPoint.col + incrementX) +
                (Math.abs(destPoint.row - 7) + 1));
        }
    }
    static translateCoordsToIndex(coords, reverted) {
        let xAxis;
        let yAxis;
        if (reverted) {
            xAxis = 104 - coords.charCodeAt(0);
            yAxis = +coords.charAt(1) - 1;
        }
        else {
            xAxis = coords.charCodeAt(0) - 97;
            yAxis = Math.abs(+coords.charAt(1) - 8);
        }
        return new MoveTranslation(xAxis, yAxis, reverted);
    }
    static findPieceByPossibleMovesContaining(coords, board, color) {
        let indexes = this.translateCoordsToIndex(coords, board.reverted);
        let destPoint = new Point(indexes.yAxis, indexes.xAxis);
        let foundPieces = [];
        for (let piece of board.pieces.filter(piece => piece.color === color)) {
            for (let point of piece.getPossibleMoves()) {
                if (!MoveUtils.willMoveCauseCheck(piece.color, piece.point.row, piece.point.col, indexes.yAxis, indexes.xAxis, board) && point.isEqual(destPoint)) {
                    foundPieces.push(piece);
                }
            }
        }
        return foundPieces;
    }
    static findPieceByPossibleCapturesContaining(coords, board, color) {
        let indexes = this.translateCoordsToIndex(coords, board.reverted);
        let destPoint = new Point(indexes.yAxis, indexes.xAxis);
        let foundPieces = [];
        for (let piece of board.pieces.filter(piece => piece.color === color)) {
            for (let point of piece.getPossibleCaptures()) {
                if (!MoveUtils.willMoveCauseCheck(piece.color, piece.point.row, piece.point.col, indexes.yAxis, indexes.xAxis, board) && point.isEqual(destPoint)) {
                    foundPieces.push(piece);
                }
            }
        }
        return foundPieces;
    }
    static formatSingle(point, reverted) {
        if (reverted) {
            const sourceX = 104 - point.col;
            return (String.fromCharCode(sourceX) +
                (point.row + 1));
        }
        else {
            const incrementX = 97;
            return (String.fromCharCode(point.col + incrementX) +
                (Math.abs(point.row - 7) + 1));
        }
    }
    static getFirstLetterPiece(piece) {
        if (piece instanceof Pawn) {
            return 'P';
        }
        else {
            if (piece instanceof Knight) {
                return 'N';
            }
            else {
                if (piece instanceof Bishop) {
                    return 'B';
                }
                else {
                    if (piece instanceof Rook) {
                        return 'R';
                    }
                    else {
                        if (piece instanceof King) {
                            return 'K';
                        }
                        else {
                            if (piece instanceof Queen) {
                                return 'Q';
                            }
                        }
                    }
                }
            }
        }
        return '';
    }
    static reverse(board, row) {
        return board.reverted
            ? row + 1
            : Math.abs(row - 7) + 1;
    }
    static formatCol(board, col) {
        return board.reverted
            ? String.fromCharCode(104 - col)
            : String.fromCharCode(97 + col);
    }
}

class DefaultPiecesLoader {
    static loadDefaultPieces(board) {
        board.pieces = [];
        // piony czarne
        for (let i = 0; i < 8; ++i) {
            board.pieces.push(new Pawn(new Point(1, i), Color.BLACK, UnicodeConstants.BLACK_PAWN, board));
        }
        board.pieces.push(new Rook(new Point(0, 0), Color.BLACK, UnicodeConstants.BLACK_ROOK, board));
        board.pieces.push(new Knight(new Point(0, 1), Color.BLACK, UnicodeConstants.BLACK_KNIGHT, board));
        board.pieces.push(new Bishop(new Point(0, 2), Color.BLACK, UnicodeConstants.BLACK_BISHOP, board));
        board.pieces.push(new Queen(new Point(0, 3), Color.BLACK, UnicodeConstants.BLACK_QUEEN, board));
        board.pieces.push(new King(new Point(0, 4), Color.BLACK, UnicodeConstants.BLACK_KING, board));
        board.pieces.push(new Bishop(new Point(0, 5), Color.BLACK, UnicodeConstants.BLACK_BISHOP, board));
        board.pieces.push(new Knight(new Point(0, 6), Color.BLACK, UnicodeConstants.BLACK_KNIGHT, board));
        board.pieces.push(new Rook(new Point(0, 7), Color.BLACK, UnicodeConstants.BLACK_ROOK, board));
        // piony biale
        for (let i = 0; i < 8; ++i) {
            board.pieces.push(new Pawn(new Point(6, i), Color.WHITE, UnicodeConstants.WHITE_PAWN, board));
        }
        board.pieces.push(new Rook(new Point(7, 0), Color.WHITE, UnicodeConstants.WHITE_ROOK, board));
        board.pieces.push(new Knight(new Point(7, 1), Color.WHITE, UnicodeConstants.WHITE_KNIGHT, board));
        board.pieces.push(new Bishop(new Point(7, 2), Color.WHITE, UnicodeConstants.WHITE_BISHOP, board));
        board.pieces.push(new Queen(new Point(7, 3), Color.WHITE, UnicodeConstants.WHITE_QUEEN, board));
        board.pieces.push(new King(new Point(7, 4), Color.WHITE, UnicodeConstants.WHITE_KING, board));
        board.pieces.push(new Bishop(new Point(7, 5), Color.WHITE, UnicodeConstants.WHITE_BISHOP, board));
        board.pieces.push(new Knight(new Point(7, 6), Color.WHITE, UnicodeConstants.WHITE_KNIGHT, board));
        board.pieces.push(new Rook(new Point(7, 7), Color.WHITE, UnicodeConstants.WHITE_ROOK, board));
        board.calculateFEN();
    }
}

let DefaultPgnProcessor$1 = class DefaultPgnProcessor {
    process(notation, engineFacade) {
        if (notation) {
            engineFacade.board.reverted = false;
            engineFacade.board.pieces = [];
            engineFacade.reset();
            DefaultPiecesLoader.loadDefaultPieces(engineFacade.board);
            let moves = this.extractMoves(notation);
            let counter = -1;
            for (let move of moves) {
                ++counter;
                move = move.replace(/[+#]/g, '');
                let promotionIndex = '';
                if (move.includes('=')) {
                    promotionIndex = this.resolvePromotion(move.substring(move.length - 1));
                    move = move.substring(0, move.length - 2);
                }
                let color = (counter === 0 || counter % 2 === 0)
                    ? Color.WHITE
                    : Color.BLACK;
                if (/^[a-z]\d$/g.test(move)) { // zwykly ruch na wolne pole e4
                    let piece = MoveUtils.findPieceByPossibleMovesContaining(move, engineFacade.board, color).find(piece => piece instanceof Pawn);
                    // en passant check
                    if (!piece) {
                        piece = MoveUtils.findPieceByPossibleCapturesContaining(move, engineFacade.board, color).find(piece => piece instanceof Pawn);
                    }
                    // if piece is found for sure
                    if (piece) {
                        engineFacade.move(MoveUtils.formatSingle(piece.point, false) + move + promotionIndex);
                    }
                }
                else {
                    if (/^[A-Z][a-h]\d$/g.test(move)) { // jezeli ma wielka litere, czyli trzeba odszukac ktora figura Nf3
                        let pieces = MoveUtils.findPieceByPossibleMovesContaining(move.substring(1), engineFacade.board, color);
                        let piece = pieces.find(piece => this.resolvePieceByFirstChar(move.charAt(0), piece));
                        if (piece) {
                            engineFacade.move(MoveUtils.formatSingle(piece.point, false) + move.substring(1) + promotionIndex);
                        }
                        else {
                        }
                    }
                    else {
                        if ('O-O' === move) {
                            engineFacade.move(color === Color.WHITE ? 'e1g1' : 'e8g8');
                        }
                        else {
                            if (/^[a-z]x[a-z]\d$/g.test(move)) { //exd5
                                let pieces = MoveUtils.findPieceByPossibleCapturesContaining(move.substring(move.indexOf('x') + 1), engineFacade.board, color).filter(piece => piece instanceof Pawn);
                                let piece;
                                if (pieces.length > 1) {
                                    piece = this.resolveByCol(pieces, move.substring(0, 1));
                                }
                                else {
                                    piece = pieces[0];
                                }
                                if (piece) {
                                    engineFacade.move(MoveUtils.formatSingle(piece.point, false) + move.substring(move.indexOf('x') + 1) + promotionIndex);
                                }
                                else {
                                }
                            }
                            else {
                                if (/^[A-Z]x[a-z]\d$/g.test(move)) {
                                    let piece = MoveUtils.findPieceByPossibleCapturesContaining(move.substring(move.indexOf('x') + 1), engineFacade.board, color).find(piece => this.resolvePieceByFirstChar(move.substring(0, 1), piece));
                                    if (piece) {
                                        engineFacade.move(MoveUtils.formatSingle(piece.point, false) + move.substring(move.indexOf('x') + 1) + promotionIndex);
                                    }
                                    else {
                                    }
                                }
                                else {
                                    if (move === 'O-O-O') {
                                        engineFacade.move(color === Color.WHITE ? 'e1c1' : 'e8c8');
                                    }
                                    else {
                                        if (/^[A-Z]\dx[a-z]\d$/g.test(move)) { //Ngxe4 sytuacja 2 skoczkow pion bicie
                                            let pieces = MoveUtils.findPieceByPossibleCapturesContaining(move.substring(move.indexOf('x') + 1), engineFacade.board, color).filter(piece => this.resolvePieceByFirstChar(move.charAt(0), piece));
                                            let piece = this.resolveByRow(pieces, move.substring(1, 2));
                                            if (piece) {
                                                engineFacade.move(MoveUtils.formatSingle(piece.point, false) + move.substring(move.indexOf('x') + 1) + promotionIndex);
                                            }
                                        }
                                        else {
                                            if (/^[A-Z][a-z][a-z]\d$/g.test(move)) { // dwie wieze bez bicia Rac1 pion
                                                let pieces = MoveUtils.findPieceByPossibleMovesContaining(move.substring(2, 4), engineFacade.board, color).filter(piece => this.resolvePieceByFirstChar(move.charAt(0), piece));
                                                let piece = this.resolveByCol(pieces, move.substring(1, 2));
                                                if (piece) {
                                                    engineFacade.move(MoveUtils.formatSingle(piece.point, false) + move.substring(2, 4) + promotionIndex);
                                                }
                                            }
                                            else {
                                                if (/^[A-Z][a-z]x[a-z]\d$/g.test(move)) {
                                                    let pieces = MoveUtils.findPieceByPossibleCapturesContaining(move.substring(move.indexOf('x') + 1), engineFacade.board, color).filter(piece => this.resolvePieceByFirstChar(move.charAt(0), piece));
                                                    let piece = this.resolveByCol(pieces, move.substring(1, 2));
                                                    if (piece) {
                                                        engineFacade.move(MoveUtils.formatSingle(piece.point, false) + move.substring(move.indexOf('x') + 1) + promotionIndex);
                                                    }
                                                }
                                                else {
                                                    this.processR1f2(move, engineFacade, color, promotionIndex);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    processR1f2(move, engineFacade, color, promotionIndex) {
        if (/^[A-Z]\d[a-z]\d$/g.test(move)) { // R1f2
            let pieces = MoveUtils.findPieceByPossibleMovesContaining(move.substring(2, 4), engineFacade.board, color).filter(piece => this.resolvePieceByFirstChar(move.charAt(0), piece));
            let piece = this.resolveByRow(pieces, move.substring(1, 2));
            if (piece) {
                engineFacade.move(MoveUtils.formatSingle(piece.point, false) + move.substring(2, 4) + promotionIndex);
            }
        }
    }
    extractMoves(notation) {
        return notation.substring(notation.lastIndexOf(']') + 1)
            .replace(/[0-9]+\./g, '')
            .replace(/\s+/g, ' ')
            .replace(/{[^}]*}/g, '')
            .trim()
            .split(' ')
            .filter(s => s);
    }
    movePiece(piece, board, move) {
        let indexes = MoveUtils.translateCoordsToIndex(move, board.reverted);
        piece.point.col = indexes.xAxis;
        piece.point.row = indexes.yAxis;
    }
    hasUpperCase(move) {
        return /[A-Z]/.test(move);
    }
    resolvePieceByFirstChar(move, piece) {
        let piecesFirstChar = '';
        if (piece instanceof King) {
            piecesFirstChar = 'K';
        }
        else {
            if (piece instanceof Queen) {
                piecesFirstChar = 'Q';
            }
            else {
                if (piece instanceof Rook) {
                    piecesFirstChar = 'R';
                }
                else {
                    if (piece instanceof Bishop) {
                        piecesFirstChar = 'B';
                    }
                    else {
                        if (piece instanceof Knight) {
                            piecesFirstChar = 'N';
                        }
                        else {
                            if (piece instanceof Pawn) {
                                piecesFirstChar = 'P';
                            }
                        }
                    }
                }
            }
        }
        return move === piecesFirstChar;
    }
    isShortCastle(move) {
        return move === 'O-O';
    }
    removePiece(coords, board) {
        let indexes = MoveUtils.translateCoordsToIndex(coords, board.reverted);
        board.pieces = board.pieces.filter(e => !e.point.isEqual(new Point(indexes.yAxis, indexes.xAxis)));
    }
    isLongCastle(move) {
        return move === 'O-O-O';
    }
    resolveByCol(pieces, char) {
        let firstPieceFormat = MoveUtils.formatSingle(pieces[0].point, false);
        let secondPieceFormat = MoveUtils.formatSingle(pieces[1].point, false);
        return firstPieceFormat.substring(0, 1) === char
            ? pieces[0]
            : pieces[1];
    }
    resolveByRow(pieces, char) {
        let firstPieceFormat = MoveUtils.formatSingle(pieces[0].point, false);
        let secondPieceFormat = MoveUtils.formatSingle(pieces[1].point, false);
        return firstPieceFormat.substring(1, 2) === char
            ? pieces[0]
            : pieces[1];
    }
    replacePromotion(move) {
        return move
            .replace('=Q', '1')
            .replace('=R', '2')
            .replace('=B', '3')
            .replace('=K', '4');
    }
    resolvePromotion(promotionChar) {
        switch (promotionChar) {
            case 'Q':
                return '1';
            case 'R':
                return '2';
            case 'B':
                return '3';
            case 'N':
                return '4';
        }
        return '';
    }
};

class NotationProcessorFactory {
    static getProcessor(type) {
        switch (type) {
            case NotationType.FEN:
                return new DefaultFenProcessor();
            case NotationType.PGN:
                return new DefaultPgnProcessor$1();
        }
    }
    static getDefaultProcessor() {
        return new DefaultFenProcessor();
    }
}
var NotationType;
(function (NotationType) {
    NotationType[NotationType["FEN"] = 1] = "FEN";
    NotationType[NotationType["PGN"] = 2] = "PGN";
})(NotationType || (NotationType = {}));

class DrawPoint {
    constructor(x, y, color) {
        this.x = x + 0.5;
        this.y = y + 0.5;
        this.color = color;
    }
    isEqual(that) {
        return that && that.x === this.x && this.y === that.y;
    }
}

class ClickUtils {
    static getClickPoint(event, top, height, left, width) {
        return new Point(Math.floor((event.y - top) / (height / 8)), Math.floor((event.x - left) / (width / 8)));
    }
    static getDrawingPoint(tileSize, colorStrategy, x, y, ctrl, alt, shift, xAxis, yAxis) {
        const squareSize = tileSize / 8;
        const xx = Math.floor((x - xAxis) /
            squareSize);
        const yy = Math.floor((y - yAxis) /
            squareSize);
        let color = colorStrategy.resolve(ctrl, shift, alt);
        return new DrawPoint(Math.floor(xx * squareSize + squareSize / 2), Math.floor(yy * squareSize + squareSize / 2), color);
    }
}

class HistoryMove {
    constructor(move, piece, color, captured) {
        this.move = move;
        this.piece = piece;
        this.color = color;
        this.x = captured;
    }
    setGameStates(check, stalemate, mate) {
        this.check = check;
        this.stalemate = stalemate;
        this.mate = mate;
    }
}

class HistoryMoveProvider {
    constructor() {
        this.historyMovesSubject$ = new BehaviorSubject([]);
    }
    get historyMoves() {
        return this.historyMovesSubject$.value;
    }
    set historyMoves(states) {
        this.historyMovesSubject$.next(states);
    }
    addMove(historyMove) {
        this.historyMoves = [...this.historyMoves, historyMove];
    }
    pop() {
        const lastHistoryMove = this.getLastMove();
        this.historyMoves = this.historyMoves.filter((state) => state !== lastHistoryMove);
        return lastHistoryMove;
    }
    getAll() {
        return this.historyMoves;
    }
    clear() {
        this.historyMoves = [];
    }
    getLastMove() {
        return this.historyMoves[this.getLastMoveIndex()];
    }
    getLastMoveIndex() {
        return this.historyMoves.length - 1;
    }
}

class Constants {
    static { this.DEFAULT_DARK_TILE_COLOR = 'rgb(97, 84, 61)'; }
    static { this.DEFAULT_LIGHT_TILE_COLOR = '#BAA378'; }
    static { this.DEFAULT_SIZE = 500; }
    static { this.MIN_BOARD_SIZE = 100; }
    static { this.MAX_BOARD_SIZE = 4000; }
    static { this.DEFAULT_SOURCE_POINT_COLOR = 'rgba(146, 111, 26, 0.79)'; }
    static { this.DEFAULT_DESTINATION_POINT_COLOR = '#b28e1a'; }
    static { this.DEFAULT_LEGAL_MOVE_POINT_COLOR = 'radial-gradient(#13262F 15%, transparent 20%);'; }
}

class PieceIconInputManager {
    constructor() {
        this._defaultIcons = false;
    }
    get pieceIconInput() {
        return this._pieceIconInput;
    }
    set pieceIconInput(value) {
        this._pieceIconInput = value;
    }
    get defaultIcons() {
        return this._defaultIcons;
    }
    set defaultIcons(value) {
        this._defaultIcons = value;
    }
    isDefaultIcons() {
        return this.pieceIconInput === undefined || this.pieceIconInput === null;
    }
    getPieceIcon(piece) {
        let isWhite = (piece.color === Color.WHITE);
        switch (piece.constructor) {
            case King:
                return isWhite ? this.pieceIconInput.whiteKingUrl : this.pieceIconInput.blackKingUrl;
            case Queen:
                return isWhite ? this.pieceIconInput.whiteQueenUrl : this.pieceIconInput.blackQueenUrl;
            case Rook:
                return isWhite ? this.pieceIconInput.whiteRookUrl : this.pieceIconInput.blackRookUrl;
            case Bishop:
                return isWhite ? this.pieceIconInput.whiteBishopUrl : this.pieceIconInput.blackBishopUrl;
            case Knight:
                return isWhite ? this.pieceIconInput.whiteKnightUrl : this.pieceIconInput.blackKnightUrl;
            case Pawn:
                return isWhite ? this.pieceIconInput.whitePawnUrl : this.pieceIconInput.blackPawnUrl;
        }
    }
    loadDefaultData() {
        this.pieceIconInput = {
            blackBishopUrl: '',
            blackKingUrl: '',
            blackKnightUrl: '',
            blackQueenUrl: '',
            blackRookUrl: '',
            whiteBishopUrl: '',
            whiteKingUrl: '',
            whiteKnightUrl: '',
            whitePawnUrl: '',
            whiteQueenUrl: '',
            whiteRookUrl: '',
            blackPawnUrl: 'a'
        };
    }
}

class CoordsProvider {
    constructor() {
        this.defaultXCoords = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        this.defaultYCoords = [8, 7, 6, 5, 4, 3, 2, 1];
        this.currentXCoords = [...this.defaultXCoords];
        this.currentYCoords = [...this.defaultYCoords];
    }
    get xCoords() {
        return this.currentXCoords;
    }
    get yCoords() {
        return this.currentYCoords;
    }
    reverse() {
        this.currentXCoords = this.currentXCoords.reverse();
        this.currentYCoords = this.currentYCoords.reverse();
    }
    reset() {
        this.init();
    }
    init() {
        this.currentXCoords = [...this.defaultXCoords];
        this.currentYCoords = [...this.defaultYCoords];
    }
}

class AnimationDragEndProcessor {
    dragEnded(event, disabling, startTrans) {
        if (!disabling) {
            if (startTrans) {
                event.source._dragRef.getRootElement().style.transform = startTrans;
            }
        }
    }
}

class DragEndStrategy {
    constructor() {
        this.dragEndProcessor = new AnimationDragEndProcessor();
    }
    process(event, disabling, startTrans) {
        this.dragEndProcessor.dragEnded(event, disabling, startTrans);
    }
    setDragEndProcessor(processor) {
        this.dragEndProcessor = processor;
    }
}

class AnimationDragStartProcessor {
    dragStarted(event) {
        const style = event.source.getRootElement().style;
        style.zIndex = '1000';
        style.position = 'absolute';
    }
}

class DragStartStrategy {
    constructor() {
        this.dragStartProcessor = new AnimationDragStartProcessor();
    }
    process(event) {
        this.dragStartProcessor.dragStarted(event);
    }
    setDragStartProcessor(processor) {
        this.dragStartProcessor = processor;
    }
}

class DefaultColorProcessor {
    resolve(ctrl, shift, alt) {
        let color = 'green';
        if (ctrl || shift) {
            color = 'red';
        }
        if (alt) {
            color = 'blue';
        }
        if ((shift || ctrl) && alt) {
            color = 'orange';
        }
        return color;
    }
}

class ColorStrategy {
    constructor() {
        this.colorProcessor = new DefaultColorProcessor();
    }
    resolve(ctrl, shift, alt) {
        return this.colorProcessor.resolve(ctrl, shift, alt);
    }
    setColorProcessor(colorProcessor) {
        this.colorProcessor = colorProcessor;
    }
}

class DrawProvider {
    constructor() {
        this.arrowsSubject$ = new BehaviorSubject([]);
        this.circlesSubject$ = new BehaviorSubject([]);
        this.arrows$ = this.arrowsSubject$.asObservable();
        this.circles$ = this.circlesSubject$.asObservable();
    }
    get circles() {
        return this.circlesSubject$.value;
    }
    set circles(circles) {
        this.circlesSubject$.next(circles);
    }
    get arrows() {
        return this.arrowsSubject$.value;
    }
    set arrows(arrows) {
        this.arrowsSubject$.next(arrows);
    }
    addCircle(circle) {
        this.circles = [...this.circles, circle];
    }
    reomveCircle(removeCircle) {
        this.circles = this.circles.filter((circle) => !circle.isEqual(removeCircle));
    }
    addArrow(arrow) {
        this.arrows = [...this.arrows, arrow];
    }
    removeArrow(removeArrow) {
        this.arrows = this.arrows.filter((arrow) => !arrow.isEqual(removeArrow));
    }
    containsCircle(checkCircle) {
        return this.circles.some((circle) => circle.isEqual(checkCircle));
    }
    containsArrow(checkArrow) {
        return this.arrows.some((arrow) => arrow.isEqual(checkArrow));
    }
    clear() {
        this.arrows = [];
        this.circles = [];
    }
}

class AbstractPgnProcessor {
    constructor() {
        this.pgn = [];
        this.currentIndex = 0.5;
    }
    getPGN() {
        return this.pgn.join(' ');
    }
    getLast() {
        return this.pgn[this.pgn.length - 1];
    }
    appendToLast(str) {
        this.pgn[this.pgn.length - 1] = this.getLast() + str;
    }
    processChecks(checkmate, check, stalemate) {
        if (checkmate) {
            this.appendToLast('#');
        }
        else {
            if (check) {
                this.appendToLast('+');
            }
        }
    }
    reset() {
        this.pgn = [];
        this.currentIndex = 0.5;
    }
    addPromotionChoice(promotion) {
        switch (promotion) {
            case 1:
                this.appendToLast('=Q');
                break;
            case 2:
                this.appendToLast('=R');
                break;
            case 3:
                this.appendToLast('=B');
                break;
            case 4:
                this.appendToLast('=N');
                break;
        }
    }
    removeLast() {
        this.pgn.pop();
        this.currentIndex -= 0.5;
    }
}

class DefaultPgnProcessor extends AbstractPgnProcessor {
    process(board, sourcePiece, destPoint, destPiece) {
        this.currentIndex += 0.5;
        let currentMove = '';
        if (this.currentIndex % Math.floor(this.currentIndex) === 0) {
            currentMove = this.currentIndex + '. ';
        }
        let possibleCaptures = [];
        let possibleMoves = [];
        if (destPiece) {
            possibleCaptures = MoveUtils.findPieceByPossibleCapturesContaining(MoveUtils.formatSingle(destPoint, board.reverted), board, sourcePiece.color).filter(piece => piece.constructor.name === sourcePiece.constructor.name);
        }
        possibleMoves = MoveUtils.findPieceByPossibleMovesContaining(MoveUtils.formatSingle(destPoint, board.reverted), board, sourcePiece.color).filter(piece => piece.constructor.name === sourcePiece.constructor.name);
        if (sourcePiece instanceof Pawn && !destPiece && possibleCaptures.length === 0) {
            currentMove += MoveUtils.formatSingle(destPoint, board.reverted);
        }
        else {
            if (sourcePiece instanceof Pawn && destPiece) {
                currentMove += (MoveUtils.formatSingle(sourcePiece.point, board.reverted).substring(0, 1) + 'x' + MoveUtils.formatSingle(destPoint, board.reverted));
            }
            else {
                if (sourcePiece instanceof King && (Math.abs(sourcePiece.point.col - destPoint.col) === 2)) {
                    if (board.reverted) {
                        currentMove += (destPoint.col < 2
                            ? 'O-O'
                            : 'O-O-O');
                    }
                    else {
                        currentMove += destPoint.col < 3
                            ? 'O-O-O'
                            : 'O-O';
                    }
                }
                else {
                    if (!(sourcePiece instanceof Pawn) && possibleCaptures.length === 0 && possibleMoves.length < 2) { // Nf3
                        currentMove += MoveUtils.getFirstLetterPiece(sourcePiece) + MoveUtils.formatSingle(destPoint, board.reverted);
                    }
                    else {
                        if (possibleMoves && possibleMoves.length === 2 && possibleCaptures.length === 0) { // Nbd7
                            if (this.isEqualByCol(possibleMoves[0], possibleMoves[1])) {
                                currentMove += MoveUtils.getFirstLetterPiece(sourcePiece) + MoveUtils.reverse(board, sourcePiece.point.row) + MoveUtils.formatSingle(destPoint, board.reverted);
                            }
                            else {
                                currentMove += MoveUtils.getFirstLetterPiece(sourcePiece) + MoveUtils.formatCol(board, sourcePiece.point.col) + MoveUtils.formatSingle(destPoint, board.reverted);
                            }
                        }
                        else {
                            if (possibleCaptures.length > 1) {
                                if ((this.isEqualByCol(possibleCaptures[0], possibleCaptures[1]))) {
                                    currentMove += MoveUtils.getFirstLetterPiece(sourcePiece) + MoveUtils.reverse(board, sourcePiece.point.row) + 'x' + MoveUtils.formatSingle(destPoint, board.reverted);
                                }
                                else {
                                    currentMove += MoveUtils.getFirstLetterPiece(sourcePiece) + MoveUtils.formatCol(board, sourcePiece.point.col) + 'x' + MoveUtils.formatSingle(destPoint, board.reverted);
                                }
                            }
                            else {
                                currentMove += MoveUtils.getFirstLetterPiece(sourcePiece) + 'x' + MoveUtils.formatSingle(destPoint, board.reverted);
                            }
                        }
                    }
                }
            }
        }
        this.pgn.push(currentMove);
    }
    resolvePieceByFirstChar(move, piece) {
        return MoveUtils.getFirstLetterPiece(piece) === move;
    }
    isEqualByCol(aPiece, bPiece) {
        return aPiece.point.col === bPiece.point.col;
    }
}

class AbstractEngineFacade {
    constructor(board) {
        this.dragStartStrategy = new DragStartStrategy();
        this.dragEndStrategy = new DragEndStrategy();
        this.pgnProcessor = new DefaultPgnProcessor();
        this.colorStrategy = new ColorStrategy();
        this.coords = new CoordsProvider();
        this.heightAndWidth = Constants.DEFAULT_SIZE;
        this.freeMode = false;
        this.drawProvider = new DrawProvider();
        this.pieceIconManager = new PieceIconInputManager();
        this.moveHistoryProvider = new HistoryMoveProvider();
        this.disabling = false;
        this.board = board;
    }
    checkIfPawnFirstMove(piece) {
        if (piece instanceof Pawn) {
            piece.isMovedAlready = true;
        }
    }
    checkIfRookMoved(piece) {
        if (piece instanceof Rook) {
            piece.isMovedAlready = true;
        }
    }
    checkIfKingMoved(piece) {
        if (piece instanceof King) {
            piece.isMovedAlready = true;
        }
    }
    getMoveHistory() {
        return this.moveHistoryProvider.getAll();
    }
}

class BoardLoader {
    constructor(engineFacade, notationProcessor) {
        this.engineFacade = engineFacade;
        if (notationProcessor) {
            this.notationProcessor = notationProcessor;
        }
        else {
            this.notationProcessor = NotationProcessorFactory.getDefaultProcessor();
        }
    }
    addPieces() {
        DefaultPiecesLoader.loadDefaultPieces(this.engineFacade.board);
    }
    loadFEN(fen) {
        this.notationProcessor.process(fen, this.engineFacade);
    }
    loadPGN(pgn) {
        this.notationProcessor.process(pgn, this.engineFacade);
    }
    setEngineFacade(engineFacade) {
        this.engineFacade = engineFacade;
    }
    setNotationProcessor(notationProcessor) {
        this.notationProcessor = notationProcessor;
    }
}

class BoardState {
    constructor(board) {
        this.board = board;
    }
}

class BoardStateProvider {
    constructor() {
        this.statesSubject$ = new BehaviorSubject([]);
    }
    get states() {
        return this.statesSubject$.value;
    }
    set states(states) {
        this.statesSubject$.next(states);
    }
    addMove(state) {
        this.states = [...this.states, state];
    }
    getStates() {
        return this.states;
    }
    pop() {
        const lastState = this.getLastState();
        this.states = this.states.filter((state) => state !== lastState);
        return lastState;
    }
    isEmpty() {
        return this.states.length === 0;
    }
    clear() {
        this.states = [];
    }
    getLastState() {
        return this.states[this.getLastStateIndex()];
    }
    getLastStateIndex() {
        return this.states.length - 1;
    }
}

class Arrow {
    isEqual(arrow) {
        return arrow && this.start.isEqual(arrow.start) && this.end.isEqual(arrow.end);
    }
}

class Circle {
    isEqual(circle) {
        return circle && this.drawPoint.isEqual(circle.drawPoint);
    }
}

class PieceAbstractDecorator {
    constructor(piece) {
        this.piece = piece;
    }
}

class AvailableMoveDecorator extends PieceAbstractDecorator {
    constructor(piece, pointClicked, color, board) {
        super(piece);
        this.pointClicked = pointClicked;
        this.color = color;
        this.board = board;
    }
    getPossibleCaptures() {
        return this.piece
            .getPossibleCaptures()
            .filter((point) => !MoveUtils.willMoveCauseCheck(this.color, this.pointClicked.row, this.pointClicked.col, point.row, point.col, this.board));
    }
    getPossibleMoves() {
        return this.piece
            .getPossibleMoves()
            .filter((point) => !MoveUtils.willMoveCauseCheck(this.color, this.pointClicked.row, this.pointClicked.col, point.row, point.col, this.board));
    }
}

class PiecePromotionResolver {
    static resolvePromotionChoice(board, piece, index) {
        const isWhite = piece.color === Color.WHITE;
        switch (index) {
            case 1:
                board.pieces.push(new Queen(piece.point, piece.color, isWhite
                    ? UnicodeConstants.WHITE_QUEEN
                    : UnicodeConstants.BLACK_QUEEN, board));
                break;
            case 2:
                board.pieces.push(new Rook(piece.point, piece.color, isWhite
                    ? UnicodeConstants.WHITE_ROOK
                    : UnicodeConstants.BLACK_ROOK, board));
                break;
            case 3:
                board.pieces.push(new Bishop(piece.point, piece.color, isWhite
                    ? UnicodeConstants.WHITE_BISHOP
                    : UnicodeConstants.BLACK_BISHOP, board));
                break;
            case 4:
                board.pieces.push(new Knight(piece.point, piece.color, isWhite
                    ? UnicodeConstants.WHITE_KNIGHT
                    : UnicodeConstants.BLACK_KNIGHT, board));
                break;
        }
    }
}

var PieceTypeInput;
(function (PieceTypeInput) {
    PieceTypeInput[PieceTypeInput["KING"] = 1] = "KING";
    PieceTypeInput[PieceTypeInput["QUEEN"] = 2] = "QUEEN";
    PieceTypeInput[PieceTypeInput["BISHOP"] = 3] = "BISHOP";
    PieceTypeInput[PieceTypeInput["KNIGHT"] = 4] = "KNIGHT";
    PieceTypeInput[PieceTypeInput["ROOK"] = 5] = "ROOK";
    PieceTypeInput[PieceTypeInput["PAWN"] = 6] = "PAWN";
})(PieceTypeInput || (PieceTypeInput = {}));
var ColorInput;
(function (ColorInput) {
    ColorInput[ColorInput["LIGHT"] = 1] = "LIGHT";
    ColorInput[ColorInput["DARK"] = 2] = "DARK";
})(ColorInput || (ColorInput = {}));

class PieceFactory {
    static create(indexes, pieceTypeInput, colorInput, board) {
        let piece;
        let color = colorInput === ColorInput.LIGHT
            ? Color.WHITE
            : Color.BLACK;
        switch (pieceTypeInput) {
            case PieceTypeInput.QUEEN:
                piece = new Queen(new Point(indexes.yAxis, indexes.xAxis), color, color === Color.WHITE ? UnicodeConstants.WHITE_QUEEN : UnicodeConstants.BLACK_QUEEN, board);
                break;
            case PieceTypeInput.KING:
                piece = new King(new Point(indexes.yAxis, indexes.xAxis), color, color === Color.WHITE ? UnicodeConstants.WHITE_KING : UnicodeConstants.BLACK_KING, board);
                break;
            case PieceTypeInput.KNIGHT:
                piece = new Knight(new Point(indexes.yAxis, indexes.xAxis), color, color === Color.WHITE ? UnicodeConstants.WHITE_KNIGHT : UnicodeConstants.BLACK_KNIGHT, board);
                break;
            case PieceTypeInput.BISHOP:
                piece = new Bishop(new Point(indexes.yAxis, indexes.xAxis), color, color === Color.WHITE ? UnicodeConstants.WHITE_BISHOP : UnicodeConstants.BLACK_BISHOP, board);
                break;
            case PieceTypeInput.ROOK:
                piece = new Rook(new Point(indexes.yAxis, indexes.xAxis), color, color === Color.WHITE ? UnicodeConstants.WHITE_ROOK : UnicodeConstants.BLACK_ROOK, board);
                break;
            case PieceTypeInput.PAWN:
                piece = new Pawn(new Point(indexes.yAxis, indexes.xAxis), color, color === Color.WHITE ? UnicodeConstants.WHITE_PAWN : UnicodeConstants.BLACK_PAWN, board);
                break;
        }
        return piece;
    }
}

class EngineFacade extends AbstractEngineFacade {
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

class Board {
    constructor() {
        this.board = [];
        this.pieces = [];
        this.enPassantPoint = null;
        this.enPassantPiece = null;
        this.lastMoveSrc = null;
        this.lastMoveDest = null;
        this.possibleCaptures = [];
        this.possibleMoves = [];
        this.currentWhitePlayer = true;
        this.reverted = false;
        this.fullMoveCount = 1;
        for (let i = 0; i < 8; ++i) {
            this.board[i] = [];
            for (let j = 0; j < 8; ++j) {
                this.board[i][j] = 0;
            }
        }
    }
    isXYInPossibleMoves(row, col) {
        return this.possibleMoves.some((move) => move.row === row && move.col === col);
    }
    isXYInPossibleCaptures(row, col) {
        return this.possibleCaptures.some((capture) => capture.row === row && capture.col === col);
    }
    isXYInSourceMove(i, j) {
        return this.lastMoveSrc && this.lastMoveSrc.row === i && this.lastMoveSrc.col === j;
    }
    isXYInDestMove(i, j) {
        return this.lastMoveDest && this.lastMoveDest.row === i && this.lastMoveDest.col === j;
    }
    isXYInActiveMove(i, j) {
        return this.activePiece && this.activePiece.point.row === i && this.activePiece.point.col === j;
    }
    isPointInPossibleMoves(point) {
        return this.possibleMoves.some((move) => move.row === point.row && move.col === point.col);
    }
    isPointInPossibleCaptures(point) {
        return this.possibleCaptures.some((capture) => capture.row === point.row && capture.col === point.col);
    }
    reset() {
        this.lastMoveDest = null;
        this.lastMoveSrc = null;
        this.whiteKingChecked = false;
        this.blackKingChecked = false;
        this.possibleCaptures = [];
        this.possibleMoves = [];
        this.activePiece = null;
        this.reverted = false;
        this.currentWhitePlayer = true;
        this.enPassantPoint = null;
        this.enPassantPiece = null;
        this.fullMoveCount = 1;
        this.calculateFEN();
    }
    reverse() {
        this.reverted = !this.reverted;
        this.activePiece = null;
        this.possibleMoves = [];
        this.possibleCaptures = [];
        this.pieces.forEach((piece) => this.reversePoint(piece.point));
        this.reversePoint(this.lastMoveSrc);
        this.reversePoint(this.lastMoveDest);
        if (this.enPassantPoint && this.enPassantPiece) {
            this.reversePoint(this.enPassantPoint);
        }
    }
    clone() {
        return cloneDeep(this);
    }
    isFieldTakenByEnemy(row, col, enemyColor) {
        if (row > 7 || row < 0 || col > 7 || col < 0) {
            return false;
        }
        return this.pieces.some((piece) => piece.point.col === col && piece.point.row === row && piece.color === enemyColor);
    }
    isFieldEmpty(row, col) {
        if (row > 7 || row < 0 || col > 7 || col < 0) {
            return false;
        }
        return !this.pieces.some((piece) => piece.point.col === col && piece.point.row === row);
    }
    isFieldUnderAttack(row, col, color) {
        return this.pieces
            .filter((piece) => piece.color === color)
            .some((piece) => piece.getCoveredFields().some((field) => field.col === col && field.row === row));
    }
    getPieceByField(row, col) {
        if (this.isFieldEmpty(row, col)) {
            //   throw new Error('Piece not found');
            return undefined;
        }
        return this.pieces.find((piece) => piece.point.col === col && piece.point.row === row);
    }
    isKingInCheck(color, pieces) {
        const king = pieces.find((piece) => piece.color === color && piece instanceof King);
        if (king) {
            return pieces.some((piece) => piece
                .getPossibleCaptures()
                .some((point) => point.col === king.point.col && point.row === king.point.row) &&
                piece.color !== color);
        }
        return false;
    }
    getKingByColor(color) {
        return this.pieces.find((piece) => piece instanceof King && piece.color === color);
    }
    getCastleFENString(color) {
        const king = this.getKingByColor(color);
        if (!king || king.isMovedAlready) {
            return '';
        }
        let fen = '';
        const leftRook = this.getPieceByField(king.point.row, 0);
        const rightRook = this.getPieceByField(king.point.row, 7);
        if (rightRook instanceof Rook && rightRook.color === color) {
            if (!rightRook.isMovedAlready) {
                fen += this.reverted ? 'q' : 'k';
            }
        }
        if (leftRook instanceof Rook && leftRook.color === color) {
            if (!leftRook.isMovedAlready) {
                fen += this.reverted ? 'k' : 'q';
            }
        }
        fen = fen.split('').sort().join('');
        return color === Color.BLACK ? fen : fen.toUpperCase();
    }
    getEnPassantFENString() {
        if (this.enPassantPoint) {
            if (this.reverted) {
                return String.fromCharCode(104 - this.enPassantPoint.col) + (this.enPassantPoint.row + 1);
            }
            else {
                return String.fromCharCode(97 + this.enPassantPoint.col) + (Math.abs(this.enPassantPoint.row - 7) + 1);
            }
        }
        else {
            return '-';
        }
    }
    calculateFEN() {
        let fen = '';
        for (let i = 0; i < 8; ++i) {
            let emptyFields = 0;
            for (let j = 0; j < 8; ++j) {
                const foundPiece = this.pieces.find((piece) => piece.point.col === j && piece.point.row === i);
                if (foundPiece) {
                    if (emptyFields > 0) {
                        fen += emptyFields;
                        emptyFields = 0;
                    }
                    if (foundPiece instanceof Rook) {
                        fen += foundPiece.color === Color.BLACK ? 'r' : 'R';
                    }
                    else {
                        if (foundPiece instanceof Knight) {
                            fen += foundPiece.color === Color.BLACK ? 'n' : 'N';
                        }
                        else {
                            if (foundPiece instanceof Bishop) {
                                fen += foundPiece.color === Color.BLACK ? 'b' : 'B';
                            }
                            else {
                                if (foundPiece instanceof Queen) {
                                    fen += foundPiece.color === Color.BLACK ? 'q' : 'Q';
                                }
                                else {
                                    if (foundPiece instanceof King) {
                                        fen += foundPiece.color === Color.BLACK ? 'k' : 'K';
                                    }
                                    else {
                                        if (foundPiece instanceof Pawn) {
                                            fen += foundPiece.color === Color.BLACK ? 'p' : 'P';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    ++emptyFields;
                }
            }
            if (emptyFields > 0) {
                fen += emptyFields;
            }
            fen += '/';
        }
        fen = fen.substr(0, fen.length - 1);
        if (this.reverted) {
            fen = fen.split('').reverse().join('');
        }
        fen += ' ' + (this.currentWhitePlayer ? 'w' : 'b');
        const whiteEnPassant = this.getCastleFENString(Color.WHITE);
        const blackEnPassant = this.getCastleFENString(Color.BLACK);
        let concatedEnPassant = whiteEnPassant + blackEnPassant;
        if (!concatedEnPassant) {
            concatedEnPassant = '-';
        }
        fen += ' ' + concatedEnPassant;
        fen += ' ' + this.getEnPassantFENString();
        fen += ' ' + 0;
        fen += ' ' + this.fullMoveCount;
        this.fen = fen;
    }
    isXYInPointSelection(i, j) {
        return false;
    }
    reversePoint(point) {
        if (point) {
            point.row = Math.abs(point.row - 7);
            point.col = Math.abs(point.col - 7);
        }
    }
    getPieceByPoint(row, col) {
        row = Math.floor(row);
        col = Math.floor(col);
        return this.pieces.find((piece) => piece.point.col === col && piece.point.row === row);
    }
    checkIfPawnTakesEnPassant(newPoint) {
        if (newPoint.isEqual(this.enPassantPoint)) {
            this.pieces = this.pieces.filter((piece) => piece !== this.enPassantPiece);
            this.enPassantPoint = null;
            this.enPassantPiece = null;
        }
    }
    checkIfPawnEnpassanted(piece, newPoint) {
        if (Math.abs(piece.point.row - newPoint.row) > 1) {
            this.enPassantPiece = piece;
            this.enPassantPoint = new Point((piece.point.row + newPoint.row) / 2, piece.point.col);
        }
        else {
            this.enPassantPoint = null;
            this.enPassantPiece = null;
        }
    }
    isKingChecked(piece) {
        if (piece instanceof King) {
            return piece.color === Color.WHITE
                ? this.whiteKingChecked
                : this.blackKingChecked;
        }
    }
    getCurrentPlayerColor() {
        return this.currentWhitePlayer ? Color.WHITE : Color.BLACK;
    }
}

class NgxChessBoardService {
    constructor() {
        this.componentMethodCallSource = new Subject();
        this.componentMethodCalled$ = this.componentMethodCallSource.asObservable();
    }
    reset() {
        this.componentMethodCallSource.next();
    }
    static { this.ɵfac = function NgxChessBoardService_Factory(t) { return new (t || NgxChessBoardService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: NgxChessBoardService, factory: NgxChessBoardService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxChessBoardService, [{
        type: Injectable,
        args: [{
                providedIn: 'root',
            }]
    }], null, null); })();

const _c0$1 = ["myModal"];
function PiecePromotionModalComponent_div_4_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "div", 6);
    i0.ɵɵlistener("click", function PiecePromotionModalComponent_div_4_Template_div_click_1_listener() { i0.ɵɵrestoreView(_r4); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.changeSelection(1)); });
    i0.ɵɵelement(2, "img", 7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 6);
    i0.ɵɵlistener("click", function PiecePromotionModalComponent_div_4_Template_div_click_3_listener() { i0.ɵɵrestoreView(_r4); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.changeSelection(2)); });
    i0.ɵɵelement(4, "img", 8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 6);
    i0.ɵɵlistener("click", function PiecePromotionModalComponent_div_4_Template_div_click_5_listener() { i0.ɵɵrestoreView(_r4); const ctx_r6 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r6.changeSelection(3)); });
    i0.ɵɵelement(6, "img", 9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 6);
    i0.ɵɵlistener("click", function PiecePromotionModalComponent_div_4_Template_div_click_7_listener() { i0.ɵɵrestoreView(_r4); const ctx_r7 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r7.changeSelection(4)); });
    i0.ɵɵelement(8, "img", 10);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx_r1.getPieceIcon("queen"), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx_r1.getPieceIcon("rook"), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx_r1.getPieceIcon("bishop"), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx_r1.getPieceIcon("knight"), i0.ɵɵsanitizeUrl);
} }
function PiecePromotionModalComponent_div_5_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "div", 6);
    i0.ɵɵlistener("click", function PiecePromotionModalComponent_div_5_Template_div_click_1_listener() { i0.ɵɵrestoreView(_r9); const ctx_r8 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r8.changeSelection(1)); });
    i0.ɵɵtext(2, "\u265B");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 6);
    i0.ɵɵlistener("click", function PiecePromotionModalComponent_div_5_Template_div_click_3_listener() { i0.ɵɵrestoreView(_r9); const ctx_r10 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r10.changeSelection(2)); });
    i0.ɵɵtext(4, "\u265C");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 6);
    i0.ɵɵlistener("click", function PiecePromotionModalComponent_div_5_Template_div_click_5_listener() { i0.ɵɵrestoreView(_r9); const ctx_r11 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r11.changeSelection(3)); });
    i0.ɵɵtext(6, "\u265D");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 6);
    i0.ɵɵlistener("click", function PiecePromotionModalComponent_div_5_Template_div_click_7_listener() { i0.ɵɵrestoreView(_r9); const ctx_r12 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r12.changeSelection(4)); });
    i0.ɵɵtext(8, "\u265E");
    i0.ɵɵelementEnd()();
} }
class PiecePromotionModalComponent {
    constructor() {
        this.color = 'white';
        this.opened = false;
    }
    open(closeCallback) {
        this.opened = true;
        this.onCloseCallback = closeCallback;
        this.modal.nativeElement.style.display = 'block';
    }
    changeSelection(index) {
        this.modal.nativeElement.style.display = 'none';
        this.opened = false;
        this.onCloseCallback(index);
    }
    getPieceIcon(piece) {
        let coloredPiece = '';
        switch (piece.toLowerCase()) {
            case 'queen':
                coloredPiece = this.color === 'white' ? this.pieceIconInput.whiteQueenUrl : this.pieceIconInput.blackQueenUrl;
                break;
            case 'rook':
                coloredPiece = this.color === 'white' ? this.pieceIconInput.whiteRookUrl : this.pieceIconInput.blackRookUrl;
                break;
            case 'bishop':
                coloredPiece = this.color === 'white' ? this.pieceIconInput.whiteBishopUrl : this.pieceIconInput.blackBishopUrl;
                break;
            case 'knight':
                coloredPiece = this.color === 'white' ? this.pieceIconInput.whiteKnightUrl : this.pieceIconInput.blackKnightUrl;
                break;
        }
        return coloredPiece;
    }
    static { this.ɵfac = function PiecePromotionModalComponent_Factory(t) { return new (t || PiecePromotionModalComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PiecePromotionModalComponent, selectors: [["app-piece-promotion-modal"]], viewQuery: function PiecePromotionModalComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0$1, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.modal = _t.first);
        } }, inputs: { pieceIconInput: "pieceIconInput", color: "color" }, decls: 6, vars: 2, consts: [[1, "container"], ["myModal", ""], [1, "wrapper"], [1, "content"], ["class", "piece-wrapper", 4, "ngIf"], [1, "piece-wrapper"], [1, "piece", 3, "click"], ["alt", "Queen", 3, "src"], ["alt", "Rook", 3, "src"], ["alt", "Bishop", 3, "src"], ["alt", "Knight", 3, "src"]], template: function PiecePromotionModalComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0, 1)(2, "div", 2)(3, "div", 3);
            i0.ɵɵtemplate(4, PiecePromotionModalComponent_div_4_Template, 9, 4, "div", 4)(5, PiecePromotionModalComponent_div_5_Template, 9, 0, "div", 4);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngIf", ctx.pieceIconInput);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", !ctx.pieceIconInput);
        } }, dependencies: [i2.NgIf], styles: [".container[_ngcontent-%COMP%]{display:none;position:absolute;z-index:9999;top:0;color:#000;width:100%;height:100%;overflow:auto;background-color:#0006}.wrapper[_ngcontent-%COMP%]{position:relative;height:100%;width:100%}.content[_ngcontent-%COMP%]{background-color:#fefefe;margin:auto;position:relative;top:30%;font-size:100%;height:40%;padding:10px;border:1px solid #888;width:90%}.piece[_ngcontent-%COMP%]{font-size:5rem;height:100%;width:25%;cursor:pointer;display:inline-block;text-align:center}.piece[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{max-width:100%}.piece[_ngcontent-%COMP%]:hover{background-color:#ccc;border-radius:5px}.piece-wrapper[_ngcontent-%COMP%]{height:80%;width:100%}#close-button[_ngcontent-%COMP%]{border-radius:4px;background-color:#4caf50;border:none;color:#fff;padding-left:5px;padding-right:5px;text-align:center;text-decoration:none;display:inline-block}.selected[_ngcontent-%COMP%]{border:2px solid #00B919;border-radius:4px;box-sizing:border-box}"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PiecePromotionModalComponent, [{
        type: Component,
        args: [{ selector: 'app-piece-promotion-modal', template: "<div #myModal class=\"container\">\n    <div class=\"wrapper\">\n        <div class=\"content\">\n            <div class=\"piece-wrapper\" *ngIf=\"pieceIconInput\">\n                <div class=\"piece\" (click)=\"changeSelection(1)\">\n                    <img [src]=\"getPieceIcon('queen')\" alt=\"Queen\">\n                </div>\n                <div class=\"piece\" (click)=\"changeSelection(2)\">\n                    <img [src]=\"getPieceIcon('rook')\" alt=\"Rook\">\n                </div>\n                <div class=\"piece\" (click)=\"changeSelection(3)\">\n                    <img [src]=\"getPieceIcon('bishop')\" alt=\"Bishop\">\n                </div>\n                <div class=\"piece\" (click)=\"changeSelection(4)\">\n                    <img [src]=\"getPieceIcon('knight')\" alt=\"Knight\">\n                </div>\n            </div>\n            <div class=\"piece-wrapper\" *ngIf=\"!pieceIconInput\">\n                <div class=\"piece\" (click)=\"changeSelection(1)\">&#x265B;</div>\n                <div class=\"piece\" (click)=\"changeSelection(2)\">&#x265C;</div>\n                <div class=\"piece\" (click)=\"changeSelection(3)\">&#x265D;</div>\n                <div class=\"piece\" (click)=\"changeSelection(4)\">&#x265E;</div>\n            </div>\n        </div>\n    </div>\n</div>\n", styles: [".container{display:none;position:absolute;z-index:9999;top:0;color:#000;width:100%;height:100%;overflow:auto;background-color:#0006}.wrapper{position:relative;height:100%;width:100%}.content{background-color:#fefefe;margin:auto;position:relative;top:30%;font-size:100%;height:40%;padding:10px;border:1px solid #888;width:90%}.piece{font-size:5rem;height:100%;width:25%;cursor:pointer;display:inline-block;text-align:center}.piece img{max-width:100%}.piece:hover{background-color:#ccc;border-radius:5px}.piece-wrapper{height:80%;width:100%}#close-button{border-radius:4px;background-color:#4caf50;border:none;color:#fff;padding-left:5px;padding-right:5px;text-align:center;text-decoration:none;display:inline-block}.selected{border:2px solid #00B919;border-radius:4px;box-sizing:border-box}\n"] }]
    }], null, { modal: [{
            type: ViewChild,
            args: ['myModal', { static: false }]
        }], pieceIconInput: [{
            type: Input
        }], color: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PiecePromotionModalComponent, { className: "PiecePromotionModalComponent", filePath: "lib/piece-promotion/piece-promotion-modal/piece-promotion-modal.component.ts", lineNumber: 9 }); })();

const _c0 = ["boardRef"];
const _c1 = ["modal"];
function NgxChessBoardComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵlistener("cdkDragEnded", function NgxChessBoardComponent_div_3_Template_div_cdkDragEnded_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r9 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r9.dragEnded($event)); })("cdkDragMoved", function NgxChessBoardComponent_div_3_Template_div_cdkDragMoved_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r11 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r11.dragMoved($event)); })("cdkDragStarted", function NgxChessBoardComponent_div_3_Template_div_cdkDragStarted_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r12 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r12.dragStart($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const piece_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("transform", "translate3d(" + piece_r7.point.col * ctx_r1.pieceSize + "px, " + piece_r7.point.row * ctx_r1.pieceSize + "px,0px)")("max-height", ctx_r1.pieceSize + "px")("font-size", ctx_r1.pieceSize * 0.8 + "px")("width", ctx_r1.pieceSize + "px")("height", ctx_r1.pieceSize + "px");
    i0.ɵɵproperty("cdkDragDisabled", ctx_r1.engineFacade.dragDisabled)("innerHTML", ctx_r1.engineFacade.pieceIconManager.isDefaultIcons() ? piece_r7.constant.icon : "", i0.ɵɵsanitizeHtml)("ngStyle", ctx_r1.engineFacade.pieceIconManager.isDefaultIcons() ? "" : ctx_r1.getCustomPieceIcons(piece_r7));
} }
function NgxChessBoardComponent_div_4_div_1_span_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 18);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const i_r14 = i0.ɵɵnextContext(2).index;
    const ctx_r18 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("color", i_r14 % 2 === 0 ? ctx_r18.lightTileColor : ctx_r18.darkTileColor)("font-size", ctx_r18.pieceSize / 4, "px");
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", ctx_r18.engineFacade.coords.yCoords[i_r14], " ");
} }
function NgxChessBoardComponent_div_4_div_1_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const j_r17 = i0.ɵɵnextContext().index;
    const ctx_r19 = i0.ɵɵnextContext(2);
    i0.ɵɵstyleProp("color", j_r17 % 2 === 0 ? ctx_r19.lightTileColor : ctx_r19.darkTileColor)("font-size", ctx_r19.pieceSize / 4, "px");
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", ctx_r19.engineFacade.coords.xCoords[j_r17], " ");
} }
function NgxChessBoardComponent_div_4_div_1_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20);
    i0.ɵɵelement(1, "div", 21);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r20 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("font-size", ctx_r20.pieceSize + "px");
    i0.ɵɵproperty("ngClass", "piece");
} }
function NgxChessBoardComponent_div_4_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14);
    i0.ɵɵtemplate(1, NgxChessBoardComponent_div_4_div_1_span_1_Template, 2, 5, "span", 15)(2, NgxChessBoardComponent_div_4_div_1_span_2_Template, 2, 5, "span", 16)(3, NgxChessBoardComponent_div_4_div_1_div_3_Template, 2, 3, "div", 17);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const j_r17 = ctx.index;
    const i_r14 = i0.ɵɵnextContext().index;
    const ctx_r15 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("background-color", ctx_r15.getTileBackgroundColor(i_r14, j_r17));
    i0.ɵɵclassProp("current-selection", ctx_r15.showActivePiece && ctx_r15.engineFacade.board.isXYInActiveMove(i_r14, j_r17))("king-check", ctx_r15.engineFacade.board.isKingChecked(ctx_r15.engineFacade.board.getPieceByPoint(i_r14, j_r17)))("point-circle", ctx_r15.engineFacade.board.isXYInPointSelection(i_r14, j_r17))("possible-capture", ctx_r15.showPossibleCaptures && ctx_r15.engineFacade.board.isXYInPossibleCaptures(i_r14, j_r17))("possible-point", ctx_r15.engineFacade.board.isXYInPossibleMoves(i_r14, j_r17) && ctx_r15.showLegalMoves);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r15.showCoords && j_r17 === 7);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r15.showCoords && i_r14 === 7);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r15.engineFacade.board.getPieceByPoint(i_r14, j_r17));
} }
function NgxChessBoardComponent_div_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵtemplate(1, NgxChessBoardComponent_div_4_div_1_Template, 4, 15, "div", 13);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r13 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", row_r13);
} }
function NgxChessBoardComponent__svg_defs_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "defs")(1, "marker", 22);
    i0.ɵɵelement(2, "path", 23);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const color_r25 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("id", color_r25 + "Arrow");
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("fill", color_r25);
} }
function NgxChessBoardComponent__svg_line_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "line", 24);
} if (rf & 2) {
    const arrow_r26 = ctx.$implicit;
    i0.ɵɵattribute("marker-end", "url(#" + arrow_r26.end.color + "Arrow)")("stroke", arrow_r26.end.color)("x1", arrow_r26.start.x)("x2", arrow_r26.end.x)("y1", arrow_r26.start.y)("y2", arrow_r26.end.y);
} }
function NgxChessBoardComponent__svg_circle_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "circle", 25);
} if (rf & 2) {
    const circle_r27 = ctx.$implicit;
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵattribute("cx", circle_r27.drawPoint.x)("cy", circle_r27.drawPoint.y)("r", ctx_r5.engineFacade.heightAndWidth / 18)("stroke", circle_r27.drawPoint.color);
} }
const _c2 = () => ["red", "green", "blue", "orange"];
class NgxChessBoardComponent {
    constructor(ngxChessBoardService) {
        this.ngxChessBoardService = ngxChessBoardService;
        this.darkTileColor = Constants.DEFAULT_DARK_TILE_COLOR;
        this.lightTileColor = Constants.DEFAULT_LIGHT_TILE_COLOR;
        this.showCoords = true;
        this.sourcePointColor = Constants.DEFAULT_SOURCE_POINT_COLOR;
        this.destinationPointColor = Constants.DEFAULT_DESTINATION_POINT_COLOR;
        this.legalMovesPointColor = Constants.DEFAULT_LEGAL_MOVE_POINT_COLOR;
        this.showLastMove = true;
        this.showLegalMoves = true;
        this.showActivePiece = true;
        this.showPossibleCaptures = true;
        /**
         * Enabling free mode removes turn-based restriction and allows to move any piece freely!
         */
        this.moveChange = new EventEmitter();
        this.checkmate = new EventEmitter();
        this.stalemate = new EventEmitter();
        this.selected = false;
        this.isDragging = false;
        this.startTransition = '';
        this.engineFacade = new EngineFacade(new Board(), this.moveChange);
    }
    set size(size) {
        if (size &&
            size >= Constants.MIN_BOARD_SIZE &&
            size <= Constants.MAX_BOARD_SIZE) {
            this.engineFacade.heightAndWidth = size;
        }
        else {
            this.engineFacade.heightAndWidth = Constants.DEFAULT_SIZE;
        }
        this.engineFacade.drawProvider.clear();
        this.calculatePieceSize();
    }
    set freeMode(freeMode) {
        this.engineFacade.freeMode = freeMode;
    }
    set dragDisabled(dragDisabled) {
        this.engineFacade.dragDisabled = dragDisabled;
    }
    set drawDisabled(drawDisabled) {
        this.engineFacade.drawDisabled = drawDisabled;
    }
    set pieceIcons(pieceIcons) {
        this.engineFacade.pieceIconManager.pieceIconInput = pieceIcons;
    }
    set lightDisabled(lightDisabled) {
        this.engineFacade.lightDisabled = lightDisabled;
    }
    set darkDisabled(darkDisabled) {
        this.engineFacade.darkDisabled = darkDisabled;
    }
    onRightClick(event) {
        event.preventDefault();
    }
    ngOnChanges(changes) {
        if ((changes.lightDisabled &&
            this.lightDisabled &&
            this.engineFacade.board.currentWhitePlayer) ||
            (changes.darkDisabled &&
                this.darkDisabled &&
                !this.engineFacade.board.currentWhitePlayer)) {
            this.engineFacade.board.possibleCaptures = [];
            this.engineFacade.board.possibleMoves = [];
        }
    }
    ngOnInit() {
        this.ngxChessBoardService.componentMethodCalled$.subscribe(() => {
            this.engineFacade.reset();
        });
    }
    ngAfterViewInit() {
        this.engineFacade.modal = this.modal;
        this.calculatePieceSize();
    }
    onMouseUp(event) {
        this.engineFacade.onMouseUp(event, this.getClickPoint(event), this.boardRef.nativeElement.getBoundingClientRect().left, this.boardRef.nativeElement.getBoundingClientRect().top);
    }
    reverse() {
        this.selected = false;
        this.engineFacade.board.reverse();
        this.engineFacade.coords.reverse();
    }
    updateBoard(board) {
        this.engineFacade.board = board;
        this.boardLoader.setEngineFacade(this.engineFacade);
        this.engineFacade.board.possibleCaptures = [];
        this.engineFacade.board.possibleMoves = [];
    }
    setFEN(fen) {
        try {
            this.engineFacade.boardLoader.setNotationProcessor(NotationProcessorFactory.getProcessor(NotationType.FEN));
            this.engineFacade.boardLoader.loadFEN(fen);
            this.engineFacade.board.possibleCaptures = [];
            this.engineFacade.board.possibleMoves = [];
            this.engineFacade.coords.reset();
        }
        catch (exception) {
            this.engineFacade.boardLoader.addPieces();
        }
    }
    setPGN(pgn) {
        try {
            this.engineFacade.pgnProcessor.reset();
            this.engineFacade.boardLoader.setNotationProcessor(NotationProcessorFactory.getProcessor(NotationType.PGN));
            this.engineFacade.boardLoader.loadPGN(pgn);
            this.engineFacade.board.possibleCaptures = [];
            this.engineFacade.board.possibleMoves = [];
            this.engineFacade.coords.reset();
        }
        catch (exception) {
            console.log(exception);
            this.engineFacade.boardLoader.addPieces();
        }
    }
    getFEN() {
        return this.engineFacade.board.fen;
    }
    dragEnded(event) {
        this.isDragging = false;
        this.engineFacade.dragEndStrategy.process(event, this.engineFacade.moveDone, this.startTransition);
    }
    dragStart(event) {
        this.isDragging = true;
        let trans = event.source.getRootElement().style.transform.split(') ');
        //   this.startTrans= trans;
        this.startTransition = trans.length === 2 ? trans[1] : trans[0];
        this.engineFacade.dragStartStrategy.process(event);
    }
    onMouseDown(event) {
        this.engineFacade.onMouseDown(event, this.getClickPoint(event), this.boardRef.nativeElement.getBoundingClientRect().left, this.boardRef.nativeElement.getBoundingClientRect().top);
    }
    getClickPoint(event) {
        return ClickUtils.getClickPoint(event, this.boardRef.nativeElement.getBoundingClientRect().top, this.boardRef.nativeElement.getBoundingClientRect().height, this.boardRef.nativeElement.getBoundingClientRect().left, this.boardRef.nativeElement.getBoundingClientRect().width);
    }
    calculatePieceSize() {
        this.pieceSize = this.engineFacade.heightAndWidth / 8;
    }
    getCustomPieceIcons(piece) {
        return JSON.parse(`{ "background-image": "url('${this.engineFacade.pieceIconManager.getPieceIcon(piece)}')"}`);
    }
    move(coords) {
        this.engineFacade.move(coords);
    }
    getMoveHistory() {
        return this.engineFacade.getMoveHistory();
    }
    reset() {
        this.engineFacade.reset();
    }
    undo() {
        this.engineFacade.undo();
    }
    addPiece(pieceTypeInput, colorInput, coords) {
        this.engineFacade.addPiece(pieceTypeInput, colorInput, coords);
    }
    getPGN() {
        return this.engineFacade.pgnProcessor.getPGN();
    }
    dragMoved($event) {
        let x = ($event.pointerPosition.x - $event.source.getRootElement().parentElement.getBoundingClientRect().left) - (this.pieceSize / 2);
        let y = ($event.pointerPosition.y - $event.source.getRootElement().parentElement.getBoundingClientRect().top) - (this.pieceSize / 2);
        $event.source.getRootElement().style.transform = 'translate3d(' + x + 'px, '
            + (y) + 'px,0px)';
    }
    getTileBackgroundColor(i, j) {
        let color = ((i + j) % 2 === 0) ? this.lightTileColor : this.darkTileColor;
        if (this.showLastMove) {
            if (this.engineFacade.board.isXYInSourceMove(i, j)) {
                color = this.sourcePointColor;
            }
            if (this.engineFacade.board.isXYInDestMove(i, j)) {
                color = this.destinationPointColor;
            }
        }
        return color;
    }
    static { this.ɵfac = function NgxChessBoardComponent_Factory(t) { return new (t || NgxChessBoardComponent)(i0.ɵɵdirectiveInject(NgxChessBoardService)); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NgxChessBoardComponent, selectors: [["ngx-chess-board"]], viewQuery: function NgxChessBoardComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
            i0.ɵɵviewQuery(_c1, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.boardRef = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.modal = _t.first);
        } }, hostBindings: function NgxChessBoardComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("contextmenu", function NgxChessBoardComponent_contextmenu_HostBindingHandler($event) { return ctx.onRightClick($event); });
        } }, inputs: { darkTileColor: "darkTileColor", lightTileColor: "lightTileColor", showCoords: "showCoords", sourcePointColor: "sourcePointColor", destinationPointColor: "destinationPointColor", legalMovesPointColor: "legalMovesPointColor", showLastMove: "showLastMove", showLegalMoves: "showLegalMoves", showActivePiece: "showActivePiece", showPossibleCaptures: "showPossibleCaptures", size: "size", freeMode: "freeMode", dragDisabled: "dragDisabled", drawDisabled: "drawDisabled", pieceIcons: "pieceIcons", lightDisabled: "lightDisabled", darkDisabled: "darkDisabled" }, outputs: { moveChange: "moveChange", checkmate: "checkmate", stalemate: "stalemate" }, features: [i0.ɵɵNgOnChangesFeature], decls: 13, vars: 18, consts: [["id", "board", 3, "pointerdown", "pointerup"], ["boardRef", ""], ["id", "drag"], ["class", "single-piece", "cdkDrag", "", 3, "cdkDragDisabled", "innerHTML", "ngStyle", "transform", "max-height", "font-size", "width", "height", "cdkDragEnded", "cdkDragMoved", "cdkDragStarted", 4, "ngFor", "ngForOf"], ["class", "board-row", 4, "ngFor", "ngForOf"], [2, "position", "absolute", "top", "0", "pointer-events", "none"], [4, "ngFor", "ngForOf"], ["class", "arrow", 4, "ngFor", "ngForOf"], ["fill-opacity", "0.0", "stroke-width", "2", 4, "ngFor", "ngForOf"], [3, "pieceIconInput", "color"], ["modal", ""], ["cdkDrag", "", 1, "single-piece", 3, "cdkDragDisabled", "innerHTML", "ngStyle", "cdkDragEnded", "cdkDragMoved", "cdkDragStarted"], [1, "board-row"], ["class", "board-col", 3, "current-selection", "king-check", "point-circle", "possible-capture", "possible-point", "background-color", 4, "ngFor", "ngForOf"], [1, "board-col"], ["class", "yCoord", 3, "color", "font-size", 4, "ngIf"], ["class", "xCoord", 3, "color", "font-size", 4, "ngIf"], ["style", "height:100%; width:100%", 4, "ngIf"], [1, "yCoord"], [1, "xCoord"], [2, "height", "100%", "width", "100%"], [3, "ngClass"], ["markerHeight", "13", "markerWidth", "13", "orient", "auto", "refX", "9", "refY", "6", 3, "id"], ["d", "M2,2 L2,11 L10,6 L2,2"], [1, "arrow"], ["fill-opacity", "0.0", "stroke-width", "2"]], template: function NgxChessBoardComponent_Template(rf, ctx) { if (rf & 1) {
            const _r28 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 0, 1);
            i0.ɵɵlistener("pointerdown", function NgxChessBoardComponent_Template_div_pointerdown_0_listener($event) { i0.ɵɵrestoreView(_r28); const _r6 = i0.ɵɵreference(12); return i0.ɵɵresetView(!_r6.opened && ctx.onMouseDown($event)); })("pointerup", function NgxChessBoardComponent_Template_div_pointerup_0_listener($event) { i0.ɵɵrestoreView(_r28); const _r6 = i0.ɵɵreference(12); return i0.ɵɵresetView(!_r6.opened && ctx.onMouseUp($event)); });
            i0.ɵɵelementStart(2, "div", 2);
            i0.ɵɵtemplate(3, NgxChessBoardComponent_div_3_Template, 1, 13, "div", 3)(4, NgxChessBoardComponent_div_4_Template, 2, 1, "div", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(5, "svg", 5);
            i0.ɵɵtemplate(6, NgxChessBoardComponent__svg_defs_6_Template, 3, 3, "defs", 6)(7, NgxChessBoardComponent__svg_line_7_Template, 1, 6, "line", 7);
            i0.ɵɵpipe(8, "async");
            i0.ɵɵtemplate(9, NgxChessBoardComponent__svg_circle_9_Template, 1, 4, "circle", 8);
            i0.ɵɵpipe(10, "async");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelement(11, "app-piece-promotion-modal", 9, 10);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵstyleProp("height", ctx.engineFacade.heightAndWidth, "px")("width", ctx.engineFacade.heightAndWidth, "px");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngForOf", ctx.engineFacade.board.pieces);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngForOf", ctx.engineFacade.board.board);
            i0.ɵɵadvance(1);
            i0.ɵɵattribute("height", ctx.engineFacade.heightAndWidth)("width", ctx.engineFacade.heightAndWidth);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngForOf", i0.ɵɵpureFunction0(17, _c2));
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngForOf", i0.ɵɵpipeBind1(8, 13, ctx.engineFacade.drawProvider.arrows$));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngForOf", i0.ɵɵpipeBind1(10, 15, ctx.engineFacade.drawProvider.circles$));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("pieceIconInput", ctx.engineFacade.pieceIconManager.pieceIconInput)("color", ctx.engineFacade.board.getCurrentPlayerColor() ? "white" : "black");
        } }, dependencies: [i2.NgClass, i2.NgForOf, i2.NgIf, i2.NgStyle, i3.CdkDrag, PiecePromotionModalComponent, i2.AsyncPipe], styles: ["@charset \"UTF-8\";#board[_ngcontent-%COMP%]{font-family:Courier New,serif;position:relative}.board-row[_ngcontent-%COMP%]{display:block;width:100%;height:12.5%;position:relative}.board-col[_ngcontent-%COMP%]{position:relative;display:inline-block;width:12.5%;vertical-align:top;cursor:default;height:100%}.piece[_ngcontent-%COMP%]{height:100%;cursor:grab;width:100%;-moz-user-select:none;user-select:none;-webkit-user-select:none;background-size:cover;justify-content:center;text-align:center;color:#000!important;box-sizing:border-box}.piece[_ngcontent-%COMP%]:after{content:\"\\200b\";box-sizing:border-box}#drag[_ngcontent-%COMP%]{height:100%;width:100%}.possible-point[_ngcontent-%COMP%]{background:radial-gradient(#13262F 15%,transparent 20%)}.possible-point[_ngcontent-%COMP%]:hover, .possible-capture[_ngcontent-%COMP%]:hover{opacity:.4}.possible-capture[_ngcontent-%COMP%]{background:radial-gradient(transparent 0%,transparent 80%,#13262F 80%);opacity:.5;box-sizing:border-box;margin:0;padding:0}.king-check[_ngcontent-%COMP%]{background:radial-gradient(ellipse at center,red 0%,#e70000 25%,#a9000000 89%,#9e000000 100%)}.current-selection[_ngcontent-%COMP%]{background-color:#72620b!important}.yCoord[_ngcontent-%COMP%]{position:absolute;-moz-user-select:none;user-select:none;-webkit-user-select:none;cursor:pointer;right:.2em;font-family:Lucida Console,Courier,monospace;box-sizing:border-box}.xCoord[_ngcontent-%COMP%]{position:absolute;-moz-user-select:none;user-select:none;-webkit-user-select:none;cursor:pointer;left:.2em;bottom:0;font-family:Lucida Console,Courier,monospace;box-sizing:border-box}.hovering[_ngcontent-%COMP%]{background-color:red!important}.arrow[_ngcontent-%COMP%]{stroke-width:2}svg[_ngcontent-%COMP%]{filter:drop-shadow(1px 1px 0px #111) drop-shadow(-1px 1px 0px #111) drop-shadow(1px -1px 0px #111) drop-shadow(-1px -1px 0px #111)}[_nghost-%COMP%]{display:inline-block!important}.single-piece[_ngcontent-%COMP%]{position:absolute;z-index:999;justify-content:center;text-align:center;-moz-user-select:none;user-select:none;-webkit-user-select:none;color:#000!important;cursor:grab;background-size:cover}.single-piece[_ngcontent-%COMP%]:after{content:\"\\200b\";box-sizing:border-box}.cdk-drag[_ngcontent-%COMP%]:not(.cdk-drag-dragging){transition:transform .2s cubic-bezier(0,.3,.14,.49)}"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxChessBoardComponent, [{
        type: Component,
        args: [{ selector: 'ngx-chess-board', template: "<div\n    id=\"board\"\n    [style.height.px]=\"engineFacade.heightAndWidth\"\n    [style.width.px]=\"engineFacade.heightAndWidth\"\n    (pointerdown)=\"!modal.opened && onMouseDown($event)\"\n    (pointerup)=\"!modal.opened && onMouseUp($event)\"\n    #boardRef\n>\n    <div id=\"drag\">\n        <div\n            [cdkDragDisabled]=\"engineFacade.dragDisabled\"\n            (cdkDragEnded)=\"dragEnded($event)\"\n            (cdkDragMoved)=\"dragMoved($event)\"\n            (cdkDragStarted)=\"dragStart($event)\"\n            class=\"single-piece\" [innerHTML]=\"engineFacade.pieceIconManager.isDefaultIcons() ? piece.constant.icon : ''\"\n            [ngStyle]=\"engineFacade.pieceIconManager.isDefaultIcons() ? '' : getCustomPieceIcons(piece)\"\n            [style.transform]=\"'translate3d(' + piece.point.col * pieceSize + 'px, ' + piece.point.row * pieceSize + 'px,0px)'\"\n            [style.max-height]=\"pieceSize + 'px'\"\n            [style.font-size]=\"pieceSize * 0.8 + 'px'\"\n            [style.width]=\"pieceSize + 'px'\"\n            [style.height]=\"pieceSize + 'px'\"\n            cdkDrag\n            *ngFor=\"let piece of engineFacade.board.pieces; let i = index\"\n        >\n        </div>\n        <div\n            class=\"board-row\"\n            *ngFor=\"let row of engineFacade.board.board; let i = index\"\n        >\n            <div\n                class=\"board-col\"\n                [class.current-selection]=\"showActivePiece && engineFacade.board.isXYInActiveMove(i,j)\"\n                [class.king-check]=\" engineFacade.board.isKingChecked(engineFacade.board.getPieceByPoint(i,j))\"\n                [class.point-circle]=\"engineFacade.board.isXYInPointSelection(i, j)\"\n                [class.possible-capture]=\"showPossibleCaptures && engineFacade.board.isXYInPossibleCaptures(i, j)\"\n                [class.possible-point]=\"engineFacade.board.isXYInPossibleMoves(i, j) && showLegalMoves\"\n                [style.background-color]=\"getTileBackgroundColor(i, j)\"\n                *ngFor=\"let col of row; let j = index\"\n            >\n                <span\n                    class=\"yCoord\"\n                    [style.color]=\"(i % 2 === 0) ? lightTileColor : darkTileColor\"\n                    [style.font-size.px]=\"pieceSize / 4\"\n                    *ngIf=\"showCoords && j === 7\"\n                >\n                    {{engineFacade.coords.yCoords[i]}}\n                </span>\n                <span\n                    class=\"xCoord\"\n                    [style.color]=\"(j % 2 === 0) ? lightTileColor : darkTileColor\"\n                    [style.font-size.px]=\"pieceSize / 4\"\n                    *ngIf=\"showCoords && i === 7\"\n                >\n                    {{engineFacade.coords.xCoords[j]}}\n                </span>\n                <div\n                    *ngIf=\"engineFacade.board.getPieceByPoint(i, j) as piece\"\n                    style=\"height:100%; width:100%\"\n                >\n                    <div\n                        [ngClass]=\"'piece'\"\n                        [style.font-size]=\"pieceSize + 'px'\"\n\n                    >\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    <svg\n        [attr.height]=\"engineFacade.heightAndWidth\"\n        [attr.width]=\"engineFacade.heightAndWidth\"\n        style=\"position:absolute; top:0; pointer-events: none\"\n    >\n        <defs *ngFor=\"let color of ['red', 'green', 'blue', 'orange']\">\n            <marker\n                [id]=\"color + 'Arrow'\"\n                markerHeight=\"13\"\n                markerWidth=\"13\"\n                orient=\"auto\"\n                refX=\"9\"\n                refY=\"6\"\n            >\n                <path\n                    [style.fill]=\"color\"\n                    d=\"M2,2 L2,11 L10,6 L2,2\"\n                ></path>\n            </marker>\n        </defs>\n        <line\n            class=\"arrow\"\n            [attr.marker-end]=\"'url(#' + arrow.end.color + 'Arrow)'\"\n            [attr.stroke]=\"arrow.end.color\"\n            [attr.x1]=\"arrow.start.x\"\n            [attr.x2]=\"arrow.end.x\"\n            [attr.y1]=\"arrow.start.y\"\n            [attr.y2]=\"arrow.end.y\"\n            *ngFor=\"let arrow of engineFacade.drawProvider.arrows$ | async\"\n        ></line>\n        <circle\n            [attr.cx]=\"circle.drawPoint.x\"\n            [attr.cy]=\"circle.drawPoint.y\"\n            [attr.r]=\"engineFacade.heightAndWidth / 18\"\n            [attr.stroke]=\"circle.drawPoint.color\"\n            *ngFor=\"let circle of engineFacade.drawProvider.circles$ | async\"\n            fill-opacity=\"0.0\"\n            stroke-width=\"2\"\n        ></circle>\n    </svg>\n    <app-piece-promotion-modal #modal\n                               [pieceIconInput]=\"engineFacade.pieceIconManager.pieceIconInput\"\n                               [color]=\"engineFacade.board.getCurrentPlayerColor() ? 'white' : 'black'\"></app-piece-promotion-modal>\n</div>\n", styles: ["@charset \"UTF-8\";#board{font-family:Courier New,serif;position:relative}.board-row{display:block;width:100%;height:12.5%;position:relative}.board-col{position:relative;display:inline-block;width:12.5%;vertical-align:top;cursor:default;height:100%}.piece{height:100%;cursor:grab;width:100%;-moz-user-select:none;user-select:none;-webkit-user-select:none;background-size:cover;justify-content:center;text-align:center;color:#000!important;box-sizing:border-box}.piece:after{content:\"\\200b\";box-sizing:border-box}#drag{height:100%;width:100%}.possible-point{background:radial-gradient(#13262F 15%,transparent 20%)}.possible-point:hover,.possible-capture:hover{opacity:.4}.possible-capture{background:radial-gradient(transparent 0%,transparent 80%,#13262F 80%);opacity:.5;box-sizing:border-box;margin:0;padding:0}.king-check{background:radial-gradient(ellipse at center,red 0%,#e70000 25%,#a9000000 89%,#9e000000 100%)}.current-selection{background-color:#72620b!important}.yCoord{position:absolute;-moz-user-select:none;user-select:none;-webkit-user-select:none;cursor:pointer;right:.2em;font-family:Lucida Console,Courier,monospace;box-sizing:border-box}.xCoord{position:absolute;-moz-user-select:none;user-select:none;-webkit-user-select:none;cursor:pointer;left:.2em;bottom:0;font-family:Lucida Console,Courier,monospace;box-sizing:border-box}.hovering{background-color:red!important}.arrow{stroke-width:2}svg{filter:drop-shadow(1px 1px 0px #111) drop-shadow(-1px 1px 0px #111) drop-shadow(1px -1px 0px #111) drop-shadow(-1px -1px 0px #111)}:host{display:inline-block!important}.single-piece{position:absolute;z-index:999;justify-content:center;text-align:center;-moz-user-select:none;user-select:none;-webkit-user-select:none;color:#000!important;cursor:grab;background-size:cover}.single-piece:after{content:\"\\200b\";box-sizing:border-box}.cdk-drag:not(.cdk-drag-dragging){transition:transform .2s cubic-bezier(0,.3,.14,.49)}\n"] }]
    }], () => [{ type: NgxChessBoardService }], { darkTileColor: [{
            type: Input
        }], lightTileColor: [{
            type: Input
        }], showCoords: [{
            type: Input
        }], sourcePointColor: [{
            type: Input
        }], destinationPointColor: [{
            type: Input
        }], legalMovesPointColor: [{
            type: Input
        }], showLastMove: [{
            type: Input
        }], showLegalMoves: [{
            type: Input
        }], showActivePiece: [{
            type: Input
        }], showPossibleCaptures: [{
            type: Input
        }], moveChange: [{
            type: Output
        }], checkmate: [{
            type: Output
        }], stalemate: [{
            type: Output
        }], boardRef: [{
            type: ViewChild,
            args: ['boardRef']
        }], modal: [{
            type: ViewChild,
            args: ['modal']
        }], size: [{
            type: Input,
            args: ['size']
        }], freeMode: [{
            type: Input,
            args: ['freeMode']
        }], dragDisabled: [{
            type: Input,
            args: ['dragDisabled']
        }], drawDisabled: [{
            type: Input,
            args: ['drawDisabled']
        }], pieceIcons: [{
            type: Input,
            args: ['pieceIcons']
        }], lightDisabled: [{
            type: Input,
            args: ['lightDisabled']
        }], darkDisabled: [{
            type: Input,
            args: ['darkDisabled']
        }], onRightClick: [{
            type: HostListener,
            args: ['contextmenu', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NgxChessBoardComponent, { className: "NgxChessBoardComponent", filePath: "lib/ngx-chess-board.component.ts", lineNumber: 40 }); })();

class NgxChessBoardModule {
    static forRoot() {
        return {
            ngModule: NgxChessBoardModule,
            providers: [NgxChessBoardService],
        };
    }
    static { this.ɵfac = function NgxChessBoardModule_Factory(t) { return new (t || NgxChessBoardModule)(); }; }
    static { this.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NgxChessBoardModule }); }
    static { this.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [CommonModule, DragDropModule] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxChessBoardModule, [{
        type: NgModule,
        args: [{
                declarations: [NgxChessBoardComponent, PiecePromotionModalComponent],
                imports: [CommonModule, DragDropModule],
                exports: [NgxChessBoardComponent],
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(NgxChessBoardModule, { declarations: [NgxChessBoardComponent, PiecePromotionModalComponent], imports: [CommonModule, DragDropModule], exports: [NgxChessBoardComponent] }); })();

/*
 * Public API Surface of ngx-chess-board
 */
/*
 * Public API Surface of im-grid
 */

/**
 * Generated bundle index. Do not edit.
 */

export { HistoryMove, NgxChessBoardComponent, NgxChessBoardModule, NgxChessBoardService, PiecePromotionModalComponent };
//# sourceMappingURL=ngx-chess-board.mjs.map
