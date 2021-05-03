// need to add the thingy from degree requirement to add classes
// need to account for preferred classes
// need to output it into the website
// to run, "tsc src\common\createCourseSchedule.tsx"
// then    "node src\common\createCourseSchedule.js "<--- (js)

import { Semester } from '../model/course';

class dateSemester {
  semester:string;

  year:number;

  startTime?:number; // assume that start time/end time hold info for what day it is

  endTime?:number;

  constructor(semester:string, year:number, startTime?:number, endTime?:number) {
    this.semester = semester;
    this.year = year;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  addTimeslot(startTime:number, endTime:number) {
    this.startTime = startTime;
    this.endTime = endTime;
  }

  // is it available this semester
  // should work, tested it with a bunch of test
  available(semester:semester) {
    console.log(`${semester.semester} ${this.semester}`);
    console.log(`${semester.year} ${this.year}`);
    if (semester.semester != this.semester) { console.log('failed semester check'); return false; }
    if (semester.year != this.year) { console.log('failed year check'); return false; }
    for (const classes of semester.schedule) {
      if (classes.takenDate!.startTime! <= this.startTime!) { // if class start after the class on the schdule
        if (classes.takenDate!.endTime! > this.startTime!) { // if the class end after/on start time
          console.log('failed time check');
          return false;
        }
      }
      if (classes.takenDate!.startTime! >= this.startTime!) { // if class start after
        if (classes.takenDate!.startTime! < this.endTime!) {
          console.log('failed time check');

          return false;
        }
      }
    }
    return true;
  }
}

class classes {
  name: string;

  credits: number;

  requirements: classes[] = [];

  elective: boolean;

  availableDates:dateSemester[];

  takenDate?:dateSemester;

  // add a preffered tag here

  constructor(name: string, credits: number, elective: boolean, availableDates:dateSemester[]) {
    this.name = name;
    this.credits = credits;
    this.elective = elective;
    this.availableDates = availableDates;
  }

  toString() {
    return this.name;
  }

  addRequirements(requirement: classes) {
    this.requirements.push(requirement);
  }

  metRequirement(currentClass: classes, remainingClasses: classes[]) {
    // what does this do?
    // uh, check if class mets requirement to graduate, and that means checking
    // if any of the requirement classes in the array still exist in the remaining classes
    // if not, that good, if there are classes still remaining, then not good.
    for (const requiredClasses of this.requirements) {
      if (remainingClasses.indexOf(requiredClasses) > -1) {
        return false;
      }
    }
    return true;
  }
}

// holds classes for one schedule
class semester {
  schedule: classes[] = [];

  semester:string;

  year:number;

  creditLimit=18; // hard cap at 18

  constructor(semester:string, year:number) {
    this.semester = semester;
    this.year = year;
  }

  addClass(newClass:classes) {
    this.schedule.push(newClass);
  }

  addCreditLimit(limit:number) {
    this.creditLimit = limit;
  }

  creditTaken() {
    let credit = 0;
    for (const classes of this.schedule) {
      credit += classes.credits;
    }
    return credit;
  }
}

// this is good
class takeAllClass {
  allClass:classes[];

  removeClass:classes[]=[];

  constructor(allClass:classes[]) {
    this.allClass = allClass;
  }

  fillSchedule(schedule:semester[]) {
    for (const semester of schedule) {
      if (semester.creditLimit > semester.creditTaken()) {
        for (const possibleClass of this.allClass) {
          this.addToSchedule(semester, possibleClass); // add it to the schedule if possible
        }
      }
    }
    this.removeClasses();
  }

  addToSchedule(semester:semester, possibleClass:classes) {
    // add one class to schedule
    for (const dates of possibleClass.availableDates) {
      if (dates.available(semester)) {
        possibleClass.takenDate = dates;
        semester.addClass(possibleClass);
        this.removeClass.push(possibleClass);
        return true;
      }
    }
    return false;
  }

  removeClasses() {
    for (const remove of this.removeClass) {
      const temp = this.allClass.indexOf(remove, 0);
      this.allClass.splice(temp, 1);
    }
    this.removeClass = [];
  }

  // checks is all classes have been taken
  // should be empty if all classes have been taken
  fulfillsRequirement() {
    return this.allClass.length == 0;
  }
}

// need to fulfill x amount of credit
// good
class takeXCredit {
  potentialClasses:classes[];

  credit:number;

  creditsTaken =0;

  removeClass:classes[]=[];

  constructor(potentialClasses:classes[], credit:number) {
    this.potentialClasses = potentialClasses;
    this.credit = credit;
  }

  fillSchedule(schedule:semester[]) {
    console.log('here?');
    for (const semester of schedule) {
      console.log(`${semester.creditLimit} ${semester.creditTaken()}`);
      console.log(`${this.credit} ${this.creditsTaken}`);
      if ((semester.creditLimit > semester.creditTaken()) && (this.credit >= this.creditsTaken)) {
        console.log('hi?');
        for (const possibleClass of this.potentialClasses) {
          this.addToSchedule(semester, possibleClass); // add it to the schedule if possible
        }
      }
    }
    this.removeClasses();
  }

  addToSchedule(semester:semester, possibleClass:classes) {
    // add one class to schedule
    for (const dates of possibleClass.availableDates) {
      console.log(this.credit <= this.creditsTaken);
      if (dates.available(semester) && (this.credit > this.creditsTaken)) {
        console.log('datres are ava');
        possibleClass.takenDate = dates;
        semester.addClass(possibleClass);
        this.creditsTaken += possibleClass.credits; // adds the credit check
        this.removeClass.push(possibleClass);
        return true;
      }
    }
    console.log('dates not ava');
    return false;
  }

  removeClasses() {
    for (const remove of this.removeClass) {
      const temp = this.potentialClasses.indexOf(remove, 0);
      this.potentialClasses.splice(temp, 1);
    }
    this.removeClass = [];
  }

  // check if enough elective credits have been taken
  fulfillsRequirement() {
    return this.creditsTaken >= this.credit;
  }
}

// pick one
// works good
class takeOneClass {
  potentialClasses:classes[];

  takenClass?:classes;

  taken= false;

  removeClass:classes[]=[];

  constructor(class1:classes[]) {
    this.potentialClasses = class1;
  }

  fillSchedule(schedule:semester[]) {
    for (const semester of schedule) {
      // each semester
      // check for credit limit
      if (semester.creditLimit > semester.creditTaken() && this.taken == false) {
        for (const possibleClass of this.potentialClasses) {
          this.addToSchedule(semester, possibleClass); // add it to the schedule if possible
        }
      }
    }
  }

  addToSchedule(semester:semester, possibleClass:classes) {
    // add one class to schedule
    for (const dates of possibleClass.availableDates) {
      if (dates.available(semester) && this.taken == false) {
        possibleClass.takenDate = dates;
        semester.addClass(possibleClass);
        this.taken = true;
        return true;
      }
    }
    return false;
  }

  fulfillsRequirement() {
    return this.taken;
  }
}

// pick at least x class
// this is good
class atLeastXClass {
  potentialClasses:classes[];

  classesToTake:number;

  classesTaken =0;

  removeClass:classes[]=[];

  constructor(classList:classes[], classesToTake:number) {
    this.potentialClasses = classList;
    this.classesToTake = classesToTake;
  }

  fillSchedule(schedule:semester[]) {
    for (const semester of schedule) {
      // each semester
      // check for credit limit
      if (semester.creditLimit > semester.creditTaken() && this.classesTaken < this.classesToTake) {
        for (const possibleClass of this.potentialClasses) {
          this.addToSchedule(semester, possibleClass); // add it to the schedule if possible
        }
      }
    }
  }

  addToSchedule(semester:semester, possibleClass:classes) {
    // add one class to schedule
    for (const dates of possibleClass.availableDates) {
      if (dates.available(semester) && this.classesTaken < this.classesToTake) {
        possibleClass.takenDate = dates;
        semester.addClass(possibleClass);
        this.classesTaken++; // increment classes taken
        this.removeClass.push(possibleClass);
        return true;
      }
    }
    return false;
  }

  removeClasses() {
    for (const remove of this.removeClass) {
      const temp = this.potentialClasses.indexOf(remove, 0);
      this.potentialClasses.splice(temp, 1);
    }
    this.removeClass = [];
  }

  fulfillsRequirement() {
    return this.classesTaken >= this.classesToTake;
  }
}

function generateSchedule() {
  // new algo here
  // pull degree requirement
  // pull corresponding courses from courses
  // generate the corresponding pools from the degree requirements
  // run the pools
  // done
  // test run
  const fall = 'Fall';
  const spring = 'Spring';
  const ams101 = makeClass('AMS101', 3, fall, 2012, 7, 8);
  const ams102 = makeClass('AMS102', 3, fall, 2012, 8, 9);
  const ams103 = makeClass('AMS103', 3, fall, 2012, 9, 10);
  const ams104 = makeClass('AMS104', 3, fall, 2012, 14, 15);
  const temp1 = makeClass('temp1', 3, spring, 2013, 7, 8);
  const temp12 = makeClass('temp12', 3, spring, 2013, 10, 12);
  const temp13 = makeClass('temp13', 3, spring, 2013, 15, 18);
  const temp14 = makeClass('temp14', 3, spring, 2013, 20, 22);

  const allclass = new atLeastXClass([ams101, ams102, ams103, ams104, temp1, temp12, temp13, temp14], 3);
  const semester2012 = new semester(fall, 2012);
  const courseplan:semester[] = [semester2012];
  allclass.fillSchedule(courseplan);
  if (allclass.fulfillsRequirement()) {
    console.log(courseplan[0]);
    console.log(courseplan[1]);
    console.log('complete');
  } else {
    const newSemester:semester = nextSemester(courseplan);
    courseplan.push(newSemester);
    allclass.fillSchedule(courseplan);
    console.log(courseplan[0]);
    console.log(courseplan[1]);
  }
}

generateSchedule();

function makeClass(className:string, credit:number, semester:string, year:number, start:number, end:number) {
  const temptime = new dateSemester(semester, year, start, end);
  const tempclass = new classes(className, credit, false, [temptime]);
  return tempclass;
}

function nextSemester(semesterAll:semester[]) {
  let newSemester;
  let newYear;
  const semester1 = semesterAll[semesterAll.length - 1];
  if (semester1 == undefined) { return new semester('Fall', 0); } // catcher for undefined squiigly line
  if (semester1.semester === 'Fall') {
    newSemester = 'Spring';
    newYear = semester1.year + 1;
  } else {
    newSemester = 'Fall';
    newYear = semester1.year;
  }

  const semester2 = new semester(newSemester, newYear);
  return semester2;
}
