// store the data from json
let questionsData, formData, resultData;

// store the data from interface
let answerStore, formStore;

// error message
var errorMsg;

// init
function init() {
  createView();
}

/***************** Fetch Data Functions *************** */
async function fetchData(file) {
  // fetch questions data
  try {
    // read JSON file
    const response = await fetch(file);

    // check success or not
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    //
    const data = await response.json();
    return data;
  } catch (error) {
    errorMsg = `Met Some Problem While Looking for the File ${file}`;
    storeErrorMsg(errorMsg);
    window.location.href = "/error-page.html";
  }
}
/***************** Fetch Data Functions *************** */

/***************** Create the View  *********************/
async function createView() {
  questionsData = await fetchData("./assets/json/data.json");
  formData = await fetchData("./assets/json/form.json");
  resultData = await fetchData("./assets/json/result.json");

  // create main div
  const mainDivEle = document.createElement("div");
  mainDivEle.setAttribute("id", "main-div");
  document.getElementsByTagName("body")[0].appendChild(mainDivEle);

  const mainDiv = document.getElementById("main-div");

  // create title
  const divElement = document.createElement("div");
  divElement.setAttribute("id", "questions");
  mainDiv.appendChild(divElement);

  const questionTitle = document.createElement("h2");
  const textNode = document.createTextNode(questionsData.title);
  questionTitle.appendChild(textNode);
  document.getElementById("questions").appendChild(questionTitle);

  const existsData = getData("questions");

  // check whether there is exists data, if does, write the exists data into it.
  if (existsData) {
    const keys = Object.keys(existsData);
    keys.forEach((key, index) => {
      createSelect(key, existsData[key]);
      const next = findNextByValue(existsData[key]);

      // if there is no existsData and next is null, createform
      if (next === null) {
        createUserForm();
      }

      // if there is no existsData but next is not null
      if (index === keys.length - 1 && next) {
        createSelect(next);
      }
    });
  } else {
    createSelect("q1");
  }

  createAgainBtn();
}
/***************** Create the View  *********************/

/**************** Select Functions ******************** */
// function for create new select section
function createSelect(selectedQuestion, value = null) {
  // if there is no more question, then don't create new question div
  if (selectedQuestion === null) {
    return;
  }

  // if there is no questions data
  if (questionsData === null) {
    return;
  }

  //get the question data
  const dataSelected = questionsData[selectedQuestion];

  // create question div
  const elementDiv = document.createElement("div");
  elementDiv.setAttribute("id", `question-block-${dataSelected.id}`);
  elementDiv.setAttribute("class", "question");
  elementDiv.style.left = "-200px";
  elementDiv.style.position = "relative";
  document.getElementById("questions").appendChild(elementDiv);

  // create question paragraph
  const elementParagraph = document.createElement("p");
  const textNode = document.createTextNode(dataSelected.question);
  elementParagraph.appendChild(textNode);
  document
    .getElementById(`question-block-${dataSelected.id}`)
    .appendChild(elementParagraph);

  // create and set select
  const elementSelection = document.createElement("select");
  elementSelection.setAttribute("name", dataSelected.id);
  elementSelection.setAttribute("id", dataSelected.id);
  elementSelection.setAttribute(
    "onchange",
    "changeSelect(this.id, this.value)"
  );

  const textNodeSelection = document.createTextNode(dataSelected.question);
  elementSelection.appendChild(textNodeSelection);
  document
    .getElementById(`question-block-${dataSelected.id}`)
    .appendChild(elementSelection);

  // create and set option
  // using forEach to get all the options in this question data
  Object.keys(dataSelected.options).forEach((key) => {
    // have to do the createElement every time when you need a new element
    const elementOption = document.createElement("option");
    elementOption.value = dataSelected.options[key].value;
    elementOption.text = dataSelected.options[key].text;

    if (value && value === dataSelected.options[key].value) {
      elementOption.selected = true;
      oldData = true;
    }

    // show on the website
    document.getElementById(dataSelected.id).appendChild(elementOption);
  });

  requestAnimationFrame(() => moveIn(`question-block-${dataSelected.id}`));
}

function removeSelect(id) {
  // get the changed element
  const changedSelectId = document.getElementById(id);

  // if changedSelectId is not the last element, delete the last element till changedSelectId is the last element
  while (
    changedSelectId.parentElement !==
    changedSelectId.parentElement.parentElement.lastElementChild
  ) {
    changedSelectId.parentElement.parentElement.lastElementChild.remove();
  }
}

// decided when option change, whether need to remove other questions and create new question.
function changeSelect(id, value) {
  const changedSelectId = document.getElementById(id);
  const next = findNextByValue(value);

  const resultId = document.getElementById("result");
  if (resultId) {
    resultId.remove();
  }

  // get whether the selected id have the sibling.
  let removeIds = changedSelectId.parentElement.nextElementSibling;

  // if the select div doesn't have any relative question exists, and the select option has next question
  if (!removeIds) {
    // store the recent data
    const selectData = getInterfaceData("questions");
    storeData("questions", selectData);

    if (value !== "default") {
      createSelect(next);
    }
  } else {
    removeSelect(id);

    // store the resent data
    const selectData = getInterfaceData("questions");
    storeData("questions", selectData);

    if (value !== "default") {
      // create new select base on the select value
      createSelect(next);
    }
  }

  // if value is null, print out the result
  if (next === null) {
    // show the user form
    createUserForm();
  }
}
/************ Select Fucntions *******************/

/*********** Form Functions ************/
// form setting to get user information
function createUserForm() {
  const formDiv = document.createElement("div");
  formDiv.setAttribute("id", "user-form");
  formDiv.setAttribute("class", "question");
  formDiv.style.left = "-200px";
  formDiv.style.position = "relative";
  document.getElementById("questions").appendChild(formDiv);

  const h3Element = document.createElement("h3");
  const textNode = document.createTextNode(
    "Please fill in some user information"
  );
  h3Element.appendChild(textNode);
  document.getElementById("user-form").appendChild(h3Element);

  const formElement = document.createElement("form");
  formElement.setAttribute("action", "#");
  formElement.setAttribute("method", "get");
  document.getElementById("user-form").appendChild(formElement);

  const formTag = document
    .getElementById("user-form")
    .getElementsByTagName("form")[0];

  // using foreach to create the form input base on the formdata information
  Object.keys(formData).forEach((key) => {
    const formBr = document.createElement("br");

    // check whether there is data storage
    const storageData = getData("form", formData[key].input.id);

    // create the label
    const userLabel = document.createElement("label");
    const textNode = document.createTextNode(formData[key].label.text);
    userLabel.setAttribute("for", formData[key].label.for);
    userLabel.appendChild(textNode);

    formTag.appendChild(userLabel);

    // create the input
    const userInput = document.createElement("input");
    userInput.setAttribute("type", formData[key].input.type);
    userInput.setAttribute("id", formData[key].input.id);
    userInput.setAttribute("name", formData[key].input.name);
    if (storageData) {
      userInput.setAttribute("value", storageData);
    }
    formTag.appendChild(userInput);

    // add br
    formTag.appendChild(formBr);
  });

  // submit
  const submitElement = document.createElement("input");
  submitElement.setAttribute("type", "submit");
  submitElement.setAttribute("value", "Get Result");
  submitElement.setAttribute("id", "form-submit");
  formTag.appendChild(submitElement);

  // add event listener into the inputs
  const formInputs = document.querySelectorAll("#user-form input");
  // listen when the mouse into the form input
  formInputs.forEach(function (input) {
    // remove the classname when user enter the block
    input.addEventListener("mouseenter", function () {
      if (input.classList.contains("form-error")) {
        input.classList.remove("form-error");
      }
    });

    // store the interface data while user enter
    input.addEventListener("input", function () {
      const formStoreData = getInterfaceData("form");
      storeData("form", formStoreData);
    });
  });

  // move in animation
  requestAnimationFrame(() => moveIn("user-form"));
}

// form validation
function formValid() {
  // get the setting data
  const settingData = formData;

  // if the error message already exists, remove it
  const error = document.getElementById("error-message");
  if (error) {
    error.remove();
  }

  // set the errorMessage element
  let errorMessage = document.createElement("p");
  errorMessage.setAttribute("id", "error-message");
  errorMessage.innerText = "";

  // check every input
  Object.keys(settingData).forEach((key) => {
    const value = document.getElementById(settingData[key].input.id).value;
    const data = document.getElementById(settingData[key].input.id);

    // if this data is setting require
    if (settingData[key].require) {
      // check whether enter the value
      if (value === "") {
        const br1 = document.createElement("br");
        // make the alert color
        data.setAttribute("class", "form-error");

        errorMessage.innerText += `The "${settingData[key].label.text}" field is required!`;
        errorMessage.appendChild(br1);
      }
    }

    // if the type setting is "email", check whether the value is in email format
    if (
      settingData[key].input.type === "email" &&
      (settingData[key].require || data.value)
    ) {
      const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

      // test() -> test for a match in a string
      if (!emailPattern.test(data.value)) {
        const br2 = document.createElement("br");
        // make the alert color
        data.setAttribute("class", "form-error");
        errorMessage.innerText += `The email format is incorrect!`;
        errorMessage.appendChild(br2);
      }
    }
  });
  // if everything is valid
  if (errorMessage.innerText === "") {
    return true;
  } else {
    document.getElementById("user-form").appendChild(errorMessage);
    return false;
  }
}

/************* data store and get **********/
// store data into local storage
function storeData(type, data, time = 7) {
  // is the localStorage exists
  if (window.localStorage) {
    localStorage.setItem(type, JSON.stringify(data));
  } else {
    // if the localStorage doesn't exists, use the cookies
    const date = new Date();
    date.setTime(date.getTime() + time * 24 * 60 * 60 * 1000);

    // store the data into cookie
    document.cookie =
      type +
      "=" +
      JSON.stringify(data) +
      "; expires=" +
      date.toUTCString +
      "; path=/; HTTPOnly; SameSite=None; secure; domain=rit.edu";
  }
}

function getData(type, id) {
  let result;
  if (window.localStorage) {
    const resultData = JSON.parse(localStorage.getItem(type));
    // if ask for the specific id result, give the resultData[id] else return resultData
    result = resultData ? (id ? resultData[id] : resultData) : null;
  } else {
    // split all the cookie by ";"
    const cookieArray = document.cookie.split(";");
    const name = type + "=";

    // find which array is the one match to the type
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();

      // when the array data is the one we are looking for
      if (cookie.indexOf(name) === 0) {
        // get the data and change it into JSON format
        const resultData = JSON.parse(
          cookie.substring(name.length, cookie.length)
        );
        // if ask for the specific id result, give the resultData[id] else return resultData
        result = resultData ? (id ? resultData[id] : resultData) : null;
      }
    }
  }

  return result;
}

// remove data base on the type
function removeData(type = null, path, domain = "rit.edu") {
  // is the localStorage exists
  if (window.localStorage) {
    if (type === null) {
      localStorage.clear();
    } else {
      localStorage.removeItem(type);
    }
  } else {
    // if the localStorage doesn't exists, use the cookies
    document.cookie =
      type +
      "=" +
      (path ? "; path=" + path : "") +
      (domain ? "; domain=" + domain : "") +
      "; expires=Thu, 01-Jan-70 00:00:01 GMT; SameSite=None; Secure;";
  }
}

// get the data from the interface
function getInterfaceData(type) {
  let selectData = {};
  let elements;

  // if it is the question data
  if (type === "questions") {
    elements = document
      .getElementById("questions")
      .getElementsByTagName("select");
  }

  // if it is the form data
  if (type === "form") {
    elements = document
      .getElementById("user-form")
      .getElementsByTagName("input");
  }

  const elementsArray = Array.from(elements);

  elementsArray.forEach((element) => {
    const id = element.id;
    const value = element.value;

    selectData[id] = value;
  });

  return selectData;
}

/******************** data store and get ******************/

/***************** Print Result ********************* */
// print out the result
function printResults() {
  // create a div for result
  const resultDiv = document.createElement("div");
  resultDiv.setAttribute("id", "result");
  document.getElementById("main-div").appendChild(resultDiv);

  const resultDivId = document.getElementById("result");

  // create a title for result
  const resultTitle = document.createElement("h2");
  const textNode = document.createTextNode("The select result");
  resultTitle.appendChild(textNode);
  resultDivId.appendChild(resultTitle);

  let questionsAnswer = getData("questions");

  // get the result path
  let resultPath;
  Object.keys(questionsAnswer).forEach((key) => {
    resultPath = resultPath
      ? resultPath + `${questionsAnswer[key]}.`
      : `${questionsAnswer[key]}.`;
  });

  resultPath = resultPath + "result";

  // use the result path to get the recommend answer
  const resultArray = resultPath
    .split(".")
    .reduce((obj, key) => obj[key], resultData);

  // give the random recommendation
  const result = giveRandomRecommendation(resultArray);

  // get the form data
  let formAnswer = getData("form");

  const resultDetailDiv = document.createElement("div");
  resultDetailDiv.setAttribute("id", "result-detail");
  resultDivId.appendChild(resultDetailDiv);
  const resultDetailDivId = document.getElementById("result-detail");

  // result detail
  const resultBasicDiv = document.createElement("div");
  resultBasicDiv.setAttribute("id", "result-basic-detail");
  resultDetailDivId.append(resultBasicDiv);

  const resultBasic = document.getElementById("result-basic-detail");

  // print out selections
  const selectedListDiv = document.createElement("div");
  selectedListDiv.setAttribute("id", "selected-list-div");
  resultBasic.appendChild(selectedListDiv);

  const selectedListId = document.getElementById("selected-list-div");

  const chosenH3 = document.createElement("h3");
  const textNodeH3 = document.createTextNode("Your Pick");
  chosenH3.appendChild(textNodeH3);
  selectedListId.appendChild(chosenH3);

  // create ul element
  const ulEle = document.createElement("ul");
  ulEle.setAttribute("id", "selected-list-ul");
  selectedListId.appendChild(ulEle);

  const selectedUl = document.getElementById("selected-list-ul");

  Object.keys(questionsAnswer).forEach((key) => {
    const selected = questionsAnswer[key];

    // create li element
    const liEle = document.createElement("li");
    const textNodeLi = document.createTextNode(selected);
    liEle.appendChild(textNodeLi);
    selectedUl.appendChild(liEle);
  });

  // create recommendation section
  const recommendDiv = document.createElement("div");
  recommendDiv.setAttribute("id", "result-recommend");
  resultBasic.append(recommendDiv);

  const recommendId = document.getElementById("result-recommend");
  const recommendation = document.createElement("p");
  const textNodeRecom = document.createTextNode(resultArray[result].text);
  recommendation.appendChild(textNodeRecom);
  recommendId.appendChild(recommendation);

  // create recommendation more information detail
  const recommendInfoDiv = document.createElement("div");
  recommendInfoDiv.setAttribute("id", "recommend-info");
  resultDetailDivId.append(recommendInfoDiv);

  const recommendInfo = document.getElementById("recommend-info");

  // create description section
  const descriptionDiv = document.createElement("div");
  descriptionDiv.setAttribute("id", "recommend-description");
  recommendInfo.appendChild(descriptionDiv);

  const recommendDesc = document.getElementById("recommend-description");

  if (resultArray[result].desc) {
    // create description title
    const recommendH3 = document.createElement("h3");
    const textNodeRecomInfo = document.createTextNode("More Information");
    recommendH3.appendChild(textNodeRecomInfo);
    recommendDesc.appendChild(recommendH3);

    // create description paragraph
    const descriptionParagraph = document.createElement("p");
    const textNodeDesc = document.createTextNode(resultArray[result].desc);
    descriptionParagraph.appendChild(textNodeDesc);
    recommendDesc.appendChild(descriptionParagraph);
  }

  // create other detail section
  const otherDetailDiv = document.createElement("div");
  otherDetailDiv.setAttribute("id", "recommend-other-details");
  recommendInfo.appendChild(otherDetailDiv);

  const otherDetailId = document.getElementById("recommend-other-details");

  // if img info exists
  if (resultArray[result].img) {
    // create img section
    const imgEle = document.createElement("img");
    imgEle.setAttribute("src", resultArray[result].img.src);
    imgEle.setAttribute("alt", resultArray[result].text);
    otherDetailId.appendChild(imgEle);
  }

  // create link section
  const linkDiv = document.createElement("div");
  linkDiv.setAttribute("id", "other-links");
  otherDetailId.appendChild(linkDiv);

  const otherLinks = document.getElementById("other-links");

  // if link info exists
  if (resultArray[result].link) {
    // create link details
    Object.keys(resultArray[result].link).forEach((key) => {
      const linkInfo = resultArray[result].link[key];

      const linkEle = document.createElement("a");
      linkEle.setAttribute("href", linkInfo.href);
      linkEle.setAttribute("target", "_blank");
      const textNodeLink = document.createTextNode(linkInfo.linktext);
      linkEle.appendChild(textNodeLink);

      otherLinks.appendChild(linkEle);
    });
  }
}

// random recommendation
function giveRandomRecommendation(resultArray) {
  const keys = Object.keys(resultArray);
  // get a random number in the array length
  const random = Math.floor(Math.random() * keys.length);
  // use the random number to get a recommendation
  const result = keys[random];

  return result;
}

/***************** Print Result ********************* */

/************* Animation ***********/
// Selection animation
function moveIn(id) {
  let move = document.getElementById(id);
  let pos = parseInt(move.style.left);

  if (pos < 5) {
    move.style.left = pos + 2 + "px";
    requestAnimationFrame(() => moveIn(id));
  }
}
/************** Animation ************/

/******** Event Listener ***********/
// listen to the submit button
document.addEventListener("submit", function (e) {
  e.preventDefault();

  const valid = formValid();
  // check the form validatoin
  if (!valid) {
    return;
  }

  // store the data that user select and input
  // get questions number
  const questions = document
    .getElementById("questions")
    .getElementsByTagName("select");

  const questionsArray = Array.from(questions);
  // store all the questions answer
  let selectData = getInterfaceData("questions");

  storeData("questions", selectData);

  // store user form information
  let formData = getInterfaceData("form");
  storeData("form", formData);

  const resultDiv = document.getElementById("result");

  if (resultDiv) {
    resultDiv.remove();
  }
  printResults();
});

/********** Other Function ************* */
// using value to find the next question
function findNextByValue(value) {
  let nextQuestion;
  for (const key in questionsData) {
    const options = questionsData[key].options;
    for (const optionKey in options) {
      if (options[optionKey].value === value) {
        nextQuestion = options[optionKey].next;
      }
    }
  }

  return nextQuestion;
}

// create try again button
function createAgainBtn() {
  // create div for other function
  const againDiv = document.createElement("div");
  againDiv.setAttribute("id", "other-div");
  document.getElementsByTagName("body")[0].appendChild(againDiv);

  // creae try again button
  const againBtn = document.createElement("button");
  const againTextNode = document.createTextNode("Try Again!");
  againBtn.appendChild(againTextNode);
  againBtn.setAttribute("id", "again-btn");

  document.getElementById("other-div").appendChild(againBtn);

  const againId = document.getElementById("again-btn");

  // listen when it click
  againId.addEventListener("click", function () {
    removeData("questions");

    // remove result
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
      resultDiv.remove();
    }

    // remove quesitons
    const questionsDiv = document
      .getElementById("questions")
      .getElementsByTagName("div");

    for (let i = questionsDiv.length; i--; i < 0) {
      questionsDiv[i].remove();
    }
    createSelect("q1");
  });
}
/************** Other Function ********************* */

/************** Error Page ****************** */
function createErrorPage() {
  const divEle = document.createElement("div");
  divEle.setAttribute("id", "error-page");

  document.getElementsByTagName("body")[0].append(divEle);

  const errorMsg = getErrorMsg();

  // create error message
  const errorMsgEle = document.createElement("p");
  const errorMsgTextNode = document.createTextNode(errorMsg);
  errorMsgEle.appendChild(errorMsgTextNode);
  document.getElementById("error-page").append(errorMsgEle);

  // create back to home page button
  const backBtnEle = document.createElement("button");
  const backTextNode = document.createTextNode("Back to Home Page");
  backBtnEle.appendChild(backTextNode);
  backBtnEle.setAttribute("id", "back-btn");
  document.getElementById("error-page").appendChild(backBtnEle);

  // back to home page button listener
  const backBtn = document.getElementById("back-btn");
  backBtn.addEventListener("click", function () {
    removeErrorMsg();
    window.location.href = "index.html";
  });
}

function storeErrorMsg(msg, time = 7) {
  // is the localStorage exists
  // is the localStorage exists
  if (window.localStorage) {
    localStorage.setItem("errorMsg", JSON.stringify(msg));
  } else {
    // if the localStorage doesn't exists, use the cookies
    const date = new Date();
    date.setTime(date.getTime() + time * 24 * 60 * 60 * 1000);

    // store the data into cookie
    document.cookie =
      type +
      "=" +
      JSON.stringify(msg) +
      "; expires=" +
      date.toUTCString +
      "; path=/; HTTPOnly; SameSite=None; secure; domain=rit.edu";
  }
}

function getErrorMsg() {
  let msg;
  if (window.localStorage) {
    msg = JSON.parse(localStorage.getItem("errorMsg"));
  } else {
    // split all the cookie by ";"
    const cookieArray = document.cookie.split(";");
    const name = "error=";

    // find which array is the one match to the type
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();

      // when the array data is the one we are looking for
      if (cookie.indexOf(name) === 0) {
        // get the data and change it into JSON format
        msg = JSON.parse(cookie.substring(name.length, cookie.length));
      }
    }
  }

  return msg;
}

function removeErrorMsg(path, domain = "rit.edu") {
  // is the localStorage exists
  if (window.localStorage) {
    localStorage.removeItem("errorMsg");
  } else {
    // if the localStorage doesn't exists, use the cookies
    document.cookie =
      "errorMsg=" +
      (path ? "; path=" + path : "") +
      (domain ? "; domain=" + domain : "") +
      "; expires=Thu, 01-Jan-70 00:00:01 GMT; SameSite=None; Secure;";
  }
}
