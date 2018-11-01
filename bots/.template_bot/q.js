var vk, Keyboard,
	updates,
	memoryStorage;

global.GameState = {
	None: 0,
};
global.MMenu = {
	Close: -1,
	None: 0,
	Main: 1,
	Select: 2,
};

function getCmd(menuID) {
	var MMenuCMD = {
		[MMenu.Main]: "menu_main",
		[MMenu.Select]: "select",
	};

	return MMenuCMD[menuID];
}

module.exports = start;

const hearCommand = (name, conditions, handle) => {
	if (typeof handle !== 'function') {
		handle = conditions;
		conditions = [`/${name}`];
	}

	if (!Array.isArray(conditions)) {
		conditions = [conditions];
	}

	updates.hear(
		[
			(text, { state }) => (
				state.command === name
			),
			...conditions
		],
		handle
	);
};

function menuConstruct(menuID, one, context) {
	if(menuID == MMenu.None)
		return undefined;

	if(menuID == MMenu.Close) {
		var KB = Keyboard.keyboard([]);
		KB.oneTime = true;
		return KB;
	}

	const { session } = context.state;
	var { gameID }= session,
		{ peerId } = context;

	menuID = menuID || MMenu.Main;
	one = one || false;

	var menuArr = [];

	if(menuID == MMenu.Main) {
		menuArr.push(Keyboard.textButton({
			label: 'Выбрать режим игры',
			payload: {
				command: getCmd(MMenu.SelectGame)
			},
			color: Keyboard.PRIMARY_COLOR
		}));

		/*menuArr.push([
			Keyboard.textButton({
				label: '+',
				payload: {
					command: 'null'
				},
				color: Keyboard.POSITIVE_COLOR
			}),
			Keyboard.textButton({
				label: '-',
				payload: {
					command: 'null'
				},
				color: Keyboard.NEGATIVE_COLOR
			})
		]);*/
	}
	else if(menuID == MMenu.SelectGame) {
		menuArr.push(
			Keyboard.textButton({
				label: 'С ботом (Release)',
				payload: {
					command: getCmd(MMenu.SelectGame),
					command2: "ai"
				},
				color: Keyboard.POSITIVE_COLOR
			}),
			Keyboard.textButton({
				label: 'С другом (Beta)',
				payload: {
					command: getCmd(MMenu.SelectGame),
					command2: "friend"
				},
				color: Keyboard.PRIMARY_COLOR
			})
		);
	}
	else if(menuID == MMenu.PlayAI) {
		
		menuArr.push([
				Keyboard.textButton({
					label: 'Легко',
					payload: {
						command: getCmd(MMenu.PlayAI),
						command2: 1
					},
					color: Keyboard.POSITIVE_COLOR
				}),
				Keyboard.textButton({
					label: 'Средне',
					payload: {
						command: getCmd(MMenu.PlayAI),
						command2: 2
					},
					color: Keyboard.PRIMARY_COLOR
				})
			],
			[
				Keyboard.textButton({
					label: 'Хард',
					payload: {
						command: getCmd(MMenu.PlayAI),
						command2: 3
					},
					color: Keyboard.NEGATIVE_COLOR
				}),
				Keyboard.textButton({
					label: 'Random',
					payload: {
						command: getCmd(MMenu.PlayAI),
						command2: -1
					},
					color: Keyboard.DEFAULT_COLOR
				})
			]
		);
	}
	else if(menuID == MMenu.InGame) {
		
		var game = getBoardByID(gameID, peerId);

		if(game) {
			// Build Board
			menuArr = buildBoard(game, peerId, false);
		}
		else
			menuArr.push(Keyboard.textButton({
				label: '(Err) В Главное меню',
				payload: {
					command: getCmd(MMenu.Main)
				},
				color: Keyboard.NEGATIVE_COLOR
			}));
	}
	else if(menuID == MMenu.PlayFriend) {
		
		menuArr.push(Keyboard.textButton({
			label: 'Случайная игра',
			payload: {
				command: getCmd(MMenu.PlayFriend),
				command2: "random"
			},
			color: Keyboard.POSITIVE_COLOR
		}));

		/*menuArr.push(Keyboard.textButton({
			label: 'Создать',
			payload: {
				command: getCmd(MMenu.PlayFriend),
				command2: "create"
			},
			color: Keyboard.POSITIVE_COLOR
		}),
		Keyboard.textButton({
			label: 'Присоединиться',
			payload: {
				command: getCmd(MMenu.PlayFriend),
				command2: "connect"
			},
			color: Keyboard.PRIMARY_COLOR
		}));*/
	}

	if(menuID != MMenu.Main && menuID != MMenu.InGame) {
		var bm = [];
		if([MMenu.SelectGame, MMenu.PlayAI].includes(menuID)) {
			bm.push(Keyboard.textButton({
				label: 'В Главное меню',
				payload: {
					command: getCmd(MMenu.Main)
				},
				color: Keyboard.DEFAULT_COLOR
			}));
			menuArr.push(bm);
		}
	}
	
	var KB = Keyboard.keyboard(menuArr);
	if(one) KB.oneTime = true;

	return KB;
}

function buildBoard(game, peerId, otherBtns) {
	var gameBoard = game.board.gameBoard;
	var keyBoard = [];

	var teamPlayer = getPlayer(game.id, peerId);

	for(var row=0; row<3; row++) {
		var rowArr = [];
		for(var col=0; col<3; col++) {

			var key = gameBoard[row][col],
				name = (key==BS_O? BS_OE: key==BS_X? BS_XE: BS_NE),
				color = Keyboard.DEFAULT_COLOR;					

			if(game.gameEnd) {
				if(game.winTeam == key)
					color = Keyboard.POSITIVE_COLOR;
			}
			else if(teamPlayer == game.curTeam) {
				if(key == 1)
					color = Keyboard.NEGATIVE_COLOR;
				else if(key == -1)
					color = Keyboard.PRIMARY_COLOR;
				else if(key == 0)
					color = Keyboard.POSITIVE_COLOR
			}

			rowArr.push(Keyboard.textButton({
				label: name,
				payload: {
					command: (game.gameEnd)?getCmd(MMenu.SelectGame):getCmd(MMenu.PlayerMove),
					command2: (game.gameEnd)?false:(row+":"+col)
				},
				color: color
			}));

		}

		keyBoard.push(rowArr);
	}

	if(otherBtns) {
		keyBoard[0].push(Keyboard.textButton({
			label: "**",
			payload: {
				command: getCmd(MMenu.Main)
			},
			color: Keyboard.DEFAULT_COLOR
		}));
		keyBoard[1].push(Keyboard.textButton({
			label: "==",
			payload: {
				command: getCmd(MMenu.None)
			},
			color: Keyboard.DEFAULT_COLOR
		}));
		keyBoard[2].push(Keyboard.textButton({
			label: "==",
			payload: {
				command: getCmd(MMenu.None)
			},
			color: Keyboard.DEFAULT_COLOR
		}));
	}

	if(game.gameEnd)
		keyBoard.push(Keyboard.textButton({
			label: "Еще катку",
			payload: {
				command: getCmd(MMenu.SelectGame),
					// command2: -1
				},
				color: Keyboard.POSITIVE_COLOR 
			}));
	else
		keyBoard.push(Keyboard.textButton({
			label: "Обратно в меню",
			payload: {
				command: getCmd(MMenu.Main)
			},
			color: game.gameEnd ? Keyboard.POSITIVE_COLOR : Keyboard.DEFAULT_COLOR
		}));

	return keyBoard;
}

function getMenu(context, one, menuID) {
	const { session } = context.state;

	/*if(context.isChat && _.rand(0, 20) < 17)
		return undefined;*/

	return menuConstruct(menuID || session.menuState || MMenu.None, one, context);
}

async function setMenu(context, menuID, send, one) {
	send = send || "...";
	const { session } = context.state;
	session.menuState = menuID;

	if(send) {
		try {
			await context.send({
				message: send,
				keyboard: getMenu(context, one)
			});
		} catch(e) {
			console.log(e.message)
			if(e.messages && e.messages.indexOf("Flood control") !== -1)
				sWait(context, true)
		}
	}
}

// Boardse
function findPlayer(userID) {
	// if(Object.keys(gameBoards).length == 0)
	// 	return false;
	var games = _.objFilter(gameBoards, board => (board && userID in board.players) );

	if(games.length > 0) {
		if(userID in games[0].players)
			return games[0].players[userID];
	}
	
	return false;
}
function getPlayer(gameID, userID) {
	if(gameID > 0 && gameID in gameBoards) {
		if(userID in gameBoards[gameID].players)
			return gameBoards[gameID].players[userID];
	}
	
	return false;
}
function checkPlayer(gameID, userID) {
	if(gameID > 0 && gameID in gameBoards) {
		if(userID in gameBoards[gameID].players)
			return true;
	}
	
	return false;
}
function getBoardByID(gameID, userID) {
	if(gameID < 1 || userID && !checkPlayer(gameID, userID))
		return false;

	if(gameID in gameBoards)
		return gameBoards[gameID];

	return false;
}
function getBoardsByUserID(userID) {
	var games = _.objFilter(gameBoards, board => (board && userID in board.players) );
	// console.log(games)
	if(Object.keys(games).length > 0) {
		return games;
	}
	
	return false;
}
function createBoardAndUserIDAIGAME(userID, complexity) {
	
	var gb = gameBoards[++lastBoardID] = new Game(lastBoardID, complexity),
		tp = gb.addPlayer(userID);
	gb.addPlayer(-1); // AI Bot
	gb.isAI = true;

	return tp? gb.id:false;
}
function createBoardAndUserID_ROOM(userID) {
	var gb = gameBoards[++lastBoardID] = new Game(lastBoardID),
		tp = gb.addPlayer(userID);
	return tp? gb.id:false;
}
function findWaitBoards(userID) {
	var games = _.objFilter(gameBoards, board => (board && !board.isAI && !board.gameStarted
		&& !(userID in board.players) && Object.keys(board.players).length == 1) );

	if(Object.keys(games).length > 0) {
		return games;
	}	
	return false;
}
function tryAddUserID(userID) {
	
	return false;
}
function removeBoard(gameID) {
	if(gameBoards[gameID])
		delete gameBoards[gameID]
	return true;
}
function leaveBoard(gameID, userID) {
	if(gameBoards[gameID] && userID in gameBoards[gameID].players) {
		delete gameBoards[gameID].players[userID];
		return true;
	}
	if(Object.keys(gameBoards[gameID].players).length == 0)
		removeBoard(gameID);
	return false;
}
function leaveBoardAll(userID) {
	var boards = getBoardsByUserID(userID),
		arr = Object.values(boards);

	arr.forEach((el, key)=> {
		leaveBoard(el.id, userID);
	});

	return true;
}

function sWait(context, set) {
	context.state.session.inWait = set?(_.nowUNIX()+set):false;
}

async function sendOPP(peerId, text, game) {
	var kboard = Keyboard.keyboard(buildBoard(game, peerId));

	await vk.api.messages.send({
		peer_id: peerId,
		message: text,
		keyboard: kboard 
	});
	/*Keyboard.keyboard([Keyboard.textButton({
		label: 'Загрузить поле',
		payload: {
			command: getCmd(MMenu.InGame),
			command2: "load"
		},
		color: Keyboard.PRIMARY_COLOR
	})])*/
}
function start(_VK, _Keyboard) {
	vk = _VK;
	Keyboard = _Keyboard;
	updates = vk.updates;

	memoryStorage = new Map();

	// Handle message payload
	updates.use(async (context, next) => {
		if (context.is('message')) {
			const { messagePayload } = context;

			context.state.command = (messagePayload && messagePayload.command) ? messagePayload.command : null;
			context.state.command2 = (messagePayload && messagePayload.command2 !== undefined) ? messagePayload.command2 : undefined;
		}

		await next();
	})
	.on('message', async (context, next) => {
		const { peerId } = context;

		/*MessageContext {
			id: 0,
			conversationMessageId: 227,
			peerId: 2000000001,
			peerType: 'chat',
			senderId: 191039467,
			senderType: 'user',
			createdAt: 1538005743,
			text: 'a',
			forwards: [],
			attachments: [],
			isOutbox: false,
			type: 'message',
			subTypes: [ 'new_message', 'text' ],
			state: { command: null, command2: undefined }
		}*/
		/*MessageContext {
			id: 44,
			conversationMessageId: 44,
			peerId: 191039467,
			peerType: 'user',
			senderId: 191039467,
			senderType: 'user',
			createdAt: 1538005690,
			text: '-',
			forwards: [],
			attachments: [],
			messagePayload: { command: 'player_move', command2: '1:1' },
			isOutbox: false,
			type: 'message',
			subTypes: [ 'new_message', 'text' ],
			state: { command: 'player_move', command2: '1:1' }
		}*/

		const session = memoryStorage.has(peerId) ? memoryStorage.get(peerId) : {};
		context.state.session = session;
		
		memoryStorage.set(peerId, session);
		await next();
	})
	// Set defaut session
	.on('message', async (context, next) => {
		const { session } = context.state;

		if (!('inWait' in session))
			session.inWait = false;

		if (!('messages_count' in session))
			session.messages_count = 0;

		if (!('menuState' in session))
			session.menuState = MMenu.Main;

		if (!('gameID' in session))
			session.gameID = -1;
		
		await next();
	})

	// Check cool down
	.on('message', async (context, next) => {
		const { session } = context.state;

		if(session && session.inWait && (_.nowUNIX() - session.inWait) <= 30 )
			return;

		await next();
	});


	hearCommand('start', async (context, next) => {
		context.state.command = 'help';
		await next();
	});
	hearCommand('restart', async (context) => {
		const { peerId } = context;
		leaveBoardAll(peerId);
		await setMenu(context, MMenu.Main, "Restart menu");
	});
	hearCommand(getCmd(MMenu.SelectGame), async (context) => {
		var cc = context.state.command2;
		if(!cc)
			return await setMenu(context, MMenu.SelectGame, "Выбор режима игры");
		sWait(context, true);

		if(cc == "ai") {
			await setMenu(context, MMenu.PlayAI, "Игра с ботом\nВыбор сложности игры");
		}
		else if(cc == "friend") {
			await setMenu(context, MMenu.PlayFriend, "Можно создать игру или присоединиться к созданной");
		}

		sWait(context, false);
	});
	hearCommand(getCmd(MMenu.PlayAI), async (context) => {
		var cc = context.state.command2,
			{ peerId } = context;

		if(!cc)
			return await setMenu(context, MMenu.PlayAI, "Выбор сложности игры");

		// Create GAME
		sWait(context, true);

		if(cc == -1) {
			await setMenu(context, MMenu.Close, "Рaндомность");
			// await setMenu(context, MMenu.Close, "Легкая сложность");
		}
		else if(cc == 1) {
			await setMenu(context, MMenu.Close, "Легко");
		}
		else if(cc == 2) {
			await setMenu(context, MMenu.Close, "Средне");
		}
		else if(cc == 3) {
			await setMenu(context, MMenu.Close, "Хард");
		}

		var tb = getBoardsByUserID(peerId),
			subTT = "";

		// Актуально только для игры с ботом
		if(Object.keys(tb).length > 0 && !Object.values(tb)[0].gameEnd) {
			tb = Object.keys(tb)[0];
			subTT = "восстановлена"
		}
		else {
			tb = createBoardAndUserIDAIGAME(peerId, cc);
			subTT = "запущена"
		}

		// console.log(tb)

		if(tb !== false) {
			context.state.session.gameID = tb;
			await _.sleep(1);
			await setMenu(context, MMenu.None, "Игра #"+tb+" "+subTT);

			// Send new game Board
			await setMenu(context, MMenu.InGame, "Ходит "+BS_XE+"\nВаш ход");
		}
		else
			await setMenu(context, MMenu.SelectGame, "Не удалось создать игру");
		
		sWait(context, false);
	});
	hearCommand(getCmd(MMenu.PlayerMove), async (context) => {
		const { session, command2 } = context.state;
		var cc = command2,
			{ gameID } = session,
			{ peerId } = context;

		if(gameID < 1 || !cc || (cc=cc.split(':')).length !=2)
			return await setMenu(context, MMenu.SelectGame, "o_o\nЧто-то пошло не так [2]");
		

		var game = getBoardByID(gameID, peerId);
		
		// console.log(game);
		// If the game was successfully created
		if(game) {
			var teamPlayer = getPlayer(gameID, peerId);
			var curPlayer = game.curTeam==BS_O?BS_OE:BS_XE;

			// console.log(game)

			if(teamPlayer != game.curTeam) {
				await setMenu(context, MMenu.InGame, "o_o\nСейчас ход "+curPlayer);
				return;
			}

			var board = game.board;
			if(!board.canMoveCoords(cc[0], cc[1]))
				return await setMenu(context, MMenu.InGame, "Клетка ["+((cc[0]*1)+1)+"x"+((cc[1]*1)+1)+"] уже занята");

			board.processCoords(/*game.players[peerId]*/teamPlayer, cc[0], cc[1]);
			
			var nextPlayer = game.curTeam!=BS_O?BS_OE:BS_XE;
			
			var dBo = drawBoard(board.gameBoard);

			if(board.hasWon(teamPlayer)) {
				game.gameEnd = true;
				game.winTeam = teamPlayer;
				await setMenu(context, MMenu.InGame /* SelectGame */, dBo+"\nYou Win!");
				if(!game.isAI)
					await sendOPP(_.getKeyByValue(game.players, game.curTeam*(-1)), dBo+"\nYou Lose", game);
				removeBoard(gameID);
				return;
			}
			else if(board.isFinished()) {
				game.gameEnd = true;
				game.winTeam = 0;
				await setMenu(context, MMenu.InGame /* SelectGame */, dBo+"\nНичья");
				if(!game.isAI)
					await sendOPP(_.getKeyByValue(game.players, game.curTeam*(-1)), dBo+"\nНичья", game);
				removeBoard(gameID);
				return;
			}

			// Смена команды
			game.curTeam *= -1;

			var mUserID = _.getKeyByValue(game.players, game.curTeam);
			if(!game.isAI)
				await sendOPP(mUserID, "Противник сходил на ["+((cc[0]*1)+1)+"x"+((cc[1]*1)+1)+"]\n"+dBo+"\nХодит "+curPlayer+"\nВаш ход", game);
			await setMenu(context, MMenu.InGame, "Сходили на ["+((cc[0]*1)+1)+"x"+((cc[1]*1)+1)+"]\n"+dBo+"\nХодит "+nextPlayer, true);
			/*return*/

			if(!game.isAI)
				return;

			// IF AI BOT GAME MODE ==============

			await _.sleep(_.rand(0,3));

			// Random AI Bot
			var coords = (game.complexity!=-1)?game.AIMOVE():_.shuffle(board.getOpenCoords())[0];
			// console.log("AI move: ", coords)
			board.processCoords(game.curTeam, coords[0], coords[1]);
			
			dBo = drawBoard(board.gameBoard);
			
			if(board.hasWon(teamPlayer*-1)) {
				game.gameEnd = true;
				game.winTeam = teamPlayer*-1;
				await setMenu(context, MMenu.InGame, dBo+"\nBot Win. You lose");
				removeBoard(gameID);
				return;
			}
			else if(board.isFinished()) {
				game.gameEnd = true;
				game.winTeam = 0;
				await setMenu(context, MMenu.InGame /* SelectGame */, dBo+"\nНичья");
				removeBoard(gameID);
				return;
			}

			// Смена команды на игрока
			game.curTeam *= -1;		// Перед отправкой, т.к. формируется цвет на KeyBoard
			await setMenu(context, MMenu.InGame, "Противник сходил на ["+(coords[0]+1)+"x"+(coords[1]+1)+"]\n"+dBo+"\nХодит "+curPlayer+"\nВаш ход");
			
			return;
		}

		return await setMenu(context, MMenu.SelectGame, "o_o\nЧто-то пошло не так [3]\nИгра не была найдена");
	});
	hearCommand(getCmd(MMenu.PlayFriend), async (context) => {
		const { session, command2 } = context.state;
		var cc = command2,
			{ gameID } = session,
			{ peerId } = context;

		if(!cc)
			return await setMenu(context, MMenu.PlayFriend, "Выбор действия");
		
		sWait(context, true);

		if(cc == "create") {
			await setMenu(context, MMenu.Close, "Now does Not working");
		}
		else if(cc == "connect") {
			await setMenu(context, MMenu.Close, "Введите ID игры [...]");
		}
		else if(cc == "random") {
			await setMenu(context, MMenu.Close, "В процессе...");

			var waitBoards = findWaitBoards(peerId),
				tb = getBoardsByUserID(peerId),
				subTT = "";
			
			// console.log("gameBoards", gameBoards)
			// console.log("waitBoards", waitBoards)

			if(waitBoards) {
				var board = _.shuffle(Object.values(waitBoards))[0]
				board.addPlayer(peerId);
				board.gameStarted = true;
				
				tb = context.state.session.gameID = board.id;

				// console.log("Wait board connected ", board)

				var mUserID = _.getKeyByValue(board.players, BS_X); /*Object.keys(board.players)[0]*/;
				
				console.log("mUserID", mUserID)
				
				await sendOPP(mUserID, "Игра началась с (@id"+peerId+")\nВаш ход", board);
				await setMenu(context, MMenu.InGame, "Подключились к (@id"+mUserID+"). Игра #"+tb+"\nОжидание хода");
			}
			else {


				if(Object.keys(tb).length > 0 && !Object.values(tb)[0].gameEnd) {
					tb = Object.keys(tb)[0];
					subTT = "восстановлена"
				}
				else {
					tb = createBoardAndUserID_ROOM(peerId);
					subTT = "запущена"
				}

				if(tb !== false) {
					context.state.session.gameID = tb;
					await _.sleep(1);
					await setMenu(context, MMenu.None, "Игра #"+tb+" "+subTT+"\nОжидание второго игрока");

					// await setMenu(context, MMenu.InGame, "Ходит "+BS_XE+"\nВаш ход");
				}
				else
					await setMenu(context, MMenu.SelectGame, "Не удалось создать игру");
			}

		}

		sWait(context, false);
	});
	hearCommand(getCmd(MMenu.InGame), async (context) => {
		const { session, command2 } = context.state;
		var cc = command2,
			{ gameID } = session,
			{ peerId } = context;

		if(cc == "load")
			await setMenu(context, MMenu.InGame, "Загрузка игры");
	});


	hearCommand(getCmd(MMenu.Main), async (context) => {
		await setMenu(context, MMenu.Main, "Вернулись в начало");
	});

	/*hearCommand(getCmd(MMenu.ZZZZZ), async (context) => {
		await setMenu(context, MMenu.ZZZZZ, "Стартовый набор кнопок");
	});*/

	hearCommand('help', async (context) => {
		await context.send({
			message: "Tic Tac Toe",
			keyboard: getMenu(context)
		});
	});

	hearCommand('counter', ['/count'], async (context) => {
		const { session } = context.state;

		await context.send(`You turned to the bot (${session.counter||"none"}) times`);
	});
}

