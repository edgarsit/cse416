//Test1

//SQL stuff
var mysql=require("mysql");
var con=mysql.createConnection({
    //the attributes below will probably change for the sake of persistency
    host: "localhost",
    port: 3306,
    user: "root",
    password: "1234",
    database: "mydb"
});

const port = 3000;
const express = require("express");
const app = express();
const url = require('url');


//Classes

class User
{
    constructor(userName,password,isGPD)
    {
        // if there is a problem with username and password due to authentication stuff,
        // we can remove these two attributes
        this.userName=userName;
        this.password=password;
        this.isGPD=isGPD//idk how we will handle this attribute so ill leave it like this for now.
        //It should be a boolean
    }
    editStudentInformation(student)//may need more parameters, like what is being editted or replaced
    {
        //TODO
    }
    viewCoursePlanHistory(student)
    {
        //Will be implemented at some point after HW6
    }
    suggestCoursePlan(maxNumCourses,preferredCourses,coursesToAvoid,timePeriodsToAvoid)
    {
        //Will be implemented at some point after HW6
    }
    getUserName()
    {
        return this.userName
    }
    getPassword()
    {
        return this.password
    }
    getIsGPD()
    {
        return this.isGPD
    }
    //no setters for these variables i think
}

class Student extends User 
{
    constructor(username,password,department,track,reqVers,gradSemester,graduated,comments,sbuID)
    {
        super(username,password,false);
        this.department=department;
        this.reqVers=reqVers;
        this.gradSemester=gradSemester;
        this.coursePlan={};
        this.graduated=graduated;
        this.comments=comments;
        this.sbuID=sbuID
        //add this.degreeRequirements once implemented after HW6
    }

    shareCoursePlan(student)
    {
        //Will be implemented at some point after HW6
        //share this.coursePlan with student
    }

    getDepartment()
    {
        return this.department
    }
    getReqVers()
    {
        return this.reqVers
    }
    getGradSemester()
    {
        return this.gradSemester
    }
    getCoursePlan()
    {
        return this.coursePlan
    }
    getGraduated()
    {
        return this.graduated
    }
    getComments()
    {
        return this.comments
    }
    getSbuID()
    {
        return this.sbuID
    }

    setDepartment(n)
    {
        this.department=n
    }
    setReqVers(n)
    {
        this.reqVers=n
    }
    setGradSemester(n)
    {
        this.gradSemester=n
    }
    setCoursePlan(n)//not sure if this function should exist, also idk if this should be deep copied or not
    {
        this.coursePlan=n
    }
    setGraduated(n)
    {
        this.graduated=n
    }
    setComments(n)
    {
        this.comments=n
    }
    setSbuID(n)
    {
        this.sbuID=n
    }
}

class GraduateProgramDirector extends User
{
    constructor(username,password)
    {
        super(username,password,true);
    }
    importCourseOfferings(filename)
    {
        //return true if successful, false otherwise
    }
    deleteAllStudentData()
    {
        //return true if successful, false otherwise
        //see if the SQL command works here, if not this method can go outside the class
    }
    enrollmentTrends()
    {
        //Will be implemented at some point after HW6
    }
    importStudentData(filename)
    {
        //return true if successful, false otherwise
    }
    importGrades()
    {
        //return true if successful, false otherwise
    }
    addStudent(student)
    {
        //I think this is where we run the SQL command to add the student. The actual student
        //object is created and then passed as a parameter
        //return true if successful, false otehrwise
    }
    searchStudent(student)
    {
        //return student or {}
    }
}

class Course
{
    constructor(department,courseNum,section,semester,year,timeslot,prerequisites)
    {
        this.department=department
        this.courseNum=courseNum
        this.section=section
        this.semester=semester
        this.year=year
        this.timeslot=timeslot
        this.prerequisites=prerequisites
    }

    getDepartment()
    {
        return this.department
    }
    getCourseNum()
    {
        return this.courseNum
    }
    getSection()
    {
        return this.section
    }
    getSemester()
    {
        return this.semester
    }
    getYear()
    {
        return this.year
    }
    getTimeslot()
    {
        return this.timeslot
    }
    getPrerequisites()
    {
        return this.prerequisites
    }

    setDepartment(n)
    {
        this.department=n
    }
    setCourseNum(n)
    {
        this.courseNum=n
    }
    setSection(n)
    {
        this.section=n
    }
    setSemester(n)
    {
        this.semester=n
    }
    setYear(n)
    {
        this.year=n
    }
    setTimeslot(n)
    {
        this.timeslot=n
    }
    setPrerequisites(n)
    {
        this.prerequisites=n
    }
}

class CoursePlan
{
    constructor(courses,hasTaken)//not sure if these parameters should be
    {
        this.courses=courses
        this.hasTaken=hasTaken//not sure if this is where this goes
        //comments will be implemented after HW6
    }

    getCourses()
    {
        return this.courses
    }
    getHasTaken()
    {
        return this.hasTaken
    }
    //not sure about setters and other possible methods
}

//Degree Requirements and Requirement classes will be implemented after HW6

//Website stuff
let user={}
let currStudent={}

app.get("/Login", (req, res) => {
    writeLogin(req,res);
});

app.get("/GPD_Home", (req, res) => {
    writeGPDHome(req,res);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });

function writeLogin(req,res) {
    res.setHeader("Content-Type", "text/html");
    let query = url.parse(req.url, true).query;// says .parse is deprecated. I think it should be replaced by .search but I'll test it out on Tuesday
    let username = query.username? query.username : "";
    let password = query.password ? query.password: "";

    //for action="/authorize", that's where the google authorization will be. Just need to figure out how to set that up
    let html = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <title> Login </title>
    </head>

    <body>
        <h1> MAST Login Page </h1><br>
        <form method="get" action = "/authorize">
            <span>Username: </span>
            <input type="text" name="username" value=""><br>
            <span>Password: </span>
            <input type="text" name="password" value=""><br>
            <input type="submit" value="Login">
        </form>
        <br><br>
    `;
    let sql = `SELECT * FROM User WHERE username ='` + username + `'
    AND password ='` + password + `'`;
    con.query(sql, function(err, result) {
        if (err) throw err;
        if(result.length>0)
        {
            let isGPD=result[0].usertype=="Graduate Program Director";
            if(isGPD==true)
            {
                user=new GraduateProgramDirector(result[0].username,result[0].password);
                res.redirect("/GPD_home");//url names can be changed if you can think of something better.
            }
            else
            {
                //set user to new Student object by pulling relavent information frim teh database
                //if it seems difficult to do it here, I think setting user to a User object might work
                //if you run the query command right after redirection
                res.redirect("/Student");
            }
        }
        else
        {
            //add some kind of alert to say invalid credentials
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(html + "\n\n</body>\n</html>");
            res.end();
        }
    });
};

function writeGPDHome(req,res) {
    res.setHeader("Content-Type", "text/html");

    
    let html = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <title> GPD Home </title>
    </head>

    <body>
        <h1> GPD Home </h1><br>
        <form action="/Import_Course_Offerings" method = "get">
            <button>Import Course Offerings</button>
        </form>
        <br>
        <form action="/Import_Course_Offerings" method = "get">
            <button>Delete Student Data</button>
        </form>
        <br>
        <form action="/Import_Student_Data" method = "get">
            <button>Import Student Data</button>
        </form>
        <br>
        <form action="/Import_Grades" method = "get">
            <button>Import Grades</button>
        </form>
        <br>
        <form action="/Add_Student" method = "get">
            <button>Add Student</button>
        </form>
        <br>
        <form action="/Search_Students" method = "get">
            <button>Search Students</button>
        </form>
        <br>
    `;
   
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(html + "\n\n</body>\n</html>");
        res.end();
};

function writeStudent(req,res) {
    res.setHeader("Content-Type", "text/html");

    //if we will have a name for the studetn, we could replace getUsername with the name instead
    let html = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <title> Student Information Page </title>
    </head>

    <body>
        <h1> `+currStudent.getUserName()+` </h1><br>
        <br>

    `;
   if(user.getIsGPD==true)
   {
       //add stuff that student can't edit
       html+=``
   }
   else
   {
       html+=``
   }
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(html + "\n\n</body>\n</html>");
        res.end();
};
