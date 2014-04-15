$(function () {

    /**
     * Runs the game
     * @param event
     * @returns {boolean}
     */
    var play = function(event) {

        var columns = !(isNaN($('#column')[0].value)) ? ($('#column')[0].value.length == 0 ? 5 : $('#column')[0].value) : '';
        var dim     = !(isNaN($('#colorAmount')[0].value)) ? ($('#colorAmount')[0].value == 0 ? 9 : $('#colorAmount')[0].value) : '';
        var tries   = !(isNaN($('#triesAmount')[0].value)) ? ($('#triesAmount')[0].value == 0 ? 0 : $('#triesAmount')[0].value) : '';

        if(columns.length == 0 || dim.length == 0 || tries.length == 0) {
            var infoBox = $('.infoBox');
            infoBox.empty();
            infoBox.append("Podano błędne dane!");
        }else {
            $('.infoBox').empty();
            $.ajax({
                url: '/play/',
                type: 'GET',
                data: {size: columns, dim: dim, max: tries},
                dataType: "json",
                cache: false,
                timeout: 5000,
                success: function(data) {
                    var infoBox = $('.infoBox');
                    infoBox.empty();
                    infoBox.append(data.results);
                    $('#startGame').css({display: 'none'});
                    $('#submitMove').css({display: 'block'})
                    generateGame(data.game.size, data.game.move);
                },
                error: function(data) {
                    alert('There was a problem, while trying to reach the server.');
                }
            })
        }
        //prevent bubbling
        return false;
    }

    /**
     * Marks the answer. Manage move when its applied
     * @param event
     */
    var mark = function(event) {
        var answerArray = [];
        $('div.playGame:last > div').each(function(index, element){
            answerArray.push(element.lastChild.value);
        })

        $.ajax({
            url: '/mark/',
            type: 'GET',
            data: {results: answerArray},
            dataType: "json",
            cache: false,
            timeout: 5000,
            success: function(data) {
                moveDone(data.move, data.maxMove, data.size, data.answers);
            },
            error: function(data) {
                alert('There was a problem, while trying to reach the server.');
            }
        })
    }

    /**
     * Manage move when its done.
     * @param move
     * @param maxmove
     * @param size
     * @param answers
     */
    var moveDone = function(move, maxmove, size, answers) {
        var results = $('div.results:last');
        $('div.playGame:last .input').prop('disabled', true)

        if(maxmove != 0 && move > maxmove) {
            results.append('Sorry, but you lost... :(');
            $('#submitMove').css({display: "none"});
            return;
        }
        var checkWinResult = checkWin(answers, size);

        if(checkWinResult == 1) {
            results.append('Congratulations YOU WON!!! :)');
            $('#submitMove').css({display: "none"});
            results.append('<div class="button btn-primary restart"><a href="/">Restart the game.</a></div>');
            return;
        }else if(checkWinResult == 0) {
            results.append('Close enough, try again!');
        }else {
            results.append('You really should start guessing...');
        }

        results.append(generateResults(answers));
        generateGame(size, move);
    }

    /**
     * Check, if the game is won already
     * @param results
     * @param size
     * @returns {boolean}
     */
    var checkWin = function(results, size) {

        if(results.length > 0) {
            if(($.inArray(0, results) == -1) && results.length == size) {
                return 1;
            }
            return 0;
        }
        return -1;
    }

    /**
     * Generates information about answers for results in each step
     * @param answers
     */
    var generateResults = function(answers) {
        var html = '';
        answers.forEach(function(value, key) {
            html += "<div class=\"answer-" + value +"\"></div>";
        })

        return html;
    }

    /**
     * Generates next move
     * @param size
     * @param move
     */
    var generateGame = function(size, move) {
        var gameBox = $('.playGameBox');
        var inGameForms = '<div class="move">' + move + '</div><div class="playGame">' + getGameForms(size) + '</div><div class="results"></div>';
        gameBox.append(inGameForms);
    }

    /**
     * Forms for next move
     * @param size
     * @returns {string}
     */
    var getGameForms = function(size) {
        var html = '';
        for(var i = 0; i < size; i++) {
            html += '<div class="answerBox">'   +
                        '<div class="number">'+i+'</div>' +
                        '<input type="text" class="input form-control""/>'  +
                    '</div>'
        }

        return html;
    }


    $('#formPlay').on('submit', play);
    $('#submitMove').on('click', mark);
});
