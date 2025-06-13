require("dotenv").config();

const express = require('express'); //Import Express
const app = express(); //Using Express By Calling It
const path = require('path');  //Used To Connect Folders
const { v4: uuidv4 } = require('uuid'); // unique id generator
const methodOverride = require('method-override'); //use to create put patch delete
const bcrypt = require('bcryptjs'); //Use For hashing password
const cookieParser = require("cookie-parser");
const { Parser } = require("json2csv");
const fs = require("fs");
const engine = require('ejs-mate');
const jwt = require('jsonwebtoken'); //JWT Acquired
const cors = require('cors');


//SQL Queries Promise Function
const { fetchAll, addExpense, deleteExpense, editExpense} = require('./sqlQueries.js');
const { updateExpense, login, signup , fetchUniqueDates , fetchName} = require('./sqlQueries.js');
const { fetchDaily , fetchWeekly , fetchMonthly , fetchPieData , exportCsv , getUser} = require("./sqlQueries.js")

//Custom Middlewares
const {authMiddleware,isLoggedIn} = require('./middlewares');

// Data parsing Of HTTP
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());

//Linking EJS MATE
app.engine("ejs",engine);

// EJS Path And Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// CSS and JS Access (Public Folder Connection)
app.use(express.static(path.join(__dirname, 'public')));

//Method Override Middleware
app.use(methodOverride("_method"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.get("/",(req,res)=>{
   res.redirect("/expense")
})

// Home Page ("GET Request")
app.get("/expense",isLoggedIn,(req,res)=>{
    const user = req.user?.userId || "";
    const username = req.cookies.username || "";
    const errMsg = req.query.errMsg || "";

    if (username)
    res.clearCookie("username");

    fetchAll(user)
    .then( (expenses)=>{
        res.render("index.ejs",{expenses , user , username , errMsg});
    }).catch( (err)=>{
       res.render("index.ejs",{expenses: [] ,user})
    });

});

// Request To Create New Expense In The List 
app.get("/expense/new",isLoggedIn,authMiddleware,(req,res)=>{
    res.render("./CRUD/newExpense.ejs");
});

//Insert User Expense Details In The DB
app.post("/expense",isLoggedIn,authMiddleware,(req,res)=>{
    let {exName,amt,date}= req.body;
    let user_id = req.user.userId;

    addExpense(user_id,exName,amt,date)
    .then( (result)=>{
            res.redirect("/expense");
    })
    .catch( (mes)=>{
            res.redirect("/expense?errMsg=Failed To Save Data");
    });

});

//delete expense
app.delete("/expense/:id/delete",isLoggedIn,authMiddleware,(req,res)=>{
    let item_id = req.params.id;
    let user_id = req.user.userId;
    
    deleteExpense(item_id,user_id)
    .then( (result)=>{
        res.redirect("/expense");
    })
    .catch( (mes)=>{
        res.redirect("/expense?errMsg=Failed To Delete Expense")
    });

});

//Edit Expense
app.get("/expense/:id/edit",isLoggedIn,authMiddleware,(req,res)=>{
    let item_id = req.params.id;
    let user_id = req.user.userId;

    editExpense(item_id,user_id)
    .then( (result)=>{
        res.render("./CRUD/edit.ejs",{result});
    })
    .catch( (mes)=>{
        res.redirect("/expense?errMsg=Failed To Load Edit PaGe")
    });

});


//Update Expense
app.put("/expense/:id",isLoggedIn,authMiddleware,(req,res)=>{
    let {exName,amt,dateAndTime} = req.body;
    let item_id = req.params.id;
    let user_id = req.user.userId;
    dateAndTime = dateAndTime.replace("T"," ")+ ":00";

    updateExpense(exName,amt,dateAndTime,item_id,user_id)
    .then( (result)=>{
        res.redirect("/expense")
    })
    .catch( (mes)=>{
        res.redirect("/expense?errMsg=Failed To Update Info")
    });
});

//Login
app.get("/expense/login",(req,res)=>{
    msg = req.query.msg || "";
    res.render("./Auths/login.ejs", {msg})
})

app.post("/expense/login", (req,res)=>{
    let {usernameOrMail,password} = req.body;

    login(usernameOrMail,password)
    .then( (result)=>{
            const token = jwt.sign({ 
            userId: result[0].user_id},
            process.env.JWT_SECRET,
            { expiresIn: "1hr" });

            res.cookie("token", token,{ 
            httpOnly: true, 
            secure: true, 
            maxAge: 3600 * 1000 });

        fetchName(usernameOrMail)
        .then( (username)=>{

            res.cookie("username", username[0].user_name , 
            {maxAge:3600000 , 
            secure: false , 
            httpOnly:false , 
            sameSite : "Lax"});
            res.redirect("/expense");

        }).catch( (err)=>{
            res.redirect("/login?msg=Some Error Has Occured , Please Try Again");
        });

    }).catch( (mes)=>{
        if ( mes == "No User Found"){
            res.redirect("/expense/login?msg=Wrong Username or Password");

        } else if ( mes == "Login Process Failed."){

            res.redirect("/expense/login?msg=Login Process Failed.");

        } else {

            res.redirect("/expense/login?msg=Wrong Username or Password");
        }
    });

});

//SignUp
app.get("/expense/signup",(req,res)=>{
    msg = req.query.msg || "";
    res.render("./Auths/signup.ejs" , {msg}) ; 
});

app.post("/expense/signup",(req,res)=>{
    let user_id = uuidv4();
    let {username,email,password} = req.body;
    
    if (password.length === 0) {
    return res.redirect("/expense/signup?msg=Please Fill All Neccessary Info");
    }
    
    password = bcrypt.hashSync(password + process.env.PEPPER , 10);


    signup(user_id,username,email,password)
    .then( (mes)=>{
        res.redirect("/expense/login?msg=Signup Successfull")
    })
    .catch( (mes)=>{
        if ( mes == "UserName or Email Already Used"){
            res.redirect("/expense/signup?msg=UserName or Email Already Used");
        } else if ( mes == "Please Fill All Neccessary Info" ) {
            res.redirect("/expense/signup?msg=Please Fill All Neccessary Info");
        }
    });
});


//Logout
app.get("/expense/logout",(req,res)=>{
    req.user = null;
    res.clearCookie("token");
    res.redirect("/expense");
});

//View Daily , Weekly , Montly Expenses In Bar Chart
app.get("/expense/charts",isLoggedIn,authMiddleware,async(req,res)=>{
    const user = req.user.userId;
    try{
        let daily = await fetchDaily(user);
        let weekly = await fetchWeekly(user);
        let monthly = await fetchMonthly(user);
        res.render("./Charts/charts.ejs",{daily,weekly,monthly})
    }catch{
        res.redirect("/expense?errMsg=Unable To Load Charts");
    }
    
});

//View Daily Expense Of Single Day In Pie Chart
app.get("/expense/expenseCalender",isLoggedIn,authMiddleware,(req,res)=>{
    const user = req.user.userId;

    fetchUniqueDates(user)
    .then( (dates)=>{
        res.render("./Charts/expenseCalender.ejs",{dates})
    })
    .catch( (mes)=>{
        res.redirect("/expense?errMsg=Unable To Load Charts");
    })
});

//A Full Day Expense In Pie Chart
app.get("/expense/:date/pie",isLoggedIn,authMiddleware,(req,res)=>{
    let date = req.params.date;
    let user = req.user.userId;

    date = date.split("-");
    let ndate = `${date[2]}-${date[0]}-${date[1]}`

    fetchPieData(user,ndate)
    .then( (data)=>{
        res.render("./Charts/dailyPie.ejs",{data})
    })
    .catch( (mes)=>{
        res.redirect("/expense?errMsg=Unable To Load Charts");
    })
});

//Download Export File
app.get("/expense/download",isLoggedIn,authMiddleware,(req,res)=>{

    let user = req.user.userId;

    exportCsv(user)
    .then( (results)=>{
        const fields = ["expense", "expenseAmount", "date"];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(results);

        const filePath = path.join(__dirname, "expenses.csv");

        fs.writeFile(filePath, csv, (err) => {
            if (err) res.redirect("/expense?errMsg=Download Failed");
            else {
                res.download(filePath,"expenses.csv", (err) => {
                    if (err) res.redirect("/expense?errMsg=Download Failed");
                    else {
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) console.log("File Deletion Error:", unlinkErr);
                        });
                    }
                });
            }
        });

    })
    .catch( (err)=>{
        console.log(err);
        res.redirect("/expense?errMsg=Download Failed");
    });

});

app.get("/getuser",isLoggedIn,authMiddleware,(req,res)=>{
    const userId = req.user.userId;

    getUser(userId)
    .then((username)=>{
        res.json({success:true, message: username});
    })
    .catch( (err)=>{
        res.json({success:false, message: err});
    });
});
