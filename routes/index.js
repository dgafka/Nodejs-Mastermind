exports.index = function (req, res) {
    req.session.puzzle = req.session.puzzle || req.app.get('puzzle');
    res.render('index', {
        title: 'Mastermind'
    });
};

exports.play = function (req, res) {
    var newGame = function () {

        /** Prepares all needed stuff to go */
        var dataGame = {
            size: Math.floor(req.query.size),
            dim: Math.floor(req.query.dim),
            max: Math.floor(req.query.max),
            move: 1
        }

        /** Saves game information to session  */
        req.session.puzzle = dataGame;

        /** Generate correct answers */
        var i, data = [],
            puzzle = req.session.puzzle;
        for (i = 0; i < puzzle.size; i += 1) {
            data.push(Math.round(Math.random() * puzzle.dim));
        }
        req.session.puzzle.data = data;

        /** Return stuff to generate move */
        return {
            "results": "You started the game with following data:" + "<br/>" +
                " Columns amount: " + dataGame.size + "<br/>" +
                " Numbers from: 0" + " to " + dataGame.dim  + "<br/>" +
                " Amount of tries: " + dataGame.max,
            "game": {
                size: puzzle.size,
                move: 1
            }
        };
    };

    res.json(newGame());
};

exports.mark = function (req, res) {
    var markAnswer = function () {
        var game = req.session.puzzle;
        var correctAnswers = game.data.slice();
        var userAnswers = req.query.results;

        /** Search for correct answers */
        var markCorrectAnswers = new Array();
        userAnswers.forEach(function(value, key) {
            if(correctAnswers[key] == value) {
                markCorrectAnswers.push(1);
                correctAnswers[key] = "checked";
                userAnswers[key] = "checked";
            }
        });

        userAnswers.forEach(function(valueUser, keyUser){
            if(valueUser != "checked") {
                correctAnswers.forEach(function(valueCorrect, keyCorrect){
                    if(valueUser == valueCorrect) {
                        markCorrectAnswers.push(0);
                        userAnswers[keyUser]       = "checked";
                        correctAnswers[keyCorrect] = "checked";
                        return;
                    }
                });
            }
        });

        markCorrectAnswers = markCorrectAnswers.sort();
        game.move += 1;

        return {
            "move": game.move,
            "maxMove": game.max,
            "size": game.size,
            "answers": markCorrectAnswers,
            "correctAnswers": game.data
        };
    };
    res.json(markAnswer());
};