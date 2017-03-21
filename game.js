(function($) {

        function shuffle(selector) {
		var children = $(selector).children().get().sort(function() {
			return Math.random() - 0.5;
		});
		$(selector).append(children);
	}
	function success(options) {
		$("h1").text(options.successMsg);
		if( $("#page" + (options.currentIndex + 1)).is(":visible") ) {
			$('#next').css('display', 'inline');
		}
	}
	function reset(options) {
		$('div.page').hide();
		$('#page' + options.currentIndex).show();
		$('#page' + options.currentIndex + ' #next').hide();
		$('#page' + options.currentIndex + ' h1').text(options.pages[options.currentIndex].pageTitle);

		if(options.pages[options.currentIndex].pageType === 'quiz') {
			var quizType = options.pages[options.currentIndex].quizType;
			var questions = options.pages[options.currentIndex].questions;
			generateQuestions(quizType, questions, options.currentIndex);
		}
	}
	function generatePage(options) {
		switch(options.pageType) {
			case 'welcome':
				return '<div class="page" id="page0" data-page="0"><div class="row"><div class="row"><h1>' + options.title + '</h1></div><div class="center"><a href="#page1" data-dstpage="1" class="btn btn-primary indexbtn">' + options.beginMsg + '</a></div></div></div>';
			case 'quiz':
				var str = '<div class="page" id="page' + options.currentIndex + '" data-page="' + options.currentIndex + '"><div class="row"><div class="row"><h1>' + options.title + '</h1></div><div class="row"><div class="span4 offset13 btnrow"><span class="btn"></span><a href="#" class="btn" id="reset">' + options.reset + '</a>';
				if(options.pageCount !== options.currentIndex + 1) {
					str += 	'<a class="btn" data-dstpage="' + ++options.currentIndex + '" href="#page' + options.currentIndex + '" id="next">' + options.next + '</a>';
				}
				str += '</div></div><div id="quizContainer' + options.currentIndex + '" class="quizContainer center"></div></div></div>';
			case 'result':
				return '';
		}
	}
	function generateQuestions(quizType, questions, currentIndex) {
		switch(quizType) {
			case 'ImageImageFlip':
				IIF(questions, currentIndex);
				break;
			case 'ImageTextMatch':
				ITM(questions, currentIndex);
				break;
			case 'TextTextMatch':
				TTM(questions, currentIndex);
				break;
			case 'TextTextDrop':
				TTD(questions, currentIndex);
				break;
		}
	}

	function handleDrop(event, ui, cb) {
		var dropped = $(this).data('pair');
		var dragged = ui.draggable.data('pair');
		var match = false;
		
		if(dragged === dropped) {

			//Match - Lock in place and increment found
			match = true;
			$(this).droppable( 'disable' );
			ui.draggable.addClass( 'correct' );
			ui.draggable.draggable( 'disable' );
			ui.draggable.draggable( 'option', 'revert', false );
			ui.draggable.position({
				of: $(this),
				my: 'left top',
				at: 'left top'
			});

		} else {
			ui.draggable.draggable( 'option', 'revert', true );
		}
		
		cb(match);
	
	}
	function IIF(questions, currentIndex) {

		var totalPairs 		= Object.keys(questions).length;
		var quizContainer 	= "#quizContainer" + currentIndex;
		var i = 0, count = 0, found = 0, j, originalImgPair, originalImgSelector;

		$.each(questions, function(key, val) {
			j = parseInt(i, 10) + parseInt(totalPairs, 10);

			$(quizContainer).append( $('<div class="imageFlip" id="card' + i + '"><img src="' + key + '" data-pair="' + i + '"></div><div class="imageFlip" id="card' + j + '"><img src="' + val + '" data-pair="' + i + '"></div>') );

			i += 1;
		});
		
		$("img").hide();
		shuffle(quizContainer);
		$(quizContainer + " div").on("click", function(event) {
			event.preventDefault();

			var id = $(this).attr("id");
			var currentImgSelector = "#" + id + " img";

			if( $(currentImgSelector).is(":hidden") ) {

				$(quizContainer + " div").unbind("click", openCard);
				$(currentImgSelector).slideDown('fast');

				setTimeout(function() {
					$(quizContainer + " div").bind("click", openCard);
				}, 400);

				if(originalImgPair === "") {

					//First click, set image as original image
					originalImgSelector = currentImgSelector;
					originalImgPair = $(originalImgSelector).data("pair");

				} else {

					if( originalImgPair === $(currentImgSelector).data("pair") ) {

						//Found pair, fix boxes
						$(currentImgSelector).addClass("opacity");
						$(originalImgSelector).addClass("opacity");

						found += 1;

					} else {

						//Did not find, slide up boxes
						setTimeout(function() {
							$(currentImgSelector).slideUp('fast');
							$(originalImgSelector).slideUp('fast');
						}, 400);

					}

					originalImgSelector = "";
					currentImgSelector = "";

				}

				count += 1;
				$(quizContainer + " #count").html("" + count);

				if(found === Object.keys(questions).length) {
					success();
				}
			}

		});

	}
	function ITM(questions, currentIndex) {

		var totalPairs 		= Object.keys(questions).length;
		var quizContainer 	= "#quizContainer" + currentIndex;
		$(quizContainer).append('<div id="imgWrapper"></div><div id="textWrapper"></div>');
		var imgContainer 	= "#imgWrapper";
		var textContainer 	= "#textWrapper";
		var count = 0, found = 0;
		
		$.each(questions, function(key, val) {
			var tempImgContainer = $('<div id="imgContainer' + i + '"></div>');
			$('<img id="img' + i + '" src="' + key + '">').appendTo(tempImgContainer);
			$('<div id="textForImg' + i + '" data-pair="' + i + '"></div>').droppable({
				accept: '#textWrapper div',
				hoverClass: 'hovered',
				drop: function(event, ui) {
					handleDrop(event, ui, function(match) {
						//Counters Update
						count += 1;
						$(quizContainer + ' #count').text(count);

						found = (match) ? ++found : found;
						if(found == Object.keys(questions).length) {
							success();
						}
					});
				}
			}).appendTo(tempImgContainer);
			$(imgContainer).append(tempImgContainer);

			var tempTextContainer = $('<div id="textContainer' + i + '" data-pair="' + i + '">' + val + '</div>').draggable({
				containment: quizContainer + ' div',
				stack: '#textWrapper div',
				cursor: 'move',
				revert: true,
				snap: true
			});
			textContainer.append(tempTextContainer);

			i += 1;
		});

		shuffle(quizContainer + ' #textWrapper');
		
	}
	function TTM(questions, currentIndex) {

		var totalPairs 		= Object.keys(questions).length;
		var quizContainer 	= "#quizContainer" + currentIndex;
		$(quizContainer).append('<div id="imgWrapper"></div><div id="textWrapper"></div>');
		var imgContainer 	= "#imgWrapper";
		var textContainer 	= "#textWrapper";
		var count = 0, found = 0;

		$.each(pair, function(key, val) {
			var tempImgContainer = $('<div id="textDroppableContainer' + i + '"></div>');
			$('<div id="textDroppable' + i + '">' + key + '</div>').appendTo(tempImgContainer);
			$('<div id="textForImg' + i + '" data-pair="' + i + '">').droppable({
				accept: '#textWrapper div',
				hoverClass: 'hovered',
				drop: function(event, ui) {
					handleDrop(event, ui, function(match) {
						//Counters Update
						count += 1;
						$(quizContainer + ' #count').text(count);

						found = (match) ? ++found : found;
						if(found == Object.keys(questions).length) {
							success();
						}
					});
				}
			}).appendTo(tempImgContainer);
			tempImgContainer.appendTo(imgContainer);

			$('<div id="textDraggable' + i + '" data-pair="' + i + '">' + val + '</div>').draggable({
				containment: quizContainer + ' div',
				stack: '#textWrapper div',
				cursor: 'move',
				revert: true,
				snap: true
			}).appendTo(textContainer);

			i += 1;
		});

		shuffle(quizContainer + ' #textWrapper');

	}
	function TTD(questions, currentIndex) {

		var found = 0, count = 0;
		var quizContainer 	= "#quizContainer" + currentIndex;

		$.each(pair, function(key, val) {
		
			var para = val[0], choice = val[1], answers = val[2];
			var tempstr = para.split('*');
			para = [];

			//Split the paragraph
			for(var i = 0; i < tempstr.length; i++) {
				para[i] = $('<p>').attr({
					'class': 'para'+key,
					'id': 'para'+key+i
				}).html(tempstr[i]);
			}
			
			var answerContainer = $('<ul>');
			for(i = 0; i < answers.length; i++) {
				//Create unordered list for the choices
				$('<li>').append($('<a>').attr({
					'id': 'q'+key+'a'+i,
					'data-sound': 'FlipCard'
				}).text(answers[i])).appendTo(answerContainer);
			}
		
			//Append it to wrapper
			var wrapper = $('<div>').attr('id', 'wrapper'+key).appendTo($('#' + bodySelector)).data('choice', choice);
			if(Object.keys(para).length == 2) {
				para[0].appendTo(wrapper);
				answerContainer.appendTo(wrapper);
				para[1].appendTo(wrapper);
			} else {
				para[0].appendTo(wrapper);
				answerContainer.appendTo(wrapper);
			}

    	});
		
		//shuffle('#'+bodySelector);
		
		$('a[id^=q]').on('click', function(event) {

			event.stopPropagation();

			count += 1;
			$(quizContainer + ' #count').text(count);

			//Sliding Effect
			var id = $(this).attr('id');
			var para = $(this).closest('ul').siblings();
			var wrapper = $(this).closest('div');
			para.animate({
				'top': $(this).position().top - 7
			}, 1000).promise().done(function() {
				if( wrapper.data('choice') == id.slice(-1) ) {
					wrapper.addClass('correct').attr({
						'unselectable': 'on'
					});
					wrapper.children('ul').attr('unselectable', 'on');

					if(++found === Object.keys(pair).length) {
						success();
					}
				}
			});

        });

	}

	function Quiz(options) {

		options = $.extend({
			beginMsg: 'Begin Quiz',
			endMsg: 'See Results',
			successMsg: 'You Win!',
			pageTitle: 'Sample Quiz',
			pageCount: 1,
			pages: [
				{
					pageTitle: 'Question Set 1',
					pageType: 'quiz',
					quizType: 'ImageImageFlip',
					questions: {
						0:[' * vêtements est-ce que tu aimes ?', '2', 
							 ['Comment', 'Combien', 'Quels', 'Quelles']
							],
						1:['Ces chaussures coûtent * , s\'il vous plaît?', '1', 
							 ['comment', 'combien', 'quels', 'quelles']
							],
						2:[' * tu trouves cette table? Elle est jolie, non?', '0', 
							 ['Comment', 'Combien', 'Quel', 'Quelle']
							],
						3:['Il y a * couleurs?', '3', 
							 ['comment', 'combien', 'quels', 'quelles']
							],
						4:[' * est le prix, s\'il vous plaît?', '2', 
							 ['Comment', 'Combien', 'Quel', 'Quelle']
							],
						5:[' * est votre taille Madame?', '3', 
							 ['Comment', 'Combien', 'Quel', 'Quelle']
							]
					}
				}
			]
		}, options);


		var bodyContainer = "#gameContainer";

		//Setting up pages
		for(var i = 0, len = options.pageCount; i < len; i += 1) {
			options.currentIndex = i;
			$(bodyContainer).append( $( generatePage(options) ) );
		}

		//Prepare first page
		options.currentIndex = 0;
		reset(options);
		
	}

	$(document).ready(function() {

		//Handle Navigation
		$('a[data-dstpage]').on('click', function(event) {
			event.preventDefault();
			options.currentIndex = $(this).data('dstpage');
			reset(options);
		});
		$('#reset').on('click', function(event) {
			event.preventDefault();
			reset(options);
		});

	});

})(window.jQuery);