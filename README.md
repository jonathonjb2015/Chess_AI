# Chess_AI

Short video of gameplay: 

http://imgur.com/a/5roxVn9.gif

I created a chess AI program which decides what move to make by using the minimax algorithm, which was optimized using alpha/beta pruning and the evaluation functions.

For this project, I used a 2D array to store all of the pieces info, and in the minimax algorithm, I created a deep copy of the 2D array for each move/child boards. 

I realize that using a 2D array to store the pieces and creating a new copy of the board for each possible move is very inefficient. The AI used for this project  is able to check every moves for the next 4 turns in a reasonable amount of time. Any more than that would take the program too long.

If I had to start on this project all over again, I'd use maps instead of 2D arrays to store the pieces info.

BUGS / ERRORS / FEATURES TO BE ADDED
--------------
This project isn't competely done yet; there are still a few bugs which needs to be fixed.

- Tie games are not added yet. When there aren't any moves left to be made at the end of your turn, you win the game.
- The ability to switch teams has not been added yets
- The AI never castles their king; need to modify their evaluation function to give castling king a higher score
- Your moves aren't shown on the board until after the AI makes their move. 
