let userColor = null
let chosenPiece = null
let chosenPiecePosition = null
let replacementPiecePosition = null

function choosePiece(position){
    enablePieces();
    chosenPiecePosition = position;
    chosenPiece = logics.board[position[0]][position[1]];

    moves = getPieceMoves(chosenPiece, chosenPiecePosition, logics.board);
    for(let i = 0; i < moves.length; i++){
        let currMove = moves[i];
        enableTile(currMove);
    }
}

function chooseMove(position){
    let valid = false;
    moves = getPieceMoves(chosenPiece, chosenPiecePosition, logics.board);
    for(let i = 0; i < moves.length; i++){
        let currMove = moves[i];
        if(currMove[0] == position[0] && currMove[1] == position[1]){
            valid = true;
        }
    }
    if(!valid){
        return;
    }

    
    // creates a copy of the board, then makes the move and checks if there would be any threat at the end of the move.row
    // if there is a threat, the move is invalid and won't be made to the original board.
    let boardCopy = createBoardCopy(logics.board);
    movePiece(chosenPiecePosition, position, boardCopy);
    if(checkForThreat(userColor, boardCopy)){
        return;
    }
    
    movePiece(chosenPiecePosition, position, logics.board);
    makeViewMatchBoard();

    chosenPiece = null;
    chosenPiecePosition = null;

    // checks if the pawn has reached the end of the board
    if(pawnReachedEndOfBoard(position, logics.board)){
        replacementPiecePosition = position;
        if(userColor == colors.white){
            openWhitePieceChooser();
        }
        else{
            openBlackPieceChooser();
        }
        return;
    }

    endTurn();
}

function enablePieces(){
    for(let row = 0; row < logics.size; row++){
        for(let col = 0; col < logics.size; col++){
            let pieceTuple = logics.board[row][col];
            let position = [row, col];
            if(pieceTuple == null){
                disableTile(position);
                continue;
            }
            let color = pieceTuple[0];
            if(color == userColor){
                enableTile(position);
            }
            else{
                disableTile(position);
            }
        }
    }
}

function disablePieces(){
    for(let row = 0; row < logics.size; row++){
        for(let col = 0; col < logics.size; col++){
            let pieceTuple = logics.board[row][col];
            if(pieceTuple == null){
                continue;
            }
            let position = [row, col];
            disableTile(position);
        }
    }
}

function chooseReplacementPiece(piece){
    let position = replacementPiecePosition;
    logics.board[position[0]][position[1]] = [userColor, piece];

    removePieceImage(position);
    placePieceImage(userColor, piece, position);

    closeChoosers();
    endTurn();
}
