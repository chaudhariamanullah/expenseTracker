require("dotenv").config();

const mysql = require("mysql2");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // unique id generator


const con = mysql.createConnection(process.env.DATABASE_URL);

con.connect(function(err) {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      return;
    }
    console.log("Connected to MySQL!");
});


function fetchAll (user_id){
    return new Promise ( (resolve,reject)=>{
        sql = "select * from userExpense where user_id = ?";

        if (!user_id){
            resolve([]);
            return;
        }
        con.query(sql,[user_id],function(err,result){
            if (err) reject("Unable To Fetch Data From MySQl");
            else {
                resolve(result);
            }
        });

    });
}

function addExpense(user_id,exName,amt,date){
    let item_id = uuidv4();

    return new Promise( (resolve,reject)=>{
        let dateAndTime = date.replace("T"," ")+ ":00";
        let sql = "insert into userExpense(item_id , user_id, expense , expenseAmount , dateAndTime) values (?,?,?,?,?)";
        con.query(sql,[item_id,user_id,exName,amt,dateAndTime], (err,result)=>{
            if (err) reject("Some Error While Adding Data");
            else resolve(result);
        });
    });
}

function deleteExpense(item_id,user_id){
    return new Promise( (resolve,reject)=>{
        let sql = "delete from userExpense where item_id = ? And user_id = ?"
        con.query(sql,[item_id,user_id],(err,result)=>{
            if (err) reject("Deletion Failed");
            else {
                resolve(result);
            }
        });
    });

}

function editExpense(item_id,user_id){
    return new Promise( (resolve,reject)=>{
        let sql = " select * from userExpense where item_id = ? And user_id = ?"
        con.query(sql,[item_id,user_id], (err,result)=>{

            if (err) reject("DataBase Error");

            else resolve(result);
        });
    });
}

function updateExpense(exName,amt,dateAndTime,item_id,user_id){
    return new Promise ( (resolve,reject)=>{
        sql = " UPDATE userExpense SET expense = ? , expenseAmount = ? , dateAndTime = ? WHERE item_id = ? And user_id = ?"
        con.query( sql, [exName,amt,dateAndTime,item_id,user_id], (err,result)=>{
            if (err) reject("Unable To Update");
            else {
                resolve(result);
            }
        })
    });
}

function login(usernameOrMail,password){
    return new Promise ( (resolve,reject)=>{
        let sql = "select * from userInfo where user_name = ? OR email = ?";
        con.query(sql,[usernameOrMail,usernameOrMail],(err,result)=>{
            if (err) reject("Login Process Failed.");

            else if (result.length === 0){
                reject("No User Found");
            }  else {

                if (bcrypt.compareSync(password + process.env.PEPPER, result[0].password)){
                    resolve(result);
                } else{
                    reject("Password Or Username Is Wrong")
                }

            }     
        });

    });
}

function signup(user_id,username,email,password){
    let sql = "insert into userInfo (user_id , user_name , email , password) values (?,?,?,?)";

    return new Promise( (resolve,reject)=>{

        if ( user_id == "" || username == "" || email == "" || password == ""){
            reject ("Please Fill All Neccessary Info")
        }

        con.query(sql,[user_id,username,email,password],(err,result)=>{
            if (err) reject("UserName or Email Already Used")
            else resolve("Signup Succesfull")
        });
    });
};

function fetchName(usernameOrMail){
    sql = "Select user_name from userInfo where user_name = ? OR email = ?";

    console.log(usernameOrMail);

    return new Promise( (resolve,reject)=>{
        con.query(sql, [usernameOrMail,usernameOrMail] , (err,result)=>{
            if (err) reject("Failed To Get Username");
            else resolve(result);
        });
    });
}

function fetchDaily(user_id){
    let sql ="select sum(expenseAmount) as Total , DATE(dateAndTime) as date from userExpense where user_id = ? group by date order by date";
    return new Promise( (resolve,reject)=>{
        con.query(sql,[user_id],(err,result)=>{
            if (err) reject("Daily Expense Fetch Failed")
            else {
                resolve(result);
            }
        });
    });

};

function fetchWeekly(user_id){
    let sql ="SELECT YEAR(dateAndTime) AS year, WEEK(dateAndTime) AS week, MIN(DATE(dateAndTime)) AS startDate,MAX(DATE(dateAndTime)) AS endDate, SUM(expenseAmount) AS totalExpense FROM userExpense WHERE user_id = ? GROUP BY year, week ORDER BY year, week"
    return new Promise( (resolve,reject)=>{
        con.query(sql,[user_id],(err,result)=>{
            if (err) reject("Weekly Expense Fetch Failed")
            else {
                resolve(result);
            }
        });
    });

};

function fetchMonthly(user_id){
    let sql = "SELECT YEAR(dateAndTime) AS year, MONTH(dateAndTime) AS month, SUM(expenseAmount) AS totalExpense FROM userExpense WHERE user_id = ? GROUP BY year, month ORDER BY year, month"
    return new Promise( (resolve,reject)=>{
        con.query(sql,[user_id],(err,result)=>{
            if (err) reject("Monthly Expense Fetch Failed")
            else {
                resolve(result);
            }
        });
    });
};

function fetchUniqueDates(user_id){
    let sql = "SELECT DISTINCT DATE(dateAndTime) as DATE from userExpense WHERE user_id = ? ORDER BY DATE(dateAndTime)";

    return new Promise( (resolve,reject)=>{
        con.query( sql , [user_id], (err,result)=>{
            if (err) reject("Data Fetching Failed")
            else{
                resolve(result);
            }
        });
    });
};

function fetchPieData(user_id,date){
    let sql = "SELECT expense , expenseAmount FROM userExpense WHERE user_id = ? AND DATE(dateAndTime) = ?";
    return new Promise( (resolve,reject)=>{
        con.query(sql,[user_id,date],(err,result)=>{
            if (err) reject("Data Fetching Failed")
            else {
                resolve(result)
            }
        });
    });

};

function exportCsv(user){
    const sql = "SELECT expense, expenseAmount, DATE_FORMAT(dateAndTime, '%Y-%m-%d') as date FROM userExpense WHERE user_id = ?";
    return new Promise((resolve,reject)=>{
        con.query(sql,[user],(err,result)=>{
            if (err) reject("CSV Conversion Failed")
            
            else
            resolve(result)
        });
    });
}

function getUser(userId){
    const sql = "Select user_namr from userInfo where user_id = ?";

    return new Promise((resolve,reject)=>{
        con.query(sql,userId,(err,result)=>{
            if (err)
                reject ("Something Went Wrong");
            else 
                resolve (result);
        })
    })
}
module.exports = {fetchAll, addExpense, deleteExpense ,editExpense, updateExpense, login, signup, fetchDaily , fetchMonthly, fetchWeekly , fetchUniqueDates, fetchPieData , exportCsv , getUser , fetchName};
