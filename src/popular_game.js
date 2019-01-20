(function($) {

  let size = 14;    //the size of the grid
  let turn;
  let grid = [];    //internal grid
  let original = [];
  let cells = [];   //grid of jquery objects
  let seen = [];    //marks seen positions during filling
  let computingMode = false;
  let computerSolution;
  let solverMode = false;
  let solved = false;
  let solveLabel;
  let colours = [];
  
  /**
   * Messages
   */
  let successMsg = "You bested the computer!";
  let failMsg = "You failed to beat the computer. :(";
  
  /**
   * Clears seen grid
   */
  const removeSeen = () => {
    for(let i = 0; i < size; i++)
      for(let j = 0; j < size; j++)
        seen[i][j] = false;
  }
  
  /**
   * Starts a new game
   */
  const makeGrid = () => {
  
    solved = false;
    
    //initialize grids
    for(let i = 0; i < size; i++) {
      grid[i] = [];
      original[i] = [];
      cells[i] = [];
      seen[i] = [];
    }
  
    //populate table
    let $table = $('#grid'), $tr, $td, rand;
    $table.empty();
    for(let i = 0; i < size; i++) {
      $tr = $('<tr>');
      for(let j = 0; j < size; j++) {
        rand =  Math.floor(Math.random() * colours.length);
        $td = $('<td>');
        $td.addClass('cell');
        $tr.append($td);
        $td.css("background-color", '#' + colours[rand]);
        $td.height(Math.floor(420/size));
        $td.width(Math.floor(420/size));
        cells[i][j] = $td;
        grid[i][j] = rand;
        original[i][j] = rand;
      }
      $table.append($tr);
    } 
    computerSolution = computerSolve();
    updateTurn(0);
  }
  
  /**
   * Makes the colour changing palette
   */
  const makeControls = () => {
    let $palette = $('#palette');
    $palette.empty();
    for(let i = 0; i < colours.length; i++) {
      let $button = $('<button>');
      $button.addClass('palette-colour');
      $button.attr('value', i);
      $button.css('background-color', '#' + colours[i]);
      $palette.append($button);
    }
  
    $('.palette-colour').click(function() {
      fillGrid(Number($(this).val()));
    });
  }
  
  /**
   * Updates the turn text
   */
  const updateTurn = n => {
    turn = n;
    $('#counter').html(n);
    if(n === 0) {
      $('#solve-btn').show();
    }
  }
  
  /**
   * Resets the game
   */
  const reset = () => {  
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        grid[i][j] = original[i][j];
        if(!computingMode)
          cells[i][j].css('background-color', '#' + colours[grid[i][j]]);
      }
    }
    updateTurn(0);
  }
  
  /**
   * Refreshes the board with a new color
   */
  const refresh = () => {  
    for(let i = 0; i < size; i++)
      for(let j = 0; j < size; j++) {
        cells[i][j].css('background-color', '#' + colours[grid[i][j]]);
      }
  }
  
  const countConnected = (i, j, c) => {
    if(i < 0 || j < 0 || i >= size || j >= size || seen[i][j] || grid[i][j] != c) {
      return 0;
    }
    seen[i][j] = true;
    return countConnected(i, j - 1, c) +
      countConnected(i, j + 1, c) +
      countConnected(i - 1, j, c) +
      countConnected(i + 1, j, c) + 1;
  }
  

  const popularAlgo = (i, j, original, replace) => {
    if(i < 0 || j < 0 || i >= size || j >= size || seen[i][j]) {
      return 0;
    }
    seen[i][j] = true;
    if (grid[i][j] === original) {
      grid[i][j] = replace;
      if(!computingMode) {
        cells[i][j].css('background-color', '#' + colours[replace]);
      }
      return 1 + popularAlgo(i, j + 1, original, replace) +
        popularAlgo(i, j - 1, original, replace) +
        popularAlgo(i + 1, j, original, replace) +
        popularAlgo(i - 1, j, original, replace);
    } else if (grid[i][j] === replace) {
      // Unmark this cell for countConnected.
      seen[i][j] = false;
      return countConnected(i, j, replace);
    }
    return 0;
  }
  
  /**
   * Fill the grid with a certain colour
   */
  function fillGrid(c) {
    if(grid[0][0] == c) {
      return false;
    }
    removeSeen();
    // Check if number of cells filled is equal to size of grid.
    let countFilled = popularAlgo(0, 0, grid[0][0], c);
    let checkSolved = countFilled === size * size;
    updateTurn(++turn);
  
    if (!computingMode && !solverMode) {
      if(!solved && checkSolved) {
        if(turn <= computerSolution) {
          alert(successMsg);
        } else {
          alert("Puzzle cleared in " + turn + " moves!");
        }
        solved = true;
        $('#solve-btn').hide();
      } else if(computerSolution === turn) {
        alert(failMsg);
      }
    }
    return checkSolved;
  }
  
  /**
   * Solver functions
   */
  
  let list = [];
  computerSolution = -1;
  
  function _inspect(i, j) { 
    if(i < 0 || j < 0 || i >= size || j >= size || seen[i][j]) {
      return;
    }
    if(grid[i][j] === grid[0][0]) {
      seen[i][j] = true;
      _inspect(i, j - 1);
      _inspect(i, j + 1);
      _inspect(i - 1, j);
      _inspect(i + 1, j);
    } else {
      list[grid[i][j]] += countConnected(i, j, grid[i][j]);
    }
  }
  
  function inspect() {
    removeSeen();
    for(let i = 0; i < colours.length; i++) {
      list[i] = 0;
    }
    _inspect(0, 0);
    let max = 0;
    for(let i = 0; i < colours.length; i++) {
      if(list[i] > list[max]){
        max = i;
      }
    }
    return max;
  }
  
  function fillMax() {
    let c = inspect();
    return fillGrid(c);
  }
  
  function computerSolve() {
    computingMode = true;
    let computerSolution = 1;
    while(!fillMax()) {
      computerSolution++;
    }
    $('#computer-solution').html(computerSolution);
    reset();
    computingMode = false;
    return computerSolution;
  }
  
  /**
   * Solves the puzzle for the user
   */
  function solve() {
    let $solve_button = $('#solve-btn');
    let robot = setInterval(function() {
      solverMode = true;
      if(fillMax()) {
        clearInterval(robot);
        $solve_button.html(solveLabel);
      }
      solverMode = false;
    }, 500);
    $solve_button.html('Stop!').unbind().click(function() {
      clearInterval(robot);
      $solve_button.html(solveLabel).click(solve);
    });
  }
  
  $(document).ready(function() {
  
    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();
  
    colours = themes[0].colours;
    makeGrid();
    makeControls();
    solveLabel = $('#solve-btn').html();
    $('#solve-btn').click(solve);
    $('#new-game-btn').click(makeGrid);
    $('#reset-btn').click(reset);
  
    $themes = $('#themes');
    for(let i = 0; i < themes.length; i++) {
        $option = $('<option>');
        $option.val(i);
        $option.text(themes[i].name);
      $themes.append($option);
    }
  
    $('#themes').change(function() {
      colours = themes[Number($(this).find('option:selected').val())].colours;
      refresh();
      makeControls();
    });
  
    $('#size').change(function() {
      if(!confirm("This will start a new game. Continue?"))
        return;
      size = Number($(this).find('option:selected').val());
      makeGrid();
    });
  
  });
  
  

})(jQuery)


