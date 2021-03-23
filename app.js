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

app.get("/", (req, res) => {
    writeLogin(req,res);
});

