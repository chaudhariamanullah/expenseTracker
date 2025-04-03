let d2 = document.getElementsByClassName("d2");
let expenses = document.getElementsByClassName("expense-entry");

document.addEventListener("DOMContentLoaded", () => {

    if ( document.getElementById("searchButton") ){
        let searchButton = document.getElementById("searchButton");
        let searchBox = document.getElementById("searchBox");

        searchButton.addEventListener("click", ()=>{
            if ( searchBox.style.display == "none"){
                searchBox.style.display = "inline";
                setTimeout(() => {
                searchBox.style.opacity = "1";
                searchBox.style.transition ="all 0.5s ease"
                }, 200);
            }
            else {
                searchBox.style.opacity = "0";
                setTimeout(() => {
                searchBox.style.display = "none";
                }, 500);
            }
        });
    }
});

if (document.getElementById("searchButton")){
        searchBox.addEventListener("keyup",()=>{
            let query = searchBox.value;
            
            for (let i = 0; i < expenses.length; i++) {
            
                let expenseNameDiv = expenses[i].getElementsByClassName("d2")[0];

                if (expenseNameDiv && !expenseNameDiv.innerText.includes(query)) {
                    expenses[i].style.display = "none";
                } else {
                    expenses[i].style.display = "flex";
                }
            }
        });
}

if ( document.getElementById('greetDiv') && document.getElementById('greetDiv').innerText != ""){
    setTimeout( ()=>{
        let div = document.getElementById('greetDiv');
        div.innerText = "";
        div.style.display = "none";
    },2000);
}

if ( document.getElementById('errMsgDiv') && document.getElementById('errMsgDiv').innerText != ""){
    setTimeout( ()=>{
        let div = document.getElementById('errMsgDiv');
        div.innerText = "";
        div.style.display = "none";
    },2000);
}