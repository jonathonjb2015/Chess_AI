let aiColor = null
const DEPTH_LIMIT = 3;

function aiMakeMove(){
    let boardCopy = createBoardCopy(logics.board);
    let result = miniMax(aiColor, boardCopy, 0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    let bestMove = result[1]; // a list of two items; the starting position and the end position
    movePiece(bestMove[0], bestMove[1], logics.board);
    makeViewMatchBoard()
    endTurn();
}


function miniMax(currColor, currBoard, depth, alpha, beta){
    if(depth >= DEPTH_LIMIT){
        return [evaluation(currBoard), null];
    }

    let bestMove = null;
    let maximizingPlayer = currColor == aiColor ? true : false;
    let value = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

    let children = getChildren(currColor, currBoard);
    for(let i = 0; i < children.length; i++){
        let child = children[i];
        let move = [child[1], child[2]];

        let nextColor = currColor == colors.white ? colors.black : colors.white;
        let result = miniMax(nextColor, child[0], depth + 1, alpha, beta);

        if(maximizingPlayer){
            if(result[0] > value){
                value = result[0];
                bestMove = move;
            }
            alpha = Math.max(alpha, value);
        }
        else{
            if(result[0] < value){
                value = result[0];
                bestMove = move;
            }
            beta = Math.min(beta, value);
        }
        if(alpha >= beta){
            break;
        }
    }
    return [value, bestMove];
}

/** returns a list of elements; each element is a list of 3 items. 
 *  1: modified copy of current board; the board after the move
 *  2: starting position of move.
 *  3: end position of move.
*/
function getChildren(currColor, currBoard){
    let moves = getCurrMoves(currColor, currBoard);
    let children = [];

    for(let i = 0; i < moves.length; i++){
        let pieceMoves = moves[i];
        for(let j = 0; j < pieceMoves[1].length; j++){
            let boardCopy = createBoardCopy(currBoard);
            let startPosition = pieceMoves[0];
            let endPosition = pieceMoves[1][j];
            movePiece(startPosition, endPosition, boardCopy);
            if(!checkForThreat(currColor, boardCopy)){
                children.push([boardCopy, startPosition, endPosition]);
            }
        }
    }

    return children;
}

function evaluation(currBoard){
    let evaluationScore = 0;
    for(let row = 0; row < logics.size; row++){
        for(let col = 0; col < logics.size; col++){
            let currPieceScore = 0;
        
            let position = [row, col];
            
            let piece = getPiece(position, currBoard);

            if(piece == null || piece == enPassantVulnerable){
                continue;
            }

            let pieceType = piece[1];

            switch(pieceType){
                case pieceTypes.pawn:
                    currPieceScore = 1;
                    break;
                case pieceTypes.knight:
                    currPieceScore = 3;
                    break;
                case pieceTypes.bishop:
                    currPieceScore = 3;
                    break;
                case pieceTypes.rook:
                    currPieceScore = 5;
                    break;
                case pieceTypes.queen:
                    currPieceScore = 8;
                    break;
                case pieceTypes.king:
                    currPieceScore = 100;
                    break;
            }
            if(piece[0] == aiColor){
                evaluationScore += currPieceScore;
            }
            else{
                evaluationScore -= currPieceScore;
            }
        }
    }

    return evaluationScore + evaluateMobility(currBoard) + evaluatePawnPlacements(currBoard) + 
            evaluatePawnNegations(currBoard) + evaluateCenterControl(currBoard);
}

function evaluateMobility(currBoard){
    let evaluationScore = 0;
    let aiMoves = getCurrMoves(aiColor, currBoard);
    evaluationScore += aiMoves.length;

    let userMoves = getCurrMoves(userColor, currBoard);
    evaluationScore -= userMoves.length;

    return evaluationScore * 0.1;
}

function evaluateCenterControl(currBoard){
    let evaluationScore = 0;
    for(let row = 2; row <= 5; row++){
        for(let col = 2; col <= 5; col++){
            let position = [row, col];
            if(!isEmpty(position, currBoard)){
                let piece = getPiece(position, currBoard);
                if(piece[0] == aiColor){
                    evaluationScore += 1;
                }
                else{
                    evaluationScore -= 1;
                }
            }
        }
    }
    return evaluationScore * 0.1;
}

function evaluatePawnPlacements(currBoard){
    let evaluationScore = 0;
    for(let row = 0; row < logics.size; row++){
        for(let col = 0; col < logics.size; col++){
            let position = [row, col];
            let piece = getPiece(position, currBoard);
            if(isEmpty(position, currBoard) || piece[1] != pieceTypes.pawn){
                continue;
            }
            if(piece[0] == aiColor){
                if(aiColor == colors.black){
                    evaluationScore += 0.3 * row;
                }
                else{
                    evaluationScore += 0.3 * Math.abs(row - 7);
                }
            }
            else{
                if(userColor == colors.black){
                    evaluationScore -= 0.3 * row;
                }
                else{
                    evaluationScore -= 0.3 * Math.abs(row - 7);
                }
            }
        }
    }
    return evaluationScore;
}

function evaluatePawnNegations(currBoard){
    let aiDoubledPawns = getNumberOfDoubledPawns(aiColor, currBoard);
    let aiBlockedPawns = getNumberOfBlockedPawns(aiColor, currBoard);
    let aiIsolatedPawns = getNumberOfIsolatedPawns(aiColor, currBoard);

    let userDoubledPawns = getNumberOfDoubledPawns(userColor, currBoard);
    let userBlockedPawns = getNumberOfBlockedPawns(userColor, currBoard);
    let userIsolatedPawns = getNumberOfIsolatedPawns(userColor, currBoard);

    let evaluationScore = (aiDoubledPawns - userDoubledPawns) + (aiBlockedPawns - userBlockedPawns) + (aiIsolatedPawns - userIsolatedPawns);
    return -0.5 * evaluationScore;
}

function getNumberOfDoubledPawns(currColor, currBoard){
    let numOfDoubledPawns = 0;
    for(let col = 0; col < logics.size; col++){
        let flag = false;
        for(let row = 0; row < logics.size; row++){
            let position = [row, col];
            let piece = getPiece(position, currBoard);
            if(isEmpty(position, currBoard) || piece[0] != currColor || piece[1] != pieceTypes.pawn){
                continue;
            }
            if(flag){
                numOfDoubledPawns += 1;
            }
            flag = true;
        }
    }
    return numOfDoubledPawns;
}

function getNumberOfBlockedPawns(currColor, currBoard){
    let numOfBlockedPawns = 0;
    for(let row = 0; row < logics.size; row++){
        for(let col = 0; col < logics.size; col++){
            let position = [row, col];
            let piece = getPiece(position, currBoard);
            if(isEmpty(position, currBoard) || piece[0] != currColor || piece[1] != pieceTypes.pawn){
                continue;
            }
            let nextRowCheck = currColor == colors.white ? row - 1 : row + 1;
            let nextPosition = [nextRowCheck, col];

            if(!isEmpty(nextPosition, currBoard)){
                numOfBlockedPawns += 1;
            }
        }
    }
    return numOfBlockedPawns;
}

function getNumberOfIsolatedPawns(currColor, currBoard){
    let numOfIsolatedPawns = 0;
    let prevPrevColumnHasPawns = false;
    let prevColumnHasPawns = false;
    let currColumnHasPawns = false;

    for(let col = 0; col < logics.size; col++){
        for(let row = 0; row < logics.size; row++){
            let position = [row, col];
            let piece = getPiece(position, currBoard);
            if(isEmpty(position, currBoard) || piece[0] != currColor || piece[1] != pieceTypes.pawn){
                continue;
            }
            currColumnHasPawns = true;
            break;
        }
        if(currColumnHasPawns == false && prevPrevColumnHasPawns == false && prevColumnHasPawns == true){
            numOfIsolatedPawns += 1;
        }
        prevPrevColumnHasPawns = prevColumnHasPawns;
        prevColumnHasPawns = currColumnHasPawns;
        currColumnHasPawns = false;
    }

    if(currColumnHasPawns == false && prevPrevColumnHasPawns == false && prevColumnHasPawns == true){
        numOfIsolatedPawns += 1;
    }

    return numOfIsolatedPawns;
}