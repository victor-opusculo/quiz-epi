/* =====================================================================================
 * Desenvolvido por Victor Opusculo 
 * para a Escola do Parlamento de Itapevi - Câmara Municipal de Itapevi / Junho de 2019
 * =====================================================================================*/

function Question(Title, Answ, Options, Tips, Information)
{
	this.title = Title; // String
	this.answ = Answ; // number
	this.options = Options; // [] of String
	this.tips = typeof(Tips) === 'undefined' ? [] : Tips; // [] of String
	this.information = Information; // String
}

function Quiz(QuestionList)
{
	this._questionList = QuestionList; //type: [] of Question
	this._currentQuestionIndex = -1; //type: number
	
	this.score = 0;
	this.randomizeOptions = false;
	this.cookieName = "";
}

Quiz.prototype.IsOver = function() //bool
{ 
	return this._currentQuestionIndex === (this._questionList.length - 1); 
};

Quiz.prototype.NumberOfQuestions = function()	//number
{
	return this._questionList.length;
};

Quiz.prototype.CurrentQuestion = function() //Question
{ 
	if (this._currentQuestionIndex >= 0)
		return this._questionList[this._currentQuestionIndex]; 
};

Quiz.prototype.NextQuestion = function() //Question
{
	this._currentQuestionIndex++;
	return this.CurrentQuestion();
};
	

var quizSession; //type: Quiz
var startPageForm; //type: Form
var quizPageForm; //type: Form
var endPageForm; //type: Form

var checkedValue; //type: number

function getRadioVal(form, name)
{
	var val;
	// get list of radio buttons with specified name
	var radios = form.elements[name];

	// loop through list of radio buttons
	for (var i = 0, len = radios.length; i < len; i++)
	{
		if (radios[i].checked)
		{ // radio checked?
			val = radios[i].value; // if so, hold its value in val
			break; // and break out of for loop
		}
	}
	return val; // return value of checked radio or undefined if none checked
}


function btnStartQuiz_Clicked()
{							
	DrawQuestionForm(quizSession.NextQuestion());	

	startPageForm.style.display = "none";
	quizPageForm.style.display = "inherit";
}

function btnNextQuestion_Clicked()
{
	checkedValue = getRadioVal(quizPageForm, "opts");
	if (checkedValue != undefined)
	{
		let question = quizSession.CurrentQuestion();
		var msgboxbtntext = (!quizSession.IsOver()) ? "Próxima Questão" : "Finalizar";
		var msgboxcontent = "Resposta correta: " + question.options[question.answ] + "\n\n" + question.information;

		MessageBox.Show(msgboxcontent, msgboxbtntext, GoToNextQuestion);
	}
	
}

function GoToNextQuestion()
{
	if (checkedValue == quizSession.CurrentQuestion().answ)
	{
		quizSession.score++;
		UpdateScoreLabel(quizSession.score);
		checkedValue = undefined;
	}

	quizPageForm.reset();
	
	if (!quizSession.IsOver())
		DrawQuestionForm(quizSession.NextQuestion());
	else
		EndQuiz();
}

function UpdateScoreLabel(score)
{
	document.getElementById("lblScore").innerText = (score <= 1)? score + " acerto" : score + " acertos";
}

Array.prototype.randomizeItems = function() //returns new Array
{
    let randIntervalNumber = this.length - 0.5;
    var finalSequence = [];
    let array = this.slice(0);

    while (array.length > 0)
    {
        let randomized = Math.floor(Math.random() * randIntervalNumber);
        finalSequence.push(array[randomized]);
        array.splice(randomized, 1);
        randIntervalNumber--;
    }

    return finalSequence;
};

function ClearQuestionForm()
{
	let radiosPanel = document.getElementById("RadiosPanel");
	while (radiosPanel.firstChild) radiosPanel.removeChild(radiosPanel.firstChild); //Remove old radio buttons and labels
		
	let tipsPanel = document.getElementById("TipsPanel");
	while(tipsPanel.firstChild) { tipsPanel.removeChild(tipsPanel.firstChild); } //remove previous tip buttons
}

function DrawQuestionForm(currQuestion /*Question*/)
{
	ClearQuestionForm();

    document.getElementById("qTitle").innerHTML = currQuestion.title;

    //Draw options:

	var radiosPanel = document.getElementById("RadiosPanel");
    var optionIndexes = []; 
    for (var q = 0; q <= currQuestion.options.length - 1; q++)  //Get option indexes
        optionIndexes.push(q);

    var finalOptionIndexes = quizSession.randomizeOptions ? optionIndexes.randomizeItems() : optionIndexes;  //Randomize (if enabled) option indexes
 
    for (var fsIndex = 0; fsIndex <= finalOptionIndexes.length - 1; fsIndex++)
    {
        var rad = document.createElement("input");
        var lbl = document.createElement("label");
        
        rad.type = "radio";
        rad.name = "opts";
        rad.value = finalOptionIndexes[fsIndex];
        rad.id = "radopt" + finalOptionIndexes[fsIndex];
        lbl.htmlFor = "radopt" + finalOptionIndexes[fsIndex];
        lbl.innerHTML = currQuestion.options[finalOptionIndexes[fsIndex]];

        radiosPanel.appendChild(rad);
        radiosPanel.appendChild(lbl);
        radiosPanel.appendChild(document.createElement("br"));
	}
		
    //Draw Tip buttons:
	
	var tipsPanel = document.getElementById("TipsPanel");
	if (currQuestion.tips.length > 0)
	{
		tipsPanel.style.display = "inherit";
		var lbl = document.createElement("label");
		lbl.innerText = "Dicas: ";
		tipsPanel.appendChild(lbl); 
		for (var i = 0; i <= currQuestion.tips.length - 1; i++)
		{
			var btn = document.createElement("input");
			btn.type = "button";
			btn.name = "btnTip";
			btn.className = "button tip";
			btn.value = i + 1;
			btn.onclick = function() { MessageBox.Show(currQuestion.tips[this.value - 1]);};
			tipsPanel.appendChild(btn);
		}
	}
	else
	{
		tipsPanel.style.display = "none";
	}
	
	
}

function EndQuiz()
{
	document.getElementById("lblResult").innerText = quizSession.score + " " + (quizSession.score <= 1? "questão acertada" : "questões acertadas") + " no total de " + quizSession.NumberOfQuestions() + "."; 
	endPageForm.style.display = "inherit";
	quizPageForm.style.display = "none";

	ClearQuestionForm();

	document.cookie = function(cname, cvalue, exdays) 
	{
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		return cname + "=" + cvalue + ";" + expires + ";path=/";
	}
	(quizSession.cookieName, quizSession.score, 30); // Set cookie 
}

function GetDataFileName() //returns String
{
	let query  = window.location.search.substring(1);
	let indexOfParam = query.indexOf("mod=");
	let modNum = query.substring(indexOfParam + 4, indexOfParam + 5);
		
	if (!modNum || modNum < 1 || modNum > 3 ) modNum = 1;

	let fileNames = ["EPI-Quiz_1.xml", "EPI-Quiz_2.xml", "EPI-Quiz_3.xml"];

	return fileNames[modNum - 1];
}

function DownloadXMLFile(url, callback)
{
    var xhttp;
    if (window.XMLHttpRequest)
    {
        xhttp = new XMLHttpRequest();
    } else
    {    // IE 5/6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhttp.callback = callback;
    xhttp.onload = XMLloaded;
    xhttp.onerror = XMLerror;
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-Type", "text/xml");
    xhttp.send(null);
}

function XMLloaded()
{
    this.callback.apply(this, this.arguments);
}

function XMLerror()
{
    console.error(this.statusText);
    alert("Erro ao carregar o quiz!");
}

function ParseXMLdata()
{
    var xmlDoc = this.responseXML;
    var questlist = xmlDoc.getElementsByTagName("Question");

    var questionObjList = [];

    for (var q = 0; q <= questlist.length - 1; q++)
    {
        var qText = questlist[q].childNodes[1].childNodes[0].nodeValue; //Text
        var qOptions = [];
        for (var o = 0; o <= questlist[q].getElementsByTagName("Option").length - 1; o++)
        {
            qOptions.push(questlist[q].getElementsByTagName("Option")[o].childNodes[0].nodeValue);	//Options	(if any, in case of scripted questions)
        }
        var qa = questlist[q].getElementsByTagName("A")[0].childNodes[0].nodeValue; // A
        var qTips = [];
        for (var t = 0; t <= questlist[q].getElementsByTagName("Tip").length - 1; t++)
        {
            qTips.push(questlist[q].getElementsByTagName("Tip")[t].childNodes[0].nodeValue);	// Tips (if any)
		}

		var qInfo = questlist[q].getElementsByTagName("Information")[0].childNodes[0].nodeValue //Information to display after user answers

        var quest = new Question(qText, qa, qOptions, qTips, qInfo);

        questionObjList.push(quest);
    }

    quizSession = new Quiz(questionObjList);    //[!] Create Quiz instance
	
	document.title = document.getElementById("lblQuizTitle").innerText = xmlDoc.getElementsByTagName("StartPageTitle")[0].childNodes[0].nodeValue;			//must be defined
    document.getElementById("lblStartPageContent").innerHTML = xmlDoc.getElementsByTagName("StartPageContent")[0].childNodes[0].nodeValue;	//must be defined
	document.getElementById("lblEndPageContent").innerHTML = xmlDoc.getElementsByTagName("EndPageContent")[0].childNodes[0].nodeValue;		//must be defined
	document.getElementById("postResultContent").innerHTML =  
		xmlDoc.getElementsByTagName("PostResultContent")[0].childNodes[0] ? xmlDoc.getElementsByTagName("PostResultContent")[0].childNodes[0].nodeValue : "";  //optional

	quizSession.randomizeOptions = (xmlDoc.getElementsByTagName("Randomize")[0].childNodes[0].nodeValue != 0) ? true : false;
	quizSession.cookieName = xmlDoc.getElementsByTagName("CookieName")[0].childNodes[0].nodeValue;

	startPageForm.style.display = "inherit"; //Show Start Page

	document.getElementById("LoadingIcon").style.display = "none";
}

var MessageBox = new function()
{
	var box, lbl, btn;
	var btnCallAfterPreviousFunction; //type: Function

	this.Initialize = function()
	{
		box = document.getElementById("MessageBox");
		lbl = document.getElementById("MessageBox_lblInformation");
	 	btn = document.getElementById("MessageBox_btnClose");

		btn.addEventListener("click", function() 
		{
			document.getElementById("MessageBox").style.display = "none";
		});
	};
	
	this.Show = function(text, buttonText, callAfterButtonClick)
	{
		if (btnCallAfterPreviousFunction) 
		{
			btn.removeEventListener("click", btnCallAfterPreviousFunction);
			btnCallAfterPreviousFunction = undefined;
		}

		box.style.display = "flex";

		lbl.innerText = text;

		btn.value = typeof(buttonText) === 'undefined' ? "Ok" : buttonText;
		
		if (typeof(callAfterButtonClick) === 'function') 
		{
			btn.addEventListener("click", callAfterButtonClick);
			btnCallAfterPreviousFunction = callAfterButtonClick;
		}
	};

	
}

function Window_OnLoad()
{
	document.getElementById("btnNextQ").onclick = btnNextQuestion_Clicked;
	document.getElementById("btnStartQuiz").onclick = btnStartQuiz_Clicked;
	
	document.oncontextmenu = document.body.oncontextmenu = function() {return false;}

	startPageForm = document.getElementById("StartPage");
	quizPageForm = document.getElementById("QuizPage");
	endPageForm = document.getElementById("EndPage");

	DownloadXMLFile(GetDataFileName(), ParseXMLdata);

	MessageBox.Initialize();
}

window.onload = Window_OnLoad;